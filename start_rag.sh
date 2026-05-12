#!/bin/bash
# RAG 常驻服务启动脚本
# 用法: bash start_rag.sh [start|stop|restart]

SERVICE_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$SERVICE_DIR/rag_server.log"
PID_FILE="$SERVICE_DIR/rag_server.pid"
PORT=8000

start() {
    if [ -f "$PID_FILE" ]; then
        old_pid=$(cat "$PID_FILE")
        if kill -0 "$old_pid" 2>/dev/null; then
            echo "RAG 服务已在运行 (pid: $old_pid)"
            return
        fi
    fi

    # 确保依赖已安装
    pip3.11 install fastapi uvicorn sentence-transformers numpy openai httpx -q 2>/dev/null

    echo "启动 RAG 服务..."
    nohup uvicorn rag_server:app \
        --host 127.0.0.1 \
        --port $PORT \
        --log-level info \
        > "$LOG_FILE" 2>&1 &

    echo $! > "$PID_FILE"
    echo "RAG 服务已启动 (pid: $(cat $PID_FILE), port: $PORT)"
}

stop() {
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            rm -f "$PID_FILE"
            echo "RAG 服务已停止 (pid: $pid)"
        else
            rm -f "$PID_FILE"
            echo "PID 文件过期，已清理"
        fi
    else
        # 尝试按端口杀进程
        lsof -ti:$PORT | xargs -r kill 2>/dev/null
        echo "已尝试清理端口 $PORT 上的进程"
    fi
}

restart() {
    stop
    sleep 2
    start
}

case "${1:-start}" in
    start)   start ;;
    stop)    stop ;;
    restart) restart ;;
    *)       echo "用法: $0 {start|stop|restart}" ;;
esac
