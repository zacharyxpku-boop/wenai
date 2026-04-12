@echo off
set DASHSCOPE_API_KEY=sk-78d76ee8d247485da8a46c5a3edb2a6d
set QWEN_MODEL=qwen-max
set PORT=3456
echo Starting Qwen proxy on port %PORT%...
node "%~dp0proxy.js"
