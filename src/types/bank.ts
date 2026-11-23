export type AccountType = 'Checking' | 'Savings' | 'Private Reserve';

export type AccountStatus = 'Active' | 'Frozen';

export type TransactionType =
  | 'withdrawal'
  | 'deposit'
  | 'transfer_out'
  | 'transfer_in'
  | 'admin_adjustment';

export type DepositMethod = 'Cash' | 'Check';

export interface BillCount {
  denomination: number;
  count: number;
}

export interface TransactionRecord {
  id: string;
  referenceCode: string;
  accountNumber: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  timestamp: string;
  description: string;
  channel: 'ATM Terminal' | 'Digital Portal' | 'Admin Portal';
  counterpartyAccount?: string;
  counterpartyName?: string;
  method?: DepositMethod;
  billBreakdown?: BillCount[];
  adjustmentDirection?: 'credit' | 'debit';
}

export interface AccountAddress {
  village: string;
  district: string;
  state: string;
  country: string;
}

export interface BankAccount {
  accountNumber: string;
  holderName: string;
  email: string;
  phone: string;
  accountType: AccountType;
  balance: number;
  pin: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  ifscCode: string;
  aadhaarNumber: string;
  panNumber: string;
  address: AccountAddress;
  branchName: string;
  dailyWithdrawalLimit: number;
  withdrawnToday: number;
  status: AccountStatus;
  openedDate: string;
}

export interface AdminAccount {
  adminId: string;
  pin: string;
  name: string;
  position: string;
  roleTitle: string;
  phone: string;
  address: AccountAddress;
  aadhaarNumber: string;
  panNumber: string;
}

export interface AdminProfileUpdateInput {
  name: string;
  position: string;
  phone: string;
  address: AccountAddress;
  aadhaarNumber: string;
  panNumber: string;
}

export interface AdminAccountUpdateInput {
  accountNumber: string;
  holderName: string;
  email: string;
  phone: string;
  aadhaarNumber: string;
  panNumber: string;
  address: AccountAddress;
  accountType: AccountType;
  branchName: string;
  dailyWithdrawalLimit: number;
  pin: string;
  status: AccountStatus;
  balance: number;
  adjustmentNote?: string;
}

export interface BankingOperationResult {
  ok: boolean;
  error?: string;
  accounts: BankAccount[];
  transactions: TransactionRecord[];
  createdTransaction?: TransactionRecord;
  bills?: BillCount[];
}

export interface CreateAccountInput {
  accountNumber?: string;
  holderName: string;
  email: string;
  phone: string;
  aadhaarNumber?: string;
  panNumber?: string;
  address?: Partial<AccountAddress>;
  accountType: AccountType;
  initialDeposit: number;
  pin: string;
}

export type WorkspaceSection =
  | 'atm'
  | 'account'
  | 'withdraw'
  | 'deposit'
  | 'transfer'
  | 'history';
