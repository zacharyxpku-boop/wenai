#!/bin/bash
# 万象阁 · 不眠模式
# 用法: bash run-forever.sh "你的任务描述" [工作目录]
# 停止: Ctrl+C 或删除 .claude-running 文件

TASK="$1"
WORKDIR="${2:-$(pwd)}"
RETRY_WAIT=300        # 限额后等待秒数（5分钟）
MAX_RETRIES=100       # 最大重试次数
SESSION_ID=""
RETRY_COUNT=0

if [ -z "$TASK" ]; then
  echo "用法: bash run-forever.sh \"任务描述\" [工作目录]"
  exit 1
fi

cd "$WORKDIR" || exit 1
touch .claude-running
echo "$(date '+%Y-%m-%d %H:%M:%S') | 不眠模式启动 | 任务: $TASK"

while [ -f .claude-running ] && [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "$(date '+%Y-%m-%d %H:%M:%S') | 第 $((RETRY_COUNT+1)) 轮"

  if [ -z "$SESSION_ID" ]; then
    # 首次运行
    OUTPUT=$(claude -p "$TASK" \
      --output-format json \
      --max-turns 200 \
      2>&1)
    EXIT_CODE=$?

    # 尝试提取 session id 用于后续 resume
    SID=$(echo "$OUTPUT" | grep -oP '"session_id"\s*:\s*"\K[^"]+' 2>/dev/null)
    if [ -n "$SID" ]; then
      SESSION_ID="$SID"
    fi
  else
    # 后续运行：resume 上次 session
    OUTPUT=$(claude --resume "$SESSION_ID" \
      -p "继续上次未完成的工作" \
      --output-format json \
      --max-turns 200 \
      2>&1)
    EXIT_CODE=$?
  fi

  # 判断退出原因
  if [ $EXIT_CODE -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') | 任务正常完成"
    rm -f .claude-running
    break
  fi

  # 检查是否限额
  if echo "$OUTPUT" | grep -qi "rate.limit\|too.many.requests\|429\|quota\|overloaded"; then
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo "$(date '+%Y-%m-%d %H:%M:%S') | 限额触发，等待 ${RETRY_WAIT}s 后重试..."
    sleep $RETRY_WAIT

    # 递增等待（避免持续撞墙）
    if [ $RETRY_COUNT -gt 5 ]; then
      RETRY_WAIT=$((RETRY_WAIT + 60))
    fi
    continue
  fi

  # 其他错误（context满、crash等）→ 重开新session
  if echo "$OUTPUT" | grep -qi "context.window\|token.limit\|maximum.context"; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') | Context 满，开新 session 继续"
    SESSION_ID=""
    RETRY_COUNT=$((RETRY_COUNT+1))
    sleep 10
    continue
  fi

  # 未知错误
  echo "$(date '+%Y-%m-%d %H:%M:%S') | 未知退出 (code=$EXIT_CODE)，30s 后重试"
  echo "$OUTPUT" | tail -5
  RETRY_COUNT=$((RETRY_COUNT+1))
  sleep 30

done

echo "$(date '+%Y-%m-%d %H:%M:%S') | 不眠模式结束 (共 $RETRY_COUNT 次重试)"
rm -f .claude-running
