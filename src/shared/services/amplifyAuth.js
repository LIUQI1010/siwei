import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";

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
  // 用户登录（用户名 + 密码）
  static async login(username, password) {
    try {
      const { isSignedIn } = await signIn({ username, password });

      if (isSignedIn) {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        const role = deriveRoleFromSessionGroups(session);

        return {
          success: true,
          user: { id: user.userId, username: user.username, role },
        };
      }

      return { success: false, message: "登录失败，请检查凭据" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: this.getErrorMessage(error) };
    }
  }

  // 用户登出
  static async logout() {
    try {
      await signOut();
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: this.getErrorMessage(error) };
    }
  }

  // 获取当前用户信息
  static async getCurrentUserInfo() {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      const role = deriveRoleFromSessionGroups(session);

      return {
        id: user.userId,
        username: user.username,
        role,
      };
    } catch (error) {
      console.error("Get current user error:", error);
      return { message: this.getErrorMessage(error) };
    }
  }

  // 检查用户是否已登录
  static async isAuthenticated() {
    try {
      // 检查是否有用户
      await getCurrentUser();

      // 检查是否有有效的会话
      const session = await fetchAuthSession();
      return session.tokens.accessToken !== undefined;
    } catch {
      return false;
    }
  }

  // 错误消息处理
  static getErrorMessage(error) {
    if (error.name === "UserNotConfirmedException") {
      return "账户未确认，请检查邮箱验证码";
    } else if (error.name === "NotAuthorizedException") {
      return "用户名或密码错误";
    } else if (error.name === "UserNotFoundException") {
      return "用户不存在";
    } else if (error.name === "UsernameExistsException") {
      return "用户已存在";
    } else if (error.name === "CodeMismatchException") {
      return "验证码错误";
    } else if (error.name === "ExpiredCodeException") {
      return "验证码已过期";
    } else if (error.name === "LimitExceededException") {
      return "尝试次数过多，请稍后再试";
    } else {
      return error.message || "操作失败，请稍后再试";
    }
  }
}
