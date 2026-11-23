/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Banknote,
  CreditCard,
  History,
  LogOut,
  Menu,
  MonitorDot,
  PlusCircle,
  X,
} from 'lucide-react';
import { AccountDetailsView } from './components/AccountDetailsView';
import { AdminPortal } from './components/AdminPortal';
import { AtmTerminal } from './components/AtmTerminal';
import { BrandMark } from './components/BrandMark';
import { DepositView } from './components/DepositView';
import { LoginPortal } from './components/LoginPortal';
import { ReceiptModal } from './components/ReceiptModal';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { TransferView } from './components/TransferView';
import { WithdrawView } from './components/WithdrawView';
import type {
  AdminAccount,
  AdminAccountUpdateInput,
  AdminProfileUpdateInput,
  BankAccount,
  CreateAccountInput,
  DepositMethod,
  TransactionRecord,
  WorkspaceSection,
} from './types/bank';
import {
  INITIAL_ACCOUNTS,
  adminDeleteAccount,
  adminResetDailyWithdrawal,
  adminUpdateAccountDetails,
  adminUpdateProfile,
  authenticateAccount,
  authenticateAdmin,
  createAccount,
  depositFunds,
  formatCurrency,
  loadBankState,
  saveBankState,
  toggleCardStatus,
  transferFunds,
  withdrawFunds,
} from './utils/banking';

const NAV_ITEMS: { id: WorkspaceSection; label: string; icon: typeof MonitorDot }[] = [
  { id: 'atm', label: 'ATM Terminal', icon: MonitorDot },
  { id: 'account', label: 'Account Details', icon: CreditCard },
  { id: 'withdraw', label: 'Money Withdraw', icon: Banknote },
  { id: 'deposit', label: 'Deposit Funds', icon: PlusCircle },
  { id: 'transfer', label: 'Fund Transfer', icon: ArrowLeftRight },
  { id: 'history', label: 'Transaction History', icon: History },
];

export default function App() {
  const [initial] = useState(() => {
    const loaded = loadBankState();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' && !loaded.sessionAccountNumber) {
        return {
          ...loaded,
          sessionAccountNumber: loaded.accounts[0]?.accountNumber ?? INITIAL_ACCOUNTS[0].accountNumber,
        };
      }
    }
    return loaded;
  });

  const [accounts, setAccounts] = useState<BankAccount[]>(initial.accounts);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(initial.transactions);
  const [admins, setAdmins] = useState<AdminAccount[]>(initial.admins);
  const [sessionAccountNumber, setSessionAccountNumber] = useState<string | null>(
    initial.sessionAccountNumber
  );
  const [sessionAdminId, setSessionAdminId] = useState<string | null>(initial.sessionAdminId);
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('atm');
  const [receiptTx, setReceiptTx] = useState<TransactionRecord | null>(null);
  const [receiptAccountOverride, setReceiptAccountOverride] = useState<BankAccount | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminOpenCreateOnLogin, setAdminOpenCreateOnLogin] = useState(false);

  useEffect(() => {
    saveBankState(accounts, transactions, sessionAccountNumber, sessionAdminId, admins);
  }, [accounts, transactions, sessionAccountNumber, sessionAdminId, admins]);

  const activeAccount =
    accounts.find((a) => a.accountNumber === sessionAccountNumber) ?? null;
  const activeAdmin =
    admins.find((admin) => admin.adminId === sessionAdminId) ?? null;

  const handleAuthenticate = (identifier: string, pin: string) => {
    const res = authenticateAccount(accounts, identifier, pin);
    if (!res.ok) {
      return { ok: false, error: res.error };
    }
    setSessionAdminId(null);
    setAdminOpenCreateOnLogin(false);
    setSessionAccountNumber(res.account.accountNumber);
    setActiveSection('atm');
    return { ok: true };
  };

  const handleAuthenticateAdmin = (
    adminId: string,
    pin: string,
    openCreateAccount = false
  ) => {
    const res = authenticateAdmin(adminId, pin, admins);
    if (!res.ok) {
      return { ok: false, error: res.error };
    }
    setSessionAccountNumber(null);
    setAdminOpenCreateOnLogin(openCreateAccount);
    setSessionAdminId(res.admin.adminId);
    return { ok: true };
  };

  const handleCreateAccount = (input: CreateAccountInput) => {
    if (!activeAdmin) {
      return { ok: false, error: 'Only an authenticated administrator can add new account holders.' };
    }
    const res = createAccount(accounts, transactions, input);
    if (!res.ok) {
      return { ok: false, error: res.error };
    }
    setAccounts(res.accounts);
    setTransactions(res.transactions);
    return { ok: true, account: res.account };
  };

  const handleAdminUpdateAccount = (
    accountNumber: string,
    updates: AdminAccountUpdateInput
  ) => {
    if (!activeAdmin) return { ok: false, error: 'Administrator authentication required.' };
    const res = adminUpdateAccountDetails(
      accounts,
      transactions,
      accountNumber,
      updates,
      activeAdmin.adminId
    );
    if (res.ok) {
      setAccounts(res.accounts);
      setTransactions(res.transactions);
    }
    return { ok: res.ok, error: res.error };
  };

  const handleAdminToggleFreeze = (accountNumber: string) => {
    if (!activeAdmin) return;
    setAccounts((prev) => toggleCardStatus(prev, accountNumber));
  };

  const handleAdminResetDailyLimit = (accountNumber: string) => {
    if (!activeAdmin) return;
    setAccounts((prev) => adminResetDailyWithdrawal(prev, accountNumber));
  };

  const handleAdminDeleteAccount = (accountNumber: string) => {
    if (!activeAdmin) return { ok: false, error: 'Administrator authentication required.' };
    const res = adminDeleteAccount(accounts, transactions, accountNumber);
    if (res.ok) {
      setAccounts(res.accounts);
      setTransactions(res.transactions);
    }
    return { ok: res.ok, error: res.error };
  };

  const handleUpdateAdminProfile = (
    targetAdminId: string,
    updates: AdminProfileUpdateInput
  ) => {
    if (!activeAdmin) return { ok: false, error: 'Administrator authentication required.' };
    const res = adminUpdateProfile(admins, targetAdminId, updates);
    if (res.ok) {
      setAdmins(res.admins);
    }
    return { ok: res.ok, error: res.error };
  };

  const handleLogout = () => {
    setReceiptTx(null);
    setReceiptAccountOverride(null);
    setMobileMenuOpen(false);
    setAdminOpenCreateOnLogin(false);
    setSessionAccountNumber(null);
    setSessionAdminId(null);
  };

  const handleWithdraw = (amount: number, note?: string) => {
    if (!activeAccount) return { ok: false, error: 'No active session.' };
    const res = withdrawFunds(accounts, transactions, activeAccount.accountNumber, amount, {
      channel: activeSection === 'atm' ? 'ATM Terminal' : 'Digital Portal',
      note,
    });
    if (res.ok) {
      setAccounts(res.accounts);
      setTransactions(res.transactions);
    }
    return {
      ok: res.ok,
      error: res.error,
      transaction: res.createdTransaction,
      bills: res.bills,
    };
  };

  const handleDeposit = (amount: number, method: DepositMethod, note?: string) => {
    if (!activeAccount) return { ok: false, error: 'No active session.' };
    const res = depositFunds(accounts, transactions, activeAccount.accountNumber, amount, method, {
      channel: activeSection === 'atm' ? 'ATM Terminal' : 'Digital Portal',
      note,
    });
    if (res.ok) {
      setAccounts(res.accounts);
      setTransactions(res.transactions);
    }
    return {
      ok: res.ok,
      error: res.error,
      transaction: res.createdTransaction,
    };
  };

  const handleTransfer = (
    toAccountNumber: string,
    amount: number,
    recipientName?: string,
    note?: string
  ) => {
    if (!activeAccount) return { ok: false, error: 'No active session.' };
    const res = transferFunds(
      accounts,
      transactions,
      activeAccount.accountNumber,
      toAccountNumber,
      amount,
      {
        recipientName,
        note,
        channel: activeSection === 'atm' ? 'ATM Terminal' : 'Digital Portal',
      }
    );
    if (res.ok) {
      setAccounts(res.accounts);
      setTransactions(res.transactions);
    }
    return {
      ok: res.ok,
      error: res.error,
      transaction: res.createdTransaction,
    };
  };

  const handleToggleCardFreeze = () => {
    if (!activeAccount) return;
    setAccounts((prev) => toggleCardStatus(prev, activeAccount.accountNumber));
  };

  if (activeAdmin) {
    return (
      <>
        <AdminPortal
          admin={activeAdmin}
          admins={admins}
          accounts={accounts}
          transactions={transactions}
          initialOpenCreate={adminOpenCreateOnLogin}
          onUpdateAccount={handleAdminUpdateAccount}
          onUpdateAdminProfile={handleUpdateAdminProfile}
          onToggleFreeze={handleAdminToggleFreeze}
          onResetDailyLimit={handleAdminResetDailyLimit}
          onDeleteAccount={handleAdminDeleteAccount}
          onCreateAccount={handleCreateAccount}
          onOpenReceipt={(tx, owner) => {
            setReceiptAccountOverride(owner);
            setReceiptTx(tx);
          }}
          onLogout={handleLogout}
        />
        {receiptAccountOverride && (
          <ReceiptModal
            transaction={receiptTx}
            account={receiptAccountOverride}
            onClose={() => {
              setReceiptTx(null);
              setReceiptAccountOverride(null);
            }}
          />
        )}
      </>
    );
  }

  if (!activeAccount) {
    return (
      <LoginPortal
        onAuthenticate={handleAuthenticate}
        onAuthenticateAdmin={handleAuthenticateAdmin}
      />
    );
  }

  const otherAccounts = accounts.filter(
    (a) => a.accountNumber !== activeAccount.accountNumber
  );
  const currentNavLabel =
    NAV_ITEMS.find((item) => item.id === activeSection)?.label ?? 'ATM Terminal';

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-zinc-800/90 lg:bg-[#0D0D11] shrink-0">
        <div className="flex h-16 items-center border-b border-zinc-800/90 px-6">
          <BrandMark />
        </div>

        <div className="border-b border-zinc-800/90 px-6 py-5">
          <p className="text-xs text-zinc-400">Signed in as</p>
          <p className="mt-0.5 text-sm font-semibold text-white truncate">
            {activeAccount.holderName}
          </p>
          <p className="mt-1 font-mono text-xs text-zinc-400 tabular-nums">
            {activeAccount.accountNumber}
          </p>
          <p className="mt-3 font-mono text-lg font-bold text-white tabular-nums">
            {formatCurrency(activeAccount.balance)}
          </p>
        </div>

        <nav aria-label="Primary banking navigation" className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800/90 px-6 py-4">
          <p className="text-xs text-zinc-500 truncate">{activeAccount.branchName}</p>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-800/90 bg-[#09090B]/95 px-4 sm:px-8 backdrop-blur-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden rounded-lg border border-zinc-800 bg-[#121216] p-2 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="font-semibold text-zinc-400 lg:hidden">ASFC Bank /</span>
              <span className="font-semibold text-zinc-400 hidden lg:inline">ASFC Bank /</span>
              <span className="font-semibold text-white truncate">{currentNavLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-white whitespace-nowrap">
                {activeAccount.holderName}
              </p>
              <p className="text-[11px] font-mono text-zinc-400 tabular-nums whitespace-nowrap">
                {activeAccount.accountType}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </header>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="border-b border-zinc-800 bg-[#0D0D11] p-4 lg:hidden">
            <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <p className="text-sm font-semibold text-white">{activeAccount.holderName}</p>
                <p className="text-xs font-mono text-zinc-400">{activeAccount.accountNumber}</p>
              </div>
              <p className="font-mono text-base font-bold text-white tabular-nums">
                {formatCurrency(activeAccount.balance)}
              </p>
            </div>
            <nav aria-label="Mobile banking navigation" className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'bg-[#121216] text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Active Banking Viewport */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {activeSection === 'atm' && (
            <AtmTerminal
              account={activeAccount}
              otherAccounts={otherAccounts}
              onWithdraw={handleWithdraw}
              onDeposit={handleDeposit}
              onTransfer={handleTransfer}
              onOpenReceipt={(tx) => setReceiptTx(tx)}
              onLogout={handleLogout}
            />
          )}

          {activeSection === 'account' && (
            <AccountDetailsView
              account={activeAccount}
              onToggleCardFreeze={handleToggleCardFreeze}
            />
          )}

          {activeSection === 'withdraw' && (
            <WithdrawView
              account={activeAccount}
              onWithdraw={handleWithdraw}
              onOpenReceipt={(tx) => setReceiptTx(tx)}
            />
          )}

          {activeSection === 'deposit' && (
            <DepositView
              account={activeAccount}
              onDeposit={handleDeposit}
              onOpenReceipt={(tx) => setReceiptTx(tx)}
            />
          )}

          {activeSection === 'transfer' && (
            <TransferView
              account={activeAccount}
              otherAccounts={otherAccounts}
              onTransfer={handleTransfer}
              onOpenReceipt={(tx) => setReceiptTx(tx)}
            />
          )}

          {activeSection === 'history' && (
            <TransactionHistoryView
              account={activeAccount}
              transactions={transactions}
              onOpenReceipt={(tx) => setReceiptTx(tx)}
            />
          )}
        </main>
      </div>

      <ReceiptModal
        transaction={receiptTx}
        account={activeAccount}
        onClose={() => setReceiptTx(null)}
      />
    </div>
  );
}
