@echo off
chcp 65001 >nul 2>&1
title 万象工具箱 · 爬小红书
cd /d "%~dp0"
node tools/xhs-scraper.js
pause
