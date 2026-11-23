import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Delete,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { BrandMark } from './BrandMark';

interface LoginPortalProps {
  onAuthenticate: (identifier: string, pin: string) => { ok: boolean; error?: string };
  onAuthenticateAdmin: (
    adminId: string,
    pin: string,
    openCreateAccount?: boolean
  ) => { ok: boolean; error?: string };
}

type AuthMode = 'login' | 'new-account' | 'admin';

export function LoginPortal({ onAuthenticate, onAuthenticateAdmin }: LoginPortalProps) {
  const [mode, setMode] = useState<AuthMode>('login');

  // Customer login form state
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin / New Account Open authorization form state
  const [adminId, setAdminId] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const isAdminAuthMode = mode === 'admin' || mode === 'new-account';

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setLoginError(null);
    setAdminError(null);
  };

  const handleKeypadDigit = (digit: string) => {
    if (isAdminAuthMode) {
      setAdminError(null);
      if (adminPin.length < 6) {
        setAdminPin((prev) => prev + digit);
      }
      return;
    }
    setLoginError(null);
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const handleKeypadBackspace = () => {
    if (isAdminAuthMode) {
      setAdminError(null);
      setAdminPin((prev) => prev.slice(0, -1));
      return;
    }
    setLoginError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    if (isAdminAuthMode) {
      setAdminError(null);
      setAdminPin('');
      return;
    }
    setLoginError(null);
    setPin('');
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = onAuthenticate(identifier, pin);
    if (!res.ok) {
      setLoginError(res.error ?? 'Authentication failed.');
    }
  };

  const handleAdminSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    const res = onAuthenticateAdmin(adminId, adminPin, mode === 'new-account');
    if (!res.ok) {
      setAdminError(res.error ?? 'Administrator authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-900 bg-[#09090B]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
          <BrandMark />
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                mode === 'login' ? 'text-white' : 'hover:text-white'
              }`}
            >
              ATM Access
            </button>
            <button
              type="button"
              onClick={() => switchMode('new-account')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                mode === 'new-account' ? 'text-white' : 'hover:text-white'
              }`}
            >
              New Account Open
            </button>
            <button
              type="button"
              onClick={() => switchMode('admin')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                mode === 'admin' ? 'text-white' : 'hover:text-white'
              }`}
            >
              Admin Portal
            </button>
          </nav>
          <button
            type="button"
            onClick={() => switchMode('new-account')}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors whitespace-nowrap shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            New Account Open
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-10">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Left Institutional Hero */}
          <section className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-[#121216] overflow-hidden">
            <div className="relative h-64 w-full overflow-hidden border-b border-zinc-800 bg-[#09090B]">
              <img
                src="/src/assets/images/asfc_bank_backdrop_1795454548505.jpg"
                alt="ASFC Bank obsidian and crimson architectural vault"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/55 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6">
                <p className="text-xs font-medium tracking-wide text-red-400">
                  ASFC Institutional &amp; ATM Network
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
                  Precision ATM Simulation &amp; Account Banking
                </h1>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
              <div className="space-y-6">
                <p className="text-sm leading-relaxed text-zinc-400">
                  Insert your ASFC Bank debit card or enter your ASFC account number and 4-digit ATM
                  PIN to execute real-time INR cash withdrawals, vault deposits, instant internal
                  fund transfers, and printable receipts.
                </p>

                <div className="space-y-3">
                  <div className="rounded-xl border border-zinc-800 bg-[#09090B] p-4">
                    <p className="text-xs font-semibold text-white">INR ATM Cash Dispenser</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Automated Indian Rupee note breakdown across ₹500, ₹200, ₹100, ₹50, ₹20, and
                      ₹10 denominations.
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-[#09090B] p-4">
                    <p className="text-xs font-semibold text-white">
                      Instant Ledger &amp; Fund Transfers
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Real-time account holder verification, card freeze controls, CSV statement
                      export, and reference receipts.
                    </p>
                  </div>

                  <div className="rounded-xl border border-red-900/50 bg-[#09090B] p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-red-500" />
                        New Account Open
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Account creation and holder modifications are restricted exclusively to ASFC
                        administrators.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => switchMode('new-account')}
                      className="rounded-lg border border-red-600/60 bg-red-950/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-600 hover:text-white transition-colors whitespace-nowrap shrink-0"
                    >
                      Admin Access
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-zinc-800/80 pt-4 text-xs text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-red-500 shrink-0" />
                <span>256-bit local session persistence · Restricted admin governance</span>
              </div>
            </div>
          </section>

          {/* Right ATM Authentication & Admin-Only New Account Console */}
          <section
            id="atm-access"
            className="lg:col-span-6 rounded-2xl border border-zinc-800/90 bg-[#121216] p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {mode === 'login'
                      ? 'ATM Card & PIN Sign In'
                      : mode === 'new-account'
                      ? 'New Account Open'
                      : 'Admin Vault Sign In'}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-400">
                    {mode === 'login'
                      ? 'Enter your ASFC account number and 4-digit ATM PIN'
                      : mode === 'new-account'
                      ? 'Admin authorization required to open a new customer account'
                      : 'Restricted administrator access for managing all bank accounts'}
                  </p>
                </div>

                <div
                  className="inline-flex rounded-lg border border-zinc-800 bg-[#09090B] p-1 shrink-0"
                  role="tablist"
                  aria-label="Authentication mode"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'login'}
                    onClick={() => switchMode('login')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      mode === 'login'
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'new-account'}
                    onClick={() => switchMode('new-account')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      mode === 'new-account'
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    New Account Open
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'admin'}
                    onClick={() => switchMode('admin')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      mode === 'admin'
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {isAdminAuthMode ? (
                <form onSubmit={handleAdminSubmit} className="mt-6 space-y-5">
                  {mode === 'new-account' && (
                    <div className="rounded-xl border border-red-900/60 bg-red-950/25 px-4 py-3 text-xs leading-relaxed text-red-200 flex items-start gap-2.5">
                      <Lock className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Admin Only Access:</strong> Opening a new ASFC Bank account requires
                        authorized administrator sign-in. Enter your Admin ID and 6-digit security
                        PIN to open the account provisioning form.
                      </span>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="admin-login-id"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      Administrator ID
                    </label>
                    <input
                      id="admin-login-id"
                      type="text"
                      required
                      value={adminId}
                      onChange={(e) => {
                        setAdminId(e.target.value);
                        setAdminError(null);
                      }}
                      placeholder="AS-XXXXXXXXXX"
                      className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="admin-login-pin"
                        className="block text-xs font-medium text-zinc-300"
                      >
                        6-Digit Admin Security PIN
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAdminPin((prev) => !prev)}
                        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                      >
                        {showAdminPin ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        {showAdminPin ? 'Hide PIN' : 'Show PIN'}
                      </button>
                    </div>
                    <input
                      id="admin-login-pin"
                      type={showAdminPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={adminPin}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setAdminPin(digits);
                        setAdminError(null);
                      }}
                      placeholder="••••••"
                      className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-center text-lg tracking-[0.5em] text-white font-mono placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  {/* Interactive Admin Security Keypad */}
                  <div className="rounded-xl border border-zinc-800 bg-[#09090B] p-4">
                    <p className="mb-3 text-xs font-medium text-zinc-400">
                      Admin Vault Security Keypad
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => handleKeypadDigit(digit)}
                          className="h-11 rounded-lg border border-zinc-800 bg-[#141419] font-mono text-base font-semibold text-white hover:border-red-600/60 hover:bg-zinc-800 active:scale-[0.98] transition-all"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleKeypadClear}
                        className="h-11 rounded-lg border border-zinc-800 bg-[#1A1214] text-xs font-semibold text-red-400 hover:bg-red-950/60 transition-colors"
                      >
                        CLEAR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadDigit('0')}
                        className="h-11 rounded-lg border border-zinc-800 bg-[#141419] font-mono text-base font-semibold text-white hover:border-red-600/60 hover:bg-zinc-800 active:scale-[0.98] transition-all"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handleKeypadBackspace}
                        aria-label="Delete last Admin PIN digit"
                        className="flex h-11 items-center justify-center rounded-lg border border-zinc-800 bg-[#141419] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        <Delete className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {adminError && (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-900/80 bg-red-950/40 px-4 py-2.5 text-xs font-medium text-red-300"
                    >
                      {adminError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {mode === 'new-account'
                      ? 'Verify Admin & Open New Account'
                      : 'Sign In to Admin Portal'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="login-account-id"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      Account Number or 16-Digit Card Number
                    </label>
                    <input
                      id="login-account-id"
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="ASFC-1234567899"
                      className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-pin"
                        className="block text-xs font-medium text-zinc-300"
                      >
                        4-Digit ATM PIN
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPin((prev) => !prev)}
                        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                      >
                        {showPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {showPin ? 'Hide PIN' : 'Show PIN'}
                      </button>
                    </div>
                    <input
                      id="login-pin"
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPin(digits);
                        setLoginError(null);
                      }}
                      placeholder="••••"
                      className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-center text-lg tracking-[0.6em] text-white font-mono placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  {/* Interactive ATM PIN Keypad */}
                  <div className="rounded-xl border border-zinc-800 bg-[#09090B] p-4">
                    <p className="mb-3 text-xs font-medium text-zinc-400">ATM Security Keypad</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => handleKeypadDigit(digit)}
                          className="h-11 rounded-lg border border-zinc-800 bg-[#141419] font-mono text-base font-semibold text-white hover:border-red-600/60 hover:bg-zinc-800 active:scale-[0.98] transition-all"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleKeypadClear}
                        className="h-11 rounded-lg border border-zinc-800 bg-[#1A1214] text-xs font-semibold text-red-400 hover:bg-red-950/60 transition-colors"
                      >
                        CLEAR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadDigit('0')}
                        className="h-11 rounded-lg border border-zinc-800 bg-[#141419] font-mono text-base font-semibold text-white hover:border-red-600/60 hover:bg-zinc-800 active:scale-[0.98] transition-all"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handleKeypadBackspace}
                        aria-label="Delete last PIN digit"
                        className="flex h-11 items-center justify-center rounded-lg border border-zinc-800 bg-[#141419] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        <Delete className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-900/80 bg-red-950/40 px-4 py-2.5 text-xs font-medium text-red-300"
                    >
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                  >
                    <KeyRound className="h-4 w-4" />
                    Insert Card &amp; Sign In
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
