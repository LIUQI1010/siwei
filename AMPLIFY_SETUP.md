# AWS Amplify 集成指南

本项目已集成 AWS Amplify，提供完整的用户认证、API 管理和文件存储功能。

## 🚀 快速开始

### 1. 安装 AWS CLI 和 Amplify CLI

```bash
# 安装 AWS CLI
# 下载地址: https://aws.amazon.com/cli/

# 安装 Amplify CLI
npm install -g @aws-amplify/cli

# 配置 Amplify
amplify configure
```

### 2. 初始化 Amplify 项目

```bash
# 在项目根目录执行
amplify init

# 按照提示配置项目
# - 项目名称: siwei
# - 环境: dev
# - 默认编辑器: 选择你的编辑器
# - 类型: JavaScript
# - 框架: React
# - 源码目录: src
# - 分发目录: dist
# - 构建命令: npm run build
# - 开始命令: npm run dev
```

### 3. 添加认证服务

```bash
# 添加 Cognito 用户池
amplify add auth

# 选择配置:
# - 默认配置
# - 用户名: 选择 "Email"
# - 密码要求: 至少8位
# - 多因素认证: 选择 "No"
# - 用户属性: 选择 "Email" 和 "Name"
# - 自定义属性: 添加 "role" (String)
```

### 4. 添加 API 服务

```bash
# 添加 GraphQL API
amplify add api

# 选择配置:
# - GraphQL
# - API 名称: siweiAPI
# - 认证类型: Amazon Cognito User Pool
# - 使用默认的 GraphQL schema
```

### 5. 添加存储服务

```bash
# 添加 S3 存储
amplify add storage

# 选择配置:
# - 内容 (S3)
# - 存储名称: siweiStorage
# - 访问级别: 认证用户
# - 权限: 创建/更新/删除/读取
```

### 6. 推送配置到云端

```bash
# 推送所有配置到 AWS
amplify push

# 等待部署完成
```

### 7. 配置环境变量

创建 `.env` 文件并填入以下配置：

```env
# AWS Amplify Configuration
VITE_USER_POOL_ID=你的用户池ID
VITE_USER_POOL_CLIENT_ID=你的用户池客户端ID
VITE_AWS_REGION=你的AWS区域

# API Endpoints
VITE_GRAPHQL_ENDPOINT=你的GraphQL端点
VITE_REST_ENDPOINT=你的REST端点

# Storage
VITE_S3_BUCKET=你的S3存储桶名称
```

## 📁 项目结构

```
src/
├── amplifyconfiguration.js          # Amplify 配置文件
├── shared/
│   └── services/
│       └── amplifyAuth.js          # Amplify 认证服务
├── features/
│   └── auth/
│       └── pages/
│           ├── LoginPage.jsx       # 登录页面
│           └── RegisterPage.jsx    # 注册页面
└── shared/
    └── components/
        └── guards/
            └── AuthGuard.jsx       # 认证守卫
```

## 🔐 认证功能

### 用户注册

- 邮箱验证
- 密码强度要求
- 角色选择 (学生/教师)
- 邮箱验证码确认

### 用户登录

- 邮箱 + 密码登录
- 自动角色识别
- 会话管理

### 安全特性

- JWT Token 管理
- 自动 Token 刷新
- 安全的密码策略

## 📡 API 集成

### GraphQL API

- 自动认证集成
- 用户权限控制
- 实时数据同步

### REST API

- 标准 HTTP 方法
- 认证头自动添加
- 错误处理

## 💾 文件存储

### S3 集成

- 用户文件上传
- 权限控制
- 文件管理

## 🛠️ 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# Amplify 相关命令
amplify status          # 查看状态
amplify push            # 推送配置
amplify pull            # 拉取配置
amplify publish         # 发布应用
```

## 🔧 故障排除

### 常见问题

1. **认证失败**

   - 检查环境变量配置
   - 确认用户池配置正确
   - 检查网络连接

2. **API 调用失败**

   - 确认 API 已正确部署
   - 检查认证状态
   - 查看浏览器控制台错误

3. **存储访问失败**
   - 确认 S3 存储桶权限
   - 检查用户认证状态
   - 验证存储策略配置

### 调试技巧

```javascript
// 在浏览器控制台中查看 Amplify 状态
import { Amplify } from "aws-amplify";
console.log(Amplify.getConfig());

// 检查认证状态
import { getCurrentUser } from "aws-amplify/auth";
getCurrentUser().then(console.log).catch(console.error);
```

## 📚 相关资源

- [AWS Amplify 官方文档](https://docs.amplify.aws/)
- [Amplify JavaScript 库](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)
- [AWS Cognito 用户池](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [Amplify CLI 命令参考](https://docs.amplify.aws/cli/)

## 🤝 贡献

如有问题或建议，请提交 Issue 或 Pull Request。

---

**注意**: 请确保在生产环境中妥善保护你的 AWS 凭证和配置信息。
