export interface Contact {
  name: string;
  phone: string;
  email: string;
  companyName?: string;
  syncedFrom: "Google Workspace" | "Microsoft 365" | "Local System Sync";
}

export interface TrackingLog {
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

export interface SocialAccount {
  platform: "Instagram" | "TikTok" | "X" | "Facebook" | "YouTube";
  username: string;
  avatarUrl: string;
  bio: string;
  status: "Generating" | "Ready" | "OTP_Required" | "OTP_Verified";
  otpCode?: string;
  customPassword?: string;
  realUrl?: string;
}

export interface VerifiedAccountEntry {
  id: string;
  phone: string;
  name: string;
  syncedEmail: string;
  generatedUsername: string;
  generatedPassword: string;
  birthday?: string; // Real-world birth date as shown on standard signup forms (e.g., 25 Des 1998)
  companyName: string;
  status: "Draft" | "Queued" | "Sending" | "Sent" | "Delivered" | "Opened" | "Failed";
  accountCategory?: "NOT REG" | "READY TO USE" | "ACTIVE" | "NEED CHECK" | "SUSPEND" | "BANNED";
  subject: string;
  htmlBody: string;
  textBody: string;
  smtpLogs: TrackingLog[];
  errorMessage?: string;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  socialAccounts?: SocialAccount[];
}

export interface Campaign {
  id: string;
  name: string;
  companyName: string;
  subjectTemplate: string;
  totalSent: number;
  deliveredCount: number;
  openedCount: number;
  failedCount: number;
  createdAt: string;
}

export interface GoogleContactAPIResponse {
  names?: Array<{ displayName: string }>;
  phoneNumbers?: Array<{ value: string; canonicalForm?: string }>;
  emailAddresses?: Array<{ value: string }>;
}

export interface GmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
}

export interface GmailAccount {
  id: string;
  name: string;
  gender: string;
  birthday: string;
  email: string;
  password: string;
  recoveryEmail: string;
  recoveryPhone: string;
  otpCode: string;
  securityQuestion: string;
  securityAnswer: string;
  accountCategory?: "NOT REG" | "READY TO USE" | "ACTIVE" | "NEED CHECK" | "SUSPEND" | "BANNED";
  avatarUrl?: string;
  emails: GmailMessage[];
}

