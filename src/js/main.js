import { triggerCsvDownload } from './dom.js';
import {
  adminDeleteAccount,
  adminResetDailyWithdrawal,
  adminUpdateAccountDetails,
  adminUpdateProfile,
  authenticateAccount,
  authenticateAdmin,
  createAccount,
  depositFunds,
  filterTransactions,
  generateTransactionsCsv,
  loadBankState,
  saveBankState,
  toggleCardStatus,
  transferFunds,
  withdrawFunds,
} from './banking.js';
import { renderLoginView } from './loginView.js';
import { renderCustomerView } from './customerView.js';
import { renderAdminView } from './adminView.js';
import { renderReceiptModal } from './receiptModal.js';

const initialState = loadBankState();

let state = {
  accounts: initialState.accounts,
  transactions: initialState.transactions,
  admins: initialState.admins,
  sessionAccountNumber: initialState.sessionAccountNumber,
  sessionAdminId: initialState.sessionAdminId,
};

function createFreshNewAccountDraft() {
  return {
    accountNumber: '',
    holderName: '',
    email: '',
    phone: '',
    aadhaarNumber: '',
    panNumber: '',
    village: '',
    district: '',
    state: 'Maharashtra',
    country: 'India',
    accountType: 'Checking',
    pin: '',
    initialDeposit: '5000',
  };
}

const ui = {
  // Login & Auth
  loginMode: 'login', // 'login' | 'new-account' | 'admin'
  loginIdentifier: '',
  loginPin: '',
  showLoginPin: false,
  loginError: '',
  adminId: '',
  adminPin: '',
  showAdminPin: false,
  adminError: '',

  // Customer Workspace
  activeSection: 'atm',
  mobileMenuOpen: false,
  revealCard: false,
  revealAadhaar: false,
  atmMode: 'withdraw',
  atmAmount: '2000',
  atmDepositAmount: '',
  atmDepositMethod: 'Cash',
  atmDepositNote: '',
  atmTransferTo: '',
  atmTransferAmount: '',
  atmError: '',
  withdrawAmount: '2000',
  withdrawNote: '',
  withdrawError: '',
  depositAmount: '',
  depositMethod: 'Cash',
  depositNote: '',
  depositError: '',
  transferTo: '',
  transferRecipientName: '',
  transferAmount: '',
  transferNote: '',
  transferError: '',
  historyFilter: 'all',
  historySearch: '',
  lastResultTx: null,

  // Admin Workspace
  adminTab: 'accounts',
  adminSearch: '',
  adminTxAccountFilter: 'all',
  adminNotice: '',
  revealAdminAadhaar: false,
  editingAccountNumber: null,
  editDraft: null,
  editError: '',
  confirmDeleteAccount: false,
  newAccountModalOpen: false,
  newAccountDraft: createFreshNewAccountDraft(),
  newAccountError: '',
  historyAccountNumber: null,
  adminHistoryFilter: 'all',
  adminHistorySearch: '',
  editingAdminId: null,
  adminProfileDraft: null,
  adminProfileError: '',

  // Shared Receipt Modal
  receiptTxId: null,
};

const appEl = document.getElementById('app');

function persist() {
  saveBankState(
    state.accounts,
    state.transactions,
    state.sessionAccountNumber,
    state.sessionAdminId,
    state.admins
  );
}

function getActiveCustomer() {
  if (!state.sessionAccountNumber) return null;
  return state.accounts.find((a) => a.accountNumber === state.sessionAccountNumber) ?? null;
}

function getActiveAdmin() {
  if (!state.sessionAdminId) return null;
  return state.admins.find((a) => a.adminId === state.sessionAdminId) ?? null;
}

function render(preserveFocus = false) {
  if (!appEl) return;

  let focusId = null;
  let selectionStart = null;
  let selectionEnd = null;
  if (preserveFocus && document.activeElement && document.activeElement.id) {
    focusId = document.activeElement.id;
    if (typeof document.activeElement.selectionStart === 'number') {
      selectionStart = document.activeElement.selectionStart;
      selectionEnd = document.activeElement.selectionEnd;
    }
  }

  const activeAdmin = getActiveAdmin();
  const activeCustomer = getActiveCustomer();

  let html = '';
  if (activeAdmin) {
    html = renderAdminView(activeAdmin, state.admins, state.accounts, state.transactions, ui);
  } else if (activeCustomer) {
    const otherAccounts = state.accounts.filter(
      (a) => a.accountNumber !== activeCustomer.accountNumber
    );
    html = renderCustomerView(activeCustomer, otherAccounts, state.transactions, ui);
  } else {
    html = renderLoginView(ui);
  }

  if (ui.receiptTxId) {
    const receiptTx = state.transactions.find((t) => t.id === ui.receiptTxId) ?? null;
    const receiptAccount = receiptTx
      ? state.accounts.find((a) => a.accountNumber === receiptTx.accountNumber) ?? activeCustomer
      : null;
    if (receiptTx && receiptAccount) {
      html += renderReceiptModal(receiptTx, receiptAccount);
    }
  }

  appEl.innerHTML = html;

  if (focusId) {
    const el = document.getElementById(focusId);
    if (el) {
      el.focus();
      if (selectionStart !== null && typeof el.setSelectionRange === 'function') {
        try {
          el.setSelectionRange(selectionStart, selectionEnd ?? selectionStart);
        } catch {
          // Some input types (e.g., number) reject setSelectionRange in Chromium
        }
      }
    }
  }
}

function logoutSession() {
  state.sessionAccountNumber = null;
  state.sessionAdminId = null;
  persist();

  ui.loginMode = 'login';
  ui.loginPin = '';
  ui.loginError = '';
  ui.adminId = '';
  ui.adminPin = '';
  ui.adminError = '';
  ui.activeSection = 'atm';
  ui.mobileMenuOpen = false;
  ui.revealCard = false;
  ui.revealAadhaar = false;
  ui.lastResultTx = null;
  ui.receiptTxId = null;
  ui.editingAccountNumber = null;
  ui.editDraft = null;
  ui.newAccountModalOpen = false;
  ui.historyAccountNumber = null;
  ui.editingAdminId = null;
  ui.adminProfileDraft = null;
  ui.adminNotice = '';
  render();
}

function openEditModalForAccount(accountNumber) {
  const acct = state.accounts.find((a) => a.accountNumber === accountNumber);
  if (!acct) return;
  ui.editingAccountNumber = acct.accountNumber;
  ui.editError = '';
  ui.confirmDeleteAccount = false;
  ui.editDraft = {
    accountNumber: acct.accountNumber,
    holderName: acct.holderName,
    email: acct.email,
    phone: acct.phone,
    aadhaarNumber: acct.aadhaarNumber || '',
    panNumber: acct.panNumber || '',
    village: acct.address?.village || '',
    district: acct.address?.district || '',
    state: acct.address?.state || '',
    country: acct.address?.country || 'India',
    accountType: acct.accountType,
    status: acct.status,
    branchName: acct.branchName,
    pin: acct.pin,
    dailyWithdrawalLimit: String(acct.dailyWithdrawalLimit),
    balance: String(acct.balance),
    adjustmentNote: '',
  };
  render();
}

function openEditModalForAdmin(adminId) {
  const target = state.admins.find((a) => a.adminId === adminId);
  if (!target) return;
  ui.editingAdminId = target.adminId;
  ui.adminProfileError = '';
  ui.adminProfileDraft = {
    name: target.name,
    position: target.position,
    phone: target.phone,
    aadhaarNumber: target.aadhaarNumber,
    panNumber: target.panNumber,
    village: target.address?.village || '',
    district: target.address?.district || '',
    state: target.address?.state || '',
    country: target.address?.country || 'India',
  };
  render();
}

// Event Delegation: Clicks
document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  // Backdrop click closes modals
  const backdrop = target.getAttribute('data-modal-backdrop');
  if (backdrop === 'receipt') {
    ui.receiptTxId = null;
    render();
    return;
  }
  if (backdrop === 'edit-account') {
    ui.editingAccountNumber = null;
    ui.editDraft = null;
    render();
    return;
  }
  if (backdrop === 'new-account') {
    ui.newAccountModalOpen = false;
    render();
    return;
  }
  if (backdrop === 'account-history') {
    ui.historyAccountNumber = null;
    render();
    return;
  }
  if (backdrop === 'edit-admin') {
    ui.editingAdminId = null;
    ui.adminProfileDraft = null;
    render();
    return;
  }

  const actionEl = target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.getAttribute('data-action');

  switch (action) {
    // Login & Auth
    case 'switch-auth-mode': {
      const mode = actionEl.getAttribute('data-mode') || 'login';
      ui.loginMode = mode;
      ui.loginError = '';
      ui.adminError = '';
      render();
      break;
    }
    case 'toggle-login-pin-vis': {
      ui.showLoginPin = !ui.showLoginPin;
      render();
      break;
    }
    case 'toggle-admin-pin-vis': {
      ui.showAdminPin = !ui.showAdminPin;
      render();
      break;
    }
    case 'keypad-digit': {
      const digit = actionEl.getAttribute('data-digit') || '';
      if (ui.loginMode === 'login') {
        if (ui.loginPin.length < 4) ui.loginPin += digit;
      } else {
        if (ui.adminPin.length < 6) ui.adminPin += digit;
      }
      render();
      break;
    }
    case 'keypad-backspace': {
      if (ui.loginMode === 'login') {
        ui.loginPin = ui.loginPin.slice(0, -1);
      } else {
        ui.adminPin = ui.adminPin.slice(0, -1);
      }
      render();
      break;
    }
    case 'keypad-clear': {
      if (ui.loginMode === 'login') ui.loginPin = '';
      else ui.adminPin = '';
      render();
      break;
    }

    // Shared Session Actions
    case 'logout': {
      logoutSession();
      break;
    }
    case 'open-receipt': {
      ui.receiptTxId = actionEl.getAttribute('data-tx-id');
      render();
      break;
    }
    case 'close-receipt': {
      ui.receiptTxId = null;
      render();
      break;
    }
    case 'print-receipt': {
      window.print();
      break;
    }

    // Customer Workspace
    case 'nav-section': {
      ui.activeSection = actionEl.getAttribute('data-section') || 'atm';
      ui.mobileMenuOpen = false;
      ui.atmError = '';
      ui.withdrawError = '';
      ui.depositError = '';
      ui.transferError = '';
      render();
      break;
    }
    case 'toggle-mobile-menu': {
      ui.mobileMenuOpen = !ui.mobileMenuOpen;
      render();
      break;
    }
    case 'set-atm-mode': {
      ui.atmMode = actionEl.getAttribute('data-mode') || 'withdraw';
      ui.atmError = '';
      render();
      break;
    }
    case 'set-atm-amount': {
      ui.atmAmount = actionEl.getAttribute('data-amount') || '';
      ui.atmError = '';
      render();
      break;
    }
    case 'pick-atm-recipient': {
      ui.atmTransferTo = actionEl.getAttribute('data-acct') || '';
      render();
      break;
    }
    case 'toggle-reveal-card': {
      ui.revealCard = !ui.revealCard;
      render();
      break;
    }
    case 'toggle-reveal-aadhaar': {
      ui.revealAadhaar = !ui.revealAadhaar;
      render();
      break;
    }
    case 'toggle-card-freeze': {
      const acct = getActiveCustomer();
      if (!acct) break;
      state.accounts = toggleCardStatus(state.accounts, acct.accountNumber);
      persist();
      render();
      break;
    }
    case 'set-withdraw-amount': {
      ui.withdrawAmount = actionEl.getAttribute('data-amount') || '';
      ui.withdrawError = '';
      render();
      break;
    }
    case 'pick-transfer-recipient': {
      ui.transferTo = actionEl.getAttribute('data-acct') || '';
      ui.transferRecipientName = actionEl.getAttribute('data-name') || '';
      render();
      break;
    }
    case 'set-customer-history-filter': {
      ui.historyFilter = actionEl.getAttribute('data-filter') || 'all';
      render();
      break;
    }
    case 'export-customer-csv': {
      const acct = getActiveCustomer();
      if (!acct) break;
      const rows = filterTransactions(
        state.transactions,
        acct.accountNumber,
        ui.historyFilter,
        ui.historySearch
      );
      if (rows.length === 0) break;
      triggerCsvDownload(
        `asfc-statement-${acct.accountNumber}.csv`,
        generateTransactionsCsv(rows)
      );
      break;
    }

    // Admin Portal
    case 'dismiss-admin-notice': {
      ui.adminNotice = '';
      render();
      break;
    }
    case 'admin-set-tab': {
      ui.adminTab = actionEl.getAttribute('data-tab') || 'accounts';
      render();
      break;
    }
    case 'admin-toggle-status': {
      const acctNo = actionEl.getAttribute('data-acct');
      if (!acctNo) break;
      const before = state.accounts.find((a) => a.accountNumber === acctNo);
      state.accounts = toggleCardStatus(state.accounts, acctNo);
      persist();
      if (before) {
        const nextStatus = before.status === 'Active' ? 'Frozen' : 'Active';
        ui.adminNotice = `${before.holderName} (${acctNo}) is now ${nextStatus}.`;
      }
      render();
      break;
    }
    case 'admin-open-edit': {
      const acctNo = actionEl.getAttribute('data-acct');
      if (acctNo) openEditModalForAccount(acctNo);
      break;
    }
    case 'admin-close-edit': {
      ui.editingAccountNumber = null;
      ui.editDraft = null;
      ui.editError = '';
      ui.confirmDeleteAccount = false;
      render();
      break;
    }
    case 'admin-reset-daily': {
      if (!ui.editingAccountNumber) break;
      state.accounts = adminResetDailyWithdrawal(state.accounts, ui.editingAccountNumber);
      persist();
      ui.adminNotice = `Daily ATM withdrawal counter reset to ₹0.00 for ${ui.editingAccountNumber}.`;
      render();
      break;
    }
    case 'admin-request-delete': {
      ui.confirmDeleteAccount = true;
      render();
      break;
    }
    case 'admin-cancel-delete': {
      ui.confirmDeleteAccount = false;
      render();
      break;
    }
    case 'admin-confirm-delete': {
      if (!ui.editingAccountNumber) break;
      const targetNo = ui.editingAccountNumber;
      const res = adminDeleteAccount(state.accounts, state.transactions, targetNo);
      if (!res.ok) {
        ui.editError = res.error;
        render();
        break;
      }
      state.accounts = res.accounts;
      state.transactions = res.transactions;
      persist();
      ui.editingAccountNumber = null;
      ui.editDraft = null;
      ui.confirmDeleteAccount = false;
      ui.adminNotice = `Account ${targetNo} has been removed from ASFC Bank.`;
      render();
      break;
    }
    case 'admin-open-new-modal': {
      ui.newAccountModalOpen = true;
      ui.newAccountError = '';
      ui.newAccountDraft = createFreshNewAccountDraft();
      render();
      break;
    }
    case 'admin-close-new-modal': {
      ui.newAccountModalOpen = false;
      ui.newAccountError = '';
      render();
      break;
    }
    case 'admin-open-history': {
      ui.historyAccountNumber = actionEl.getAttribute('data-acct');
      ui.adminHistoryFilter = 'all';
      ui.adminHistorySearch = '';
      render();
      break;
    }
    case 'admin-close-history': {
      ui.historyAccountNumber = null;
      render();
      break;
    }
    case 'admin-set-history-filter': {
      ui.adminHistoryFilter = actionEl.getAttribute('data-filter') || 'all';
      render();
      break;
    }
    case 'admin-export-account-csv': {
      if (!ui.historyAccountNumber) break;
      const rows = filterTransactions(
        state.transactions,
        ui.historyAccountNumber,
        ui.adminHistoryFilter,
        ui.adminHistorySearch
      );
      if (rows.length === 0) break;
      triggerCsvDownload(
        `asfc-ledger-${ui.historyAccountNumber}.csv`,
        generateTransactionsCsv(rows)
      );
      break;
    }
    case 'admin-export-csv': {
      const accountQuery = ui.adminSearch.trim().toLowerCase();
      const rows = state.transactions.filter((tx) => {
        if (ui.adminTxAccountFilter !== 'all' && tx.accountNumber !== ui.adminTxAccountFilter) {
          return false;
        }
        if (!accountQuery) return true;
        const acct = state.accounts.find((a) => a.accountNumber === tx.accountNumber);
        return [tx.referenceCode, tx.accountNumber, acct?.holderName ?? '', tx.description, tx.channel]
          .join(' ')
          .toLowerCase()
          .includes(accountQuery);
      });
      if (rows.length === 0) break;
      triggerCsvDownload('asfc-bank-wide-ledger.csv', generateTransactionsCsv(rows));
      break;
    }
    case 'toggle-admin-aadhaar': {
      ui.revealAdminAadhaar = !ui.revealAdminAadhaar;
      render();
      break;
    }
    case 'admin-open-profile-edit': {
      const adminId = actionEl.getAttribute('data-admin-id') || state.sessionAdminId;
      if (adminId) openEditModalForAdmin(adminId);
      break;
    }
    case 'admin-close-profile-edit': {
      ui.editingAdminId = null;
      ui.adminProfileDraft = null;
      ui.adminProfileError = '';
      render();
      break;
    }
  }
});

// Event Delegation: Input synchronization
document.addEventListener('input', (event) => {
  const el = event.target;
  if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
  const val = el.value;

  switch (el.id) {
    case 'login-account-id':
      ui.loginIdentifier = val;
      break;
    case 'login-pin':
      ui.loginPin = val.replace(/\D/g, '').slice(0, 4);
      el.value = ui.loginPin;
      break;
    case 'admin-login-id':
      ui.adminId = val;
      break;
    case 'admin-login-pin':
      ui.adminPin = val.replace(/\D/g, '').slice(0, 6);
      el.value = ui.adminPin;
      break;
    case 'atm-withdraw-amount':
      ui.atmAmount = val;
      render(true);
      break;
    case 'atm-deposit-amount':
      ui.atmDepositAmount = val;
      break;
    case 'atm-deposit-note':
      ui.atmDepositNote = val;
      break;
    case 'atm-transfer-to':
      ui.atmTransferTo = val;
      break;
    case 'atm-transfer-amount':
      ui.atmTransferAmount = val;
      break;
    case 'withdraw-amount':
      ui.withdrawAmount = val;
      render(true);
      break;
    case 'withdraw-note':
      ui.withdrawNote = val;
      break;
    case 'deposit-amount':
      ui.depositAmount = val;
      break;
    case 'deposit-note':
      ui.depositNote = val;
      break;
    case 'transfer-to':
      ui.transferTo = val;
      break;
    case 'transfer-recipient-name':
      ui.transferRecipientName = val;
      break;
    case 'transfer-amount':
      ui.transferAmount = val;
      break;
    case 'transfer-note':
      ui.transferNote = val;
      break;
    case 'customer-history-search':
      ui.historySearch = val;
      render(true);
      break;
    case 'admin-search-input':
      ui.adminSearch = val;
      render(true);
      break;
    case 'admin-history-search':
      ui.adminHistorySearch = val;
      render(true);
      break;
    // Edit Account Draft
    case 'edit-account-number':
      if (ui.editDraft) ui.editDraft.accountNumber = val.toUpperCase();
      break;
    case 'edit-holder-name':
      if (ui.editDraft) ui.editDraft.holderName = val;
      break;
    case 'edit-email':
      if (ui.editDraft) ui.editDraft.email = val;
      break;
    case 'edit-phone':
      if (ui.editDraft) ui.editDraft.phone = val;
      break;
    case 'edit-aadhaar':
      if (ui.editDraft) ui.editDraft.aadhaarNumber = val;
      break;
    case 'edit-pan':
      if (ui.editDraft) ui.editDraft.panNumber = val.toUpperCase();
      break;
    case 'edit-pin':
      if (ui.editDraft) {
        ui.editDraft.pin = val.replace(/\D/g, '').slice(0, 4);
        el.value = ui.editDraft.pin;
      }
      break;
    case 'edit-address-village':
      if (ui.editDraft) ui.editDraft.village = val;
      break;
    case 'edit-address-district':
      if (ui.editDraft) ui.editDraft.district = val;
      break;
    case 'edit-address-state':
      if (ui.editDraft) ui.editDraft.state = val;
      break;
    case 'edit-address-country':
      if (ui.editDraft) ui.editDraft.country = val;
      break;
    case 'edit-branch-name':
      if (ui.editDraft) ui.editDraft.branchName = val;
      break;
    case 'edit-daily-limit':
      if (ui.editDraft) ui.editDraft.dailyWithdrawalLimit = val;
      break;
    case 'edit-balance':
      if (ui.editDraft) ui.editDraft.balance = val;
      break;
    case 'edit-adjustment-note':
      if (ui.editDraft) ui.editDraft.adjustmentNote = val;
      break;
    // New Account Draft
    case 'admin-new-account-number':
      ui.newAccountDraft.accountNumber = val.toUpperCase();
      break;
    case 'admin-new-holder-name':
      ui.newAccountDraft.holderName = val;
      break;
    case 'admin-new-email':
      ui.newAccountDraft.email = val;
      break;
    case 'admin-new-phone':
      ui.newAccountDraft.phone = val;
      break;
    case 'admin-new-aadhaar':
      ui.newAccountDraft.aadhaarNumber = val;
      break;
    case 'admin-new-pan':
      ui.newAccountDraft.panNumber = val.toUpperCase();
      break;
    case 'admin-new-village':
      ui.newAccountDraft.village = val;
      break;
    case 'admin-new-district':
      ui.newAccountDraft.district = val;
      break;
    case 'admin-new-state':
      ui.newAccountDraft.state = val;
      break;
    case 'admin-new-country':
      ui.newAccountDraft.country = val;
      break;
    case 'admin-new-pin':
      ui.newAccountDraft.pin = val.replace(/\D/g, '').slice(0, 4);
      el.value = ui.newAccountDraft.pin;
      break;
    case 'admin-new-deposit':
      ui.newAccountDraft.initialDeposit = val;
      break;
    // Admin Profile Draft
    case 'edit-admin-name':
      if (ui.adminProfileDraft) ui.adminProfileDraft.name = val;
      break;
    case 'edit-admin-position':
      if (ui.adminProfileDraft) ui.adminProfileDraft.position = val;
      break;
    case 'edit-admin-phone':
      if (ui.adminProfileDraft) ui.adminProfileDraft.phone = val;
      break;
    case 'edit-admin-aadhaar':
      if (ui.adminProfileDraft) ui.adminProfileDraft.aadhaarNumber = val;
      break;
    case 'edit-admin-pan':
      if (ui.adminProfileDraft) ui.adminProfileDraft.panNumber = val.toUpperCase();
      break;
    case 'edit-admin-village':
      if (ui.adminProfileDraft) ui.adminProfileDraft.village = val;
      break;
    case 'edit-admin-district':
      if (ui.adminProfileDraft) ui.adminProfileDraft.district = val;
      break;
    case 'edit-admin-state':
      if (ui.adminProfileDraft) ui.adminProfileDraft.state = val;
      break;
    case 'edit-admin-country':
      if (ui.adminProfileDraft) ui.adminProfileDraft.country = val;
      break;
  }
});

// Event Delegation: Select Changes
document.addEventListener('change', (event) => {
  const el = event.target;
  if (!(el instanceof HTMLSelectElement)) return;
  const val = el.value;

  switch (el.id) {
    case 'atm-deposit-method':
      ui.atmDepositMethod = val;
      break;
    case 'deposit-method':
      ui.depositMethod = val;
      break;
    case 'admin-tx-account-filter':
      ui.adminTxAccountFilter = val;
      render();
      break;
    case 'edit-account-type':
      if (ui.editDraft) ui.editDraft.accountType = val;
      break;
    case 'edit-status':
      if (ui.editDraft) ui.editDraft.status = val;
      break;
    case 'admin-new-account-type':
      ui.newAccountDraft.accountType = val;
      break;
  }
});

// Event Delegation: Form Submissions
document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();

  switch (form.id) {
    case 'customer-login-form': {
      const res = authenticateAccount(state.accounts, ui.loginIdentifier, ui.loginPin);
      if (!res.ok) {
        ui.loginError = res.error;
        render();
        return;
      }
      state.sessionAccountNumber = res.account.accountNumber;
      state.sessionAdminId = null;
      persist();
      ui.loginError = '';
      ui.loginPin = '';
      ui.activeSection = 'atm';
      render();
      break;
    }

    case 'admin-login-form': {
      const res = authenticateAdmin(ui.adminId, ui.adminPin, state.admins);
      if (!res.ok) {
        ui.adminError = res.error;
        render();
        return;
      }
      const openNewModal = ui.loginMode === 'new-account';
      state.sessionAdminId = res.admin.adminId;
      state.sessionAccountNumber = null;
      persist();
      ui.adminError = '';
      ui.adminPin = '';
      ui.adminTab = 'accounts';
      ui.adminNotice = openNewModal
        ? `Signed in as ${res.admin.name} (${res.admin.position}). Ready to open a new customer account.`
        : `Authenticated Admin session active for ${res.admin.name} (${res.admin.position}).`;
      ui.newAccountModalOpen = openNewModal;
      ui.newAccountDraft = createFreshNewAccountDraft();
      ui.newAccountError = '';
      render();
      break;
    }

    case 'atm-withdraw-form': {
      const acct = getActiveCustomer();
      if (!acct) break;
      const res = withdrawFunds(
        state.accounts,
        state.transactions,
        acct.accountNumber,
        Number(ui.atmAmount),
        { channel: 'ATM Terminal' }
      );
      if (!res.ok) {
        ui.atmError = res.error;
        render();
        return;
      }
      state.accounts = res.accounts;
      state.transactions = res.transactions;
      persist();
      ui.atmError = '';
      ui.lastResultTx = res.createdTransaction;
      ui.receiptTxId = res.createdTransaction.id;
      render();
      break;
    }

    case 'atm-deposit-form': {
      const acct = getActiveCustomer();
      if (!acct) break;
      const res = depositFunds(
        state.accounts,
        state.transactions,
        acct.accountNumber,
        Number(ui.atmDepositAmount),
        ui.atmDepositMethod,
        { channel: 'ATM Terminal', note: ui.atmDepositNote }
      );
      if (!res.ok) {
        ui.atmError = res.error;
        render();
        return;
      }
      state.accounts = res.accounts;
      state.transactions = res.transactions;
      persist();
      ui.atmError = '';
      ui.atmDepositAmount = '';
      ui.atmDepositNote = '';
      ui.lastResultTx = res.createdTransaction;
      ui.receiptTxId = res.createdTransaction.id;
      render();
      break;
    }

    case 'atm-transfer-form': {
      const acct = getActiveCustomer();
      if (!acct) break;
      const res = transferFunds(
        state.accounts,
        state.transactions,
        acct.accountNumber,
        ui.atmTransferTo,
        Number(ui.atmTransferAmount),
        { channel: 'ATM Terminal' }
      );
      if (!res.ok) {
        ui.atmError = res.error;
        render();
        return;
      }
      state.accounts = res.accounts;
      state.transactions = res.transactions;
      persist();
      ui.atmError = '';
      ui.atmTransferAmount = '';
      ui.lastResultTx = res.createdTransaction;
      ui.receiptTxId = res.createdTransaction.id;
      render();
      break;
    }

    case 'withdraw-view-form': {
      const acct = getActiveCustomer();
      if (!acct) break;
      const res = withdrawFunds(
        state.accounts,
        state.transactions,
        acct.accountNumber,
        Number(ui.withdrawAmount),
        { channel: 'ATM Terminal', note: ui.withdrawNote }
      );
      if (!res.ok) {
        ui.withdrawError = res.error;
        render();
        return;
      }
      state.accounts = res.accounts;
      state.transactions = res.transactions;
      persist();
      ui.withdrawError = '';
      ui.withdrawNote = '';
      ui.lastResultTx = res.createdTransaction;
      ui.receiptTxId = res.createdTransaction.id;
      render();
      break;
    }

    case 'deposit-view-form': {
      const acct = getActiveCustomer();
      if (!acct) break;
      const res = depositFunds(
        state.accounts,
        state.transactions,
        acct.accountNumber,
        Number(ui.depositAmount),
        ui.depositMethod,
        { channel: 'Digital Portal', note: ui.depositNote }
      );
      if (!res.ok) {
        ui.depositError = res.error;
        render();
        return;
      }
      state.accounts = res.accounts;
      state.transactions = res.transactions;
      persist();
      ui.depositError = '';
      ui.depositAmount = '';
      ui.depositNote = '';
      ui.lastResultTx = res.createdTransaction;
      ui.receiptTxId = res.createdTransaction.id;
      render();
      break;
    }

    case 'transfer-view-form': {
      const acct = getActiveCustomer();
      if (!acct) break;
      const res = transferFunds(
        state.accounts,
        state.transactions,
        acct.accountNumber,
        ui.transferTo,
        Number(ui.transferAmount),
        {
          channel: 'Digital Portal',
          recipientName: ui.transferRecipientName,
          note: ui.transferNote,
        }
      );
      if (!res.ok) {
        ui.transferError = res.error;
        render();
        return;
      }
      state.accounts = res.accounts;
      state.transactions = res.transactions;
      persist();
      ui.transferError = '';
      ui.transferAmount = '';
      ui.transferNote = '';
      ui.lastResultTx = res.createdTransaction;
      ui.receiptTxId = res.createdTransaction.id;
      render();
      break;
    }

    case 'admin-edit-account-form': {
      const admin = getActiveAdmin();
      if (!admin || !ui.editingAccountNumber || !ui.editDraft) break;
      const d = ui.editDraft;
      const res = adminUpdateAccountDetails(
        state.accounts,
        state.transactions,
        ui.editingAccountNumber,
        {
          accountNumber: d.accountNumber,
          holderName: d.holderName,
          email: d.email,
          phone: d.phone,
          aadhaarNumber: d.aadhaarNumber,
          panNumber: d.panNumber,
          address: {
            village: d.village,
            district: d.district,
            state: d.state,
            country: d.country,
          },
          accountType: d.accountType,
          status: d.status,
          branchName: d.branchName,
          pin: d.pin,
          dailyWithdrawalLimit: d.dailyWithdrawalLimit,
          balance: d.balance,
          adjustmentNote: d.adjustmentNote,
        },
        admin.adminId
      );
      if (!res.ok) {
        ui.editError = res.error;
        render();
        return;
      }
      state.accounts = res.accounts;
      state.transactions = res.transactions;
      persist();
      ui.editingAccountNumber = null;
      ui.editDraft = null;
      ui.editError = '';
      ui.confirmDeleteAccount = false;
      ui.adminNotice = `Updated account details for ${d.holderName} (${d.accountNumber}).`;
      render();
      break;
    }

    case 'admin-new-account-form': {
      const d = ui.newAccountDraft;
      const res = createAccount(state.accounts, state.transactions, {
        accountNumber: d.accountNumber || undefined,
        holderName: d.holderName,
        email: d.email,
        phone: d.phone,
        aadhaarNumber: d.aadhaarNumber || undefined,
        panNumber: d.panNumber || undefined,
        address: {
          village: d.village,
          district: d.district,
          state: d.state,
          country: d.country,
        },
        accountType: d.accountType,
        pin: d.pin,
        initialDeposit: Number(d.initialDeposit),
      });
      if (!res.ok) {
        ui.newAccountError = res.error;
        render();
        return;
      }
      state.accounts = res.accounts;
      state.transactions = res.transactions;
      persist();
      ui.newAccountModalOpen = false;
      ui.newAccountError = '';
      ui.newAccountDraft = createFreshNewAccountDraft();
      ui.adminNotice = `Opened new account ${res.account.accountNumber} for ${res.account.holderName}.`;
      render();
      break;
    }

    case 'admin-edit-profile-form': {
      if (!ui.editingAdminId || !ui.adminProfileDraft) break;
      const d = ui.adminProfileDraft;
      const res = adminUpdateProfile(state.admins, ui.editingAdminId, {
        name: d.name,
        position: d.position,
        phone: d.phone,
        aadhaarNumber: d.aadhaarNumber,
        panNumber: d.panNumber,
        address: {
          village: d.village,
          district: d.district,
          state: d.state,
          country: d.country,
        },
      });
      if (!res.ok) {
        ui.adminProfileError = res.error;
        render();
        return;
      }
      state.admins = res.admins;
      persist();
      ui.editingAdminId = null;
      ui.adminProfileDraft = null;
      ui.adminProfileError = '';
      ui.adminNotice = `Updated executive admin profile for ${res.updatedAdmin.name} (${res.updatedAdmin.position}).`;
      render();
      break;
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (ui.receiptTxId) {
    ui.receiptTxId = null;
    render();
  } else if (ui.editingAccountNumber) {
    ui.editingAccountNumber = null;
    ui.editDraft = null;
    render();
  } else if (ui.newAccountModalOpen) {
    ui.newAccountModalOpen = false;
    render();
  } else if (ui.historyAccountNumber) {
    ui.historyAccountNumber = null;
    render();
  } else if (ui.editingAdminId) {
    ui.editingAdminId = null;
    ui.adminProfileDraft = null;
    render();
  }
});

render();
