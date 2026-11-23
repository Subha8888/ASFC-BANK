import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADMIN_ACCOUNTS,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  adminDeleteAccount,
  adminResetDailyWithdrawal,
  adminUpdateAccountDetails,
  adminUpdateProfile,
  authenticateAccount,
  authenticateAdmin,
  calculateBillBreakdown,
  createAccount,
  depositFunds,
  filterTransactions,
  formatAadhaarNumber,
  formatAddress,
  formatCurrency,
  generateTransactionsCsv,
  toggleCardStatus,
  transferFunds,
  withdrawFunds,
} from './banking';

test('formatCurrency formats numbers in Indian Rupees (INR)', () => {
  assert.equal(formatCurrency(124500), '₹1,24,500.00');
  assert.equal(formatCurrency(68205), '₹68,205.00');
});

test('formatAadhaarNumber and formatAddress format KYC details cleanly', () => {
  assert.equal(formatAadhaarNumber('648219304812', true), '6482 1930 4812');
  assert.equal(formatAadhaarNumber('648219304812', false), '•••• •••• 4812');
  assert.equal(
    formatAddress({
      village: 'Nariman Point',
      district: 'Mumbai City',
      state: 'Maharashtra',
      country: 'India',
    }),
    'Nariman Point, Mumbai City, Maharashtra, India'
  );
});

test('authenticateAccount verifies account number, card number, and PIN', () => {
  const byAccount = authenticateAccount(INITIAL_ACCOUNTS, 'ASFC-1048920101', '4829');
  assert.equal(byAccount.ok, true);
  if (byAccount.ok) {
    assert.equal(byAccount.account.holderName, 'Aarav Sharma');
  }

  const byCard = authenticateAccount(INITIAL_ACCOUNTS, '4532 8810 4490 9201', '4829');
  assert.equal(byCard.ok, true);

  const badPin = authenticateAccount(INITIAL_ACCOUNTS, 'ASFC-1048920101', '0000');
  assert.equal(badPin.ok, false);

  const missingAcct = authenticateAccount(INITIAL_ACCOUNTS, 'ASFC-9999000000', '4829');
  assert.equal(missingAcct.ok, false);
});

test('calculateBillBreakdown computes optimal INR ATM cash denominations', () => {
  assert.deepEqual(calculateBillBreakdown(1880), [
    { denomination: 500, count: 3 },
    { denomination: 200, count: 1 },
    { denomination: 100, count: 1 },
    { denomination: 50, count: 1 },
    { denomination: 20, count: 1 },
    { denomination: 10, count: 1 },
  ]);
  assert.equal(calculateBillBreakdown(25), null);
  assert.equal(calculateBillBreakdown(0), null);
  assert.equal(calculateBillBreakdown(-100), null);
});

test('withdrawFunds enforces balance, multiples of ₹10, daily limits, and updates state', () => {
  const res = withdrawFunds(INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, 'ASFC-1048920101', 2500);
  assert.equal(res.ok, true);
  const updated = res.accounts.find((a) => a.accountNumber === 'ASFC-1048920101');
  assert.equal(updated?.balance, 122000);
  assert.equal(updated?.withdrawnToday, 4500);
  assert.equal(res.createdTransaction?.type, 'withdrawal');
  assert.deepEqual(res.bills, [{ denomination: 500, count: 5 }]);

  const nonMultiple = withdrawFunds(INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, 'ASFC-1048920101', 45);
  assert.equal(nonMultiple.ok, false);

  const overDaily = withdrawFunds(INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, 'ASFC-1048920101', 49000);
  assert.equal(overDaily.ok, false);

  const insufficient = withdrawFunds(INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, 'ASFC-2091441002', 90000);
  assert.equal(insufficient.ok, false);
});

test('depositFunds credits balance and records deposit transaction', () => {
  const res = depositFunds(INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, 'ASFC-2091441002', 5000, 'Cash', {
    note: 'ATM Cash Deposit',
  });
  assert.equal(res.ok, true);
  const updated = res.accounts.find((a) => a.accountNumber === 'ASFC-2091441002');
  assert.equal(updated?.balance, 73205);
  assert.equal(res.createdTransaction?.type, 'deposit');
  assert.equal(res.createdTransaction?.amount, 5000);

  const invalid = depositFunds(INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, 'ASFC-2091441002', -50, 'Cash');
  assert.equal(invalid.ok, false);
});

test('transferFunds updates both internal sender and recipient balances atomically', () => {
  const res = transferFunds(
    INITIAL_ACCOUNTS,
    INITIAL_TRANSACTIONS,
    'ASFC-1048920101',
    'ASFC-2091441002',
    10000,
    { note: 'Rent split' }
  );
  assert.equal(res.ok, true);
  const sender = res.accounts.find((a) => a.accountNumber === 'ASFC-1048920101');
  const recipient = res.accounts.find((a) => a.accountNumber === 'ASFC-2091441002');
  assert.equal(sender?.balance, 114500);
  assert.equal(recipient?.balance, 78205);
  assert.equal(res.transactions.length, INITIAL_TRANSACTIONS.length + 2);

  const selfTransfer = transferFunds(
    INITIAL_ACCOUNTS,
    INITIAL_TRANSACTIONS,
    'ASFC-1048920101',
    'ASFC-1048920101',
    1000
  );
  assert.equal(selfTransfer.ok, false);
});

test('frozen card blocks withdrawals, deposits, and transfers until unfrozen', () => {
  const frozenAccounts = toggleCardStatus(INITIAL_ACCOUNTS, 'ASFC-1048920101');
  const withdrawRes = withdrawFunds(frozenAccounts, INITIAL_TRANSACTIONS, 'ASFC-1048920101', 1000);
  assert.equal(withdrawRes.ok, false);

  const unfrozenAccounts = toggleCardStatus(frozenAccounts, 'ASFC-1048920101');
  const okRes = withdrawFunds(unfrozenAccounts, INITIAL_TRANSACTIONS, 'ASFC-1048920101', 1000);
  assert.equal(okRes.ok, true);
});

test('createAccount provisions a new ASFC-10digit account or custom ASFC sequence', () => {
  const res = createAccount(INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, {
    holderName: 'Elena Vance',
    email: 'elena@example.com',
    phone: '+91 98200 11223',
    accountType: 'Checking',
    initialDeposit: 7500,
    pin: '2468',
  });
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.match(res.account.accountNumber, /^ASFC-\d{10}$/);
    assert.equal(res.account.holderName, 'Elena Vance');
    assert.equal(res.account.balance, 7500);
    assert.equal(res.accounts.length, INITIAL_ACCOUNTS.length + 1);
    assert.equal(res.transactions[0].accountNumber, res.account.accountNumber);
  }

  const customRes = createAccount(INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, {
    accountNumber: 'ASFC-1234567899',
    holderName: 'Vikram Nair',
    email: 'vikram@example.com',
    phone: '+91 98200 22334',
    panNumber: 'qj45678',
    address: {
      village: 'Aluva',
      district: 'Ernakulam',
      state: 'Kerala',
      country: 'India',
    },
    accountType: 'Savings',
    initialDeposit: 10000,
    pin: '1122',
  });
  assert.equal(customRes.ok, true);
  if (customRes.ok) {
    assert.equal(customRes.account.accountNumber, 'ASFC-1234567899');
    assert.equal(customRes.account.panNumber, 'QJ45678');
    assert.equal(customRes.account.address.district, 'Ernakulam');
  }
});

test('filterTransactions and generateTransactionsCsv return expected records', () => {
  const all = filterTransactions(INITIAL_TRANSACTIONS, 'ASFC-1048920101', 'all');
  assert.equal(all.length, 4);

  const withdrawals = filterTransactions(INITIAL_TRANSACTIONS, 'ASFC-1048920101', 'withdrawals');
  assert.equal(withdrawals.length, 1);

  const searchMatch = filterTransactions(INITIAL_TRANSACTIONS, 'ASFC-1048920101', 'all', 'Maya');
  assert.equal(searchMatch.length, 1);

  const csv = generateTransactionsCsv(all);
  assert.ok(csv.includes('REF-884920'));
  assert.ok(csv.includes('-2000.00'));
});

test('authenticateAdmin validates both authorized admin IDs and 6-digit PINs', () => {
  const admin1 = authenticateAdmin('AS-9733680877', '202666');
  assert.equal(admin1.ok, true);
  if (admin1.ok) {
    assert.equal(admin1.admin.adminId, 'AS-9733680877');
  }

  const admin2 = authenticateAdmin('as-7430054701', '202525');
  assert.equal(admin2.ok, true);
  if (admin2.ok) {
    assert.equal(admin2.admin.adminId, 'AS-7430054701');
  }

  const wrongPin = authenticateAdmin('AS-9733680877', '111111');
  assert.equal(wrongPin.ok, false);

  const customerAttempt = authenticateAdmin('ASFC-1048920101', '202666');
  assert.equal(customerAttempt.ok, false);
});

test('adminUpdateAccountDetails edits accountNumber, aadhaarNumber, panNumber, address, holder info, balance, limits, and cascades transactions', () => {
  const res = adminUpdateAccountDetails(
    INITIAL_ACCOUNTS,
    INITIAL_TRANSACTIONS,
    'ASFC-2091441002',
    {
      accountNumber: 'ASFC-1234567899',
      holderName: 'Maya Lin-Chen',
      email: 'maya.chen@asfc-client.example',
      phone: '+91 98112 00000',
      aadhaarNumber: '998877665544',
      panNumber: 'QJ45678',
      address: {
        village: 'Saket',
        district: 'South Delhi',
        state: 'Delhi',
        country: 'India',
      },
      accountType: 'Private Reserve',
      branchName: 'Nariman Point Financial District · Branch 04',
      dailyWithdrawalLimit: 75000,
      pin: '9988',
      status: 'Frozen',
      balance: 80000,
      adjustmentNote: 'Tier upgrade bonus credit',
    },
    'AS-9733680877'
  );
  assert.equal(res.ok, true);
  assert.equal(
    res.accounts.some((a) => a.accountNumber === 'ASFC-2091441002'),
    false
  );
  const updated = res.accounts.find((a) => a.accountNumber === 'ASFC-1234567899');
  assert.equal(updated?.holderName, 'Maya Lin-Chen');
  assert.equal(updated?.aadhaarNumber, '998877665544');
  assert.equal(updated?.panNumber, 'QJ45678');
  assert.deepEqual(updated?.address, {
    village: 'Saket',
    district: 'South Delhi',
    state: 'Delhi',
    country: 'India',
  });
  assert.equal(updated?.accountType, 'Private Reserve');
  assert.equal(updated?.dailyWithdrawalLimit, 75000);
  assert.equal(updated?.pin, '9988');
  assert.equal(updated?.status, 'Frozen');
  assert.equal(updated?.balance, 80000);
  assert.equal(res.createdTransaction?.accountNumber, 'ASFC-1234567899');
  assert.equal(res.createdTransaction?.type, 'admin_adjustment');
  assert.equal(res.createdTransaction?.adjustmentDirection, 'credit');
  assert.equal(
    res.transactions.some((t) => t.accountNumber === 'ASFC-2091441002'),
    false
  );
  assert.equal(
    res.transactions.some((t) => t.counterpartyAccount === 'ASFC-1234567899'),
    true
  );

  // Reject invalid Aadhaar (< 12 digits)
  const badAadhaar = adminUpdateAccountDetails(
    INITIAL_ACCOUNTS,
    INITIAL_TRANSACTIONS,
    'ASFC-2091441002',
    {
      accountNumber: 'ASFC-2091441002',
      holderName: 'Maya Lin',
      email: 'maya.lin@asfc-client.example',
      phone: '+91 98112 90834',
      aadhaarNumber: '12345',
      panNumber: 'QJ45678',
      address: {
        village: 'Connaught Place',
        district: 'New Delhi',
        state: 'Delhi',
        country: 'India',
      },
      accountType: 'Checking',
      branchName: 'Connaught Exchange Center · Branch 12',
      dailyWithdrawalLimit: 30000,
      pin: '7314',
      status: 'Active',
      balance: 68205,
    },
    'AS-9733680877'
  );
  assert.equal(badAadhaar.ok, false);

  // Reject invalid PAN (< 5 chars)
  const badPan = adminUpdateAccountDetails(
    INITIAL_ACCOUNTS,
    INITIAL_TRANSACTIONS,
    'ASFC-2091441002',
    {
      accountNumber: 'ASFC-2091441002',
      holderName: 'Maya Lin',
      email: 'maya.lin@asfc-client.example',
      phone: '+91 98112 90834',
      aadhaarNumber: '739150284619',
      panNumber: 'Q1',
      address: {
        village: 'Connaught Place',
        district: 'New Delhi',
        state: 'Delhi',
        country: 'India',
      },
      accountType: 'Checking',
      branchName: 'Connaught Exchange Center · Branch 12',
      dailyWithdrawalLimit: 30000,
      pin: '7314',
      status: 'Active',
      balance: 68205,
    },
    'AS-9733680877'
  );
  assert.equal(badPan.ok, false);

  // Reject duplicate account numbers
  const dup = adminUpdateAccountDetails(
    INITIAL_ACCOUNTS,
    INITIAL_TRANSACTIONS,
    'ASFC-2091441002',
    {
      accountNumber: 'ASFC-1048920101',
      holderName: 'Maya Lin',
      email: 'maya.lin@asfc-client.example',
      phone: '+91 98112 90834',
      aadhaarNumber: '739150284619',
      panNumber: 'ML89412',
      address: {
        village: 'Connaught Place',
        district: 'New Delhi',
        state: 'Delhi',
        country: 'India',
      },
      accountType: 'Checking',
      branchName: 'Connaught Exchange Center · Branch 12',
      dailyWithdrawalLimit: 30000,
      pin: '7314',
      status: 'Active',
      balance: 68205,
    },
    'AS-9733680877'
  );
  assert.equal(dup.ok, false);
});

test('adminResetDailyWithdrawal and adminDeleteAccount mutate state cleanly', () => {
  const reset = adminResetDailyWithdrawal(INITIAL_ACCOUNTS, 'ASFC-1048920101');
  const acct = reset.find((a) => a.accountNumber === 'ASFC-1048920101');
  assert.equal(acct?.withdrawnToday, 0);

  const deleted = adminDeleteAccount(INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, 'ASFC-3372885403');
  assert.equal(deleted.ok, true);
  assert.equal(deleted.accounts.length, INITIAL_ACCOUNTS.length - 1);
  assert.equal(
    deleted.transactions.some((t) => t.accountNumber === 'ASFC-3372885403'),
    false
  );
});

test('adminUpdateProfile updates admin name, position, phone, address, aadhaarNumber, and panNumber', () => {
  const res = adminUpdateProfile(ADMIN_ACCOUNTS, 'AS-9733680877', {
    name: 'Arjun S. Kapoor',
    position: 'MD & CEO',
    phone: '+91 98200 97336',
    aadhaarNumber: '112233445566',
    panNumber: 'QJ45678',
    address: {
      village: 'Bandra West',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      country: 'India',
    },
  });
  assert.equal(res.ok, true);
  assert.equal(res.updatedAdmin?.name, 'Arjun S. Kapoor');
  assert.equal(res.updatedAdmin?.position, 'MD & CEO');
  assert.equal(res.updatedAdmin?.aadhaarNumber, '112233445566');
  assert.equal(res.updatedAdmin?.panNumber, 'QJ45678');
  assert.equal(res.updatedAdmin?.address.village, 'Bandra West');

  const badAadhaar = adminUpdateProfile(ADMIN_ACCOUNTS, 'AS-9733680877', {
    name: 'Arjun Singhania',
    position: 'MD',
    phone: '+91 97336 80877',
    aadhaarNumber: '1234',
    panNumber: 'MD97336',
    address: {
      village: 'Nariman Point',
      district: 'Mumbai City',
      state: 'Maharashtra',
      country: 'India',
    },
  });
  assert.equal(badAadhaar.ok, false);
});
