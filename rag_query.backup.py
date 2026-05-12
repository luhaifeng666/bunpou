"""
RAG 查询接口（本地向量检索 + 小米 MiMo 生成）
用法：
  # 直接测试
  MIMO_API_KEY=xxx python rag/api/rag_query.py

  # 作为模块调用
  from rag.api.rag_query import rag_query
  result = rag_query("怎样表达持续变化？")
依赖：pip install sentence-transformers numpy openai
"""

import os
import json
import sqlite3

import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    from openai import OpenAI
    import httpx
except ImportError:
    raise SystemExit("请先安装依赖：pip3.11 install sentence-transformers numpy openai")


from pathlib import Path

# ── 配置 ──────────────────────────────────────────────────────────────────────
MODEL_NAME   = str(Path(__file__).resolve().parent.parent / "models" / "paraphrase-multilingual-MiniLM-L12-v2")
DB_PATH      = Path(__file__).resolve().parent.parent / "bunpou_rag.db"
MIMO_API_KEY = os.environ.get("MIMO_API_KEY", "")
MIMO_BASE    = "https://api.xiaomimimo.com/v1"
MIMO_MODEL   = "mimo-v2-pro"   # 限时免费；付费可换 mimo-v2-pro
TOP_K        = 5
# ─────────────────────────────────────────────────────────────────────────────

# 延迟初始化（避免 import 时就加载模型）
_embed_model: SentenceTransformer | None = None
_mimo_client: OpenAI | None = None


def _get_embed_model() -> SentenceTransformer:
    global _embed_model
    if _embed_model is None:
        _embed_model = SentenceTransformer(MODEL_NAME)
    return _embed_model


def _get_mimo_client() -> OpenAI:
    global _mimo_client
    if _mimo_client is None:
        if not MIMO_API_KEY:
            raise ValueError("请设置环境变量 MIMO_API_KEY")
        # 禁用 SSL 验证（Mac Homebrew Python 证书问题）
        _mimo_client = OpenAI(
            api_key=MIMO_API_KEY,
            base_url=MIMO_BASE,
            http_client=httpx.Client(verify=False),
        )
    return _mimo_client


def _cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))


def retrieve(query: str, top_k: int = TOP_K) -> list[dict]:
    """向量检索，返回最相关的 top_k 条语法文档"""
    model = _get_embed_model()
    query_emb = model.encode(query)

    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT id, title, level, content, embedding FROM grammar_docs"
    ).fetchall()
    conn.close()

    results = []
    for doc_id, title, level, content, emb_json in rows:
        emb = np.array(json.loads(emb_json))
        results.append({
            "id":         doc_id,
            "title":      title,
            "level":      level,
            "content":    content,
            "similarity": _cosine_sim(query_emb, emb),
        })

    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]


def _build_context(docs: list[dict]) -> str:
    """将检索到的文档拼成 LLM 上下文"""
    parts = []
    for d in docs:
        # 去掉 HTML 标签，保留纯文本
        import re
        clean = re.sub(r"<[^>]+>", "", d["content"])
        clean = re.sub(r"\s+", " ", clean).strip()
        parts.append(f"【{d['level']}】{d['title']}\n{clean[:400]}")
    return "\n\n".join(parts)


def rag_query(question: str) -> dict:
    """
    RAG 查询主函数
    返回：{"answer": str, "sources": [{"title", "level", "id"}, ...]}
    """
    # 1. 检索
    docs = retrieve(question, top_k=TOP_K)
    context = _build_context(docs)

    # 2. 调用 MiMo
    client = _get_mimo_client()
    response = client.chat.completions.create(
        model=MIMO_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "你是专业的日语语法教师，擅长用中文解释日语语法。"
                    "请根据提供的语法文档，准确、简洁地回答用户的问题，"
                    "并给出实用的例句。如果文档中没有相关内容，请如实说明。"
                ),
            },
            {
                "role": "user",
                "content": f"【参考语法文档】\n{context}\n\n【问题】\n{question}",
            },
        ],
        temperature=0.7,
        max_tokens=1000,
    )
    
    seen_titles = set()
    sources = []
    
    for d in docs:
        title = d.get("title", "")
        if title in seen_titles:
            continue
        seen_titles.add(title)
    
        sources.append({
            "title": title,
            "level": (d.get("level") or "").split("/")[-1] or "",
            "id": (d.get("id") or "").replace("bunpou/", "", 1),
        })
    
    return {
        "answer": response.choices[0].message.content,
        "sources": sources,
    }

    # return {
    #     "answer": response.choices[0].message.content,
    #     "sources": [
    #         {"title": d["title"], "level": d["level"], "id": d["id"]}
    #         for d in docs
    #     ],
    # }


# ── 命令行测试 ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    q = sys.argv[1] if len(sys.argv) > 1 else "怎样表达持续变化？"
    print(f"问题：{q}\n")

    result = rag_query(q)
    print("=== 回答 ===")
    print(result["answer"])
    print("\n=== 参考文档 ===")
    for s in result["sources"]:
        print(f"  [{s['level']}] {s['title']}  ({s['id']})")
