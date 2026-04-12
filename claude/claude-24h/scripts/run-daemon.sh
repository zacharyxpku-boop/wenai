#!/bin/bash
# ============================================================
# 方案2: 守护进程模式 - 持续运行，自动执行任务队列
# 用法: bash run-daemon.sh /path/to/project
# 按 Ctrl+C 停止
# ============================================================

PROJECT_DIR="${1:?请提供项目目录}"
TASKS_DIR="$(dirname "$0")/../tasks"
LOG_DIR="$(dirname "$0")/../logs"
POLL_INTERVAL=60  # 每60秒检查一次新任务

mkdir -p "$LOG_DIR" "$TASKS_DIR"

DAEMON_LOG="${LOG_DIR}/daemon_$(date +%Y%m%d).log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$DAEMON_LOG"
}

# 优雅退出
cleanup() {
    log "守护进程收到停止信号，正在退出..."
    exit 0
}
trap cleanup SIGINT SIGTERM

log "========================================="
log "Claude Code 守护进程启动"
log "项目目录: $PROJECT_DIR"
log "任务目录: $TASKS_DIR"
log "轮询间隔: ${POLL_INTERVAL}秒"
log "========================================="

cd "$PROJECT_DIR" || exit 1

while true; do
    # 扫描待执行任务（.md 文件，排除已完成的 .done 文件）
    TASK_FILES=($(find "$TASKS_DIR" -name "*.md" -not -name "*.done.md" | sort))

    if [ ${#TASK_FILES[@]} -eq 0 ]; then
        log "没有待执行任务，等待 ${POLL_INTERVAL} 秒..."
        sleep "$POLL_INTERVAL"
        continue
    fi

    for TASK_FILE in "${TASK_FILES[@]}"; do
        TASK_NAME=$(basename "$TASK_FILE" .md)
        TASK_CONTENT=$(cat "$TASK_FILE")

        log "开始执行任务: $TASK_NAME"
        log "任务内容: $(head -1 "$TASK_FILE")"

        TASK_LOG="${LOG_DIR}/task_${TASK_NAME}_$(date +%H%M%S).log"

        # 执行任务
        claude --dangerously-skip-permissions \
            --max-turns 100 \
            --print \
            --output-format text \
            -p "$TASK_CONTENT" \
            > "$TASK_LOG" 2>&1

        EXIT_CODE=$?

        if [ $EXIT_CODE -eq 0 ]; then
            log "任务完成: $TASK_NAME (成功)"
            mv "$TASK_FILE" "${TASK_FILE%.md}.done.md"
        else
            log "任务失败: $TASK_NAME (退出码: $EXIT_CODE)"
            mv "$TASK_FILE" "${TASK_FILE%.md}.failed.md"
        fi

        # 任务间歇，避免 API 限速
        log "等待 30 秒后执行下一个任务..."
        sleep 30
    done
done
