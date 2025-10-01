/**
 * OTP utility functions
 */

import { ATTENDANCE_CONFIG } from '@/config/app.config';

/**
 * Generate a random OTP code
 * @param length Length of OTP (default from config)
 * @returns OTP string
 */
export const generateOTP = (length: number = ATTENDANCE_CONFIG.OTP_LENGTH): string => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

/**
 * Calculate OTP expiry time
 * @param minutes Minutes until expiry (default from config)
 * @returns ISO string of expiry time
 */
export const calculateExpiryTime = (
  minutes: number = ATTENDANCE_CONFIG.OTP_EXPIRY_MINUTES
): string => {
  const now = new Date();
  const expiry = new Date(now.getTime() + minutes * 60000);
  return expiry.toISOString();
};

/**
 * Check if OTP has expired
 * @param expiresAt Expiry timestamp
 * @returns boolean
 */
export const isOTPExpired = (expiresAt: string): boolean => {
  return new Date(expiresAt) < new Date();
};

/**
 * Get remaining time for OTP
 * @param expiresAt Expiry timestamp
 * @returns Seconds remaining or 0 if expired
 */
export const getRemainingTime = (expiresAt: string): number => {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const remaining = Math.floor((expiry - now) / 1000);
  return remaining > 0 ? remaining : 0;
};

/**
 * Format remaining time as MM:SS
 * @param seconds Seconds remaining
 * @returns Formatted string
 */
export const formatRemainingTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
