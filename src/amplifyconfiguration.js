const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || "your-user-pool-id",
      userPoolClientId:
        import.meta.env.VITE_USER_POOL_CLIENT_ID || "your-user-pool-client-id",
      signUpVerificationMethod: "code", // 'code' | 'link'
      loginWith: {
        email: false,
        phone: false,
        username: true,
      },
    },
  },
  API: {
    GraphQL: {
      endpoint:
        import.meta.env.VITE_GRAPHQL_ENDPOINT || "your-graphql-endpoint",
      region: import.meta.env.VITE_AWS_REGION || "us-east-1",
      defaultAuthMode: "userPool",
    },
    REST: {
      endpoint: import.meta.env.VITE_REST_ENDPOINT || "your-rest-endpoint",
      region: import.meta.env.VITE_AWS_REGION || "us-east-1",
    },
  },
  Storage: {
    S3: {
      bucket: import.meta.env.VITE_S3_BUCKET || "your-s3-bucket",
      region: import.meta.env.VITE_AWS_REGION || "us-east-1",
    },
  },
};

export default amplifyConfig;
