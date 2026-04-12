#!/bin/bash
# ============================================================
# 快速启动 - 一键运行
# 用法: bash quick-start.sh
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "  Claude Code 24H 自动编码系统"
echo "========================================"
echo ""
echo "请选择运行模式:"
echo ""
echo "  1) 单次任务 - 执行一个编码任务然后退出"
echo "  2) 守护进程 - 持续监听任务队列"
echo "  3) 多Agent - 并行执行多个任务"
echo "  4) 编排器   - Agent SDK 智能编排"
echo "  5) 安装CLI  - 安装/更新 Claude Code"
echo "  0) 退出"
echo ""
read -p "请输入选项 [1-5]: " choice

case $choice in
    1)
        read -p "请输入任务描述: " task
        read -p "请输入项目目录: " project
        bash "$SCRIPT_DIR/run-task.sh" "$task" "$project"
        ;;
    2)
        read -p "请输入项目目录: " project
        bash "$SCRIPT_DIR/run-daemon.sh" "$project"
        ;;
    3)
        echo "请确保已在 tasks/ 目录中添加任务文件"
        read -p "最大并行数 [3]: " parallel
        parallel=${parallel:-3}
        bash "$SCRIPT_DIR/run-multi.sh" "$parallel"
        ;;
    4)
        cd "$ROOT_DIR/agent-sdk"
        if [ ! -d "node_modules" ]; then
            echo "首次运行，安装依赖..."
            npm install
        fi
        read -p "守护进程模式? [y/N]: " daemon
        if [[ "$daemon" =~ ^[Yy] ]]; then
            node orchestrator.mjs --daemon
        else
            node orchestrator.mjs
        fi
        ;;
    5)
        bash "$SCRIPT_DIR/install-claude.sh"
        ;;
    0)
        echo "退出"
        exit 0
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac
