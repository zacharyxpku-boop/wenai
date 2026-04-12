#!/bin/bash
# ============================================================
# 方案1: 单次无人值守任务执行
# 用法: bash run-task.sh "任务描述" /path/to/project [max-turns]
# ============================================================

TASK="${1:?请提供任务描述}"
PROJECT_DIR="${2:?请提供项目目录}"
MAX_TURNS="${3:-200}"  # 默认最多200轮对话
LOG_DIR="$(dirname "$0")/../logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/task_${TIMESTAMP}.log"

mkdir -p "$LOG_DIR"

echo "========================================" | tee "$LOG_FILE"
echo "Claude Code 无人值守任务" | tee -a "$LOG_FILE"
echo "时间: $(date)" | tee -a "$LOG_FILE"
echo "任务: $TASK" | tee -a "$LOG_FILE"
echo "项目: $PROJECT_DIR" | tee -a "$LOG_FILE"
echo "最大轮次: $MAX_TURNS" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# 安全检查
if [ ! -d "$PROJECT_DIR" ]; then
    echo "错误: 项目目录不存在: $PROJECT_DIR" | tee -a "$LOG_FILE"
    exit 1
fi

# 检查是否有未提交的更改
cd "$PROJECT_DIR"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    if [ -n "$(git status --porcelain)" ]; then
        echo "警告: 项目有未提交的更改，建议先 commit" | tee -a "$LOG_FILE"
        echo "5秒后继续..." | tee -a "$LOG_FILE"
        sleep 5
    fi
fi

# 运行 Claude Code（非交互模式）
echo "开始运行 Claude Code..." | tee -a "$LOG_FILE"

claude --dangerously-skip-permissions \
    --max-turns "$MAX_TURNS" \
    --print \
    --output-format text \
    -p "$TASK" \
    2>&1 | tee -a "$LOG_FILE"

EXIT_CODE=$?

echo "========================================" | tee -a "$LOG_FILE"
echo "任务完成，退出码: $EXIT_CODE" | tee -a "$LOG_FILE"
echo "结束时间: $(date)" | tee -a "$LOG_FILE"
echo "日志: $LOG_FILE" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

exit $EXIT_CODE
