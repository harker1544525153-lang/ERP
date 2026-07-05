@echo off
chcp 65001 >nul
echo ================================================
echo           ERP系统 - 一键启动脚本
echo ================================================
echo.

echo [1/4] 检查 Node.js 环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: 未检测到 Node.js，请先安装 Node.js 18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo OK: Node.js 已安装

echo.
echo [2/4] 检查前端依赖是否已安装...
if not exist "apps\frontend\node_modules" (
    echo 正在安装前端依赖，请稍候...
    cd apps\frontend
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: 前端依赖安装失败
        pause
        exit /b 1
    )
    echo OK: 前端依赖安装完成
    cd ..\..
) else (
    echo OK: 前端依赖已安装
)

echo.
echo [3/4] 检查后端依赖是否已安装...
if not exist "apps\backend\node_modules" (
    echo 正在安装后端依赖，请稍候...
    cd apps\backend
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: 后端依赖安装失败
        pause
        exit /b 1
    )
    echo OK: 后端依赖安装完成
    cd ..\..
) else (
    echo OK: 后端依赖已安装
)

echo.
echo [4/4] 启动服务...
echo.
echo 后端服务将在 http://localhost:3001 启动
echo 前端服务将在 http://localhost:5177 启动
echo.

set DATA_DIR=apps\backend
start "ERP Backend" cmd /k "cd apps\backend && npm run start"
timeout /t 3 /nobreak >nul
start "ERP Frontend" cmd /k "cd apps\frontend && npm run dev"

echo.
echo 服务启动中，请稍候...
echo 访问地址: http://localhost:5177
echo 默认账号: admin / 密码: 123456
echo.
pause