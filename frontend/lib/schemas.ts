/**
 * Validation schemas using Zod.
 * Used for both frontend form validation and backend API validation.
 */

import { z } from "zod";

// ─── Auth Schemas ───────────────────────────────────────────────────────────────

/**
 * Email validation with detailed error messages
 */
export const emailSchema = z
  .string({ message: "Email is required" })
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(254, "Email is too long")
  .toLowerCase()
  .trim();

/**
 * Password validation
 * - Minimum 8 characters
 * - Maximum 128 characters
 */
export const passwordSchema = z
  .string({ message: "Password is required" })
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

/**
 * Sign in form schema
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Sign up form schema
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Confirm sign up schema
 */
export const confirmSignUpSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .min(1, "Email is required"),
  code: z
    .string({ message: "Confirmation code is required" })
    .min(1, "Confirmation code is required")
    .length(6, "Confirmation code must be exactly 6 digits")
    .regex(/^\d+$/, "Confirmation code must contain only numbers"),
});

export type ConfirmSignUpInput = z.infer<typeof confirmSignUpSchema>;

// ─── URL Schemas ─────────────────────────────────────────────────────────────────

/**
 * URL validation schema (string form for API)
 * - Must be a valid URL
 * - Must use http or https protocol
 */
export const urlValueSchema = z
  .string({ message: "URL is required" })
  .min(1, "URL is required")
  .trim()
  .url("Please enter a valid URL")
  .refine(
    (url) => url.startsWith("http://") || url.startsWith("https://"),
    "URL must start with http:// or https://",
  );

export const urlSchema = urlValueSchema;
export type UrlInput = z.infer<typeof urlSchema>;

/**
 * Add URL form schema (object form for react-hook-form)
 */
export const addUrlFormSchema = z.object({
  url: urlValueSchema,
});

export type AddUrlFormInput = z.infer<typeof addUrlFormSchema>;

// ─── Telegram Schemas ────────────────────────────────────────────────────────────

/**
 * Telegram Chat ID validation (string form for API)
 * - Must be a numeric string (can be negative for groups)
 */
export const telegramChatIdValueSchema = z
  .string({ message: "Chat ID is required" })
  .min(1, "Chat ID is required")
  .trim()
  .regex(/^-?\d+$/, "Chat ID must be a valid number");

export const telegramChatIdSchema = telegramChatIdValueSchema;
export type TelegramChatIdInput = z.infer<typeof telegramChatIdSchema>;

/**
 * Telegram setup form schema (object form for react-hook-form)
 */
export const telegramSetupFormSchema = z.object({
  chatId: telegramChatIdValueSchema,
});

export type TelegramSetupFormInput = z.infer<typeof telegramSetupFormSchema>;

// ─── API Request Schemas ─────────────────────────────────────────────────────────

/**
 * Create URL API request schema
 */
export const createUrlRequestSchema = z.object({
  url: urlSchema,
});

/**
 * Register Telegram API request schema
 */
export const registerTelegramRequestSchema = z.object({
  telegramChatId: telegramChatIdSchema,
});
