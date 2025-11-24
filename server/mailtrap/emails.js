import { mailtrapClient, sender } from "./mailtrap.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTEmplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Welcome to Our Platform",
      html: WELCOME_EMAIL_TEMPLATE,
      category: "Welcome Email",
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error(`Error sending welcome email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  if (!email || !resetURL) {
    throw new Error("Email and resetURL are required");
  }

  const recipient = [{ email }];

  try {
    return await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Reset Password",
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error.message}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });
  } catch (error) {
    console.error("Error sending reset success email:", error);
    throw new Error(`Error sending reset success email: ${error.message}`);
  }
};
