@echo off
chcp 65001 >nul 2>&1
title 万象工具箱 · 下载视频
cd /d "%~dp0"
node tools/video-downloader.js
pause
