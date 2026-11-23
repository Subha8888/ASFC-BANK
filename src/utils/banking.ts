import type {
  AccountAddress,
  AccountType,
  AdminAccount,
  AdminAccountUpdateInput,
  AdminProfileUpdateInput,
  BankAccount,
  BankingOperationResult,
  BillCount,
  CreateAccountInput,
  DepositMethod,
  TransactionRecord,
  TransactionType,
} from '../types/bank';

export const STORAGE_KEYS = {
  accounts: 'asfc_bank_accounts_v6',
  transactions: 'asfc_bank_transactions_v6',
  sessionAccount: 'asfc_bank_session_account_v6',
  sessionAdmin: 'asfc_bank_session_admin_v6',
  admins: 'asfc_bank_admins_v6',
} as const;

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    adminId: 'AS-9733680877',
    pin: '202666',
    name: 'Arjun Singhania',
    position: 'MD',
    roleTitle: 'ASFC Central Vault Administrator',
    phone: '+91 97336 80877',
    address: {
      village: 'Nariman Point',
      district: 'Mumbai City',
      state: 'Maharashtra',
      country: 'India',
    },
    aadhaarNumber: '491827364510',
    panNumber: 'MD97336',
  },
  {
    adminId: 'AS-7430054701',
    pin: '202525',
    name: 'Sandeep Verma',
    position: 'Joint MD',
    roleTitle: 'ASFC Compliance & Ledger Administrator',
    phone: '+91 74300 54701',
    address: {
      village: 'Salt Lake Sector V',
      district: 'North 24 Parganas',
      state: 'West Bengal',
      country: 'India',
    },
    aadhaarNumber: '837261549012',
    panNumber: 'JM74300',
  },
];

export const ATM_DENOMINATIONS = [500, 200, 100, 50, 20, 10] as const;

export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    accountNumber: 'ASFC-1048920101',
    holderName: 'Aarav Sharma',
    email: 'aarav.sharma@asfc-client.example',
    phone: '+91 98204 44120',
    accountType: 'Private Reserve',
    balance: 124500.0,
    pin: '4829',
    cardNumber: '4532881044909201',
    cardExpiry: '09/29',
    cardCvv: '742',
    ifscCode: 'ASFC0001048',
    aadhaarNumber: '648219304812',
    panNumber: 'QJ45678',
    address: {
      village: 'Nariman Point',
      district: 'Mumbai City',
      state: 'Maharashtra',
      country: 'India',
    },
    branchName: 'Nariman Point Financial District · Branch 04',
    dailyWithdrawalLimit: 50000,
    withdrawnToday: 2000,
    status: 'Active',
    openedDate: '2023-04-12',
  },
  {
    accountNumber: 'ASFC-2091441002',
    holderName: 'Maya Lin',
    email: 'maya.lin@asfc-client.example',
    phone: '+91 98112 90834',
    accountType: 'Checking',
    balance: 68205.0,
    pin: '7314',
    cardNumber: '4532881077214410',
    cardExpiry: '11/28',
    cardCvv: '318',
    ifscCode: 'ASFC0002091',
    aadhaarNumber: '739150284619',
    panNumber: 'ML89412',
    address: {
      village: 'Connaught Place',
      district: 'New Delhi',
      state: 'Delhi',
      country: 'India',
    },
    branchName: 'Connaught Exchange Center · Branch 12',
    dailyWithdrawalLimit: 30000,
    withdrawnToday: 0,
    status: 'Active',
    openedDate: '2024-01-19',
  },
  {
    accountNumber: 'ASFC-3372885403',
    holderName: 'Daniel Brooks',
    email: 'daniel.brooks@asfc-client.example',
    phone: '+91 98450 18274',
    accountType: 'Savings',
    balance: 241000.0,
    pin: '1950',
    cardNumber: '4532881031098854',
    cardExpiry: '06/30',
    cardCvv: '905',
    ifscCode: 'ASFC0003372',
    aadhaarNumber: '512984730265',
    panNumber: 'DB74190',
    address: {
      village: 'Indiranagar',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      country: 'India',
    },
    branchName: 'Indiranagar Vault · Branch 08',
    dailyWithdrawalLimit: 40000,
    withdrawnToday: 0,
    status: 'Active',
    openedDate: '2022-08-03',
  },
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-1005',
    referenceCode: 'REF-884920',
    accountNumber: 'ASFC-1048920101',
    type: 'withdrawal',
    amount: 2000,
    balanceAfter: 124500.0,
    timestamp: '2026-11-23T08:15:00.000Z',
    description: 'ATM Cash Withdrawal — Nariman Point Terminal 02',
    channel: 'ATM Terminal',
    billBreakdown: [{ denomination: 500, count: 4 }],
  },
  {
    id: 'tx-1004',
    referenceCode: 'REF-884107',
    accountNumber: 'ASFC-1048920101',
    type: 'deposit',
    amount: 18500,
    balanceAfter: 126500.0,
    timestamp: '2026-11-21T16:42:00.000Z',
    description: 'Check Deposit — Consulting Retainer',
    channel: 'ATM Terminal',
    method: 'Check',
  },
  {
    id: 'tx-1003',
    referenceCode: 'REF-883762',
    accountNumber: 'ASFC-1048920101',
    type: 'transfer_out',
    amount: 4500,
    balanceAfter: 108000.0,
    timestamp: '2026-11-19T13:10:00.000Z',
    description: 'Fund Transfer to Maya Lin',
    channel: 'Digital Portal',
    counterpartyAccount: 'ASFC-2091441002',
    counterpartyName: 'Maya Lin',
  },
  {
    id: 'tx-1002',
    referenceCode: 'REF-882914',
    accountNumber: 'ASFC-1048920101',
    type: 'deposit',
    amount: 32000,
    balanceAfter: 112500.0,
    timestamp: '2026-11-15T10:05:00.000Z',
    description: 'Cash Deposit — Vault Lobby ATM',
    channel: 'ATM Terminal',
    method: 'Cash',
  },
  {
    id: 'tx-1001',
    referenceCode: 'REF-881203',
    accountNumber: 'ASFC-2091441002',
    type: 'transfer_in',
    amount: 4500,
    balanceAfter: 68205.0,
    timestamp: '2026-11-19T13:10:00.000Z',
    description: 'Fund Transfer from Aarav Sharma',
    channel: 'Digital Portal',
    counterpartyAccount: 'ASFC-1048920101',
    counterpartyName: 'Aarav Sharma',
  },
  {
    id: 'tx-1000',
    referenceCode: 'REF-880551',
    accountNumber: 'ASFC-3372885403',
    type: 'deposit',
    amount: 50000,
    balanceAfter: 241000.0,
    timestamp: '2026-11-14T11:30:00.000Z',
    description: 'Cash Deposit — Indiranagar Branch',
    channel: 'ATM Terminal',
    method: 'Cash',
  },
];

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCardNumber(cardNumber: string, reveal = false): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length !== 16) return cardNumber;
  if (reveal) {
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

export function formatAadhaarNumber(aadhaarNumber: string, reveal = true): string {
  const digits = (aadhaarNumber || '').replace(/\D/g, '');
  if (digits.length !== 12) return aadhaarNumber || 'Not Provided';
  if (reveal) {
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }
  return `•••• •••• ${digits.slice(-4)}`;
}

export function normalizePanNumber(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidPanNumber(value: string): boolean {
  return /^[A-Z0-9]{5,12}$/.test(value);
}

export function formatAddress(address?: Partial<AccountAddress>): string {
  if (!address) return 'Not Provided';
  const parts = [address.village, address.district, address.state, address.country]
    .map((part) => (part ?? '').trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Not Provided';
}

export function maskAccountNumber(accountNumber: string): string {
  const parts = accountNumber.split('-');
  if (parts.length === 2 && parts[1].length > 4) {
    return `${parts[0]}-${'•'.repeat(parts[1].length - 4)}${parts[1].slice(-4)}`;
  }
  if (parts.length === 3) {
    return `${parts[0]}-••••-${parts[2]}`;
  }
  return accountNumber;
}

export function isValidAsfcAccountNumber(accountNumber: string): boolean {
  return /^ASFC-[A-Z0-9-]{6,18}$/.test(accountNumber);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function generateReferenceCode(seed?: number): string {
  const randomPart =
    seed !== undefined
      ? String(Math.abs(seed) % 1000000).padStart(6, '0')
      : String(Math.floor(100000 + Math.random() * 900000));
  return `REF-${randomPart}`;
}

export function calculateBillBreakdown(amount: number): BillCount[] | null {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount) || amount % 10 !== 0) {
    return null;
  }
  let remaining = amount;
  const bills: BillCount[] = [];
  for (const denom of ATM_DENOMINATIONS) {
    const count = Math.floor(remaining / denom);
    if (count > 0) {
      bills.push({ denomination: denom, count });
      remaining -= count * denom;
    }
  }
  return remaining === 0 ? bills : null;
}

export function normalizeIdentifier(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

export function authenticateAccount(
  accounts: BankAccount[],
  identifier: string,
  pin: string
): { ok: true; account: BankAccount } | { ok: false; error: string } {
  const cleanedId = normalizeIdentifier(identifier);
  const cleanedPin = pin.trim();

  if (!cleanedId) {
    return { ok: false, error: 'Enter your ASFC account number or 16-digit card number.' };
  }
  if (!/^\d{4}$/.test(cleanedPin)) {
    return { ok: false, error: 'PIN must be exactly 4 digits.' };
  }

  const matched = accounts.find((acct) => {
    const acctNorm = normalizeIdentifier(acct.accountNumber);
    const cardNorm = acct.cardNumber.replace(/\D/g, '');
    return acctNorm === cleanedId || cardNorm === cleanedId.replace(/\D/g, '');
  });

  if (!matched) {
    return { ok: false, error: 'No ASFC Bank account matches that account or card number.' };
  }

  if (matched.pin !== cleanedPin) {
    return { ok: false, error: 'Incorrect 4-digit ATM PIN. Please verify and try again.' };
  }

  return { ok: true, account: matched };
}

export function withdrawFunds(
  accounts: BankAccount[],
  transactions: TransactionRecord[],
  accountNumber: string,
  amount: number,
  options?: { channel?: 'ATM Terminal' | 'Digital Portal'; note?: string; timestamp?: string }
): BankingOperationResult {
  const account = accounts.find((a) => a.accountNumber === accountNumber);
  if (!account) {
    return { ok: false, error: 'Active account not found.', accounts, transactions };
  }
  if (account.status === 'Frozen') {
    return {
      ok: false,
      error: 'This card and account are currently frozen. Unfreeze the card in Account Details to withdraw cash.',
      accounts,
      transactions,
    };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'Enter a valid withdrawal amount greater than ₹0.', accounts, transactions };
  }
  if (!Number.isInteger(amount) || amount % 10 !== 0) {
    return {
      ok: false,
      error: 'ATM cash dispenser issues INR notes in multiples of ₹10 only.',
      accounts,
      transactions,
    };
  }
  if (amount > account.balance) {
    return {
      ok: false,
      error: `Insufficient funds. Available balance is ${formatCurrency(account.balance)}.`,
      accounts,
      transactions,
    };
  }
  const remainingDaily = roundCurrency(account.dailyWithdrawalLimit - account.withdrawnToday);
  if (amount > remainingDaily) {
    return {
      ok: false,
      error: `Exceeds remaining daily ATM limit of ${formatCurrency(Math.max(0, remainingDaily))}.`,
      accounts,
      transactions,
    };
  }

  const bills = calculateBillBreakdown(amount);
  if (!bills) {
    return {
      ok: false,
      error: 'Unable to dispense requested bill combination.',
      accounts,
      transactions,
    };
  }

  const newBalance = roundCurrency(account.balance - amount);
  const newWithdrawnToday = roundCurrency(account.withdrawnToday + amount);
  const timestamp = options?.timestamp ?? new Date().toISOString();

  const updatedAccounts = accounts.map((a) =>
    a.accountNumber === accountNumber
      ? { ...a, balance: newBalance, withdrawnToday: newWithdrawnToday }
      : a
  );

  const tx: TransactionRecord = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    referenceCode: generateReferenceCode(),
    accountNumber,
    type: 'withdrawal',
    amount,
    balanceAfter: newBalance,
    timestamp,
    description: options?.note?.trim() || 'ATM Cash Withdrawal',
    channel: options?.channel ?? 'ATM Terminal',
    billBreakdown: bills,
  };

  return {
    ok: true,
    accounts: updatedAccounts,
    transactions: [tx, ...transactions],
    createdTransaction: tx,
    bills,
  };
}

export function depositFunds(
  accounts: BankAccount[],
  transactions: TransactionRecord[],
  accountNumber: string,
  amount: number,
  method: DepositMethod = 'Cash',
  options?: { channel?: 'ATM Terminal' | 'Digital Portal'; note?: string; timestamp?: string }
): BankingOperationResult {
  const account = accounts.find((a) => a.accountNumber === accountNumber);
  if (!account) {
    return { ok: false, error: 'Active account not found.', accounts, transactions };
  }
  if (account.status === 'Frozen') {
    return {
      ok: false,
      error: 'This account is frozen. Unfreeze the card in Account Details before making a deposit.',
      accounts,
      transactions,
    };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'Enter a deposit amount greater than ₹0.00.', accounts, transactions };
  }
  const roundedAmount = roundCurrency(amount);
  if (roundedAmount > 250000) {
    return {
      ok: false,
      error: 'Single ATM deposit limit is ₹2,50,000.00 per transaction.',
      accounts,
      transactions,
    };
  }

  const newBalance = roundCurrency(account.balance + roundedAmount);
  const timestamp = options?.timestamp ?? new Date().toISOString();

  const updatedAccounts = accounts.map((a) =>
    a.accountNumber === accountNumber ? { ...a, balance: newBalance } : a
  );

  const tx: TransactionRecord = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    referenceCode: generateReferenceCode(),
    accountNumber,
    type: 'deposit',
    amount: roundedAmount,
    balanceAfter: newBalance,
    timestamp,
    description: options?.note?.trim() || `${method} Deposit`,
    channel: options?.channel ?? 'ATM Terminal',
    method,
  };

  return {
    ok: true,
    accounts: updatedAccounts,
    transactions: [tx, ...transactions],
    createdTransaction: tx,
  };
}

export function transferFunds(
  accounts: BankAccount[],
  transactions: TransactionRecord[],
  fromAccountNumber: string,
  toAccountNumber: string,
  amount: number,
  options?: {
    recipientName?: string;
    note?: string;
    channel?: 'ATM Terminal' | 'Digital Portal';
    timestamp?: string;
  }
): BankingOperationResult {
  const sender = accounts.find((a) => a.accountNumber === fromAccountNumber);
  if (!sender) {
    return { ok: false, error: 'Source account not found.', accounts, transactions };
  }
  if (sender.status === 'Frozen') {
    return {
      ok: false,
      error: 'Your card and account are currently frozen. Unfreeze before transferring funds.',
      accounts,
      transactions,
    };
  }

  const cleanedTarget = normalizeIdentifier(toAccountNumber);
  if (!cleanedTarget || cleanedTarget.length < 6) {
    return {
      ok: false,
      error: 'Enter a valid recipient account number (minimum 6 characters).',
      accounts,
      transactions,
    };
  }
  if (cleanedTarget === normalizeIdentifier(fromAccountNumber)) {
    return {
      ok: false,
      error: 'Source and destination accounts cannot be the same.',
      accounts,
      transactions,
    };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      error: 'Enter a transfer amount greater than ₹0.00.',
      accounts,
      transactions,
    };
  }

  const roundedAmount = roundCurrency(amount);
  if (roundedAmount > sender.balance) {
    return {
      ok: false,
      error: `Insufficient funds. Available balance is ${formatCurrency(sender.balance)}.`,
      accounts,
      transactions,
    };
  }

  const internalRecipient = accounts.find(
    (a) => normalizeIdentifier(a.accountNumber) === cleanedTarget
  );
  const resolvedRecipientName =
    internalRecipient?.holderName || options?.recipientName?.trim() || 'External Beneficiary';
  const resolvedTargetAccount = internalRecipient?.accountNumber || toAccountNumber.trim().toUpperCase();

  const timestamp = options?.timestamp ?? new Date().toISOString();
  const referenceCode = generateReferenceCode();
  const senderNewBalance = roundCurrency(sender.balance - roundedAmount);

  const updatedAccounts = accounts.map((a) => {
    if (a.accountNumber === sender.accountNumber) {
      return { ...a, balance: senderNewBalance };
    }
    if (internalRecipient && a.accountNumber === internalRecipient.accountNumber) {
      return { ...a, balance: roundCurrency(a.balance + roundedAmount) };
    }
    return a;
  });

  const baseMemo = options?.note?.trim();
  const outTx: TransactionRecord = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    referenceCode,
    accountNumber: sender.accountNumber,
    type: 'transfer_out',
    amount: roundedAmount,
    balanceAfter: senderNewBalance,
    timestamp,
    description: baseMemo
      ? `Transfer to ${resolvedRecipientName} — ${baseMemo}`
      : `Fund Transfer to ${resolvedRecipientName}`,
    channel: options?.channel ?? 'Digital Portal',
    counterpartyAccount: resolvedTargetAccount,
    counterpartyName: resolvedRecipientName,
  };

  const newTransactions = [outTx];

  if (internalRecipient) {
    const recipientNewBalance = roundCurrency(internalRecipient.balance + roundedAmount);
    const inTx: TransactionRecord = {
      id: `tx-${Date.now() + 1}-${Math.floor(Math.random() * 1000)}`,
      referenceCode,
      accountNumber: internalRecipient.accountNumber,
      type: 'transfer_in',
      amount: roundedAmount,
      balanceAfter: recipientNewBalance,
      timestamp,
      description: baseMemo
        ? `Transfer from ${sender.holderName} — ${baseMemo}`
        : `Fund Transfer from ${sender.holderName}`,
      channel: options?.channel ?? 'Digital Portal',
      counterpartyAccount: sender.accountNumber,
      counterpartyName: sender.holderName,
    };
    newTransactions.push(inTx);
  }

  return {
    ok: true,
    accounts: updatedAccounts,
    transactions: [...newTransactions, ...transactions],
    createdTransaction: outTx,
  };
}

export function createAccount(
  accounts: BankAccount[],
  transactions: TransactionRecord[],
  input: CreateAccountInput
):
  | { ok: true; account: BankAccount; accounts: BankAccount[]; transactions: TransactionRecord[] }
  | { ok: false; error: string } {
  const holderName = input.holderName.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const pin = input.pin.trim();
  const initialDeposit = roundCurrency(input.initialDeposit);

  if (holderName.length < 2) {
    return { ok: false, error: 'Account holder name must be at least 2 characters.' };
  }
  if (!email.includes('@') || email.length < 5) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  if (!/^\d{4}$/.test(pin)) {
    return { ok: false, error: 'Choose a 4-digit numeric ATM PIN.' };
  }
  if (!Number.isFinite(initialDeposit) || initialDeposit < 500) {
    return { ok: false, error: 'Minimum opening deposit is ₹500.00.' };
  }

  const requestedAccountNumber = input.accountNumber
    ? normalizeIdentifier(input.accountNumber)
    : '';

  let accountNumber = requestedAccountNumber;
  if (accountNumber) {
    if (!isValidAsfcAccountNumber(accountNumber)) {
      return {
        ok: false,
        error: 'Account number must follow the ASFC sequence format (e.g., ASFC-1234567899).',
      };
    }
    if (accounts.some((a) => normalizeIdentifier(a.accountNumber) === accountNumber)) {
      return {
        ok: false,
        error: 'An account with this account number already exists.',
      };
    }
  } else {
    const generateSequence = () => String(Math.floor(1000000000 + Math.random() * 9000000000));
    accountNumber = `ASFC-${generateSequence()}`;
    while (accounts.some((a) => a.accountNumber === accountNumber)) {
      accountNumber = `ASFC-${generateSequence()}`;
    }
  }

  const digitsOnly = accountNumber.replace(/\D/g, '').padEnd(10, '0');
  const middle = digitsOnly.slice(0, 4);
  const suffix = digitsOnly.slice(-4);

  const rawAadhaar = (input.aadhaarNumber ?? '').replace(/\D/g, '');
  if (rawAadhaar && !/^\d{12}$/.test(rawAadhaar)) {
    return { ok: false, error: 'Aadhaar number must be exactly 12 digits.' };
  }
  const aadhaarNumber =
    rawAadhaar || String(Math.floor(200000000000 + Math.random() * 799999999999));

  const rawPan = input.panNumber ? normalizePanNumber(input.panNumber) : '';
  if (rawPan && !isValidPanNumber(rawPan)) {
    return {
      ok: false,
      error: 'PAN number must be 5 to 12 alphanumeric characters (e.g., QJ45678).',
    };
  }
  const panNumber = rawPan || `QJ${String(Math.floor(10000 + Math.random() * 89999))}`;

  const address: AccountAddress = {
    village: input.address?.village?.trim() || 'Mumbai Central',
    district: input.address?.district?.trim() || 'Mumbai City',
    state: input.address?.state?.trim() || 'Maharashtra',
    country: input.address?.country?.trim() || 'India',
  };

  const limitByType: Record<AccountType, number> = {
    Checking: 30000,
    Savings: 40000,
    'Private Reserve': 60000,
  };

  const newAccount: BankAccount = {
    accountNumber,
    holderName,
    email,
    phone: phone || '+91 98200 01990',
    accountType: input.accountType,
    balance: initialDeposit,
    pin,
    cardNumber: `45328810${middle}${suffix}`,
    cardExpiry: '11/30',
    cardCvv: String(Math.floor(100 + Math.random() * 900)),
    ifscCode: `ASFC000${middle}`,
    aadhaarNumber,
    panNumber,
    address,
    branchName: 'Mumbai Central Digital Vault · Branch 01',
    dailyWithdrawalLimit: limitByType[input.accountType],
    withdrawnToday: 0,
    status: 'Active',
    openedDate: new Date().toISOString().slice(0, 10),
  };

  const openingTx: TransactionRecord = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    referenceCode: generateReferenceCode(),
    accountNumber,
    type: 'deposit',
    amount: initialDeposit,
    balanceAfter: initialDeposit,
    timestamp: new Date().toISOString(),
    description: 'Account Opening Deposit',
    channel: 'Digital Portal',
    method: 'Cash',
  };

  return {
    ok: true,
    account: newAccount,
    accounts: [...accounts, newAccount],
    transactions: [openingTx, ...transactions],
  };
}

export function toggleCardStatus(
  accounts: BankAccount[],
  accountNumber: string
): BankAccount[] {
  return accounts.map((a) =>
    a.accountNumber === accountNumber
      ? { ...a, status: a.status === 'Active' ? 'Frozen' : 'Active' }
      : a
  );
}

export type TransactionFilter = 'all' | 'withdrawals' | 'deposits' | 'transfers';

export function filterTransactions(
  transactions: TransactionRecord[],
  accountNumber: string,
  filter: TransactionFilter,
  searchQuery = ''
): TransactionRecord[] {
  const query = searchQuery.trim().toLowerCase();

  return transactions.filter((tx) => {
    if (tx.accountNumber !== accountNumber) return false;

    if (filter === 'withdrawals' && tx.type !== 'withdrawal') return false;
    if (filter === 'deposits' && tx.type !== 'deposit') return false;
    if (filter === 'transfers' && tx.type !== 'transfer_out' && tx.type !== 'transfer_in') {
      return false;
    }

    if (!query) return true;

    const haystack = [
      tx.referenceCode,
      tx.description,
      tx.counterpartyName ?? '',
      tx.counterpartyAccount ?? '',
      tx.channel,
      String(tx.amount),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function authenticateAdmin(
  adminId: string,
  pin: string,
  admins: AdminAccount[] = ADMIN_ACCOUNTS
): { ok: true; admin: AdminAccount } | { ok: false; error: string } {
  const cleanedId = normalizeIdentifier(adminId);
  const cleanedPin = pin.trim();

  if (!cleanedId) {
    return { ok: false, error: 'Enter your authorized ASFC Admin ID.' };
  }
  if (!/^\d{6}$/.test(cleanedPin)) {
    return { ok: false, error: 'Admin PIN must be exactly 6 digits.' };
  }

  const matched = admins.find(
    (admin) => normalizeIdentifier(admin.adminId) === cleanedId
  );

  if (!matched) {
    return { ok: false, error: 'Unrecognized Admin ID. Access restricted to ASFC administrators.' };
  }
  if (matched.pin !== cleanedPin) {
    return { ok: false, error: 'Invalid 6-digit Admin PIN. Access denied.' };
  }

  return { ok: true, admin: matched };
}

export function adminUpdateProfile(
  admins: AdminAccount[],
  targetAdminId: string,
  updates: AdminProfileUpdateInput
): { ok: boolean; error?: string; admins: AdminAccount[]; updatedAdmin?: AdminAccount } {
  const target = admins.find(
    (a) => normalizeIdentifier(a.adminId) === normalizeIdentifier(targetAdminId)
  );
  if (!target) {
    return { ok: false, error: 'Administrator record not found.', admins };
  }

  const name = updates.name.trim();
  const position = updates.position.trim();
  const phone = updates.phone.trim();
  const aadhaarNumber = updates.aadhaarNumber.replace(/\D/g, '');
  const panNumber = normalizePanNumber(updates.panNumber);
  const address: AccountAddress = {
    village: updates.address.village.trim(),
    district: updates.address.district.trim(),
    state: updates.address.state.trim(),
    country: updates.address.country.trim(),
  };

  if (name.length < 2) {
    return { ok: false, error: 'Administrator name must be at least 2 characters.', admins };
  }
  if (position.length < 2) {
    return { ok: false, error: 'Position is required (e.g., MD, Director).', admins };
  }
  if (phone.replace(/\D/g, '').length < 10) {
    return { ok: false, error: 'Enter a valid phone number (at least 10 digits).', admins };
  }
  if (!/^\d{12}$/.test(aadhaarNumber)) {
    return { ok: false, error: 'Admin Aadhaar number must be exactly 12 digits.', admins };
  }
  if (!isValidPanNumber(panNumber)) {
    return {
      ok: false,
      error: 'Admin PAN number must be 5 to 12 alphanumeric characters (e.g., QJ45678).',
      admins,
    };
  }
  if (!address.village || !address.district || !address.state || !address.country) {
    return {
      ok: false,
      error: 'Complete all admin address fields (Vill, Dist, State, Country).',
      admins,
    };
  }

  let updatedAdmin: AdminAccount | undefined;
  const nextAdmins = admins.map((a) => {
    if (normalizeIdentifier(a.adminId) !== normalizeIdentifier(targetAdminId)) return a;
    updatedAdmin = {
      ...a,
      name,
      position,
      phone,
      aadhaarNumber,
      panNumber,
      address,
    };
    return updatedAdmin;
  });

  return { ok: true, admins: nextAdmins, updatedAdmin };
}

export function adminUpdateAccountDetails(
  accounts: BankAccount[],
  transactions: TransactionRecord[],
  accountNumber: string,
  updates: AdminAccountUpdateInput,
  adminId: string
): BankingOperationResult {
  const target = accounts.find((a) => a.accountNumber === accountNumber);
  if (!target) {
    return { ok: false, error: 'Customer account not found.', accounts, transactions };
  }

  const nextAccountNumber = normalizeIdentifier(updates.accountNumber);
  const holderName = updates.holderName.trim();
  const email = updates.email.trim();
  const phone = updates.phone.trim();
  const aadhaarNumber = updates.aadhaarNumber.replace(/\D/g, '');
  const panNumber = normalizePanNumber(updates.panNumber);
  const address: AccountAddress = {
    village: updates.address.village.trim(),
    district: updates.address.district.trim(),
    state: updates.address.state.trim(),
    country: updates.address.country.trim(),
  };
  const branchName = updates.branchName.trim();
  const pin = updates.pin.trim();
  const dailyWithdrawalLimit = roundCurrency(updates.dailyWithdrawalLimit);
  const newBalance = roundCurrency(updates.balance);

  if (!isValidAsfcAccountNumber(nextAccountNumber)) {
    return {
      ok: false,
      error: 'Account number must follow the ASFC sequence format (e.g., ASFC-1234567899).',
      accounts,
      transactions,
    };
  }
  const duplicateAccount = accounts.some(
    (a) =>
      a.accountNumber !== target.accountNumber &&
      normalizeIdentifier(a.accountNumber) === nextAccountNumber
  );
  if (duplicateAccount) {
    return {
      ok: false,
      error: 'Another account already uses this account number.',
      accounts,
      transactions,
    };
  }
  if (holderName.length < 2) {
    return { ok: false, error: 'Account holder name must be at least 2 characters.', accounts, transactions };
  }
  if (!email.includes('@') || email.length < 5) {
    return { ok: false, error: 'Enter a valid email address.', accounts, transactions };
  }
  if (!/^\d{12}$/.test(aadhaarNumber)) {
    return { ok: false, error: 'Aadhaar number must be exactly 12 digits.', accounts, transactions };
  }
  if (!isValidPanNumber(panNumber)) {
    return {
      ok: false,
      error: 'PAN number must be 5 to 12 alphanumeric characters (e.g., QJ45678).',
      accounts,
      transactions,
    };
  }
  if (!address.village || !address.district || !address.state || !address.country) {
    return {
      ok: false,
      error: 'Complete all address fields (Vill, Dist, State, Country).',
      accounts,
      transactions,
    };
  }
  if (!/^\d{4}$/.test(pin)) {
    return { ok: false, error: 'Customer ATM PIN must be exactly 4 digits.', accounts, transactions };
  }
  if (!Number.isFinite(dailyWithdrawalLimit) || dailyWithdrawalLimit < 1000) {
    return { ok: false, error: 'Daily withdrawal limit must be at least ₹1,000.00.', accounts, transactions };
  }
  if (!Number.isFinite(newBalance) || newBalance < 0) {
    return { ok: false, error: 'Account balance cannot be negative.', accounts, transactions };
  }

  const updatedAccounts = accounts.map((a) =>
    a.accountNumber === accountNumber
      ? {
          ...a,
          accountNumber: nextAccountNumber,
          holderName,
          email,
          phone: phone || a.phone,
          aadhaarNumber,
          panNumber,
          address,
          accountType: updates.accountType,
          branchName: branchName || a.branchName,
          dailyWithdrawalLimit,
          pin,
          status: updates.status,
          balance: newBalance,
        }
      : a
  );

  let nextTransactions =
    nextAccountNumber !== target.accountNumber
      ? transactions.map((tx) => ({
          ...tx,
          accountNumber:
            tx.accountNumber === target.accountNumber ? nextAccountNumber : tx.accountNumber,
          counterpartyAccount:
            tx.counterpartyAccount === target.accountNumber
              ? nextAccountNumber
              : tx.counterpartyAccount,
        }))
      : transactions;

  const delta = roundCurrency(newBalance - target.balance);
  let createdTx: TransactionRecord | undefined;

  if (delta !== 0) {
    const direction = delta > 0 ? 'credit' : 'debit';
    const note = updates.adjustmentNote?.trim();
    createdTx = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      referenceCode: generateReferenceCode(),
      accountNumber: nextAccountNumber,
      type: 'admin_adjustment',
      amount: Math.abs(delta),
      balanceAfter: newBalance,
      timestamp: new Date().toISOString(),
      description: note
        ? `Admin Adjustment (${adminId}) — ${note}`
        : `Admin Balance Adjustment (${adminId})`,
      channel: 'Admin Portal',
      adjustmentDirection: direction,
    };
    nextTransactions = [createdTx, ...nextTransactions];
  }

  return {
    ok: true,
    accounts: updatedAccounts,
    transactions: nextTransactions,
    createdTransaction: createdTx,
  };
}

export function adminResetDailyWithdrawal(
  accounts: BankAccount[],
  accountNumber: string
): BankAccount[] {
  return accounts.map((a) =>
    a.accountNumber === accountNumber ? { ...a, withdrawnToday: 0 } : a
  );
}

export function adminDeleteAccount(
  accounts: BankAccount[],
  transactions: TransactionRecord[],
  accountNumber: string
): { ok: boolean; error?: string; accounts: BankAccount[]; transactions: TransactionRecord[] } {
  if (!accounts.some((a) => a.accountNumber === accountNumber)) {
    return { ok: false, error: 'Account not found.', accounts, transactions };
  }
  return {
    ok: true,
    accounts: accounts.filter((a) => a.accountNumber !== accountNumber),
    transactions: transactions.filter((t) => t.accountNumber !== accountNumber),
  };
}

export function getTransactionSignAndLabel(
  type: TransactionType,
  adjustmentDirection?: 'credit' | 'debit'
): {
  sign: '+' | '-';
  label: string;
  isCredit: boolean;
} {
  switch (type) {
    case 'deposit':
      return { sign: '+', label: 'Deposit', isCredit: true };
    case 'transfer_in':
      return { sign: '+', label: 'Transfer In', isCredit: true };
    case 'withdrawal':
      return { sign: '-', label: 'Withdrawal', isCredit: false };
    case 'transfer_out':
      return { sign: '-', label: 'Transfer Out', isCredit: false };
    case 'admin_adjustment':
      return adjustmentDirection === 'debit'
        ? { sign: '-', label: 'Admin Debit', isCredit: false }
        : { sign: '+', label: 'Admin Credit', isCredit: true };
  }
}

export function generateTransactionsCsv(transactions: TransactionRecord[]): string {
  const header = ['Date', 'Reference', 'Type', 'Channel', 'Description', 'Amount', 'Balance After'].join(',');
  const rows = transactions.map((tx) => {
    const { sign, label } = getTransactionSignAndLabel(tx.type, tx.adjustmentDirection);
    const safeDesc = `"${tx.description.replace(/"/g, '""')}"`;
    return [
      tx.timestamp,
      tx.referenceCode,
      label,
      tx.channel,
      safeDesc,
      `${sign}${tx.amount.toFixed(2)}`,
      tx.balanceAfter.toFixed(2),
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

export function loadBankState(): {
  accounts: BankAccount[];
  transactions: TransactionRecord[];
  admins: AdminAccount[];
  sessionAccountNumber: string | null;
  sessionAdminId: string | null;
} {
  if (typeof window === 'undefined') {
    return {
      accounts: INITIAL_ACCOUNTS,
      transactions: INITIAL_TRANSACTIONS,
      admins: ADMIN_ACCOUNTS,
      sessionAccountNumber: null,
      sessionAdminId: null,
    };
  }

  try {
    const rawAccounts = window.localStorage.getItem(STORAGE_KEYS.accounts);
    const rawTx = window.localStorage.getItem(STORAGE_KEYS.transactions);
    const rawAdmins = window.localStorage.getItem(STORAGE_KEYS.admins);
    const rawSession = window.localStorage.getItem(STORAGE_KEYS.sessionAccount);
    const rawAdmin = window.localStorage.getItem(STORAGE_KEYS.sessionAdmin);

    const accounts: BankAccount[] = rawAccounts ? JSON.parse(rawAccounts) : INITIAL_ACCOUNTS;
    const transactions: TransactionRecord[] = rawTx ? JSON.parse(rawTx) : INITIAL_TRANSACTIONS;
    const parsedAdmins: AdminAccount[] = rawAdmins ? JSON.parse(rawAdmins) : ADMIN_ACCOUNTS;
    const admins = Array.isArray(parsedAdmins) && parsedAdmins.length > 0 ? parsedAdmins : ADMIN_ACCOUNTS;

    const validAdmin =
      rawAdmin && admins.some((admin) => admin.adminId === rawAdmin) ? rawAdmin : null;
    const validSession =
      !validAdmin && rawSession && accounts.some((a) => a.accountNumber === rawSession)
        ? rawSession
        : null;

    return {
      accounts: Array.isArray(accounts) ? accounts : INITIAL_ACCOUNTS,
      transactions: Array.isArray(transactions) ? transactions : INITIAL_TRANSACTIONS,
      admins,
      sessionAccountNumber: validSession,
      sessionAdminId: validAdmin,
    };
  } catch {
    return {
      accounts: INITIAL_ACCOUNTS,
      transactions: INITIAL_TRANSACTIONS,
      admins: ADMIN_ACCOUNTS,
      sessionAccountNumber: null,
      sessionAdminId: null,
    };
  }
}

export function saveBankState(
  accounts: BankAccount[],
  transactions: TransactionRecord[],
  sessionAccountNumber: string | null,
  sessionAdminId: string | null = null,
  admins: AdminAccount[] = ADMIN_ACCOUNTS
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
    window.localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
    window.localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify(admins));
    if (sessionAdminId) {
      window.localStorage.setItem(STORAGE_KEYS.sessionAdmin, sessionAdminId);
      window.localStorage.removeItem(STORAGE_KEYS.sessionAccount);
    } else if (sessionAccountNumber) {
      window.localStorage.setItem(STORAGE_KEYS.sessionAccount, sessionAccountNumber);
      window.localStorage.removeItem(STORAGE_KEYS.sessionAdmin);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.sessionAccount);
      window.localStorage.removeItem(STORAGE_KEYS.sessionAdmin);
    }
  } catch {
    // Ignore storage quota errors
  }
}
