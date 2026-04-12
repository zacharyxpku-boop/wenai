#!/bin/bash
# ============================================================
# 安装/更新 Claude Code CLI
# ============================================================

echo "正在安装 Claude Code CLI..."

# 全局安装
npm install -g @anthropic-ai/claude-code

# 验证安装
if command -v claude &>/dev/null; then
    echo "安装成功!"
    claude --version
else
    echo "安装完成，但 claude 命令未找到。"
    echo "请尝试重新打开终端，或手动添加 npm 全局目录到 PATH。"
    echo ""
    echo "npm 全局目录:"
    npm config get prefix
    echo ""
    echo "将以下路径添加到 PATH:"
    echo "  $(npm config get prefix)/bin"
fi
