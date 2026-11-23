import { useState, type FormEvent } from 'react';
import {
  Download,
  Eye,
  EyeOff,
  FileText,
  History,
  Lock,
  LogOut,
  PencilLine,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Unlock,
  UserPlus,
  X,
} from 'lucide-react';
import type {
  AccountStatus,
  AccountType,
  AdminAccount,
  AdminAccountUpdateInput,
  AdminProfileUpdateInput,
  BankAccount,
  CreateAccountInput,
  TransactionRecord,
} from '../types/bank';
import {
  filterTransactions,
  formatAadhaarNumber,
  formatCardNumber,
  formatCurrency,
  formatDateTime,
  generateTransactionsCsv,
  getTransactionSignAndLabel,
  type TransactionFilter,
} from '../utils/banking';
import { BrandMark } from './BrandMark';

interface AdminPortalProps {
  admin: AdminAccount;
  admins: AdminAccount[];
  accounts: BankAccount[];
  transactions: TransactionRecord[];
  initialOpenCreate?: boolean;
  onUpdateAccount: (
    accountNumber: string,
    updates: AdminAccountUpdateInput
  ) => { ok: boolean; error?: string };
  onUpdateAdminProfile: (
    adminId: string,
    updates: AdminProfileUpdateInput
  ) => { ok: boolean; error?: string };
  onToggleFreeze: (accountNumber: string) => void;
  onResetDailyLimit: (accountNumber: string) => void;
  onDeleteAccount: (accountNumber: string) => { ok: boolean; error?: string };
  onCreateAccount: (input: CreateAccountInput) => { ok: boolean; error?: string };
  onOpenReceipt: (tx: TransactionRecord, account: BankAccount) => void;
  onLogout: () => void;
}

export function AdminPortal({
  admin,
  admins,
  accounts,
  transactions,
  initialOpenCreate = false,
  onUpdateAccount,
  onUpdateAdminProfile,
  onToggleFreeze,
  onResetDailyLimit,
  onDeleteAccount,
  onCreateAccount,
  onOpenReceipt,
  onLogout,
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'admin-details'>('accounts');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Frozen'>('all');
  const [txAccountFilter, setTxAccountFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [revealSensitive, setRevealSensitive] = useState(false);
  const [revealAdminAadhaar, setRevealAdminAadhaar] = useState(true);

  // Per-account transaction history modal state
  const [historyAccountNumber, setHistoryAccountNumber] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<TransactionFilter>('all');
  const [historySearch, setHistorySearch] = useState('');

  // Edit modal state
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editHolderName, setEditHolderName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAadhaar, setEditAadhaar] = useState('');
  const [editPan, setEditPan] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editState, setEditState] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editAccountType, setEditAccountType] = useState<AccountType>('Checking');
  const [editBranchName, setEditBranchName] = useState('');
  const [editDailyLimit, setEditDailyLimit] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editStatus, setEditStatus] = useState<AccountStatus>('Active');
  const [editBalance, setEditBalance] = useState('');
  const [editAdjustmentNote, setEditAdjustmentNote] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Create account modal state
  const [showCreateModal, setShowCreateModal] = useState(initialOpenCreate);
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newHolderName, setNewHolderName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAadhaar, setNewAadhaar] = useState('');
  const [newPan, setNewPan] = useState('');
  const [newVillage, setNewVillage] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newState, setNewState] = useState('');
  const [newCountry, setNewCountry] = useState('India');
  const [newType, setNewType] = useState<AccountType>('Checking');
  const [newDeposit, setNewDeposit] = useState('10000');
  const [newPin, setNewPin] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Admin profile edit modal state
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [adminEditName, setAdminEditName] = useState('');
  const [adminEditPosition, setAdminEditPosition] = useState('');
  const [adminEditPhone, setAdminEditPhone] = useState('');
  const [adminEditAadhaar, setAdminEditAadhaar] = useState('');
  const [adminEditPan, setAdminEditPan] = useState('');
  const [adminEditVillage, setAdminEditVillage] = useState('');
  const [adminEditDistrict, setAdminEditDistrict] = useState('');
  const [adminEditState, setAdminEditState] = useState('');
  const [adminEditCountry, setAdminEditCountry] = useState('');
  const [adminEditError, setAdminEditError] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  const openEditAdminModal = (target: AdminAccount) => {
    setEditingAdmin(target);
    setAdminEditName(target.name);
    setAdminEditPosition(target.position);
    setAdminEditPhone(target.phone);
    setAdminEditAadhaar(target.aadhaarNumber ?? '');
    setAdminEditPan(target.panNumber ?? '');
    setAdminEditVillage(target.address?.village ?? '');
    setAdminEditDistrict(target.address?.district ?? '');
    setAdminEditState(target.address?.state ?? '');
    setAdminEditCountry(target.address?.country ?? 'India');
    setAdminEditError(null);
  };

  const handleSaveAdminEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setAdminEditError(null);

    const res = onUpdateAdminProfile(editingAdmin.adminId, {
      name: adminEditName,
      position: adminEditPosition,
      phone: adminEditPhone,
      aadhaarNumber: adminEditAadhaar,
      panNumber: adminEditPan,
      address: {
        village: adminEditVillage,
        district: adminEditDistrict,
        state: adminEditState,
        country: adminEditCountry,
      },
    });

    if (!res.ok) {
      setAdminEditError(res.error ?? 'Failed to update administrator details.');
      return;
    }

    setNotice(`Updated administrator profile for ${adminEditName} (${adminEditPosition}).`);
    setEditingAdmin(null);
  };

  const openEditModal = (account: BankAccount) => {
    setEditingAccount(account);
    setEditAccountNumber(account.accountNumber);
    setEditHolderName(account.holderName);
    setEditEmail(account.email);
    setEditPhone(account.phone);
    setEditAadhaar(account.aadhaarNumber ?? '');
    setEditPan(account.panNumber ?? '');
    setEditVillage(account.address?.village ?? '');
    setEditDistrict(account.address?.district ?? '');
    setEditState(account.address?.state ?? '');
    setEditCountry(account.address?.country ?? 'India');
    setEditAccountType(account.accountType);
    setEditBranchName(account.branchName);
    setEditDailyLimit(String(account.dailyWithdrawalLimit));
    setEditPin(account.pin);
    setEditStatus(account.status);
    setEditBalance(String(account.balance));
    setEditAdjustmentNote('');
    setEditError(null);
    setConfirmDelete(false);
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    setEditError(null);

    const normalizedNextAccount = editAccountNumber.trim().toUpperCase().replace(/\s+/g, '');
    const res = onUpdateAccount(editingAccount.accountNumber, {
      accountNumber: normalizedNextAccount,
      holderName: editHolderName,
      email: editEmail,
      phone: editPhone,
      aadhaarNumber: editAadhaar,
      panNumber: editPan,
      address: {
        village: editVillage,
        district: editDistrict,
        state: editState,
        country: editCountry,
      },
      accountType: editAccountType,
      branchName: editBranchName,
      dailyWithdrawalLimit: Number(editDailyLimit),
      pin: editPin,
      status: editStatus,
      balance: Number(editBalance),
      adjustmentNote: editAdjustmentNote,
    });

    if (!res.ok) {
      setEditError(res.error ?? 'Failed to update account.');
      return;
    }

    setNotice(`Updated account details for ${editHolderName} (${normalizedNextAccount}).`);
    setEditingAccount(null);
  };

  const handleConfirmDelete = () => {
    if (!editingAccount) return;
    const res = onDeleteAccount(editingAccount.accountNumber);
    if (!res.ok) {
      setEditError(res.error ?? 'Could not delete account.');
      return;
    }
    setNotice(`Closed account ${editingAccount.accountNumber} (${editingAccount.holderName}).`);
    setEditingAccount(null);
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    const res = onCreateAccount({
      accountNumber: newAccountNumber.trim() || undefined,
      holderName: newHolderName,
      email: newEmail,
      phone: newPhone,
      aadhaarNumber: newAadhaar.trim() || undefined,
      panNumber: newPan.trim() || undefined,
      address: {
        village: newVillage,
        district: newDistrict,
        state: newState,
        country: newCountry,
      },
      accountType: newType,
      initialDeposit: Number(newDeposit),
      pin: newPin,
    });
    if (!res.ok) {
      setCreateError(res.error ?? 'Could not create customer account.');
      return;
    }
    setNotice(`Provisioned new customer account for ${newHolderName}.`);
    setShowCreateModal(false);
    setNewAccountNumber('');
    setNewHolderName('');
    setNewEmail('');
    setNewPhone('');
    setNewAadhaar('');
    setNewPan('');
    setNewVillage('');
    setNewDistrict('');
    setNewState('');
    setNewCountry('India');
    setNewPin('');
    setNewDeposit('10000');
  };

  const totalLiquidity = accounts.reduce((sum, acct) => sum + acct.balance, 0);
  const activeCount = accounts.filter((a) => a.status === 'Active').length;
  const frozenCount = accounts.filter((a) => a.status === 'Frozen').length;

  const query = searchQuery.trim().toLowerCase();
  const filteredAccounts = accounts.filter((acct) => {
    if (statusFilter !== 'all' && acct.status !== statusFilter) return false;
    if (!query) return true;
    return [acct.holderName, acct.accountNumber, acct.cardNumber, acct.email, acct.accountType]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  const filteredBankTransactions = transactions.filter((tx) => {
    if (txAccountFilter !== 'all' && tx.accountNumber !== txAccountFilter) return false;
    if (!query) return true;
    const owner = accounts.find((a) => a.accountNumber === tx.accountNumber);
    return [
      tx.referenceCode,
      tx.accountNumber,
      owner?.holderName ?? '',
      tx.description,
      tx.channel,
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  const historyAccount = historyAccountNumber
    ? accounts.find((a) => a.accountNumber === historyAccountNumber) ?? null
    : null;
  const historyTransactions = historyAccount
    ? filterTransactions(transactions, historyAccount.accountNumber, historyFilter, historySearch)
    : [];

  const openHistoryModal = (account: BankAccount) => {
    setHistoryAccountNumber(account.accountNumber);
    setHistoryFilter('all');
    setHistorySearch('');
  };

  const handleDownloadAccountCsv = (acct: BankAccount, rows: TransactionRecord[]) => {
    const csvContent = generateTransactionsCsv(rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asfc-statement-${acct.accountNumber}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/90 bg-[#09090B]/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <BrandMark />
            <span className="hidden sm:inline text-zinc-600">/</span>
            <span className="hidden sm:inline text-sm font-semibold text-zinc-300 whitespace-nowrap">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white whitespace-nowrap">
                {admin.name} · <span className="text-red-400">{admin.position}</span>
              </p>
              <p className="text-[11px] font-mono text-zinc-400 tabular-nums whitespace-nowrap">
                {admin.adminId}
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8 space-y-6">
        {/* Page Heading */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-red-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Restricted Administrator Console · {admin.roleTitle}</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              ASFC Bank Account Administration
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Inspect and manage all customer accounts, balances, daily limits, ATM PINs, and card statuses.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors whitespace-nowrap shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            New Account Open
          </button>
        </div>

        {/* Notice Banner */}
        {notice && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-900/70 bg-emerald-950/25 px-4 py-3 text-xs font-medium text-emerald-300">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss notice"
              className="rounded p-1 text-emerald-400 hover:bg-emerald-900/40"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 4-Column KPI Summary Strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-[#121216] p-5">
            <p className="text-xs text-zinc-400">Total Customer Accounts</p>
            <p className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
              {accounts.length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#121216] p-5">
            <p className="text-xs text-zinc-400">Total Managed Liquidity</p>
            <p className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
              {formatCurrency(totalLiquidity)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#121216] p-5">
            <p className="text-xs text-zinc-400">Card &amp; Account Status</p>
            <p className="mt-2 font-mono text-lg font-bold text-white tabular-nums">
              {activeCount} Active · {frozenCount} Frozen
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#121216] p-5">
            <p className="text-xs text-zinc-400">Bank-Wide Transactions</p>
            <p className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
              {transactions.length}
            </p>
          </div>
        </div>

        {/* Workspace Controls */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="inline-flex rounded-lg border border-zinc-800 bg-[#121216] p-1"
              role="tablist"
              aria-label="Admin workspace sections"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'accounts'}
                onClick={() => setActiveTab('accounts')}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'accounts'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Accounts Directory ({accounts.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'transactions'}
                onClick={() => setActiveTab('transactions')}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'transactions'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Bank-Wide Transactions ({transactions.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'admin-details'}
                onClick={() => setActiveTab('admin-details')}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'admin-details'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Admin Details ({admins.length})
              </button>
            </div>

            {activeTab === 'accounts' && (
              <div
                className="inline-flex rounded-lg border border-zinc-800 bg-[#121216] p-1"
                role="tablist"
                aria-label="Filter accounts by status"
              >
                {(['all', 'Active', 'Frozen'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === status}
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      statusFilter === status
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeTab !== 'admin-details' && (
            <div className="flex flex-wrap items-center gap-3">
              {activeTab === 'accounts' ? (
                <button
                  type="button"
                  onClick={() => setRevealSensitive((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#121216] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
                >
                  {revealSensitive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {revealSensitive ? 'Hide Cards & PINs' : 'Reveal Cards & PINs'}
                </button>
              ) : (
                <select
                  value={txAccountFilter}
                  onChange={(e) => setTxAccountFilter(e.target.value)}
                  aria-label="Filter bank-wide transactions by account"
                  className="rounded-lg border border-zinc-800 bg-[#121216] px-3.5 py-2 text-xs font-medium text-zinc-200 focus:border-red-600 focus:outline-none"
                >
                  <option value="all">All Accounts ({accounts.length})</option>
                  {accounts.map((acct) => (
                    <option key={acct.accountNumber} value={acct.accountNumber}>
                      {acct.holderName} ({acct.accountNumber})
                    </option>
                  ))}
                </select>
              )}

              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search accounts or transactions"
                  placeholder={
                    activeTab === 'accounts'
                      ? 'Search holder, account, or email...'
                      : 'Search reference, holder, or account...'
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-[#121216] py-2 pl-9 pr-3 text-xs text-white placeholder:text-zinc-500 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Data Table */}
        {activeTab === 'accounts' ? (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#121216]">
            {filteredAccounts.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="text-sm font-medium text-zinc-300">No customer accounts match</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Adjust the search query or create a new customer account.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#0D0D11] text-xs font-medium text-zinc-400">
                      <th className="px-5 py-3.5">Account Holder</th>
                      <th className="px-5 py-3.5">Account &amp; Tier</th>
                      <th className="px-5 py-3.5">Card &amp; PIN</th>
                      <th className="px-5 py-3.5 text-right">Balance</th>
                      <th className="px-5 py-3.5 text-right">Daily Limit Used</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {filteredAccounts.map((acct) => (
                      <tr key={acct.accountNumber} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">{acct.holderName}</p>
                          <p className="text-xs text-zinc-400">{acct.email}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-mono text-xs font-medium text-white tabular-nums">
                            {acct.accountNumber}
                          </p>
                          <p className="text-xs text-zinc-400">{acct.accountType}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-mono text-xs text-zinc-200 tabular-nums">
                            {formatCardNumber(acct.cardNumber, revealSensitive)}
                          </p>
                          <p className="font-mono text-xs text-zinc-500 tabular-nums">
                            PIN: {revealSensitive ? acct.pin : '••••'}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-sm font-semibold text-white tabular-nums whitespace-nowrap">
                          {formatCurrency(acct.balance)}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-xs text-zinc-300 tabular-nums whitespace-nowrap">
                          {formatCurrency(acct.withdrawnToday)} /{' '}
                          {formatCurrency(acct.dailyWithdrawalLimit)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-semibold ${
                              acct.status === 'Active' ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {acct.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openHistoryModal(acct)}
                              aria-label={`History ${acct.holderName}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#09090B] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-red-600/60 hover:text-white transition-colors"
                            >
                              <History className="h-3.5 w-3.5" />
                              History
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(acct)}
                              aria-label={`Manage ${acct.holderName}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                              Manage Details
                            </button>
                            <button
                              type="button"
                              onClick={() => onToggleFreeze(acct.accountNumber)}
                              aria-label={
                                acct.status === 'Active'
                                  ? `Freeze ${acct.holderName}`
                                  : `Unfreeze ${acct.holderName}`
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#09090B] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
                            >
                              {acct.status === 'Active' ? (
                                <>
                                  <Lock className="h-3.5 w-3.5" />
                                  Freeze
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-3.5 w-3.5" />
                                  Unfreeze
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'transactions' ? (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#121216]">
            {filteredBankTransactions.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="text-sm font-medium text-zinc-300">No transactions recorded</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#0D0D11] text-xs font-medium text-zinc-400">
                      <th className="px-5 py-3.5">Date &amp; Time</th>
                      <th className="px-5 py-3.5">Account</th>
                      <th className="px-5 py-3.5">Description</th>
                      <th className="px-5 py-3.5">Type &amp; Channel</th>
                      <th className="px-5 py-3.5">Reference</th>
                      <th className="px-5 py-3.5 text-right">Amount</th>
                      <th className="px-5 py-3.5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {filteredBankTransactions.map((tx) => {
                      const owner = accounts.find((a) => a.accountNumber === tx.accountNumber);
                      const { sign, label, isCredit } = getTransactionSignAndLabel(
                        tx.type,
                        tx.adjustmentDirection
                      );
                      return (
                        <tr key={tx.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xs text-zinc-400 tabular-nums whitespace-nowrap">
                            {formatDateTime(tx.timestamp)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <p className="text-xs font-semibold text-white">
                              {owner?.holderName ?? 'Closed Account'}
                            </p>
                            <p className="font-mono text-xs text-zinc-500 tabular-nums">
                              {tx.accountNumber}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-zinc-200">{tx.description}</td>
                          <td className="px-5 py-3.5 text-xs text-zinc-400 whitespace-nowrap">
                            {label} · {tx.channel}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs text-zinc-400 tabular-nums whitespace-nowrap">
                            {tx.referenceCode}
                          </td>
                          <td
                            className={`px-5 py-3.5 text-right font-mono text-sm font-semibold tabular-nums whitespace-nowrap ${
                              isCredit ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {sign}
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            {owner ? (
                              <button
                                type="button"
                                onClick={() => onOpenReceipt(tx, owner)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-[#09090B] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-red-600/60 hover:text-white transition-colors"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Receipt
                              </button>
                            ) : (
                              <span className="text-xs text-zinc-600">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-900/50 bg-[#121216] p-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-red-400">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Admin-Only Confidential KYC &amp; Executive Profile</span>
                </div>
                <h2 className="mt-1 text-lg font-bold text-white">
                  ASFC Administrator Details
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Visible and editable exclusively by authenticated ASFC Bank administrators.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRevealAdminAadhaar((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  {revealAdminAadhaar ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {revealAdminAadhaar ? 'Mask Admin Aadhaar' : 'Show Admin Aadhaar'}
                </button>
                <button
                  type="button"
                  onClick={() => openEditAdminModal(admin)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Edit My Admin Details
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {admins.map((adm) => {
                const isCurrent = adm.adminId === admin.adminId;
                return (
                  <div
                    key={adm.adminId}
                    className={`rounded-xl border bg-[#121216] p-6 ${
                      isCurrent ? 'border-red-600/60' : 'border-zinc-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-4">
                      <div>
                        <p className="text-xs font-mono text-red-400 tabular-nums">
                          {adm.adminId} {isCurrent ? '· Signed In' : ''}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-white">{adm.name}</h3>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          Position: <span className="font-semibold text-zinc-200">{adm.position}</span> ·{' '}
                          {adm.roleTitle}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditAdminModal(adm)}
                        aria-label={`Edit Admin ${adm.name}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#09090B] px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-red-600/60 hover:text-white transition-colors"
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                        Edit Admin
                      </button>
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                      <div className="border-b border-zinc-800/70 pb-2.5">
                        <dt className="text-[11px] text-zinc-500">Admin Name</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-white">{adm.name}</dd>
                      </div>
                      <div className="border-b border-zinc-800/70 pb-2.5">
                        <dt className="text-[11px] text-zinc-500">Position</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-red-400">{adm.position}</dd>
                      </div>
                      <div className="border-b border-zinc-800/70 pb-2.5">
                        <dt className="text-[11px] text-zinc-500">Phone No.</dt>
                        <dd className="mt-0.5 text-sm font-medium text-zinc-200 font-mono tabular-nums">
                          {adm.phone}
                        </dd>
                      </div>
                      <div className="border-b border-zinc-800/70 pb-2.5">
                        <dt className="text-[11px] text-zinc-500">PAN No.</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-white font-mono uppercase tabular-nums">
                          {adm.panNumber}
                        </dd>
                      </div>
                      <div className="sm:col-span-2 border-b border-zinc-800/70 pb-2.5">
                        <dt className="text-[11px] text-zinc-500">Aadhaar No. (12-Digit KYC)</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-white font-mono tabular-nums">
                          {formatAadhaarNumber(adm.aadhaarNumber, revealAdminAadhaar)}
                        </dd>
                      </div>
                      <div className="sm:col-span-2 pt-1">
                        <dt className="text-[11px] text-zinc-500">
                          Address (Vill, Dist, State, Country)
                        </dt>
                        <dd className="mt-1.5 grid grid-cols-2 gap-2.5 rounded-lg border border-zinc-800/80 bg-[#09090B] p-3 sm:grid-cols-4">
                          <div>
                            <span className="block text-[10px] text-zinc-500">Vill</span>
                            <span className="block text-xs font-medium text-zinc-100">
                              {adm.address?.village || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-zinc-500">Dist</span>
                            <span className="block text-xs font-medium text-zinc-100">
                              {adm.address?.district || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-zinc-500">State</span>
                            <span className="block text-xs font-medium text-zinc-100">
                              {adm.address?.state || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-zinc-500">Country</span>
                            <span className="block text-xs font-medium text-zinc-100">
                              {adm.address?.country || '—'}
                            </span>
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Manage Account Details Modal */}
      {editingAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-edit-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-[#121216] shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <div>
                <h2 id="admin-edit-title" className="text-lg font-bold text-white">
                  Manage Account Details
                </h2>
                <p className="text-xs font-mono text-zinc-400 tabular-nums mt-0.5">
                  {editingAccount.accountNumber} · IFSC {editingAccount.ifscCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                aria-label="Close manage account dialog"
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="edit-account-number" className="block text-xs font-medium text-zinc-300">
                    Account Number (Sequence e.g. ASFC-1234567899)
                  </label>
                  <input
                    id="edit-account-number"
                    type="text"
                    required
                    value={editAccountNumber}
                    onChange={(e) => setEditAccountNumber(e.target.value.toUpperCase())}
                    placeholder="ASFC-1234567899"
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white font-mono tracking-wide focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="edit-holder-name" className="block text-xs font-medium text-zinc-300">
                    Account Holder Name
                  </label>
                  <input
                    id="edit-holder-name"
                    type="text"
                    required
                    value={editHolderName}
                    onChange={(e) => setEditHolderName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="edit-email" className="block text-xs font-medium text-zinc-300">
                    Email Address
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="edit-phone" className="block text-xs font-medium text-zinc-300">
                    Phone Number
                  </label>
                  <input
                    id="edit-phone"
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white font-mono focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="edit-branch" className="block text-xs font-medium text-zinc-300">
                    Home Branch
                  </label>
                  <input
                    id="edit-branch"
                    type="text"
                    value={editBranchName}
                    onChange={(e) => setEditBranchName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="edit-aadhaar" className="block text-xs font-medium text-zinc-300">
                    Aadhaar No. (12 Digits)
                  </label>
                  <input
                    id="edit-aadhaar"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    required
                    value={editAadhaar}
                    onChange={(e) => setEditAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="12-digit Aadhaar No."
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white font-mono tracking-wider focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="edit-pan" className="block text-xs font-medium text-zinc-300">
                    PAN No. (e.g. QJ45678)
                  </label>
                  <input
                    id="edit-pan"
                    type="text"
                    maxLength={12}
                    required
                    value={editPan}
                    onChange={(e) =>
                      setEditPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))
                    }
                    placeholder="QJ45678"
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white font-mono uppercase tracking-wider focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 rounded-xl border border-zinc-800/80 bg-[#09090B] p-4">
                  <p className="text-xs font-medium text-zinc-300 mb-3">
                    Address (Vill, Dist, State, Country)
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="edit-address-village" className="block text-[11px] text-zinc-400">
                        Village / Town (Vill)
                      </label>
                      <input
                        id="edit-address-village"
                        type="text"
                        required
                        value={editVillage}
                        onChange={(e) => setEditVillage(e.target.value)}
                        placeholder="Village or locality"
                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121216] px-3 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-address-district" className="block text-[11px] text-zinc-400">
                        District (Dist)
                      </label>
                      <input
                        id="edit-address-district"
                        type="text"
                        required
                        value={editDistrict}
                        onChange={(e) => setEditDistrict(e.target.value)}
                        placeholder="District"
                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121216] px-3 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-address-state" className="block text-[11px] text-zinc-400">
                        State
                      </label>
                      <input
                        id="edit-address-state"
                        type="text"
                        required
                        value={editState}
                        onChange={(e) => setEditState(e.target.value)}
                        placeholder="State"
                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121216] px-3 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-address-country" className="block text-[11px] text-zinc-400">
                        Country
                      </label>
                      <input
                        id="edit-address-country"
                        type="text"
                        required
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                        placeholder="Country"
                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121216] px-3 py-2 text-xs text-white focus:border-red-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-tier" className="block text-xs font-medium text-zinc-300">
                    Account Tier
                  </label>
                  <select
                    id="edit-tier"
                    value={editAccountType}
                    onChange={(e) => setEditAccountType(e.target.value as AccountType)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white focus:border-red-600 focus:outline-none"
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="Private Reserve">Private Reserve</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-pin" className="block text-xs font-medium text-zinc-300">
                    4-Digit Customer ATM PIN
                  </label>
                  <input
                    id="edit-pin"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white font-mono tracking-widest focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="edit-status" className="block text-xs font-medium text-zinc-300">
                    Card &amp; Account Status
                  </label>
                  <select
                    id="edit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as AccountStatus)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white focus:border-red-600 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Frozen">Frozen</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="edit-limit" className="block text-xs font-medium text-zinc-300">
                      Daily ATM Limit (INR)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        onResetDailyLimit(editingAccount.accountNumber);
                        setNotice(`Reset today's withdrawn counter to ₹0.00 for ${editingAccount.accountNumber}.`);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-red-400 hover:text-red-300"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset Used ({formatCurrency(editingAccount.withdrawnToday)})
                    </button>
                  </div>
                  <input
                    id="edit-limit"
                    type="number"
                    min={1000}
                    step={500}
                    required
                    value={editDailyLimit}
                    onChange={(e) => setEditDailyLimit(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white font-mono tabular-nums focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="edit-balance" className="block text-xs font-medium text-zinc-300">
                    Account Balance (INR)
                  </label>
                  <input
                    id="edit-balance"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white font-mono tabular-nums focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="edit-note" className="block text-xs font-medium text-zinc-300">
                    Balance Adjustment Reason (Recorded if balance changes)
                  </label>
                  <input
                    id="edit-note"
                    type="text"
                    value={editAdjustmentNote}
                    onChange={(e) => setEditAdjustmentNote(e.target.value)}
                    placeholder="e.g., Audit reconciliation credit"
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {editError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-900/80 bg-red-950/40 px-4 py-2.5 text-xs font-medium text-red-300"
                >
                  {editError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5">
                <div>
                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/60 bg-red-950/30 px-3.5 py-2 text-xs font-semibold text-red-300 hover:bg-red-950/60 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Account
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleConfirmDelete}
                        className="rounded-lg bg-red-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                      >
                        Confirm Permanent Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingAccount(null)}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                  >
                    Save Account Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Create Customer Account Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-create-title"
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-[#121216] shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3.5">
              <h2 id="admin-create-title" className="text-lg font-bold text-white">
                New Account Open · Admin Provisioning
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close create account dialog"
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="admin-new-account-number" className="block text-xs font-medium text-zinc-300">
                    Account Number (Optional · Auto ASFC sequence)
                  </label>
                  <input
                    id="admin-new-account-number"
                    type="text"
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value.toUpperCase())}
                    placeholder="ASFC-1234567899"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white font-mono placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="admin-new-name" className="block text-xs font-medium text-zinc-300">
                    Account Holder Full Name
                  </label>
                  <input
                    id="admin-new-name"
                    type="text"
                    required
                    value={newHolderName}
                    onChange={(e) => setNewHolderName(e.target.value)}
                    placeholder="Rohan Kapoor"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="admin-new-email" className="block text-xs font-medium text-zinc-300">
                    Email Address
                  </label>
                  <input
                    id="admin-new-email"
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="rohan@example.com"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="admin-new-phone" className="block text-xs font-medium text-zinc-300">
                    Phone Number
                  </label>
                  <input
                    id="admin-new-phone"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98200 14800"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="admin-new-type" className="block text-xs font-medium text-zinc-300">
                    Account Tier
                  </label>
                  <select
                    id="admin-new-type"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as AccountType)}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="Private Reserve">Private Reserve</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="admin-new-deposit" className="block text-xs font-medium text-zinc-300">
                    Opening Balance (INR)
                  </label>
                  <input
                    id="admin-new-deposit"
                    type="number"
                    min={500}
                    step="100"
                    required
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white font-mono tabular-nums focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="admin-new-aadhaar" className="block text-xs font-medium text-zinc-300">
                    Aadhaar No. (12 Digits · Optional)
                  </label>
                  <input
                    id="admin-new-aadhaar"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={newAadhaar}
                    onChange={(e) => setNewAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="Auto-generated if blank"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white font-mono placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="admin-new-pan" className="block text-xs font-medium text-zinc-300">
                    PAN No. (Optional · e.g. QJ45678)
                  </label>
                  <input
                    id="admin-new-pan"
                    type="text"
                    maxLength={12}
                    value={newPan}
                    onChange={(e) =>
                      setNewPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))
                    }
                    placeholder="Auto-generated if blank"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white font-mono uppercase placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-[#09090B] p-3.5">
                <p className="text-xs font-medium text-zinc-300 mb-2.5">
                  Address (Vill, Dist, State, Country)
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="admin-new-village" className="block text-[11px] text-zinc-400">
                      Village / Town (Vill)
                    </label>
                    <input
                      id="admin-new-village"
                      type="text"
                      value={newVillage}
                      onChange={(e) => setNewVillage(e.target.value)}
                      placeholder="Mumbai Central"
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121216] px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="admin-new-district" className="block text-[11px] text-zinc-400">
                      District (Dist)
                    </label>
                    <input
                      id="admin-new-district"
                      type="text"
                      value={newDistrict}
                      onChange={(e) => setNewDistrict(e.target.value)}
                      placeholder="Mumbai City"
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121216] px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="admin-new-state" className="block text-[11px] text-zinc-400">
                      State
                    </label>
                    <input
                      id="admin-new-state"
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="Maharashtra"
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121216] px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="admin-new-country" className="block text-[11px] text-zinc-400">
                      Country
                    </label>
                    <input
                      id="admin-new-country"
                      type="text"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      placeholder="India"
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121216] px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="admin-new-pin" className="block text-xs font-medium text-zinc-300">
                  Initial 4-Digit Customer PIN
                </label>
                <input
                  id="admin-new-pin"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4 digits"
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white font-mono tracking-widest focus:border-red-600 focus:outline-none"
                />
              </div>

              {createError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-900/80 bg-red-950/40 px-4 py-2.5 text-xs font-medium text-red-300"
                >
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Per-Account Transaction History Modal */}
      {historyAccount && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-history-title"
        >
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#121216] shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 px-6 py-4">
              <div>
                <h2 id="admin-history-title" className="text-lg font-bold text-white">
                  Transaction History · {historyAccount.holderName}
                </h2>
                <p className="mt-0.5 font-mono text-xs text-zinc-400 tabular-nums">
                  {historyAccount.accountNumber} · {historyAccount.accountType} · Balance{' '}
                  <span className="font-semibold text-white">
                    {formatCurrency(historyAccount.balance)}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDownloadAccountCsv(historyAccount, historyTransactions)}
                  disabled={historyTransactions.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#09090B] px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryAccountNumber(null)}
                  aria-label="Close account transaction history dialog"
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-b border-zinc-800/80 bg-[#0D0D11] px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div
                className="inline-flex flex-wrap rounded-lg border border-zinc-800 bg-[#09090B] p-1"
                role="tablist"
                aria-label="Filter account history by type"
              >
                {(
                  [
                    { id: 'all', label: 'All Activity' },
                    { id: 'withdrawals', label: 'Withdrawals' },
                    { id: 'deposits', label: 'Deposits' },
                    { id: 'transfers', label: 'Transfers' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={historyFilter === tab.id}
                    onClick={() => setHistoryFilter(tab.id)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      historyFilter === tab.id
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="search"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  aria-label="Search account transactions"
                  placeholder="Search reference or memo..."
                  className="w-full rounded-lg border border-zinc-800 bg-[#09090B] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-zinc-500 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {historyTransactions.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <p className="text-sm font-medium text-zinc-300">
                    No transactions recorded for this account
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Withdrawals, deposits, transfers, and admin adjustments will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-[#0D0D11] text-xs font-medium text-zinc-400">
                        <th className="px-4 py-3">Date &amp; Time</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Type &amp; Channel</th>
                        <th className="px-4 py-3">Reference</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                        <th className="px-4 py-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80">
                      {historyTransactions.map((tx) => {
                        const { sign, label, isCredit } = getTransactionSignAndLabel(
                          tx.type,
                          tx.adjustmentDirection
                        );
                        return (
                          <tr key={tx.id} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-zinc-400 tabular-nums whitespace-nowrap">
                              {formatDateTime(tx.timestamp)}
                            </td>
                            <td className="px-4 py-3 min-w-[200px]">
                              <p className="text-sm text-zinc-100">{tx.description}</p>
                              {tx.counterpartyAccount && (
                                <p className="font-mono text-xs text-zinc-500 tabular-nums">
                                  Account {tx.counterpartyAccount}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">
                              {label} · {tx.channel}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-zinc-400 tabular-nums whitespace-nowrap">
                              {tx.referenceCode}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-mono text-sm font-semibold tabular-nums whitespace-nowrap ${
                                isCredit ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {sign}
                              {formatCurrency(tx.amount)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs text-zinc-300 tabular-nums whitespace-nowrap">
                              {formatCurrency(tx.balanceAfter)}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => onOpenReceipt(tx, historyAccount)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-[#09090B] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-red-600/60 hover:text-white transition-colors"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Receipt
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Administrator Details Modal */}
      {editingAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-admin-modal-title"
        >
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-800 bg-[#121216] shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <div>
                <h2 id="edit-admin-modal-title" className="text-lg font-bold text-white">
                  Edit Admin Details
                </h2>
                <p className="mt-0.5 font-mono text-xs text-red-400 tabular-nums">
                  {editingAdmin.adminId} · {editingAdmin.roleTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                aria-label="Close edit admin details dialog"
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-admin-name" className="block text-xs font-medium text-zinc-300">
                    Admin Full Name
                  </label>
                  <input
                    id="edit-admin-name"
                    type="text"
                    required
                    value={adminEditName}
                    onChange={(e) => setAdminEditName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="edit-admin-position" className="block text-xs font-medium text-zinc-300">
                    Position (e.g. MD, Director)
                  </label>
                  <input
                    id="edit-admin-position"
                    type="text"
                    required
                    value={adminEditPosition}
                    onChange={(e) => setAdminEditPosition(e.target.value)}
                    placeholder="MD"
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="edit-admin-phone" className="block text-xs font-medium text-zinc-300">
                    Phone No.
                  </label>
                  <input
                    id="edit-admin-phone"
                    type="tel"
                    required
                    value={adminEditPhone}
                    onChange={(e) => setAdminEditPhone(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white font-mono focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="edit-admin-aadhaar" className="block text-xs font-medium text-zinc-300">
                    Aadhaar No. (12 Digits)
                  </label>
                  <input
                    id="edit-admin-aadhaar"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    required
                    value={adminEditAadhaar}
                    onChange={(e) => setAdminEditAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white font-mono tracking-wider focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="edit-admin-pan" className="block text-xs font-medium text-zinc-300">
                    PAN No. (e.g. MD97336)
                  </label>
                  <input
                    id="edit-admin-pan"
                    type="text"
                    maxLength={12}
                    required
                    value={adminEditPan}
                    onChange={(e) =>
                      setAdminEditPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))
                    }
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2 text-sm text-white font-mono uppercase tracking-wider focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-[#09090B] p-4">
                <p className="text-xs font-medium text-zinc-300 mb-3">
                  Address (Vill, Dist, State, Country)
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="edit-admin-village" className="block text-[11px] text-zinc-400">
                      Village / Town (Vill)
                    </label>
                    <input
                      id="edit-admin-village"
                      type="text"
                      required
                      value={adminEditVillage}
                      onChange={(e) => setAdminEditVillage(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121216] px-3 py-1.5 text-xs text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-admin-district" className="block text-[11px] text-zinc-400">
                      District (Dist)
                    </label>
                    <input
                      id="edit-admin-district"
                      type="text"
                      required
                      value={adminEditDistrict}
                      onChange={(e) => setAdminEditDistrict(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121216] px-3 py-1.5 text-xs text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-admin-state" className="block text-[11px] text-zinc-400">
                      State
                    </label>
                    <input
                      id="edit-admin-state"
                      type="text"
                      required
                      value={adminEditState}
                      onChange={(e) => setAdminEditState(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121216] px-3 py-1.5 text-xs text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-admin-country" className="block text-[11px] text-zinc-400">
                      Country
                    </label>
                    <input
                      id="edit-admin-country"
                      type="text"
                      required
                      value={adminEditCountry}
                      onChange={(e) => setAdminEditCountry(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121216] px-3 py-1.5 text-xs text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {adminEditError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-900/80 bg-red-950/40 px-4 py-2.5 text-xs font-medium text-red-300"
                >
                  {adminEditError}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                >
                  Save Admin Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
