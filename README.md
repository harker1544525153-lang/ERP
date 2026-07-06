# ERP系统 - 企业资源管理系统

对标金蝶、用友、畅捷通等主流商用ERP的MVP版本全栈系统。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **UI组件**: Ant Design 5
- **构建工具**: Vite 5
- **路由**: React Router 6
- **动画**: Framer Motion
- **后端框架**: Express.js
- **数据存储**: JSON文件（离线嵌入式数据库）
- **认证**: JWT

## 项目目录结构

```
ERP/
├── apps/                     # 应用代码（上传到 GitHub）
│   ├── frontend/            # React前端
│   │   ├── src/
│   │   │   ├── api/         # API调用
│   │   │   ├── components/  # 公共组件
│   │   │   ├── contexts/    # React上下文
│   │   │   ├── pages/       # 页面组件
│   │   │   ├── utils/       # 工具函数
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── .env.production  # 生产环境配置
│   │   ├── vite.config.ts   # Vite配置（固定端口5177）
│   │   └── package.json
│   └── backend/             # Express后端（Vercel部署根目录）
│       ├── server.js        # 服务器主文件（固定端口3001）
│       ├── data-init.json   # 初始化数据（上传到GitHub）
│       ├── data.json        # 运行时数据库（本地专用，不上传）
│       ├── vercel.json      # Vercel部署配置
│       └── package.json
├── docs/                    # 文档目录
│   └── .gitkeep
├── local/                   # 本地数据目录（不上传GitHub）
│   ├── database-backups/    # 数据库备份
│   └── .gitkeep
├── .github/                 # GitHub Actions
│   └── workflows/
│       └── deploy.yml       # 自动部署到GitHub Pages
├── .gitignore               # 忽略本地文件
├── start.bat                # Windows一键启动脚本
└── README.md                # 项目说明文档
```

### 目录说明

| 目录 | 是否上传GitHub | 说明 |
|------|---------------|------|
| `apps/` | ✅ 是 | 前端和后端源代码 |
| `docs/` | ✅ 是 | 项目文档 |
| `local/` | ❌ 否 | 本地数据和备份 |
| `apps/backend/data.json` | ❌ 否 | 运行时数据库（本地专用） |
| `apps/backend/data-init.json` | ✅ 是 | 初始化数据模板 |

## 核心功能模块

### 基础设置
- 组织架构管理（支持多级层级显示）
- 用户管理（导出功能）
- 角色权限管理
- 会计科目体系
- 客户管理
- 供应商管理
- 物料管理
- 仓库管理

### 财务总账
- 凭证录入
- 凭证审核
- 凭证管理（导出功能）
- 科目余额查询

### 进销存
- 采购管理（采购订单、采购入库）
- 销售管理（销售订单、销售出库）
- 库存管理（库存查询、库存调拨）

### 应收应付
- 应收账款管理
- 应付账款管理

### 报表中心
- 资产负债表
- 利润表
- 库存报表
- 采购/销售报表

### 系统功能
- 个人信息管理
- 系统设置（基本设置、通知设置、安全设置）
- 帮助中心（FAQ、使用手册、联系客服）
- 消息通知（未读消息计数、标为已读、删除通知）

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

> **无需安装数据库！** 本项目使用 JSON 文件存储数据，开箱即用。

---

### 🚀 本地开发

#### 方式一：Windows 一键启动（推荐）
```bash
# 双击 start.bat 文件，或在命令行运行
start.bat
```

#### 方式二：手动启动
```powershell
# 安装依赖（首次运行）
cd apps\frontend; npm install
cd ..\backend; npm install

# 启动后端服务（端口3001）
cd apps\backend
npm start

# 启动前端服务（端口5177，新终端窗口）
cd apps\frontend
npm run dev
```

#### 服务端口

| 服务 | 端口 | 地址 |
|------|------|------|
| 前端 | 5177 | http://localhost:5177 |
| 后端API | 3001 | http://localhost:3001/api |

#### 默认账号

- 用户名: `admin`
- 密码: `123456`

#### 测试用户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 超级管理员 |
| finance | 123456 | 财务主管 |
| purchase | 123456 | 采购专员 |
| sale | 123456 | 销售专员 |
| warehouse | 123456 | 仓储主管 |
| production | 123456 | 生产经理 |

---

### 💾 数据库管理

#### 本地数据库

- **运行时数据库**: `apps/backend/data.json`
- **初始化数据模板**: `apps/backend/data-init.json`
- **数据备份**: `local/database-backups/`

> `data.json` 已加入 `.gitignore`，不会上传到GitHub，确保本地数据安全。

#### 重置数据库
如需将数据库恢复到初始状态：
```bash
# 1. 先获取登录令牌
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 2. 使用令牌调用重置接口
curl -X POST http://localhost:3001/api/reset \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 同步初始数据
当 `data.json` 更新后，建议同步到 `data-init.json`：
```powershell
# Windows
copy apps\backend\data.json apps\backend\data-init.json

# Linux/Mac
cp apps/backend/data.json apps/backend/data-init.json
```

#### 数据结构
`data.json` 包含以下模块：
- `users`, `roles`, `organizations`
- `customers`, `suppliers`, `materials`, `warehouses`
- `purchaseOrders`, `saleOrders`, `inventories`
- `receivables`, `payables`, `vouchers`
- `purchaseReceipts`, `saleDeliveries`, `transfers`
- `productionPickings`, `productionReturns`
- `receipts`, `payments`

---

## 部署到 GitHub Pages

### 架构说明

本项目采用前后端分离部署：
- **前端**：部署到 GitHub Pages（静态站点）
- **后端**：部署到 Vercel（Node.js 服务器）

---

### 第一步：部署后端到 Vercel

1. **访问 Vercel**：https://vercel.com
2. **登录**：使用 GitHub 账号登录
3. **新建项目**：
   - 点击 "New Project"
   - 选择导入 GitHub 仓库 `harker1544525153-lang/ERP`
4. **配置项目**：
   - 项目名称：`erp-api`
   - Framework Preset：`Other`
   - Root Directory：`apps/backend`（**重要**：必须设置为此值）
5. **部署**：点击 "Deploy"

6. **获取部署地址**：部署完成后，会得到类似 `https://erp-api-xxxx.vercel.app` 的地址

> **Vercel 配置说明**：
> - Vercel 只读取 `apps/backend` 目录下的文件
> - `apps/backend/vercel.json` 定义了 Serverless Function 配置
> - `apps/backend/package.json` 定义了 Node.js 依赖和启动脚本

---

### 第二步：配置前端 API 地址

编辑 `apps/frontend/.env.production` 文件：
```env
VITE_API_URL=https://erp-api-xxxx.vercel.app/api
```
将 `https://erp-api-xxxx.vercel.app` 替换为你的 Vercel 部署地址。

---

### 第三步：部署前端到 GitHub Pages

#### 方式一：使用 gh-pages 自动部署（推荐）
```powershell
cd apps\frontend
npm run build
npm run deploy
```

#### 方式二：手动部署
```powershell
# 构建项目
cd apps\frontend
npm run build

# 创建或切换到 gh-pages 分支
cd ..\..
git checkout -b gh-pages

# 删除除 dist 外的所有文件
git rm -rf .
git checkout main -- apps\frontend\dist

# 移动 dist 内容到根目录
mv apps\frontend\dist\* .
rm -rf apps

# 提交并推送
git add .
git commit -m "deploy: 部署前端到 GitHub Pages"
git push -u origin gh-pages

# 切回 main 分支
git checkout main
```

---

### 第四步：配置 GitHub Pages

1. 访问仓库设置：https://github.com/harker1544525153-lang/ERP/settings/pages
2. 在 "Source" 部分：
   - 选择 `gh-pages` 分支
   - 选择 `/ (root)` 目录
3. 点击 "Save"

---

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端 | https://harker1544525153-lang.github.io/ERP/ |
| 后端API | https://erp-api-xxxx.vercel.app/api |

---

### 环境变量配置

#### 后端环境变量（Vercel）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| JWT_SECRET | erp-secret-key | JWT 密钥 |
| PORT | 3001 | 服务端口 |

#### 前端环境变量

在 `apps/frontend/.env.production` 中配置：
```env
VITE_API_URL=https://erp-api-xxxx.vercel.app/api
```

---

## GitHub 上传命令

### 完整上传流程（Windows PowerShell）

```powershell
# ============ 第一步：同步本地数据 ============
# 如果本地数据库(data.json)有修改，同步到初始化数据模板
copy apps\backend\data.json apps\backend\data-init.json

# ============ 第二步：构建前端 ============
cd apps\frontend
npm run build

# ============ 第三步：提交代码到 main 分支 ============
cd ..\..
git add .
git status  # 确认要提交的文件
git commit -m "feat: 更新项目内容"
git push origin main

# ============ 第四步：部署前端到 GitHub Pages ============
cd apps\frontend
npm run deploy

# ============ 第五步：更新 Vercel 后端（如有后端代码修改） ============
# Vercel 会自动检测 GitHub main 分支的更新并重新部署
# 如果需要手动触发：登录 Vercel 网站 https://vercel.com/harker1544/erp-api
# 在 Deployments 页面点击最新部署右侧的三个点 ...，选择 Redeploy
# 注意：Vercel 只读取 apps/backend 目录的变更
```

### 分步说明

| 步骤 | 命令 | 说明 |
|------|------|------|
| 1 | `copy apps\backend\data.json apps\backend\data-init.json` | 同步本地数据库到初始化模板 |
| 2 | `cd apps\frontend && npm run build` | 构建前端项目 |
| 3 | `git add . && git commit -m "..." && git push origin main` | 提交代码到 main 分支 |
| 4 | `cd apps\frontend && npm run deploy` | 部署前端到 gh-pages 分支 |
| 5 | Vercel自动部署 | 检测 apps/backend 目录变更后自动重新部署 |

### 验证部署

```powershell
# 验证后端API是否正常
curl -X POST https://erp-api-gamma.vercel.app/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d '{"username":"admin","password":"123456"}'

# 验证前端是否正常
# 访问: https://harker1544525153-lang.github.io/ERP/
```

---

### 本地开发与生产环境差异

| 项目 | 本地开发 | 生产环境 |
|------|----------|----------|
| 前端地址 | http://localhost:5177 | https://harker1544525153-lang.github.io/ERP/ |
| API地址 | /api（代理到 localhost:3001） | https://erp-api-xxxx.vercel.app/api |
| 数据存储 | 本地 JSON 文件（持久化） | Vercel 临时文件系统（重启后数据会重置） |

> **注意**：由于 Vercel 使用临时文件系统，生产环境的数据修改在部署重启后会丢失。如需持久化数据，建议使用外部数据库服务。

## 开发注意事项

### 代码规范
- 使用 ESLint + Prettier

### 新增页面
- 在 `apps/frontend/src/pages/` 下创建新页面
- 在 `apps/frontend/src/api/` 下创建对应的 API 文件

## 许可证

MIT License