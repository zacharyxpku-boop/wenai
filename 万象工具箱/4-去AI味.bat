@echo off
chcp 65001 >nul 2>&1
title 万象工具箱 · 去AI味
cd /d "%~dp0"
node tools/humanizer.js
pause
