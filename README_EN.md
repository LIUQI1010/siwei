# Siwei Homework Management System

A modern online homework management system built with React and AWS cloud services, designed for teachers and students to provide comprehensive homework creation, submission, grading, and scoring functionalities.

## 📋 Project Overview

Siwei Homework Management System is a full-stack web application using modern frontend-backend separation architecture. The frontend is built with React + Ant Design for user interface, while the backend is entirely based on AWS cloud services, including Cognito for user authentication, DynamoDB for data storage, Lambda functions for business logic, and API Gateway for RESTful API endpoints.

### 🌟 Core Features

- **User Authentication & Authorization**: Secure login system based on AWS Cognito, supporting both teacher and student roles
- **Homework Management**: Teachers can create, assign, and manage homework; students can view and submit assignments
- **Intelligent Grading**: Teachers can grade student homework with scoring and comments, supporting image annotation
- **Real-time Notifications**: Dashboard-based notification system for timely task reminders
- **File Management**: Support for uploading, downloading, and sharing teaching materials
- **Multi-language Support**: Built-in bilingual system (Chinese/English) with dynamic switching
- **Responsive Design**: Adapts to different device sizes, providing consistent user experience

## 🏗️ Technology Architecture

### Frontend Tech Stack

- **React 19**: Core framework using latest React features
- **Ant Design 5**: UI component library with rich components and themes
- **React Router**: Client-side routing management
- **Zustand**: Lightweight state management
- **AWS Amplify**: AWS services integration and authentication
- **Konva/React-Konva**: Image annotation and drawing functionality
- **Axios**: HTTP client
- **Vite**: Build tool and development server

### Backend Architecture (AWS Cloud Services)

- **AWS Cognito**: User identity authentication and authorization management
- **AWS DynamoDB**: NoSQL database for storing users, classes, homework data
- **AWS Lambda**: Serverless functions for business logic processing
- **AWS API Gateway**: RESTful API gateway
- **AWS S3**: Object storage for files and images
- **AWS CloudFormation/Amplify**: Infrastructure as Code

## 📁 Project Structure

```
src/
├── app/                          # Application core configuration
│   ├── router/                   # Routing configuration
│   └── store/                    # State management
│       ├── classStore.js         # Class management state
│       ├── homeworkStore.js      # Homework management state
│       ├── materialStore.js      # Material management state
│       ├── messageStore.js       # Message notification state
│       ├── profileStore.js       # User profile state
│       └── studentStore.js       # Student management state
├── features/                     # Feature modules
│   ├── auth/                     # User authentication
│   │   └── pages/                # Login, register, password reset pages
│   ├── classes/                  # Class management
│   │   ├── card/                 # Class card components
│   │   └── pages/                # Class list pages
│   ├── dashboard/                # Dashboard
│   │   └── pages/                # Homepage and pending reminders
│   ├── homework/                 # Homework management
│   │   ├── card/                 # Homework card components
│   │   └── pages/                # Homework list, submission, grading pages
│   ├── materials/                # Teaching materials
│   │   └── pages/                # Material management pages
│   ├── profile/                  # User profile
│   │   ├── card/                 # Profile card components
│   │   └── pages/                # Personal profile pages
│   └── setting/                  # System settings
│       └── pages/                # Settings pages
├── shared/                       # Shared resources
│   ├── components/               # Common components
│   │   ├── guards/               # Route guards
│   │   └── layout/               # Layout components
│   ├── i18n/                     # Internationalization
│   │   ├── translations/         # Translation files
│   │   └── hooks/                # Translation hooks
│   ├── services/                 # API services
│   │   ├── amplifyAuth.js        # AWS Cognito authentication service
│   │   └── apiClient.js          # API client
│   └── utils/                    # Utility functions
└── amplifyconfiguration.js       # AWS Amplify configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- AWS Account (for backend services)

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/your-username/siwei.git
cd siwei
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**
   Create a `.env` file and configure the following variables:

```env
VITE_USER_POOL_ID=your-cognito-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-cognito-client-id
VITE_REST_ENDPOINT=your-api-gateway-endpoint
VITE_GRAPHQL_ENDPOINT=your-graphql-endpoint
VITE_S3_BUCKET=your-s3-bucket-name
VITE_AWS_REGION=your-aws-region
```

4. **Start development server**

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

## 👥 User Roles & Features

### Teacher Role

- ✅ Create and manage classes
- ✅ Publish homework with deadlines
- ✅ View student submission status
- ✅ Grade homework with scores and comments
- ✅ Upload and manage teaching materials
- ✅ View pending grading reminders

### Student Role

- ✅ View enrolled classes
- ✅ Browse pending, submitted, and graded homework
- ✅ Submit homework online (with image upload support)
- ✅ View homework grading results and comments
- ✅ Download teaching materials
- ✅ View homework deadline reminders

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Preview build
npm run preview

# AWS Amplify related
npm run amplify:status    # Check Amplify status
npm run amplify:push      # Push backend updates
npm run amplify:pull      # Pull backend configuration
npm run amplify:publish   # Publish to production
```

## 🌍 Internationalization

The project supports bilingual functionality:

- Default language: Chinese
- Supported languages: Chinese (zh) / English (en)
- Translation files location: `src/shared/i18n/translations/`
- Use `useTranslation` hook for translations

## 📱 Responsive Design

- Mobile-first responsive design
- Supports mobile, tablet, and desktop
- Uses Ant Design grid system
- Adaptive component layouts

## 🔒 Security Features

- AWS Cognito user pool authentication
- Automatic JWT token refresh
- Route-level permission control
- Role-based access control (RBAC)
- S3 pre-signed URLs for secure file uploads
- Automatic authentication headers for API requests

## 🛠️ Deployment

### Frontend Deployment

1. Build production version: `npm run build`
2. Deploy the `dist` directory to a static hosting service
3. Recommended: AWS S3 + CloudFront or Vercel/Netlify

### Backend Deployment

Deploy using AWS Amplify CLI:

```bash
amplify init
amplify push
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - User interface library
- [Ant Design](https://ant.design/) - React UI component library
- [AWS Amplify](https://aws.amazon.com/amplify/) - Full-stack development platform
- [Zustand](https://github.com/pmndrs/zustand) - State management library

---

⭐ If this project helps you, please give it a star!
