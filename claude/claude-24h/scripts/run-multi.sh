#!/bin/bash
# ============================================================
# 方案3: 多agent并行执行
# 用法: bash run-multi.sh [最大并行数]
# 将任务文件放入 tasks/ 目录，每个 .md 文件是一个独立任务
# ============================================================

MAX_PARALLEL="${1:-3}"  # 默认最多3个并行agent
TASKS_DIR="$(dirname "$0")/../tasks"
LOG_DIR="$(dirname "$0")/../logs"
PIDS=()

mkdir -p "$LOG_DIR" "$TASKS_DIR"

MASTER_LOG="${LOG_DIR}/multi_$(date +%Y%m%d_%H%M%S).log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$MASTER_LOG"
}

cleanup() {
    log "收到停止信号，正在终止所有agent..."
    for pid in "${PIDS[@]}"; do
        kill "$pid" 2>/dev/null
    done
    wait
    log "所有agent已停止"
    exit 0
}
trap cleanup SIGINT SIGTERM

log "========================================="
log "Claude Code 多Agent并行模式"
log "最大并行数: $MAX_PARALLEL"
log "========================================="

# 收集待执行任务
TASK_FILES=($(find "$TASKS_DIR" -name "*.md" -not -name "*.done.md" -not -name "*.failed.md" | sort))

if [ ${#TASK_FILES[@]} -eq 0 ]; then
    log "没有待执行任务。请在 tasks/ 目录中添加 .md 任务文件"
    exit 0
fi

log "发现 ${#TASK_FILES[@]} 个任务"

RUNNING=0

for TASK_FILE in "${TASK_FILES[@]}"; do
    # 等待空闲slot
    while [ $RUNNING -ge $MAX_PARALLEL ]; do
        # 检查已完成的进程
        NEW_PIDS=()
        for pid in "${PIDS[@]}"; do
            if kill -0 "$pid" 2>/dev/null; then
                NEW_PIDS+=("$pid")
            else
                wait "$pid"
                RUNNING=$((RUNNING - 1))
                log "一个agent已完成 (PID: $pid)，当前运行: $RUNNING"
            fi
        done
        PIDS=("${NEW_PIDS[@]}")
        [ $RUNNING -ge $MAX_PARALLEL ] && sleep 5
    done

    TASK_NAME=$(basename "$TASK_FILE" .md)
    TASK_CONTENT=$(cat "$TASK_FILE")
    # 从任务文件第一行提取项目目录（格式: # PROJECT: /path/to/project）
    PROJECT_DIR=$(head -1 "$TASK_FILE" | grep -oP '(?<=PROJECT:\s).*' || echo ".")
    TASK_LOG="${LOG_DIR}/agent_${TASK_NAME}_$(date +%H%M%S).log"

    log "启动agent: $TASK_NAME (项目: $PROJECT_DIR)"

    (
        cd "$PROJECT_DIR" 2>/dev/null || cd .
        claude --dangerously-skip-permissions \
            --max-turns 100 \
            --print \
            --output-format text \
            -p "$TASK_CONTENT" \
            > "$TASK_LOG" 2>&1

        if [ $? -eq 0 ]; then
            mv "$TASK_FILE" "${TASK_FILE%.md}.done.md"
        else
            mv "$TASK_FILE" "${TASK_FILE%.md}.failed.md"
        fi
    ) &

    PID=$!
    PIDS+=("$PID")
    RUNNING=$((RUNNING + 1))
    log "Agent启动 (PID: $PID)，当前运行: $RUNNING/${MAX_PARALLEL}"

    # 错开启动避免API限速
    sleep 10
done

# 等待所有agent完成
log "所有任务已分配，等待完成..."
for pid in "${PIDS[@]}"; do
    wait "$pid"
    log "Agent完成 (PID: $pid)"
done

log "========================================="
log "所有任务执行完毕"
log "========================================="
