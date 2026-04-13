#!/bin/bash
# 万象阁 · 不眠模式 v2
# 修复：防重复覆盖 + headless skill路由 + git checkpoint
# 用法: bash run-forever.sh "任务描述" [工作目录]
# 停止: Ctrl+C 或删除 .claude-running 文件

TASK="$1"
WORKDIR="${2:-$(pwd)}"
RETRY_WAIT=300
MAX_RETRIES=100
RETRY_COUNT=0
ROUND=0

if [ -z "$TASK" ]; then
  echo "用法: bash run-forever.sh \"任务描述\" [工作目录]"
  exit 1
fi

cd "$WORKDIR" || exit 1
touch .claude-running
echo "$(date '+%Y-%m-%d %H:%M:%S') | 不眠模式v2启动 | 任务: $TASK"

# ── 构建每轮 prompt ──
build_prompt() {
  local round=$1

  # 读取 git 最近改动，防止新 session 重复改同一批文件
  local recent_changes=""
  if git rev-parse --git-dir > /dev/null 2>&1; then
    recent_changes=$(git log --oneline -20 --no-decorate 2>/dev/null)
    recent_changes="
## 已完成的工作（git log，禁止重复修改这些文件）
${recent_changes}
"
  fi

  # 读取作战计划（如果有）
  local mission=""
  if [ -f .claude-mission.md ]; then
    mission="
## 作战计划
$(cat .claude-mission.md)
"
  fi

  # 组装 prompt，强制带路由指令
  cat <<PROMPT
# 不眠模式 · 第${round}轮

## 核心任务
${TASK}

## 铁律（每轮必须遵守）
1. 先读 git log 确认哪些文件已经改过 → 不要再碰已改过的文件
2. 按 CLAUDE.md 路由表匹配 skill，调用所有相关 skill 不要只调一个
3. 每完成一个子任务立即 git add + git commit，不要攒到最后
4. 如果所有子任务都完成了，在结尾明确说"ALL_TASKS_COMPLETE"
5. 如果遇到需要用户决策的问题，写入 .claude-pending-decisions.md 然后继续做其他任务
6. 禁止覆盖写入已有文件的全部内容，用 Edit 局部修改
${recent_changes}
${mission}
PROMPT
}

# ── 主循环 ──
while [ -f .claude-running ] && [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  ROUND=$((ROUND+1))
  PROMPT=$(build_prompt $ROUND)
  echo "$(date '+%Y-%m-%d %H:%M:%S') | 第${ROUND}轮开始"

  OUTPUT=$(claude -p "$PROMPT" \
    --max-turns 200 \
    --output-format json \
    2>&1)
  EXIT_CODE=$?

  # 检查是否全部完成
  if echo "$OUTPUT" | grep -q "ALL_TASKS_COMPLETE"; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') | 所有任务完成"
    rm -f .claude-running
    break
  fi

  # 正常退出（context用完但任务没完）→ 下一轮
  if [ $EXIT_CODE -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') | 第${ROUND}轮正常结束，检查是否还有未完成任务"
    sleep 5
    continue
  fi

  # 限额
  if echo "$OUTPUT" | grep -qi "rate.limit\|too.many.requests\|429\|quota\|overloaded"; then
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo "$(date '+%Y-%m-%d %H:%M:%S') | 限额触发，等待 ${RETRY_WAIT}s..."
    sleep $RETRY_WAIT
    if [ $RETRY_COUNT -gt 5 ]; then
      RETRY_WAIT=$((RETRY_WAIT + 60))
    fi
    continue
  fi

  # Context 满
  if echo "$OUTPUT" | grep -qi "context.window\|token.limit\|maximum.context"; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') | Context满，第${ROUND}轮结束，下轮自动续接"
    RETRY_COUNT=$((RETRY_COUNT+1))
    sleep 10
    continue
  fi

  # 未知错误
  echo "$(date '+%Y-%m-%d %H:%M:%S') | 退出码=$EXIT_CODE，30s后重试"
  echo "$OUTPUT" | tail -5
  RETRY_COUNT=$((RETRY_COUNT+1))
  sleep 30
done

echo "$(date '+%Y-%m-%d %H:%M:%S') | 不眠模式结束 (${ROUND}轮, ${RETRY_COUNT}次重试)"
rm -f .claude-running
