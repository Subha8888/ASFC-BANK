import { esc } from './dom.js';
import { brandMarkHtml, icons } from './icons.js';

export function renderLoginView(ui) {
  const mode = ui.loginMode;
  const isAdminAuth = mode === 'admin' || mode === 'new-account';

  const headingTitle =
    mode === 'login'
      ? 'ATM Card & PIN Sign In'
      : mode === 'new-account'
      ? 'New Account Open'
      : 'Admin Vault Sign In';

  const headingDesc =
    mode === 'login'
      ? 'Enter your ASFC account number and 4-digit ATM PIN'
      : mode === 'new-account'
      ? 'Admin authorization required to open a new customer account'
      : 'Restricted administrator access for managing all bank accounts';

  const keypadHtml = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    .map(
      (d) =>
        `<button type="button" class="keypad-key" data-action="keypad-digit" data-digit="${d}">${d}</button>`
    )
    .join('');

  return `
    <div class="login-shell">
      <header class="top-header">
        <div class="top-header-inner">
          ${brandMarkHtml()}
          <nav class="header-nav" aria-label="Primary portal modes">
            <button type="button" class="header-nav-btn ${mode === 'login' ? 'active' : ''}" data-action="switch-auth-mode" data-mode="login">ATM Access</button>
            <button type="button" class="header-nav-btn ${mode === 'new-account' ? 'active' : ''}" data-action="switch-auth-mode" data-mode="new-account">New Account Open</button>
            <button type="button" class="header-nav-btn ${mode === 'admin' ? 'active' : ''}" data-action="switch-auth-mode" data-mode="admin">Admin Portal</button>
          </nav>
          <button type="button" class="btn btn-primary" data-action="switch-auth-mode" data-mode="new-account">
            ${icons.userPlus()} New Account Open
          </button>
        </div>
      </header>

      <main class="login-main">
        <div class="login-grid">
          <section class="card-panel hero-card login-col-6">
            <div class="hero-banner">
              <img src="/src/assets/images/asfc_bank_backdrop_1795454548505.jpg" alt="ASFC Bank obsidian and crimson architectural vault" referrerpolicy="no-referrer" />
              <div class="hero-banner-overlay"></div>
              <div class="hero-banner-copy">
                <p class="hero-kicker">ASFC Institutional &amp; ATM Network</p>
                <h1 class="hero-title">Precision ATM Simulation &amp; Account Banking</h1>
              </div>
            </div>

            <div class="hero-body">
              <div>
                <p style="font-size:0.875rem;line-height:1.6;color:var(--text-secondary);">
                  Insert your ASFC Bank debit card or enter your ASFC account number and 4-digit ATM PIN to execute real-time INR cash withdrawals, vault deposits, instant internal fund transfers, and printable receipts.
                </p>

                <div class="feature-list">
                  <div class="feature-item">
                    <p style="font-size:0.75rem;font-weight:600;color:#fff;">INR ATM Cash Dispenser</p>
                    <p style="margin-top:0.25rem;font-size:0.75rem;color:var(--text-secondary);">
                      Automated Indian Rupee note breakdown across ₹500, ₹200, ₹100, ₹50, ₹20, and ₹10 denominations.
                    </p>
                  </div>

                  <div class="feature-item">
                    <p style="font-size:0.75rem;font-weight:600;color:#fff;">Instant Ledger &amp; Fund Transfers</p>
                    <p style="margin-top:0.25rem;font-size:0.75rem;color:var(--text-secondary);">
                      Real-time account holder verification, card freeze controls, CSV statement export, and reference receipts.
                    </p>
                  </div>

                  <div class="feature-item feature-item-red">
                    <div>
                      <p style="font-size:0.75rem;font-weight:600;color:#fff;display:flex;align-items:center;gap:0.35rem;">
                        <span style="color:var(--accent-red-hover);display:inline-flex;">${icons.lock()}</span>
                        New Account Open
                      </p>
                      <p style="margin-top:0.25rem;font-size:0.75rem;color:var(--text-secondary);">
                        Account creation and holder modifications are restricted exclusively to ASFC administrators.
                      </p>
                    </div>
                    <button type="button" class="btn btn-danger-outline" data-action="switch-auth-mode" data-mode="new-account">
                      Admin Access
                    </button>
                  </div>
                </div>
              </div>

              <div style="display:flex;align-items:center;gap:0.5rem;border-top:1px solid var(--border-soft);padding-top:1rem;font-size:0.75rem;color:var(--text-muted);">
                <span style="color:var(--accent-red-hover);display:inline-flex;">${icons.shieldCheck()}</span>
                <span>256-bit local session persistence · Restricted admin governance</span>
              </div>
            </div>
          </section>

          <section id="atm-access" class="card-panel auth-panel login-col-6">
            <div>
              <div class="auth-header">
                <div>
                  <h2 style="font-size:1.25rem;font-weight:700;color:#fff;">${headingTitle}</h2>
                  <p style="margin-top:0.25rem;font-size:0.75rem;color:var(--text-secondary);">${headingDesc}</p>
                </div>

                <div class="tablist tablist-dark" role="tablist" aria-label="Authentication mode">
                  <button type="button" role="tab" aria-selected="${mode === 'login'}" class="tab-btn ${mode === 'login' ? 'active' : ''}" data-action="switch-auth-mode" data-mode="login">Sign In</button>
                  <button type="button" role="tab" aria-selected="${mode === 'new-account'}" class="tab-btn ${mode === 'new-account' ? 'active' : ''}" data-action="switch-auth-mode" data-mode="new-account">New Account Open</button>
                  <button type="button" role="tab" aria-selected="${mode === 'admin'}" class="tab-btn ${mode === 'admin' ? 'active' : ''}" data-action="switch-auth-mode" data-mode="admin">Admin</button>
                </div>
              </div>

              ${
                isAdminAuth
                  ? `<form id="admin-login-form" class="form-stack">
                      ${
                        mode === 'new-account'
                          ? `<div class="alert-info-red">
                              <span style="color:var(--accent-red-light);flex-shrink:0;">${icons.lock()}</span>
                              <span><strong>Admin Only Access:</strong> Opening a new ASFC Bank account requires authorized administrator sign-in. Enter your Admin ID and 6-digit security PIN to open the account provisioning form.</span>
                            </div>`
                          : ''
                      }
                      <div>
                        <label for="admin-login-id" class="field-label">Administrator ID</label>
                        <input id="admin-login-id" type="text" required value="${esc(ui.adminId)}" placeholder="AS-XXXXXXXXXX" class="input-control font-mono" />
                      </div>
                      <div>
                        <div style="display:flex;align-items:center;justify-content:space-between;">
                          <label for="admin-login-pin" class="field-label">6-Digit Admin Security PIN</label>
                          <button type="button" class="btn-link-muted" data-action="toggle-admin-pin-vis">
                            ${ui.showAdminPin ? icons.eyeOff() : icons.eye()}
                            ${ui.showAdminPin ? 'Hide PIN' : 'Show PIN'}
                          </button>
                        </div>
                        <input id="admin-login-pin" type="${ui.showAdminPin ? 'text' : 'password'}" inputmode="numeric" maxlength="6" required value="${esc(ui.adminPin)}" placeholder="••••••" class="input-control input-pin" />
                      </div>
                      <div class="keypad-box">
                        <p class="keypad-title">Admin Vault Security Keypad</p>
                        <div class="keypad-grid">
                          ${keypadHtml}
                          <button type="button" class="keypad-key keypad-key-clear" data-action="keypad-clear">CLEAR</button>
                          <button type="button" class="keypad-key" data-action="keypad-digit" data-digit="0">0</button>
                          <button type="button" class="keypad-key" data-action="keypad-backspace" aria-label="Delete last Admin PIN digit">${icons.backspace()}</button>
                        </div>
                      </div>
                      ${ui.adminError ? `<div role="alert" class="alert-error">${esc(ui.adminError)}</div>` : ''}
                      <button type="submit" class="btn btn-primary btn-lg">
                        ${icons.shieldCheck()}
                        ${mode === 'new-account' ? 'Verify Admin & Open New Account' : 'Sign In to Admin Portal'}
                        ${icons.arrowRight()}
                      </button>
                    </form>`
                  : `<form id="customer-login-form" class="form-stack">
                      <div>
                        <label for="login-account-id" class="field-label">Account Number or 16-Digit Card Number</label>
                        <input id="login-account-id" type="text" value="${esc(ui.loginIdentifier)}" placeholder="ASFC-1234567899" class="input-control font-mono" />
                      </div>
                      <div>
                        <div style="display:flex;align-items:center;justify-content:space-between;">
                          <label for="login-pin" class="field-label">4-Digit ATM PIN</label>
                          <button type="button" class="btn-link-muted" data-action="toggle-login-pin-vis">
                            ${ui.showLoginPin ? icons.eyeOff() : icons.eye()}
                            ${ui.showLoginPin ? 'Hide PIN' : 'Show PIN'}
                          </button>
                        </div>
                        <input id="login-pin" type="${ui.showLoginPin ? 'text' : 'password'}" inputmode="numeric" maxlength="4" value="${esc(ui.loginPin)}" placeholder="••••" class="input-control input-pin" />
                      </div>
                      <div class="keypad-box">
                        <p class="keypad-title">ATM Security Keypad</p>
                        <div class="keypad-grid">
                          ${keypadHtml}
                          <button type="button" class="keypad-key keypad-key-clear" data-action="keypad-clear">CLEAR</button>
                          <button type="button" class="keypad-key" data-action="keypad-digit" data-digit="0">0</button>
                          <button type="button" class="keypad-key" data-action="keypad-backspace" aria-label="Delete last PIN digit">${icons.backspace()}</button>
                        </div>
                      </div>
                      ${ui.loginError ? `<div role="alert" class="alert-error">${esc(ui.loginError)}</div>` : ''}
                      <button type="submit" class="btn btn-primary btn-lg">
                        ${icons.keyRound()}
                        Insert Card &amp; Sign In
                        ${icons.arrowRight()}
                      </button>
                    </form>`
              }
            </div>
          </section>
        </div>
      </main>
    </div>
  `;
}
