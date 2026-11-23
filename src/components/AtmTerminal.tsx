import { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  Delete,
  LogOut,
  PlusCircle,
  Printer,
  RotateCcw,
} from 'lucide-react';
import type { BankAccount, BillCount, DepositMethod, TransactionRecord } from '../types/bank';
import {
  calculateBillBreakdown,
  formatCardNumber,
  formatCurrency,
} from '../utils/banking';
import { BrandMark } from './BrandMark';

type AtmScreen =
  | 'menu'
  | 'balance'
  | 'fast_cash'
  | 'withdraw'
  | 'deposit'
  | 'transfer'
  | 'result';

interface AtmTerminalProps {
  account: BankAccount;
  otherAccounts: BankAccount[];
  onWithdraw: (
    amount: number,
    note?: string
  ) => { ok: boolean; error?: string; transaction?: TransactionRecord; bills?: BillCount[] };
  onDeposit: (
    amount: number,
    method: DepositMethod,
    note?: string
  ) => { ok: boolean; error?: string; transaction?: TransactionRecord };
  onTransfer: (
    toAccountNumber: string,
    amount: number,
    recipientName?: string,
    note?: string
  ) => { ok: boolean; error?: string; transaction?: TransactionRecord };
  onOpenReceipt: (tx: TransactionRecord) => void;
  onLogout: () => void;
}

export function AtmTerminal({
  account,
  otherAccounts,
  onWithdraw,
  onDeposit,
  onTransfer,
  onOpenReceipt,
  onLogout,
}: AtmTerminalProps) {
  const [screen, setScreen] = useState<AtmScreen>('menu');
  const [amountInput, setAmountInput] = useState('');
  const [depositMethod, setDepositMethod] = useState<DepositMethod>('Cash');
  const [transferTarget, setTransferTarget] = useState(otherAccounts[0]?.accountNumber ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<TransactionRecord | null>(null);
  const [dispensedBills, setDispensedBills] = useState<BillCount[] | null>(null);

  const navigateTo = (next: AtmScreen) => {
    setScreen(next);
    setAmountInput('');
    setErrorMessage(null);
  };

  const handleDigit = (digit: string) => {
    setErrorMessage(null);
    if (screen === 'withdraw' || screen === 'deposit' || screen === 'transfer') {
      if (amountInput.length < 6) {
        setAmountInput((prev) => (prev === '0' ? digit : prev + digit));
      }
    }
  };

  const handleClear = () => {
    setErrorMessage(null);
    setAmountInput('');
  };

  const handleBackspace = () => {
    setErrorMessage(null);
    setAmountInput((prev) => prev.slice(0, -1));
  };

  const executeWithdraw = (amount: number) => {
    const res = onWithdraw(amount, 'ATM Terminal Cash Withdrawal');
    if (!res.ok) {
      setErrorMessage(res.error ?? 'Withdrawal declined.');
      return;
    }
    setLastTx(res.transaction ?? null);
    setDispensedBills(res.bills ?? null);
    setErrorMessage(null);
    setScreen('result');
  };

  const executeDeposit = (amount: number) => {
    const res = onDeposit(amount, depositMethod, `ATM Terminal ${depositMethod} Deposit`);
    if (!res.ok) {
      setErrorMessage(res.error ?? 'Deposit declined.');
      return;
    }
    setLastTx(res.transaction ?? null);
    setDispensedBills(null);
    setErrorMessage(null);
    setScreen('result');
  };

  const executeTransfer = (amount: number) => {
    const recipient = otherAccounts.find((a) => a.accountNumber === transferTarget);
    const res = onTransfer(
      transferTarget,
      amount,
      recipient?.holderName,
      'ATM Terminal Transfer'
    );
    if (!res.ok) {
      setErrorMessage(res.error ?? 'Transfer declined.');
      return;
    }
    setLastTx(res.transaction ?? null);
    setDispensedBills(null);
    setErrorMessage(null);
    setScreen('result');
  };

  const handleEnter = () => {
    const parsed = Number(amountInput);
    if (screen === 'withdraw') {
      executeWithdraw(parsed);
    } else if (screen === 'deposit') {
      executeDeposit(parsed);
    } else if (screen === 'transfer') {
      executeTransfer(parsed);
    }
  };

  const previewBills =
    screen === 'withdraw' && amountInput ? calculateBillBreakdown(Number(amountInput)) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ASFC ATM Terminal</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Interactive ATM simulation · Card {formatCardNumber(account.cardNumber)} ·{' '}
            {account.holderName}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-zinc-400">Available Balance</p>
          <p className="text-2xl font-bold text-white font-mono tabular-nums">
            {formatCurrency(account.balance)}
          </p>
        </div>
      </div>

      {/* Physical ATM Bezel Layout */}
      <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5 sm:p-7 shadow-2xl">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Left & Center: Interactive ATM Display Screen */}
          <div className="xl:col-span-8 flex flex-col justify-between rounded-xl border-2 border-zinc-800 bg-[#070709] p-5 sm:p-6 min-h-[430px]">
            {/* Screen Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/90 pb-3.5">
              <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
                <BrandMark compact />
                <span className="font-display text-sm font-bold tracking-wide text-white whitespace-nowrap">
                  ASFC ATM
                </span>
              </div>
              <span className="font-mono text-xs text-zinc-400 tabular-nums whitespace-nowrap">
                {account.accountNumber} · {account.status}
              </span>
            </div>

            {/* Dynamic ATM LCD Viewport */}
            <div className="my-5 flex-1 flex flex-col justify-center">
              {screen === 'menu' && (
                <div>
                  <p className="text-xs font-medium text-red-400">Welcome, {account.holderName}</p>
                  <h2 className="mt-1 text-xl font-bold text-white">Select an ATM Transaction</h2>
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => navigateTo('withdraw')}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#121217] px-4 py-3.5 text-left hover:border-red-600 hover:bg-[#191215] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">Withdraw Cash</p>
                        <p className="text-xs text-zinc-400">Custom amount in ₹10 multiples</p>
                      </div>
                      <Banknote className="h-5 w-5 text-red-500 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo('fast_cash')}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#121217] px-4 py-3.5 text-left hover:border-red-600 hover:bg-[#191215] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">Fast Cash</p>
                        <p className="text-xs text-zinc-400">One-tap ₹500 to ₹15,000 notes</p>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-red-500 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo('deposit')}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#121217] px-4 py-3.5 text-left hover:border-red-600 hover:bg-[#191215] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">Deposit Funds</p>
                        <p className="text-xs text-zinc-400">Cash or check envelope</p>
                      </div>
                      <PlusCircle className="h-5 w-5 text-red-500 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo('transfer')}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#121217] px-4 py-3.5 text-left hover:border-red-600 hover:bg-[#191215] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">Fund Transfer</p>
                        <p className="text-xs text-zinc-400">Send to ASFC or external</p>
                      </div>
                      <ArrowLeftRight className="h-5 w-5 text-red-500 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo('balance')}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#121217] px-4 py-3.5 text-left hover:border-red-600 hover:bg-[#191215] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">Balance Inquiry</p>
                        <p className="text-xs text-zinc-400">Account summary &amp; daily limit</p>
                      </div>
                      <CreditCard className="h-5 w-5 text-red-500 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#121217] px-4 py-3.5 text-left hover:border-red-600 hover:bg-[#191215] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">Eject Card &amp; Exit</p>
                        <p className="text-xs text-zinc-400">End ATM session securely</p>
                      </div>
                      <LogOut className="h-5 w-5 text-zinc-400 shrink-0" />
                    </button>
                  </div>
                </div>
              )}

              {screen === 'balance' && (
                <div className="space-y-4">
                  <p className="text-xs font-medium text-red-400">Balance Inquiry</p>
                  <div className="rounded-xl border border-zinc-800 bg-[#121217] p-5">
                    <p className="text-xs text-zinc-400">Available Funds ({account.accountType})</p>
                    <p className="mt-1 text-3xl font-bold text-white font-mono tabular-nums">
                      {formatCurrency(account.balance)}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4 text-xs">
                      <div>
                        <p className="text-zinc-500">Account Holder</p>
                        <p className="mt-0.5 font-medium text-white">{account.holderName}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Remaining Daily ATM Limit</p>
                        <p className="mt-0.5 font-mono font-medium text-white tabular-nums">
                          {formatCurrency(
                            Math.max(0, account.dailyWithdrawalLimit - account.withdrawnToday)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {screen === 'fast_cash' && (
                <div>
                  <p className="text-xs font-medium text-red-400">Fast Cash Dispenser</p>
                  <h2 className="mt-1 text-lg font-bold text-white">
                    Select an instant withdrawal amount
                  </h2>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[500, 1000, 2000, 5000, 10000, 15000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => executeWithdraw(amt)}
                        className="rounded-lg border border-zinc-800 bg-[#121217] py-4 font-mono text-lg font-bold text-white tabular-nums hover:border-red-600 hover:bg-red-950/30 transition-colors"
                      >
                        {formatCurrency(amt).replace('.00', '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {screen === 'withdraw' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-red-400">Cash Withdrawal</p>
                    <h2 className="mt-1 text-lg font-bold text-white">
                      Enter amount using keypad or keyboard (multiples of ₹10)
                    </h2>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-[#121217] p-4">
                    <label htmlFor="atm-withdraw-input" className="text-xs text-zinc-400">
                      Withdrawal Amount (INR)
                    </label>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-bold text-red-500">₹</span>
                      <input
                        id="atm-withdraw-input"
                        type="text"
                        inputMode="numeric"
                        value={amountInput}
                        onChange={(e) => {
                          setErrorMessage(null);
                          setAmountInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                        }}
                        placeholder="0"
                        className="w-full bg-transparent font-mono text-3xl font-bold text-white tabular-nums placeholder:text-zinc-700 focus:outline-none"
                      />
                    </div>
                    {previewBills && (
                      <p className="mt-2 text-xs text-zinc-400 font-mono">
                        Notes:{' '}
                        {previewBills.map((b) => `₹${b.denomination}×${b.count}`).join(' · ')}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleEnter}
                    className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                  >
                    Dispense Cash
                  </button>
                </div>
              )}

              {screen === 'deposit' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-red-400">ATM Deposit Slot</p>
                      <h2 className="mt-1 text-lg font-bold text-white">Enter deposit amount</h2>
                    </div>
                    <div className="inline-flex rounded-lg border border-zinc-800 bg-[#121217] p-1">
                      {(['Cash', 'Check'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setDepositMethod(method)}
                          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                            depositMethod === method
                              ? 'bg-red-600 text-white'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-[#121217] p-4">
                    <label htmlFor="atm-deposit-input" className="text-xs text-zinc-400">
                      {depositMethod} Deposit Amount (INR)
                    </label>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-bold text-emerald-400">₹</span>
                      <input
                        id="atm-deposit-input"
                        type="text"
                        inputMode="decimal"
                        value={amountInput}
                        onChange={(e) => {
                          setErrorMessage(null);
                          setAmountInput(e.target.value.replace(/[^\d.]/g, '').slice(0, 8));
                        }}
                        placeholder="0.00"
                        className="w-full bg-transparent font-mono text-3xl font-bold text-white tabular-nums placeholder:text-zinc-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleEnter}
                    className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                  >
                    Confirm {depositMethod} Deposit
                  </button>
                </div>
              )}

              {screen === 'transfer' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-red-400">ATM Quick Transfer</p>
                    <h2 className="mt-1 text-lg font-bold text-white">
                      Select recipient &amp; enter amount
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="atm-transfer-target" className="block text-xs text-zinc-400">
                        Recipient Account
                      </label>
                      <select
                        id="atm-transfer-target"
                        value={transferTarget}
                        onChange={(e) => setTransferTarget(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121217] px-3 py-2.5 text-xs text-white font-mono focus:border-red-600 focus:outline-none"
                      >
                        {otherAccounts.map((acct) => (
                          <option key={acct.accountNumber} value={acct.accountNumber}>
                            {acct.holderName} ({acct.accountNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="atm-transfer-amount" className="block text-xs text-zinc-400">
                        Amount (INR)
                      </label>
                      <input
                        id="atm-transfer-amount"
                        type="text"
                        inputMode="decimal"
                        value={amountInput}
                        onChange={(e) => {
                          setErrorMessage(null);
                          setAmountInput(e.target.value.replace(/[^\d.]/g, '').slice(0, 8));
                        }}
                        placeholder="2500"
                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#121217] px-3 py-2 text-base font-bold text-white font-mono tabular-nums focus:border-red-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleEnter}
                    className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                  >
                    Execute Fund Transfer
                  </button>
                </div>
              )}

              {screen === 'result' && lastTx && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                    <div>
                      <h2 className="text-lg font-bold text-white">Transaction Complete</h2>
                      <p className="text-xs text-zinc-400 font-mono">{lastTx.referenceCode}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-[#121217] p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Description</span>
                      <span className="font-medium text-white">{lastTx.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Amount</span>
                      <span className="font-mono font-bold text-white tabular-nums">
                        {formatCurrency(lastTx.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Updated Balance</span>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(lastTx.balanceAfter)}
                      </span>
                    </div>
                  </div>

                  {dispensedBills && dispensedBills.length > 0 && (
                    <div className="rounded-xl border border-red-900/50 bg-[#190D10] p-4">
                      <p className="text-xs font-semibold text-red-300 mb-2">
                        Cash Dispenser Slot — Please Take Your Notes
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {dispensedBills.map((bill) => (
                          <div
                            key={bill.denomination}
                            className="rounded-md border border-emerald-800/70 bg-emerald-950/60 px-3 py-1.5 font-mono text-xs font-semibold text-emerald-300 tabular-nums"
                          >
                            ₹{bill.denomination} × {bill.count}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenReceipt(lastTx)}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
                    >
                      <Printer className="h-4 w-4" />
                      View Printed Receipt
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('menu')}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                    >
                      Another Transaction
                    </button>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-xs font-medium text-red-300"
                >
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Screen Footer Controls */}
            <div className="flex items-center justify-between border-t border-zinc-800/90 pt-3.5 text-xs">
              {screen !== 'menu' ? (
                <button
                  type="button"
                  onClick={() => navigateTo('menu')}
                  className="inline-flex items-center gap-1.5 font-semibold text-zinc-300 hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Main ATM Menu
                </button>
              ) : (
                <span className="text-zinc-500">Select an operation above</span>
              )}
              <span className="text-zinc-500 font-mono">ASFC ATM-04</span>
            </div>
          </div>

          {/* Right: Physical Keypad, Card Reader & Dispenser Hardware Panel */}
          <div className="xl:col-span-4 flex flex-col justify-between gap-5">
            {/* Card Reader Slot */}
            <div className="rounded-xl border border-zinc-800 bg-[#0A0A0D] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Card Reader</span>
                <span className="text-xs font-mono text-emerald-400">Card Inserted</span>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg border border-zinc-800 bg-[#141419] px-3 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CreditCard className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="truncate text-xs font-medium text-white">
                    {account.holderName}
                  </span>
                </div>
                <span className="font-mono text-xs text-zinc-400 tabular-nums shrink-0">
                  •••• {account.cardNumber.slice(-4)}
                </span>
              </div>
            </div>

            {/* Tactile Numeric ATM Keypad */}
            <div className="rounded-xl border border-zinc-800 bg-[#0A0A0D] p-4">
              <p className="mb-3 text-xs font-semibold text-zinc-300">ATM Keypad</p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleDigit('1')}
                  className="h-11 rounded-lg border border-zinc-800 bg-[#16161C] font-mono text-sm font-bold text-white hover:border-red-600/60 hover:bg-zinc-800 transition-colors"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => handleDigit('2')}
                  className="h-11 rounded-lg border border-zinc-800 bg-[#16161C] font-mono text-sm font-bold text-white hover:border-red-600/60 hover:bg-zinc-800 transition-colors"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => handleDigit('3')}
                  className="h-11 rounded-lg border border-zinc-800 bg-[#16161C] font-mono text-sm font-bold text-white hover:border-red-600/60 hover:bg-zinc-800 transition-colors"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('menu')}
                  className="h-11 rounded-lg border border-red-900/70 bg-red-950/50 text-[11px] font-bold text-red-300 hover:bg-red-900/60 transition-colors"
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={() => handleDigit('4')}
                  className="h-11 rounded-lg border border-zinc-800 bg-[#16161C] font-mono text-sm font-bold text-white hover:border-red-600/60 hover:bg-zinc-800 transition-colors"
                >
                  4
                </button>
                <button
                  type="button"
                  onClick={() => handleDigit('5')}
                  className="h-11 rounded-lg border border-zinc-800 bg-[#16161C] font-mono text-sm font-bold text-white hover:border-red-600/60 hover:bg-zinc-800 transition-colors"
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => handleDigit('6')}
                  className="h-11 rounded-lg border border-zinc-800 bg-[#16161C] font-mono text-sm font-bold text-white hover:border-red-600/60 hover:bg-zinc-800 transition-colors"
                >
                  6
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-11 rounded-lg border border-amber-900/60 bg-amber-950/40 text-[11px] font-bold text-amber-300 hover:bg-amber-900/50 transition-colors"
                >
                  CLEAR
                </button>

                <button
                  type="button"
                  onClick={() => handleDigit('7')}
                  className="h-11 rounded-lg border border-zinc-800 bg-[#16161C] font-mono text-sm font-bold text-white hover:border-red-600/60 hover:bg-zinc-800 transition-colors"
                >
                  7
                </button>
                <button
                  type="button"
                  onClick={() => handleDigit('8')}
                  className="h-11 rounded-lg border border-zinc-800 bg-[#16161C] font-mono text-sm font-bold text-white hover:border-red-600/60 hover:bg-zinc-800 transition-colors"
                >
                  8
                </button>
                <button
                  type="button"
                  onClick={() => handleDigit('9')}
                  className="h-11 rounded-lg border border-zinc-800 bg-[#16161C] font-mono text-sm font-bold text-white hover:border-red-600/60 hover:bg-zinc-800 transition-colors"
                >
                  9
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  aria-label="Backspace digit"
                  className="flex h-11 items-center justify-center rounded-lg border border-zinc-800 bg-[#16161C] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <Delete className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDigit('0')}
                  className="col-span-2 h-11 rounded-lg border border-zinc-800 bg-[#16161C] font-mono text-sm font-bold text-white hover:border-red-600/60 hover:bg-zinc-800 transition-colors"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleEnter}
                  className="col-span-2 h-11 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-500 transition-colors"
                >
                  ENTER
                </button>
              </div>
            </div>

            {/* Cash Dispenser & Receipt Slot Indicator */}
            <div className="rounded-xl border border-zinc-800 bg-[#0A0A0D] p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Cash Dispenser Slot</span>
                <span className="font-mono text-zinc-400">₹10 · ₹50 · ₹100 · ₹200 · ₹500</span>
              </div>
              <div className="mt-2.5 h-3 w-full rounded-sm border border-zinc-800 bg-[#050507] flex items-center justify-center">
                <div
                  className={`h-1 w-3/4 rounded-full transition-colors ${
                    screen === 'result' && dispensedBills ? 'bg-emerald-500' : 'bg-zinc-800'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
