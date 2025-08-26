# 项目部署设置指南 / Project Setup Guide

## 🔧 环境配置 / Environment Configuration

### 1. 环境变量设置 / Environment Variables Setup

复制环境变量模板并配置实际值：
Copy the environment template and configure actual values:

```bash
cp env.example .env
```

然后编辑 `.env` 文件，填入您的 AWS 资源信息：
Then edit the `.env` file with your AWS resource information:

```env
# AWS Cognito 用户池配置
VITE_USER_POOL_ID=your-actual-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-actual-client-id

# API Gateway 端点
VITE_REST_ENDPOINT=https://your-api-id.execute-api.region.amazonaws.com/prod

# S3 存储桶
VITE_S3_BUCKET=your-s3-bucket-name

# AWS 区域
VITE_AWS_REGION=us-east-1
```

### 2. AWS 后端部署 / AWS Backend Deployment

您需要在 AWS 中设置以下服务：
You need to set up the following AWS services:

#### AWS Cognito

- 创建用户池 (User Pool)
- 配置用户组：teacher, student
- 获取用户池 ID 和客户端 ID

#### AWS DynamoDB

- 创建数据表存储用户、班级、作业数据
- 配置适当的分区键和排序键

#### AWS Lambda + API Gateway

- 部署 Lambda 函数处理业务逻辑
- 配置 API Gateway 路由
- 设置 CORS 和认证

#### AWS S3

- 创建存储桶用于文件上传
- 配置预签名 URL 策略
- 设置适当的访问权限

### 3. 安全注意事项 / Security Considerations

⚠️ **重要安全提醒 / Important Security Reminders:**

1. **永远不要提交 `.env` 文件到版本控制**
   Never commit `.env` files to version control

2. **使用 IAM 角色限制权限**
   Use IAM roles to restrict permissions

3. **启用 AWS CloudTrail 进行审计**
   Enable AWS CloudTrail for auditing

4. **定期轮换访问密钥**
   Regularly rotate access keys

5. **使用 HTTPS 进行所有通信**
   Use HTTPS for all communications

### 4. 本地开发环境 / Local Development Environment

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行代码检查
npm run lint

# 构建生产版本
npm run build
```

### 5. 生产环境部署 / Production Deployment

#### 前端部署选项 / Frontend Deployment Options:

1. **AWS S3 + CloudFront** (推荐)
2. **Vercel**
3. **Netlify**
4. **GitHub Pages**

#### 部署步骤 / Deployment Steps:

```bash
# 构建生产版本
npm run build

# 部署到您选择的托管服务
# Deploy to your chosen hosting service
```

### 6. 监控和日志 / Monitoring and Logging

- 配置 AWS CloudWatch 监控
- 设置错误告警
- 启用 API Gateway 日志
- 监控 DynamoDB 性能指标

---

如需帮助，请查看[项目 README](README.md)或提交[Issue](https://github.com/your-username/siwei/issues)。
For help, please check the [project README](README.md) or submit an [Issue](https://github.com/your-username/siwei/issues).
