@echo off
chcp 65001 >nul 2>&1
title 万象工具箱 v1.0
cd /d "%~dp0"
node tools/launcher.js
pause
