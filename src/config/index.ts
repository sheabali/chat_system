import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 8000,
  password_salt: process.env.PASSWORD_SALT || "12",
  jwt: {
    secret: process.env.JWT_SECRET || "very-secret-key",
    expires_in: process.env.JWT_EXPIRES_IN || "30d",
  },
  emailSender: {
    email: process.env.EMAIL_SENDER_EMAIL || "",
    app_pass: process.env.EMAIL_SENDER_APP_PASS || "",
  }
};
