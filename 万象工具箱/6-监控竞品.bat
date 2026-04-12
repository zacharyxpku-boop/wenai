@echo off
chcp 65001 >nul 2>&1
title 万象工具箱 · 监控竞品
cd /d "%~dp0"
node tools/competitor-monitor.js
pause
