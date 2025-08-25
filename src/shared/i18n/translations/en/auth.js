// Authentication module translations (English)
export const authEn = {
  // LoginPage
  loginPage_title: "Login",
  loginPage_subtitle: "Welcome back, please enter your account information",
  loginPage_username: "Username",
  loginPage_usernamePlaceholder: "Please enter username",
  loginPage_password: "Password",
  loginPage_passwordPlaceholder: "Please enter password",
  loginPage_loginButton: "Login",
  loginPage_loginButtonLoading: "Logging in…",
  loginPage_tip: "Contact administrator to change password",
  loginPage_loginSuccess: "Login successful",
  loginPage_loginError: "Login error occurred, please try again later",
  loginPage_invalidCredentials: "Invalid username or password",
  loginPage_userNotExist: "User does not exist",
  loginPage_passwordAttemptsExceeded:
    "Too many password attempts, please try again later",
  loginPage_passwordSetSuccess: "Password set successfully",
  loginPage_passwordSetError: "Error setting password, please try again later",

  // NewUserLogin translations
  newUserLogin_title: "Set New Password",
  newUserLogin_subtitle: "First time login, please set your account password",
  newUserLogin_phoneNumber: "Phone Number",
  newUserLogin_phoneNumberPlaceholder: "Please enter phone number",
  newUserLogin_password: "Password",
  newUserLogin_passwordPlaceholder: "Please enter password",
  newUserLogin_confirmPassword: "Confirm Password",
  newUserLogin_confirmPasswordPlaceholder: "Please enter password again",
  newUserLogin_submitButton: "Set Password",
  newUserLogin_submitButtonLoading: "Setting…",
  newUserLogin_cancelButton: "Cancel",
  newUserLogin_tip:
    "Password must be at least 8 characters, including letters and numbers",
  newUserLogin_passwordMismatch: "Passwords do not match",
  newUserLogin_passwordTooShort: "Password must be at least 8 characters",
  newUserLogin_passwordRequirement: "Password must contain letters and numbers",

  // New error code translations
  USER_NOT_CONFIRMED:
    "Account not confirmed, please check your email verification code",
  USER_ALREADY_EXISTS: "User already exists",
  CODE_MISMATCH: "Verification code is incorrect",
  CODE_EXPIRED: "Verification code has expired",
  LIMIT_EXCEEDED: "Too many attempts, please try again later",
  NEW_PASSWORD_REQUIRED: "New user needs to set password",
  INVALID_PASSWORD_FORMAT:
    "Password does not meet requirements, please ensure password is at least 8 characters with lowercase letters and numbers",
  LOGIN_FAILED: "Login failed, please check your credentials",
  EMPTY_CREDENTIALS: "Username or password cannot be empty",
  EMPTY_PASSWORD: "Password cannot be empty",
  PASSWORD_SET_SUCCESS: "Password set successfully",
  PASSWORD_SET_FAILED: "Password setting failed",
  PHONE_NUMBER_MISSING:
    "Phone number information is missing, please check input",
  INVALID_PARAMETER: "Invalid parameter",
  SESSION_EXPIRED:
    "Login session has expired, please login again with temporary password",
  SESSION_INVALID:
    "Login session is invalid, please login again with temporary password",
  AUTH_FAILED: "Authentication failed, please check credentials",
  UNKNOWN_ERROR: "Operation failed, please try again later",
  REGISTRATION_ERROR: "Registration error occurred, please try again later",
  VERIFICATION_ERROR: "Verification error occurred, please try again later",
  RESEND_CODE_ERROR:
    "Failed to resend verification code, please try again later",

  // RegisterPage
  registerPage_title: "User Registration",
  registerPage_step1Title: "Fill Information",
  registerPage_step2Title: "Verify Email",
  registerPage_step3Title: "Registration Complete",
  registerPage_email: "Email",
  registerPage_emailPlaceholder: "your@email.com",
  registerPage_emailRequired: "Please enter email",
  registerPage_emailInvalid: "Please enter a valid email address",
  registerPage_name: "Name",
  registerPage_namePlaceholder: "Please enter your name",
  registerPage_nameRequired: "Please enter name",
  registerPage_password: "Password",
  registerPage_passwordPlaceholder: "Please enter password",
  registerPage_passwordRequired: "Please enter password",
  registerPage_passwordMinLength: "Password must be at least 8 characters",
  registerPage_confirmPassword: "Confirm Password",
  registerPage_confirmPasswordPlaceholder: "Please enter password again",
  registerPage_confirmPasswordRequired: "Please confirm password",
  registerPage_passwordMismatch: "Passwords do not match",
  registerPage_role: "Role",
  registerPage_roleRequired: "Please select role",
  registerPage_student: "Student",
  registerPage_teacher: "Teacher",
  registerPage_registerButton: "Register",
  registerPage_registerButtonLoading: "Registering...",
  registerPage_hasAccount: "Already have an account? Login now",

  // ResetPasswordPage
  resetPasswordPage_title: "Reset Password",
};
