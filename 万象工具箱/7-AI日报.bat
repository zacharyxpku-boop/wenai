@echo off
chcp 65001 >nul 2>&1
title 万象工具箱 · AI日报
cd /d "%~dp0"
node tools/daily-digest.js
pause
