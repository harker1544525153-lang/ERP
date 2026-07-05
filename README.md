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

## 项目结构

```
ERP/
├── apps/
│   ├── frontend/         # React前端
│   │   ├── src/
│   │   │   ├── api/      # 真实API调用
│   │   │   ├── mock/     # Mock数据（保留参考）
│   │   │   ├── components/ # 公共组件
│   │   │   ├── contexts/   # React上下文
│   │   │   ├── pages/    # 页面组件
│   │   │   ├── utils/    # 工具函数
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   └── package.json
│   └── backend/          # Express后端
│       ├── server.js     # 服务器主文件
│       ├── data.json     # 嵌入式数据库（JSON文件）
│       └── package.json
├── start.bat             # Windows一键启动
└── README.md
```

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

### 🚀 启动方式

#### 方式一：Windows 一键启动（推荐）
```bash
# 双击 start.bat 文件，或在命令行运行
start.bat
```

#### 方式二：PowerShell 启动
```powershell
# 打开 PowerShell，进入项目目录
cd D:\Desktop\Trea\ERP

# 安装依赖（首次运行）
cd apps\frontend; npm install
cd ..\backend; npm install

# 启动后端服务（保持窗口打开）
npm start

# 打开新的 PowerShell 窗口，启动前端服务
cd D:\Desktop\Trea\ERP\apps\frontend
npm run dev
```

#### 方式三：手动分步启动
```bash
# 1. 安装前端依赖
cd apps/frontend
npm install

# 2. 安装后端依赖
cd ../backend
npm install

# 3. 启动后端服务（新终端/新窗口）
npm run start

# 4. 启动前端服务（新终端/新窗口）
cd ../frontend
npm run dev
```

---

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:5177 |
| 后端API | http://localhost:3001/api |

### 默认账号

- 用户名: `admin`
- 密码: `123456`

### 测试用户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 超级管理员 |
| finance | 123456 | 财务主管 |
| purchase | 123456 | 采购专员 |
| sale | 123456 | 销售专员 |
| warehouse | 123456 | 仓储主管 |
| production | 123456 | 生产经理 |

## 数据存储

本项目采用离线嵌入式数据库方案：
- 所有数据存储在 `apps/backend/data.json` 文件中
- 无需额外安装数据库服务
- 数据持久化，重启服务后数据不丢失
- 支持 CRUD 操作
- 适合本地开发、演示和小型项目使用

### 数据库管理

#### 修改测试数据
直接编辑 `apps/backend/data.json` 文件即可修改测试数据，修改后重启后端服务生效：

```bash
cd apps/backend
npm start
```

> **注意**：修改数据后，建议同步更新 `data-init.json` 文件，以确保重置时能恢复到最新的测试数据。

#### 重置数据库
如需将数据库恢复到初始状态，可通过 API 接口重置：

```bash
# 1. 先获取登录令牌
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 2. 使用令牌调用重置接口
curl -X POST http://localhost:3001/api/reset \
  -H "Authorization: Bearer YOUR_TOKEN"
```

> 初始数据备份文件为 `apps/backend/data-init.json`，重置时会从该文件恢复数据。

#### 同步初始数据
当 `data.json` 中的数据更新后，建议同步到 `data-init.json`：

```bash
# Windows
copy apps\backend\data.json apps\backend\data-init.json

# Linux/Mac
cp apps/backend/data.json apps/backend/data-init.json
```

#### 数据结构说明
`data.json` 包含以下模块数据：
- `users` - 用户信息
- `roles` - 角色权限
- `organizations` - 组织架构
- `customers` - 客户信息
- `suppliers` - 供应商信息
- `materials` - 物料信息（含成品）
- `warehouses` - 仓库信息
- `purchaseOrders` - 采购订单
- `saleOrders` - 销售订单
- `inventories` - 库存记录
- `receivables` - 应收账款
- `payables` - 应付账款
- `vouchers` - 凭证记录
- `bom` - 物料清单（BOM）
- `productionOrders` - 生产订单

## 功能亮点

### 1. 消息通知系统
- 实时未读消息计数显示
- 支持按类型筛选通知（采购、销售、凭证、应收、应付、库存、系统）
- 支持标为已读、全部已读
- 支持批量删除通知

### 2. 导出功能
- 用户管理导出
- 组织架构导出
- 凭证管理导出
- 导出格式为 CSV，支持中文

### 3. 用户界面
- 支持亮色/暗色主题切换
- 响应式侧边栏布局
- 流畅的动画效果
- 玻璃拟态设计风格

## 部署到 GitHub

### 准备工作

1. 确保已安装 [Git](https://git-scm.com/downloads)

2. 创建 GitHub 仓库：
   - 访问 https://github.com/new
   - 创建一个新的空仓库（不要初始化 README）

### 上传项目

```bash
# 初始化 git 仓库
cd ERP
git init

# 添加所有文件（自动排除 .gitignore 中的文件）
git add .

# 提交代码
git commit -m "feat: 初始化ERP系统 MVP版本"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/your-repo-name.git

# 推送到主分支
git branch -M main
git push -u origin main
```

### GitHub 仓库配置建议

1. **分支保护**：
   - 在 Settings > Branches 中启用 main 分支保护

2. **Gitignore 规则**：
   - 已包含 `.gitignore` 文件，自动排除以下文件：
     - `node_modules/`
     - `dist/`, `build/`
     - `.env` 文件
     - 日志文件
     - 包管理器锁文件

## 开发注意事项

### 代码规范
- 使用 ESLint + Prettier

### 新增页面
- 在 `apps/frontend/src/pages/` 下创建新页面
- 在 `apps/frontend/src/api/` 下创建对应的 API 文件

## 许可证

MIT License
