# 思维作业管理系统

> [English](./README_EN.md) | 中文

一个基于 React 和 AWS 云服务的现代化在线作业管理系统，专为教师和学生打造，提供完整的作业创建、提交、批改和评分功能。

## 📋 项目概述

思维作业管理系统是一个全栈 web 应用，采用现代化的前后端分离架构。前端使用 React + Ant Design 构建用户界面，后端完全基于 AWS 云服务，包括 Cognito 用户认证、DynamoDB 数据存储、Lambda 函数处理业务逻辑以及 API Gateway 提供 RESTful API 接口。

### 🌟 核心特性

- **用户认证与授权**: 基于 AWS Cognito 的安全登录系统，支持教师和学生两种角色
- **作业管理**: 教师可创建、分配和管理作业，学生可查看和提交作业
- **智能批改**: 教师可对学生作业进行批改和评分，支持图片标注
- **实时通知**: 基于仪表板的通知系统，及时提醒待办事项
- **文件管理**: 支持教学材料的上传、下载和共享
- **多语言支持**: 内置中英文双语系统，可动态切换
- **响应式设计**: 适配不同设备尺寸，提供一致的用户体验

## 🏗️ 技术架构

### 前端技术栈

- **React 19**: 核心框架，使用最新的 React 特性
- **Ant Design 5**: UI 组件库，提供丰富的组件和主题
- **React Router**: 客户端路由管理
- **Zustand**: 轻量级状态管理
- **AWS Amplify**: AWS 服务集成和认证
- **Konva/React-Konva**: 图片标注和绘图功能
- **Axios**: HTTP 客户端
- **Vite**: 构建工具和开发服务器

### 后端技术架构（AWS 云服务）

- **AWS Cognito**: 用户身份认证和授权管理
- **AWS DynamoDB**: NoSQL 数据库，存储用户、班级、作业等数据
- **AWS Lambda**: 无服务器函数，处理业务逻辑
- **AWS API Gateway**: RESTful API 网关
- **AWS S3**: 对象存储，用于文件和图片存储
- **AWS CloudFormation/Amplify**: 基础设施即代码

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- AWS 账户（用于后端服务）

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/your-username/siwei.git
cd siwei
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**
   创建 `.env` 文件并配置以下变量：

```env
VITE_USER_POOL_ID=your-cognito-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-cognito-client-id
VITE_REST_ENDPOINT=your-api-gateway-endpoint
VITE_GRAPHQL_ENDPOINT=your-graphql-endpoint
VITE_S3_BUCKET=your-s3-bucket-name
VITE_AWS_REGION=your-aws-region
```

4. **启动开发服务器**

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

## 👥 用户角色与功能

### 教师角色

- ✅ 创建和管理班级
- ✅ 发布作业和设置截止时间
- ✅ 查看学生提交状态
- ✅ 批改作业并给出评分和评语
- ✅ 上传和管理教学材料
- ✅ 查看待批改作业提醒

### 学生角色

- ✅ 查看已加入的班级
- ✅ 浏览待提交、已提交、已批改的作业
- ✅ 在线提交作业（支持图片上传）
- ✅ 查看作业批改结果和评语
- ✅ 下载教学材料
- ✅ 查看作业截止提醒

## 🔧 可用脚本

```bash
# 开发服务器
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint

# 预览构建结果
npm run preview

# AWS Amplify 相关
npm run amplify:status    # 查看Amplify状态
npm run amplify:push      # 推送后端更新
npm run amplify:pull      # 拉取后端配置
npm run amplify:publish   # 发布到生产环境
```

## 🌍 国际化

项目支持中英文双语：

- 默认语言：中文
- 支持语言：中文 (zh) / 英文 (en)
- 翻译文件位置：`src/shared/i18n/translations/`
- 使用 `useTranslation` 钩子进行翻译

## 📱 响应式设计

- 移动端优先的响应式设计
- 支持手机、平板、桌面端
- 使用 Ant Design 的栅格系统
- 自适应组件布局

## 🔒 安全特性

- AWS Cognito 用户池认证
- JWT 令牌自动刷新
- 路由级别的权限控制
- 角色基础的访问控制（RBAC）
- S3 预签名 URL 安全文件上传
- API 请求自动携带认证头

## 🛠️ 部署

### 前端部署

1. 构建生产版本：`npm run build`
2. 将 `dist` 目录部署到静态托管服务
3. 推荐使用 AWS S3 + CloudFront 或 Vercel/Netlify

### 后端部署

使用 AWS Amplify CLI 部署：

```bash
amplify init
amplify push
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面库
- [Ant Design](https://ant.design/) - React UI 组件库
- [AWS Amplify](https://aws.amazon.com/amplify/) - 全栈开发平台
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理库

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
