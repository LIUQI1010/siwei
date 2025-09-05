import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignIn,
  updatePassword,
  updateUserAttributes,
} from "aws-amplify/auth";

function getExpFromSession(session) {
  // exp 单位：秒
  return session?.tokens?.accessToken?.payload?.exp ?? 0;
}

function isExpiring(expSec, skewSec = 60) {
  const now = Math.floor(Date.now() / 1000);
  return expSec - now <= skewSec;
}

// 从session（groups）中获取用户角色
function deriveRoleFromSessionGroups(session) {
  try {
    const groups = session?.tokens?.idToken?.payload?.["cognito:groups"];
    const firstGroup =
      Array.isArray(groups) && groups.length > 0 ? groups[0] : "";
    const normalized =
      typeof firstGroup === "string" ? firstGroup.toLowerCase() : "";
    return normalized === "teacher" ? "teacher" : "student";
  } catch {
    return "student";
  }
}

export class AmplifyAuthService {
  // 获取有效的 ID Token
  static async getValidIdToken() {
    try {
      const session = await fetchAuthSession();
      const idToken = session?.tokens?.idToken?.toString();
      if (idToken) {
        // 调试信息
        const payload = session?.tokens?.idToken?.payload;
      }
      return idToken;
    } catch (error) {
      return null;
    }
  }
  // 对外暴露：拿一枚“可用”的 access token（必要时会强制刷新）
  static async getValidAccessToken(skewSec = 60) {
    try {
      // 1) 先拿当前会话（Amplify 可能已自动续签）
      let session = await fetchAuthSession();
      const exp = getExpFromSession(session);

      // 2) 快过期/已过期 → 强制刷新
      if (isExpiring(exp, skewSec)) {
        session = await fetchAuthSession({ forceRefresh: true });
      }

      const token = session?.tokens?.accessToken?.toString() ?? null;
      return token;
    } catch {
      return null;
    }
  }
  // 用户登录（用户名 + 密码）
  static async login(username, password) {
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });

      if (isSignedIn) {
        const user = await getCurrentUser();
        const session = await fetchAuthSession({ forceRefresh: true });
        const role = deriveRoleFromSessionGroups(session);

        return {
          success: true,
          user: { id: user.userId, username: user.username, role },
        };
      }

      // 检查是否需要设置新密码（兼容新版本cognito）
      if (
        nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        return {
          success: false,
          requiresNewPassword: true,
          message: "NEW_PASSWORD_REQUIRED",
        };
      }

      return { success: false, message: "LOGIN_FAILED" };
    } catch (error) {
      console.error("Login error:", error);

      // 检查是否是 Cognito 要求设置新密码的错误（兼容旧版本cognito）
      if (error.name === "NewPasswordRequiredException") {
        return {
          success: false,
          requiresNewPassword: true,
          message: "NEW_PASSWORD_REQUIRED",
        };
      }

      return { success: false, message: this.getErrorMessage(error) };
    }
  }

  // 新用户设置密码
  static async setNewPassword(username, newPassword) {
    try {
      // 添加参数验证
      if (!username || !newPassword) {
        console.error("setNewPassword: 参数验证失败", {
          username,
          newPassword,
        });
        return {
          success: false,
          message: "EMPTY_CREDENTIALS",
        };
      }

      if (newPassword.trim() === "") {
        console.error("setNewPassword: 密码为空字符串");
        return {
          success: false,
          message: "EMPTY_PASSWORD",
        };
      }

      // 直接使用 confirmSignIn 完成密码设置
      // 这里假设用户已经通过临时密码登录，处于 NEW_PASSWORD_REQUIRED 状态
      const { isSignedIn } = await confirmSignIn({
        challengeResponse: newPassword,
        options: {
          userAttributes: {
            phone_number: username, // 完整的手机号（+86xxxxxxxxxx）
          },
        },
      });

      if (isSignedIn) {
        // 密码设置成功，获取用户信息
        const user = await getCurrentUser();
        const session = await fetchAuthSession({ forceRefresh: true });
        const role = deriveRoleFromSessionGroups(session);

        return {
          success: true,
          message: "PASSWORD_SET_SUCCESS",
          user: { id: user.userId, username: user.username, role },
        };
      }

      return { success: false, message: "PASSWORD_SET_FAILED" };
    } catch (error) {
      console.error("Set new password error:", error);

      // 处理特定的 Cognito 错误
      if (error.name === "InvalidParameterException") {
        if (error.message.includes("phone_number is missing")) {
          return {
            success: false,
            message: "PHONE_NUMBER_MISSING",
          };
        }
        return {
          success: false,
          message: "INVALID_PARAMETER",
        };
      }

      if (error.name === "NotAuthorizedException") {
        if (error.message.includes("session is expired")) {
          return {
            success: false,
            message: "SESSION_EXPIRED",
          };
        }
        if (error.message.includes("Incorrect username or password")) {
          return {
            success: false,
            message: "SESSION_INVALID",
          };
        }
        return {
          success: false,
          message: "AUTH_FAILED",
        };
      }

      return { success: false, message: this.getErrorMessage(error) };
    }
  }

  // 用户登出
  static async logout() {
    try {
      await signOut({ global: true });
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: this.getErrorMessage(error) };
    } finally {
      localStorage.clear();
      sessionStorage.clear();
    }
  }

  // 获取当前用户信息
  static async getCurrentUserInfo() {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession({ forceRefresh: true });
      const role = deriveRoleFromSessionGroups(session);

      return {
        id: user.userId,
        username: user.username,
        role,
      };
    } catch (error) {
      console.error("Get current user error:", error);
      localStorage.clear();
      sessionStorage.clear();
      return { message: this.getErrorMessage(error) };
    }
  }

  // 检查用户是否已登录（带过期判断 + 必要时强刷一次）
  static async isAuthenticated(skewSec = 60) {
    try {
      // 1) 是否有当前用户
      await getCurrentUser();

      // 2) 拉会话 & 判断即将过期
      let session = await fetchAuthSession();
      let exp = getExpFromSession(session);

      // 3) 需要则强刷一次
      if (isExpiring(exp, skewSec)) {
        session = await fetchAuthSession({ forceRefresh: true });
        exp = getExpFromSession(session);
      }

      return !!session?.tokens?.accessToken && !isExpiring(exp, skewSec);
    } catch {
      return false;
    }
  }

  // 错误消息处理 - 返回错误代码而不是硬编码的中文消息
  static getErrorMessage(error) {
    if (error.name === "UserNotConfirmedException") {
      return "USER_NOT_CONFIRMED";
    } else if (error.name === "NotAuthorizedException") {
      return "INVALID_CREDENTIALS";
    } else if (error.name === "UserNotFoundException") {
      return "USER_NOT_EXIST";
    } else if (error.name === "UsernameExistsException") {
      return "USER_ALREADY_EXISTS";
    } else if (error.name === "CodeMismatchException") {
      return "CODE_MISMATCH";
    } else if (error.name === "ExpiredCodeException") {
      return "CODE_EXPIRED";
    } else if (error.name === "LimitExceededException") {
      return "LIMIT_EXCEEDED";
    } else if (error.name === "NewPasswordRequiredException") {
      return "NEW_PASSWORD_REQUIRED";
    } else if (error.name === "InvalidPasswordException") {
      return "INVALID_PASSWORD_FORMAT";
    } else {
      return error.message || "UNKNOWN_ERROR";
    }
  }
}
