import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Amplify } from "aws-amplify";
import amplifyConfig from "./amplifyconfiguration";
import AppRouter from "./app/router";
import "antd/dist/reset.css";
import "./index.css";

// Initialize AWS Amplify
Amplify.configure(amplifyConfig);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);
