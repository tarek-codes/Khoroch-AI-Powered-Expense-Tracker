export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum ExpenseSource {
  MANUAL = 'manual',
  VOICE = 'voice',
  RECEIPT = 'receipt',
}

export enum CurrencyCode {
  BDT = 'BDT',
  USD = 'USD',
}

export enum ReceiptProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum AiLogType {
  VOICE = 'voice',
  RECEIPT = 'receipt',
}
