"""
常驻 RAG 服务 —— 模型只加载一次，支持流式输出。
部署：uvicorn rag_server:app --host 127.0.0.1 --port 8000
依赖：pip3.11 install fastapi uvicorn sentence-transformers numpy openai httpx
"""

import os
import json
import re
import sqlite3
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Any

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from openai import OpenAI
import httpx

# ── 配置 ──────────────────────────────────────────────────────────────
MODEL_NAME = str(
    Path(__file__).resolve().parent / "models" / "paraphrase-multilingual-MiniLM-L12-v2"
)
DB_PATH = str(Path(__file__).resolve().parent / "bunpou_rag.db")
MIMO_API_KEY = os.environ.get("MIMO_API_KEY", "") or 'sk-chquxqttcac0h8demhz0e59kvrgl0lukeggblxslshav35p0'
MIMO_BASE = "https://api.xiaomimimo.com/v1"
MIMO_MODEL = "mimo-v2-pro"
TOP_K = 5

# ── 全局变量 ──────────────────────────────────────────────────────────
embed_model: SentenceTransformer | None = None
mimo_client: OpenAI | None = None
doc_cache: list[dict[str, Any]] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    global embed_model, mimo_client, doc_cache

    print("加载嵌入模型...")
    embed_model = SentenceTransformer(MODEL_NAME)
    print("嵌入模型就绪")

    if not MIMO_API_KEY:
        print("⚠ 未设置 MIMO_API_KEY，LLM 生成不可用")
    else:
        mimo_client = OpenAI(
            api_key=MIMO_API_KEY,
            base_url=MIMO_BASE,
            http_client=httpx.Client(verify=False),
        )
        print("MiMo 客户端就绪")

    _reload_cache()

    yield
    print("RAG 服务关闭")


app = FastAPI(lifespan=lifespan, title="Bunpou RAG Service")


class QueryRequest(BaseModel):
    question: str
    history: list[dict[str, Any]] = []
    stream: bool = False


# ── 检索 ──────────────────────────────────────────────────────────────

def _cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))


def _reload_cache():
    """重新加载文档缓存"""
    global doc_cache
    doc_cache.clear()
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT id, title, level, content, embedding FROM grammar_docs"
    ).fetchall()
    for doc_id, title, level, content, emb_json in rows:
        doc_cache.append({
            "id": doc_id,
            "title": title,
            "level": level,
            "content": content,
            "embedding": np.array(json.loads(emb_json)),
        })
    conn.close()
    print(f"文档缓存加载完成: {len(doc_cache)} 篇")


def _retrieve(query: str, top_k: int = TOP_K) -> list[dict[str, Any]]:
    query_emb = embed_model.encode(query)
    results: list[dict[str, Any]] = []
    for d in doc_cache:
        results.append({
            "id": d["id"],
            "title": d["title"],
            "level": d["level"],
            "content": d["content"],
            "similarity": _cosine_sim(query_emb, d["embedding"]),
        })
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]


def _build_context(docs: list[dict[str, Any]]) -> str:
    parts = []
    for d in docs:
        clean = re.sub(r"<[^>]+>", "", d["content"])
        clean = re.sub(r"\s+", " ", clean).strip()
        parts.append(f"【{d['level']}】{d['title']}\n{clean[:400]}")
    return "\n\n".join(parts)


def _normalize_history(history: list[dict[str, Any]]) -> list[dict[str, str]]:
    valid_roles = {"system", "developer", "user", "assistant", "tool"}
    normalized: list[dict[str, str]] = []
    for msg in history:
        if not isinstance(msg, dict):
            continue
        role = str(msg.get("role", "")).strip()
        content = msg.get("content")
        if role not in valid_roles or content is None:
            continue
        if isinstance(content, str) and content.strip():
            normalized.append({"role": role, "content": content.strip()})
    return normalized


def _build_sources(docs: list[dict[str, Any]]) -> list[dict[str, str]]:
    seen: set[str] = set()
    sources: list[dict[str, str]] = []
    for d in docs:
        title = d.get("title", "")
        if title in seen:
            continue
        seen.add(title)
        sources.append({
            "title": title,
            "level": (d.get("level") or "").split("/")[-1] or "",
            "id": (d.get("id") or "").replace("bunpou/", "", 1),
        })
    return sources


SYSTEM_PROMPT = (
    "你是专业的日语语法教师，擅长用中文解释日语语法。"
    "请根据提供的语法文档，准确、简洁地回答用户的问题，"
    "并给出实用的例句。如果文档中没有相关内容，请如实说明。"
)


# ── 非流式 ────────────────────────────────────────────────────────────

def _generate(question: str, history: list[dict[str, Any]], docs: list[dict[str, Any]], context: str) -> dict[str, Any]:
    history_msgs = _normalize_history(history)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *history_msgs,
        {"role": "user", "content": f"【参考语法文档】\n{context}\n\n【问题】\n{question}"},
    ]

    response = mimo_client.chat.completions.create(
        model=MIMO_MODEL,
        messages=messages,
        temperature=0.7,
        max_completion_tokens=1000,
    )

    answer = response.choices[0].message.content or ""
    sources = _build_sources(docs)
    updated_messages = history_msgs + [
        {"role": "user", "content": question},
        {"role": "assistant", "content": answer},
    ]
    return {"answer": answer, "sources": sources, "messages": updated_messages}


# ── 流式 ──────────────────────────────────────────────────────────────

def _generate_stream(question: str, history: list[dict[str, Any]], docs: list[dict[str, Any]], context: str):
    history_msgs = _normalize_history(history)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *history_msgs,
        {"role": "user", "content": f"【参考语法文档】\n{context}\n\n【问题】\n{question}"},
    ]

    response = mimo_client.chat.completions.create(
        model=MIMO_MODEL,
        messages=messages,
        temperature=0.7,
        max_completion_tokens=1000,
        stream=True,
    )

    full_answer = ""
    for chunk in response:
        delta = chunk.choices[0].delta.content if chunk.choices else ""
        if delta:
            full_answer += delta
            yield f'data: {{"type":"token","content":{json.dumps(delta, ensure_ascii=False)}}}\n\n'

    sources = _build_sources(docs)
    updated_messages = history_msgs + [
        {"role": "user", "content": question},
        {"role": "assistant", "content": full_answer},
    ]
    done = json.dumps({
        "type": "done",
        "sources": sources,
        "messages": updated_messages,
    }, ensure_ascii=False)
    yield f"data: {done}\n\n"
    yield "data: [DONE]\n\n"


# ── 路由 ──────────────────────────────────────────────────────────────

@app.post("/query")
async def query(req: QueryRequest):
    if not mimo_client:
        raise HTTPException(status_code=503, detail="LLM 服务未就绪")

    docs = _retrieve(req.question)
    context = _build_context(docs)

    if req.stream:
        return StreamingResponse(
            _generate_stream(req.question, req.history, docs, context),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )
    else:
        return _generate(req.question, req.history, docs, context)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": embed_model is not None,
        "docs_cached": len(doc_cache),
    }


@app.post("/reload")
async def reload_cache():
    _reload_cache()
    return {"status": "ok", "docs": len(doc_cache)}
