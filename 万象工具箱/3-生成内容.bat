@echo off
chcp 65001 >nul 2>&1
title 万象工具箱 · 生成内容
cd /d "%~dp0"
node tools/content-generator.js
pause
