import { esc } from './dom.js';
import {
  calculateBillBreakdown,
  filterTransactions,
  formatAadhaarNumber,
  formatCardNumber,
  formatCurrency,
  formatDateTime,
  getTransactionSignAndLabel,
} from './banking.js';
import { brandMarkHtml, icons } from './icons.js';

const NAV_ITEMS = [
  { id: 'atm', label: 'ATM Terminal', icon: 'monitorDot' },
  { id: 'account', label: 'Account Details', icon: 'creditCard' },
  { id: 'withdraw', label: 'Money Withdraw', icon: 'banknote' },
  { id: 'deposit', label: 'Deposit Funds', icon: 'plusCircle' },
  { id: 'transfer', label: 'Fund Transfer', icon: 'arrowLeftRight' },
  { id: 'history', label: 'Transaction History', icon: 'history' },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

function renderAtmSection(account, otherAccounts, ui) {
  const remainingDaily = Math.max(0, account.dailyWithdrawalLimit - account.withdrawnToday);
  const previewBills = calculateBillBreakdown(Number(ui.atmAmount));
  const atmSub = ui.atmMode;

  return `
    <div class="page-heading">
      <div>
        <h1 class="page-title">ATM Terminal Simulation</h1>
        <p class="page-subtitle">Interactive ASFC dispenser · Instant INR cash, deposits, balance check &amp; transfers</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:0.75rem;color:var(--text-secondary);">Available Balance</p>
        <p class="font-mono tabular-nums" style="font-size:1.5rem;font-weight:700;color:#fff;">${esc(formatCurrency(account.balance))}</p>
      </div>
    </div>

    <div class="grid-12">
      <div class="col-7">
        <div class="atm-bezel">
          <div class="atm-screen">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-subtle);padding-bottom:0.75rem;">
              <div>
                <p style="font-size:0.6875rem;color:var(--accent-red-light);font-weight:600;">ASFC TERMINAL #04 · ONLINE</p>
                <p style="font-size:1rem;font-weight:700;color:#fff;margin-top:0.15rem;">${esc(account.holderName)}</p>
              </div>
              <div style="text-align:right;">
                <p class="font-mono tabular-nums" style="font-size:0.75rem;color:var(--text-secondary);">${esc(account.accountNumber)}</p>
                <p style="font-size:0.7rem;color:${account.status === 'Active' ? 'var(--accent-emerald)' : 'var(--accent-red-light)'};font-weight:600;">
                  CARD ${esc(account.status.toUpperCase())}
                </p>
              </div>
            </div>

            <div class="tablist tablist-dark" style="margin-top:1rem;" role="tablist" aria-label="ATM operations">
              <button type="button" role="tab" aria-selected="${atmSub === 'withdraw'}" class="tab-btn ${atmSub === 'withdraw' ? 'active' : ''}" data-action="set-atm-mode" data-mode="withdraw">Cash Withdraw</button>
              <button type="button" role="tab" aria-selected="${atmSub === 'deposit'}" class="tab-btn ${atmSub === 'deposit' ? 'active' : ''}" data-action="set-atm-mode" data-mode="deposit">Vault Deposit</button>
              <button type="button" role="tab" aria-selected="${atmSub === 'transfer'}" class="tab-btn ${atmSub === 'transfer' ? 'active' : ''}" data-action="set-atm-mode" data-mode="transfer">Fund Transfer</button>
              <button type="button" role="tab" aria-selected="${atmSub === 'balance'}" class="tab-btn ${atmSub === 'balance' ? 'active' : ''}" data-action="set-atm-mode" data-mode="balance">Balance Inquiry</button>
            </div>

            ${
              atmSub === 'balance'
                ? `<div style="margin-top:1.25rem;display:grid;gap:0.75rem;">
                    <div class="feature-item">
                      <p style="font-size:0.75rem;color:var(--text-secondary);">Available Ledger Balance</p>
                      <p class="font-mono tabular-nums" style="font-size:1.75rem;font-weight:700;color:#fff;margin-top:0.25rem;">${esc(formatCurrency(account.balance))}</p>
                    </div>
                    <div class="feature-item" style="display:flex;justify-content:space-between;align-items:center;">
                      <div>
                        <p style="font-size:0.75rem;color:var(--text-secondary);">Remaining Daily ATM Limit</p>
                        <p class="font-mono tabular-nums" style="font-size:1rem;font-weight:600;color:#fff;margin-top:0.15rem;">${esc(formatCurrency(remainingDaily))}</p>
                      </div>
                      <button type="button" class="btn btn-secondary" data-action="nav-section" data-section="account">Card &amp; Profile</button>
                    </div>
                  </div>`
                : atmSub === 'withdraw'
                ? `<form id="atm-withdraw-form" class="form-stack" style="margin-top:1.25rem;">
                    <div>
                      <p class="field-label" style="margin-bottom:0.5rem;">Quick Cash Presets (INR)</p>
                      <div class="preset-grid">
                        ${QUICK_AMOUNTS.map(
                          (amt) =>
                            `<button type="button" class="preset-btn ${Number(ui.atmAmount) === amt ? 'active' : ''}" data-action="set-atm-amount" data-amount="${amt}">₹${amt.toLocaleString('en-IN')}</button>`
                        ).join('')}
                      </div>
                    </div>
                    <div>
                      <label for="atm-withdraw-amount" class="field-label">Withdrawal Amount (Multiples of ₹10)</label>
                      <input id="atm-withdraw-amount" type="number" min="10" step="10" required value="${esc(ui.atmAmount)}" placeholder="2000" class="input-control font-mono tabular-nums" />
                    </div>
                    ${
                      previewBills
                        ? `<div class="feature-item">
                            <p style="font-size:0.75rem;color:var(--text-secondary);">ATM Note Breakdown</p>
                            <div class="bill-grid">
                              ${previewBills
                                .map(
                                  (b) => `<div class="bill-chip"><span>₹${b.denomination}</span><span style="color:var(--accent-red-light);">×${b.count}</span></div>`
                                )
                                .join('')}
                            </div>
                          </div>`
                        : ''
                    }
                    ${ui.atmError ? `<div role="alert" class="alert-error">${esc(ui.atmError)}</div>` : ''}
                    <button type="submit" class="btn btn-primary btn-lg">Dispense Cash</button>
                  </form>`
                : atmSub === 'deposit'
                ? `<form id="atm-deposit-form" class="form-stack" style="margin-top:1.25rem;">
                    <div class="form-grid-2">
                      <div>
                        <label for="atm-deposit-amount" class="field-label">Deposit Amount (INR)</label>
                        <input id="atm-deposit-amount" type="number" min="1" step="0.01" required value="${esc(ui.atmDepositAmount)}" placeholder="5000" class="input-control font-mono tabular-nums" />
                      </div>
                      <div>
                        <label for="atm-deposit-method" class="field-label">Deposit Method</label>
                        <select id="atm-deposit-method" class="select-control">
                          <option value="Cash" ${ui.atmDepositMethod === 'Cash' ? 'selected' : ''}>Cash</option>
                          <option value="Check" ${ui.atmDepositMethod === 'Check' ? 'selected' : ''}>Check</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label for="atm-deposit-note" class="field-label">Reference Note (Optional)</label>
                      <input id="atm-deposit-note" type="text" value="${esc(ui.atmDepositNote)}" placeholder="e.g., Vault cash deposit" class="input-control" />
                    </div>
                    ${ui.atmError ? `<div role="alert" class="alert-error">${esc(ui.atmError)}</div>` : ''}
                    <button type="submit" class="btn btn-primary btn-lg">Confirm Vault Deposit</button>
                  </form>`
                : `<form id="atm-transfer-form" class="form-stack" style="margin-top:1.25rem;">
                    <div>
                      <label for="atm-transfer-to" class="field-label">Recipient Account Number</label>
                      <input id="atm-transfer-to" type="text" required value="${esc(ui.atmTransferTo)}" placeholder="ASFC-2091441002" class="input-control font-mono" />
                      ${
                        otherAccounts.length > 0
                          ? `<div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.5rem;">
                              ${otherAccounts
                                .map(
                                  (a) =>
                                    `<button type="button" class="btn btn-secondary" style="padding:0.25rem 0.6rem;font-size:0.7rem;" data-action="pick-atm-recipient" data-acct="${esc(a.accountNumber)}">${esc(a.holderName)} (${esc(a.accountNumber)})</button>`
                                )
                                .join('')}
                            </div>`
                          : ''
                      }
                    </div>
                    <div>
                      <label for="atm-transfer-amount" class="field-label">Transfer Amount (INR)</label>
                      <input id="atm-transfer-amount" type="number" min="1" step="0.01" required value="${esc(ui.atmTransferAmount)}" placeholder="2500" class="input-control font-mono tabular-nums" />
                    </div>
                    ${ui.atmError ? `<div role="alert" class="alert-error">${esc(ui.atmError)}</div>` : ''}
                    <button type="submit" class="btn btn-primary btn-lg">Execute Instant Transfer</button>
                  </form>`
            }
          </div>
        </div>
      </div>

      <div class="col-5" style="display:flex;flex-direction:column;gap:1.5rem;">
        <div class="surface-card">
          <h2 style="font-size:1rem;font-weight:600;color:#fff;">Session Status &amp; Limits</h2>
          <dl class="profile-dl" style="grid-template-columns:1fr;margin-top:1rem;">
            <div class="profile-row">
              <dt class="profile-dt">Account Tier</dt>
              <dd class="profile-dd">${esc(account.accountType)}</dd>
            </div>
            <div class="profile-row">
              <dt class="profile-dt">Daily ATM Limit Remaining</dt>
              <dd class="profile-dd font-mono tabular-nums">${esc(formatCurrency(remainingDaily))} / ${esc(formatCurrency(account.dailyWithdrawalLimit))}</dd>
            </div>
            <div class="profile-row" style="border-bottom:none;padding-bottom:0;">
              <dt class="profile-dt">Home Branch</dt>
              <dd class="profile-dd" style="font-weight:500;">${esc(account.branchName)}</dd>
            </div>
          </dl>
        </div>

        ${
          ui.lastResultTx
            ? `<div class="surface-card" style="border-color:var(--accent-emerald-border);">
                <p style="font-size:0.75rem;color:var(--accent-emerald);font-weight:600;">LAST COMPLETED TRANSACTION</p>
                <p style="font-size:0.9375rem;font-weight:600;color:#fff;margin-top:0.35rem;">${esc(ui.lastResultTx.description)}</p>
                <p class="font-mono tabular-nums" style="font-size:1.25rem;font-weight:700;color:#fff;margin-top:0.25rem;">${esc(formatCurrency(ui.lastResultTx.amount))}</p>
                <button type="button" class="btn btn-secondary" style="margin-top:0.85rem;width:100%;" data-action="open-receipt" data-tx-id="${esc(ui.lastResultTx.id)}">
                  ${icons.fileText()} View Printable Receipt
                </button>
              </div>`
            : ''
        }
      </div>
    </div>
  `;
}

function renderAccountDetailsSection(account, ui) {
  const dailyPct = Math.min(100, Math.round((account.withdrawnToday / account.dailyWithdrawalLimit) * 100));
  const remainingDaily = Math.max(0, account.dailyWithdrawalLimit - account.withdrawnToday);

  return `
    <div class="page-heading">
      <div>
        <h1 class="page-title">Account Holder Details</h1>
        <p class="page-subtitle">${esc(account.accountType)} · ${esc(account.branchName)} · Status: ${esc(account.status)}</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:0.75rem;color:var(--text-secondary);">Current Available Balance</p>
        <p class="font-mono tabular-nums" style="font-size:1.5rem;font-weight:700;color:#fff;">${esc(formatCurrency(account.balance))}</p>
      </div>
    </div>

    <div class="grid-12">
      <div class="col-5" style="display:flex;flex-direction:column;gap:1rem;">
        <div class="debit-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <p class="font-display" style="font-size:1rem;font-weight:700;letter-spacing:0.04em;color:#fff;">ASFC BANK</p>
              <p style="font-size:0.75rem;color:var(--accent-red-light);margin-top:0.15rem;">${esc(account.accountType)} Debit</p>
            </div>
            <span class="font-mono" style="font-size:0.75rem;font-weight:600;color:#d4d4d8;">
              ${account.status === 'Active' ? 'ACTIVE' : 'FROZEN'}
            </span>
          </div>

          <div style="margin-top:1.75rem;display:flex;align-items:center;gap:0.75rem;">
            <div class="emv-chip"></div>
            <span style="color:var(--text-muted);display:inline-flex;">${icons.creditCard()}</span>
          </div>

          <p class="font-mono tabular-nums" style="margin-top:1.5rem;font-size:1.15rem;font-weight:600;letter-spacing:0.08em;color:#fff;">
            ${esc(formatCardNumber(account.cardNumber, ui.revealCard))}
          </p>

          <div style="margin-top:1.5rem;display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;">
            <div>
              <p style="font-size:0.6875rem;color:var(--text-secondary);">Account Holder</p>
              <p style="margin-top:0.15rem;font-size:0.875rem;font-weight:600;color:#fff;">${esc(account.holderName)}</p>
            </div>
            <div class="font-mono tabular-nums" style="display:flex;gap:1.25rem;text-align:right;">
              <div>
                <p style="font-family:var(--font-sans);font-size:0.6875rem;color:var(--text-secondary);">Expires</p>
                <p style="margin-top:0.15rem;font-size:0.75rem;color:#e4e4e7;">${esc(account.cardExpiry)}</p>
              </div>
              <div>
                <p style="font-family:var(--font-sans);font-size:0.6875rem;color:var(--text-secondary);">CVV</p>
                <p style="margin-top:0.15rem;font-size:0.75rem;color:#e4e4e7;">${ui.revealCard ? esc(account.cardCvv) : '•••'}</p>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;">
          <button type="button" class="btn btn-surface" style="flex:1;padding:0.65rem 1rem;" data-action="toggle-reveal-card">
            ${ui.revealCard ? icons.eyeOff() : icons.eye()}
            ${ui.revealCard ? 'Mask Card Details' : 'Reveal Card & CVV'}
          </button>
          <button type="button" class="btn ${account.status === 'Active' ? 'btn-danger-outline' : 'btn-primary'}" style="flex:1;padding:0.65rem 1rem;" data-action="toggle-card-freeze">
            ${account.status === 'Active' ? `${icons.lock()} Freeze ATM Card` : `${icons.unlock()} Unfreeze ATM Card`}
          </button>
        </div>
      </div>

      <div class="col-7" style="display:flex;flex-direction:column;gap:1.5rem;">
        <div class="surface-card">
          <h2 style="font-size:1rem;font-weight:600;color:#fff;">Holder &amp; Routing Profile</h2>
          <dl class="profile-dl">
            <div class="profile-row">
              <dt class="profile-dt">Account Holder Name</dt>
              <dd class="profile-dd">${esc(account.holderName)}</dd>
            </div>
            <div class="profile-row">
              <dt class="profile-dt">Account Number</dt>
              <dd class="profile-dd font-mono tabular-nums">${esc(account.accountNumber)}</dd>
            </div>
            <div class="profile-row">
              <dt class="profile-dt">IFSC / Routing Code</dt>
              <dd class="profile-dd font-mono tabular-nums" style="font-weight:500;color:#e4e4e7;">${esc(account.ifscCode)}</dd>
            </div>
            <div class="profile-row">
              <dt class="profile-dt">Account Tier</dt>
              <dd class="profile-dd" style="font-weight:500;color:#e4e4e7;">${esc(account.accountType)}</dd>
            </div>
            <div class="profile-row">
              <dt class="profile-dt">Email Address</dt>
              <dd class="profile-dd truncate" style="font-weight:500;color:#e4e4e7;">${esc(account.email)}</dd>
            </div>
            <div class="profile-row">
              <dt class="profile-dt">Registered Phone</dt>
              <dd class="profile-dd font-mono tabular-nums" style="font-weight:500;color:#e4e4e7;">${esc(account.phone)}</dd>
            </div>
            <div class="profile-row">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                <dt class="profile-dt">Aadhaar No. (12-Digit KYC)</dt>
                <button type="button" class="btn-link-red" data-action="toggle-reveal-aadhaar">
                  ${ui.revealAadhaar ? icons.eyeOff() : icons.eye()}
                  ${ui.revealAadhaar ? 'Mask' : 'Show'}
                </button>
              </div>
              <dd class="profile-dd font-mono tabular-nums">${esc(formatAadhaarNumber(account.aadhaarNumber, ui.revealAadhaar))}</dd>
            </div>
            <div class="profile-row">
              <dt class="profile-dt">PAN No.</dt>
              <dd class="profile-dd font-mono tabular-nums" style="text-transform:uppercase;">${esc(account.panNumber || 'Not Provided')}</dd>
            </div>
            <div class="profile-row">
              <dt class="profile-dt">Account Opened Date</dt>
              <dd class="profile-dd font-mono tabular-nums" style="font-weight:500;color:#e4e4e7;">${esc(account.openedDate)}</dd>
            </div>
            <div class="profile-row">
              <dt class="profile-dt">Home Branch</dt>
              <dd class="profile-dd" style="font-weight:500;color:#e4e4e7;">${esc(account.branchName)}</dd>
            </div>
            <div class="col-span-2" style="padding-top:0.25rem;">
              <dt class="profile-dt">Address (Vill, Dist, State, Country)</dt>
              <dd class="address-box">
                <div>
                  <span style="display:block;font-size:0.6875rem;color:var(--text-muted);">Vill</span>
                  <span style="display:block;margin-top:0.15rem;font-size:0.75rem;font-weight:500;color:#f4f4f5;">${esc(account.address?.village || '—')}</span>
                </div>
                <div>
                  <span style="display:block;font-size:0.6875rem;color:var(--text-muted);">Dist</span>
                  <span style="display:block;margin-top:0.15rem;font-size:0.75rem;font-weight:500;color:#f4f4f5;">${esc(account.address?.district || '—')}</span>
                </div>
                <div>
                  <span style="display:block;font-size:0.6875rem;color:var(--text-muted);">State</span>
                  <span style="display:block;margin-top:0.15rem;font-size:0.75rem;font-weight:500;color:#f4f4f5;">${esc(account.address?.state || '—')}</span>
                </div>
                <div>
                  <span style="display:block;font-size:0.6875rem;color:var(--text-muted);">Country</span>
                  <span style="display:block;margin-top:0.15rem;font-size:0.75rem;font-weight:500;color:#f4f4f5;">${esc(account.address?.country || '—')}</span>
                </div>
              </dd>
            </div>
          </dl>
        </div>

        <div class="surface-card">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
            <div>
              <h2 style="font-size:1rem;font-weight:600;color:#fff;">Daily ATM Withdrawal Limit</h2>
              <p style="margin-top:0.15rem;font-size:0.75rem;color:var(--text-secondary);">
                Remaining today: ${esc(formatCurrency(remainingDaily))}
              </p>
            </div>
            <p class="font-mono tabular-nums" style="font-size:0.875rem;font-weight:600;color:#fff;">
              ${esc(formatCurrency(account.withdrawnToday))} / ${esc(formatCurrency(account.dailyWithdrawalLimit))}
            </p>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${dailyPct}%;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderWithdrawSection(account, ui) {
  const remainingDaily = Math.max(0, account.dailyWithdrawalLimit - account.withdrawnToday);
  const previewBills = calculateBillBreakdown(Number(ui.withdrawAmount));

  return `
    <div class="page-heading">
      <div>
        <h1 class="page-title">Money Withdraw</h1>
        <p class="page-subtitle">Withdraw INR cash from your ASFC account in multiples of ₹10</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:0.75rem;color:var(--text-secondary);">Remaining Daily Limit</p>
        <p class="font-mono tabular-nums" style="font-size:1.25rem;font-weight:700;color:#fff;">${esc(formatCurrency(remainingDaily))}</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="surface-card">
        <form id="withdraw-view-form" class="form-stack" style="margin-top:0;">
          <div>
            <p class="field-label" style="margin-bottom:0.5rem;">Quick Select Amount (INR)</p>
            <div class="preset-grid">
              ${QUICK_AMOUNTS.map(
                (amt) =>
                  `<button type="button" class="preset-btn ${Number(ui.withdrawAmount) === amt ? 'active' : ''}" data-action="set-withdraw-amount" data-amount="${amt}">₹${amt.toLocaleString('en-IN')}</button>`
              ).join('')}
            </div>
          </div>
          <div>
            <label for="withdraw-amount" class="field-label">Withdrawal Amount (INR)</label>
            <input id="withdraw-amount" type="number" min="10" step="10" required value="${esc(ui.withdrawAmount)}" placeholder="2000" class="input-control font-mono tabular-nums" />
          </div>
          <div>
            <label for="withdraw-note" class="field-label">Optional Note</label>
            <input id="withdraw-note" type="text" value="${esc(ui.withdrawNote)}" placeholder="e.g., Travel cash" class="input-control" />
          </div>
          ${ui.withdrawError ? `<div role="alert" class="alert-error">${esc(ui.withdrawError)}</div>` : ''}
          <button type="submit" class="btn btn-primary btn-lg">Withdraw Cash</button>
        </form>
      </div>

      <div class="surface-card">
        <h2 style="font-size:1rem;font-weight:600;color:#fff;">Cash Note Dispense Preview</h2>
        <p style="margin-top:0.25rem;font-size:0.75rem;color:var(--text-secondary);">Optimal Indian Rupee note combination for your requested withdrawal</p>
        ${
          previewBills
            ? `<div class="bill-grid" style="margin-top:1.25rem;">
                ${previewBills
                  .map(
                    (b) => `<div class="bill-chip"><span>₹${b.denomination}</span><span style="color:var(--accent-red-light);">×${b.count}</span></div>`
                  )
                  .join('')}
              </div>`
            : `<p style="margin-top:1.25rem;font-size:0.8125rem;color:var(--text-muted);">Enter a valid integer multiple of ₹10 to preview notes.</p>`
        }
        ${
          ui.lastResultTx && ui.lastResultTx.type === 'withdrawal'
            ? `<div style="margin-top:1.5rem;border-top:1px solid var(--border-subtle);padding-top:1rem;">
                <p style="font-size:0.75rem;color:var(--accent-emerald);font-weight:600;">WITHDRAWAL COMPLETED · ${esc(ui.lastResultTx.referenceCode)}</p>
                <button type="button" class="btn btn-secondary" style="margin-top:0.65rem;" data-action="open-receipt" data-tx-id="${esc(ui.lastResultTx.id)}">${icons.fileText()} View Receipt</button>
              </div>`
            : ''
        }
      </div>
    </div>
  `;
}

function renderDepositSection(account, ui) {
  return `
    <div class="page-heading">
      <div>
        <h1 class="page-title">Deposit Funds</h1>
        <p class="page-subtitle">Instant Cash or Check deposit up to ₹2,50,000.00 per transaction</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:0.75rem;color:var(--text-secondary);">Current Balance</p>
        <p class="font-mono tabular-nums" style="font-size:1.25rem;font-weight:700;color:#fff;">${esc(formatCurrency(account.balance))}</p>
      </div>
    </div>

    <div class="surface-card" style="max-width:38rem;">
      <form id="deposit-view-form" class="form-stack" style="margin-top:0;">
        <div class="form-grid-2">
          <div>
            <label for="deposit-amount" class="field-label">Deposit Amount (INR)</label>
            <input id="deposit-amount" type="number" min="1" step="0.01" required value="${esc(ui.depositAmount)}" placeholder="10000" class="input-control font-mono tabular-nums" />
          </div>
          <div>
            <label for="deposit-method" class="field-label">Deposit Method</label>
            <select id="deposit-method" class="select-control">
              <option value="Cash" ${ui.depositMethod === 'Cash' ? 'selected' : ''}>Cash</option>
              <option value="Check" ${ui.depositMethod === 'Check' ? 'selected' : ''}>Check</option>
            </select>
          </div>
        </div>
        <div>
          <label for="deposit-note" class="field-label">Deposit Memo (Optional)</label>
          <input id="deposit-note" type="text" value="${esc(ui.depositNote)}" placeholder="e.g., Invoice settlement" class="input-control" />
        </div>
        ${ui.depositError ? `<div role="alert" class="alert-error">${esc(ui.depositError)}</div>` : ''}
        <button type="submit" class="btn btn-primary btn-lg">Confirm Deposit</button>
      </form>
      ${
        ui.lastResultTx && ui.lastResultTx.type === 'deposit'
          ? `<div style="margin-top:1.25rem;border-top:1px solid var(--border-subtle);padding-top:1rem;">
              <p style="font-size:0.75rem;color:var(--accent-emerald);font-weight:600;">DEPOSIT CREDITED · ${esc(ui.lastResultTx.referenceCode)}</p>
              <button type="button" class="btn btn-secondary" style="margin-top:0.65rem;" data-action="open-receipt" data-tx-id="${esc(ui.lastResultTx.id)}">${icons.fileText()} View Receipt</button>
            </div>`
          : ''
      }
    </div>
  `;
}

function renderTransferSection(account, otherAccounts, ui) {
  return `
    <div class="page-heading">
      <div>
        <h1 class="page-title">Fund Transfer</h1>
        <p class="page-subtitle">Send instant INR transfers to ASFC accounts or external beneficiaries</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:0.75rem;color:var(--text-secondary);">Available Balance</p>
        <p class="font-mono tabular-nums" style="font-size:1.25rem;font-weight:700;color:#fff;">${esc(formatCurrency(account.balance))}</p>
      </div>
    </div>

    <div class="surface-card" style="max-width:42rem;">
      <form id="transfer-view-form" class="form-stack" style="margin-top:0;">
        <div>
          <label for="transfer-to" class="field-label">Recipient Account Number</label>
          <input id="transfer-to" type="text" required value="${esc(ui.transferTo)}" placeholder="ASFC-2091441002" class="input-control font-mono" />
          ${
            otherAccounts.length > 0
              ? `<div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.5rem;">
                  ${otherAccounts
                    .map(
                      (a) =>
                        `<button type="button" class="btn btn-secondary" style="padding:0.25rem 0.6rem;font-size:0.7rem;" data-action="pick-transfer-recipient" data-acct="${esc(a.accountNumber)}" data-name="${esc(a.holderName)}">${esc(a.holderName)} (${esc(a.accountNumber)})</button>`
                    )
                    .join('')}
                </div>`
              : ''
          }
        </div>
        <div class="form-grid-2">
          <div>
            <label for="transfer-recipient-name" class="field-label">Beneficiary Name (Optional)</label>
            <input id="transfer-recipient-name" type="text" value="${esc(ui.transferRecipientName)}" placeholder="Recipient full name" class="input-control" />
          </div>
          <div>
            <label for="transfer-amount" class="field-label">Amount (INR)</label>
            <input id="transfer-amount" type="number" min="1" step="0.01" required value="${esc(ui.transferAmount)}" placeholder="5000" class="input-control font-mono tabular-nums" />
          </div>
        </div>
        <div>
          <label for="transfer-note" class="field-label">Transfer Reference / Note</label>
          <input id="transfer-note" type="text" value="${esc(ui.transferNote)}" placeholder="e.g., Monthly rent" class="input-control" />
        </div>
        ${ui.transferError ? `<div role="alert" class="alert-error">${esc(ui.transferError)}</div>` : ''}
        <button type="submit" class="btn btn-primary btn-lg">Send Funds</button>
      </form>
      ${
        ui.lastResultTx && ui.lastResultTx.type === 'transfer_out'
          ? `<div style="margin-top:1.25rem;border-top:1px solid var(--border-subtle);padding-top:1rem;">
              <p style="font-size:0.75rem;color:var(--accent-emerald);font-weight:600;">TRANSFER SENT · ${esc(ui.lastResultTx.referenceCode)}</p>
              <button type="button" class="btn btn-secondary" style="margin-top:0.65rem;" data-action="open-receipt" data-tx-id="${esc(ui.lastResultTx.id)}">${icons.fileText()} View Receipt</button>
            </div>`
          : ''
      }
    </div>
  `;
}

function renderHistorySection(account, transactions, ui) {
  const rows = filterTransactions(transactions, account.accountNumber, ui.historyFilter, ui.historySearch);

  return `
    <div class="page-heading">
      <div>
        <h1 class="page-title">Transaction History</h1>
        <p class="page-subtitle">Complete statement &amp; reference receipts for ${esc(account.accountNumber)}</p>
      </div>
      <button type="button" class="btn btn-secondary" data-action="export-customer-csv" ${rows.length === 0 ? 'disabled' : ''}>
        ${icons.download()} Export CSV
      </button>
    </div>

    <div class="workspace-controls" style="margin-bottom:1.25rem;">
      <div class="tablist" role="tablist" aria-label="Filter transactions by type">
        ${[
          { id: 'all', label: 'All Activity' },
          { id: 'withdrawals', label: 'Withdrawals' },
          { id: 'deposits', label: 'Deposits' },
          { id: 'transfers', label: 'Transfers' },
        ]
          .map(
            (t) =>
              `<button type="button" role="tab" aria-selected="${ui.historyFilter === t.id}" class="tab-btn ${ui.historyFilter === t.id ? 'active' : ''}" data-action="set-customer-history-filter" data-filter="${t.id}">${t.label}</button>`
          )
          .join('')}
      </div>

      <div class="search-box">
        <span class="search-box-icon">${icons.search()}</span>
        <input id="customer-history-search" type="search" class="search-input" value="${esc(ui.historySearch)}" placeholder="Search reference or description..." aria-label="Search transaction history" />
      </div>
    </div>

    <div class="table-wrap">
      ${
        rows.length === 0
          ? `<div style="padding:3.5rem 1.5rem;text-align:center;">
              <p style="font-size:0.875rem;font-weight:500;color:#d4d4d8;">No matching transactions found</p>
            </div>`
          : `<div class="table-scroll">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Description</th>
                    <th>Type &amp; Channel</th>
                    <th>Reference</th>
                    <th class="text-right">Amount</th>
                    <th class="text-right">Balance</th>
                    <th class="text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows
                    .map((tx) => {
                      const { sign, label, isCredit } = getTransactionSignAndLabel(tx.type, tx.adjustmentDirection);
                      return `
                        <tr>
                          <td class="font-mono tabular-nums whitespace-nowrap" style="font-size:0.75rem;color:var(--text-secondary);">${esc(formatDateTime(tx.timestamp))}</td>
                          <td>
                            <p style="color:#fff;">${esc(tx.description)}</p>
                            ${tx.counterpartyAccount ? `<p class="font-mono tabular-nums" style="font-size:0.75rem;color:var(--text-muted);">${esc(tx.counterpartyAccount)}</p>` : ''}
                          </td>
                          <td class="whitespace-nowrap" style="font-size:0.75rem;color:var(--text-secondary);">${esc(label)} · ${esc(tx.channel)}</td>
                          <td class="font-mono tabular-nums whitespace-nowrap" style="font-size:0.75rem;color:var(--text-secondary);">${esc(tx.referenceCode)}</td>
                          <td class="text-right font-mono tabular-nums whitespace-nowrap" style="font-weight:600;color:${isCredit ? 'var(--accent-emerald)' : 'var(--accent-red-light)'};">${sign}${esc(formatCurrency(tx.amount))}</td>
                          <td class="text-right font-mono tabular-nums whitespace-nowrap" style="font-size:0.75rem;color:#d4d4d8;">${esc(formatCurrency(tx.balanceAfter))}</td>
                          <td class="text-right whitespace-nowrap">
                            <button type="button" class="btn btn-secondary" style="padding:0.35rem 0.65rem;" data-action="open-receipt" data-tx-id="${esc(tx.id)}">
                              ${icons.fileText()} Receipt
                            </button>
                          </td>
                        </tr>
                      `;
                    })
                    .join('')}
                </tbody>
              </table>
            </div>`
      }
    </div>
  `;
}

export function renderCustomerView(account, otherAccounts, transactions, ui) {
  const currentNavLabel = NAV_ITEMS.find((i) => i.id === ui.activeSection)?.label ?? 'ATM Terminal';

  let sectionHtml = '';
  if (ui.activeSection === 'atm') sectionHtml = renderAtmSection(account, otherAccounts, ui);
  else if (ui.activeSection === 'account') sectionHtml = renderAccountDetailsSection(account, ui);
  else if (ui.activeSection === 'withdraw') sectionHtml = renderWithdrawSection(account, ui);
  else if (ui.activeSection === 'deposit') sectionHtml = renderDepositSection(account, ui);
  else if (ui.activeSection === 'transfer') sectionHtml = renderTransferSection(account, otherAccounts, ui);
  else sectionHtml = renderHistorySection(account, transactions, ui);

  return `
    <div class="workspace-shell">
      <aside class="sidebar">
        <div class="sidebar-brand">${brandMarkHtml()}</div>
        <div class="sidebar-account">
          <p style="font-size:0.75rem;color:var(--text-secondary);">Signed in as</p>
          <p class="truncate" style="margin-top:0.15rem;font-size:0.875rem;font-weight:600;color:#fff;">${esc(account.holderName)}</p>
          <p class="font-mono tabular-nums" style="margin-top:0.25rem;font-size:0.75rem;color:var(--text-secondary);">${esc(account.accountNumber)}</p>
          <p class="font-mono tabular-nums" style="margin-top:0.75rem;font-size:1.125rem;font-weight:700;color:#fff;">${esc(formatCurrency(account.balance))}</p>
        </div>
        <nav aria-label="Primary banking navigation" class="sidebar-nav">
          ${NAV_ITEMS.map(
            (item) => `
              <button type="button" class="nav-item-btn ${ui.activeSection === item.id ? 'active' : ''}" data-action="nav-section" data-section="${item.id}">
                ${icons[item.icon]()} <span>${item.label}</span>
              </button>
            `
          ).join('')}
        </nav>
        <div class="sidebar-footer">
          <p class="truncate" style="font-size:0.75rem;color:var(--text-muted);">${esc(account.branchName)}</p>
        </div>
      </aside>

      <div class="workspace-main-col">
        <header class="sticky-topbar">
          <div style="display:flex;align-items:center;gap:0.75rem;min-width:0;">
            <button type="button" class="btn btn-surface mobile-menu-trigger" style="padding:0.45rem;" data-action="toggle-mobile-menu" aria-label="${ui.mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}">
              ${ui.mobileMenuOpen ? icons.x() : icons.menu()}
            </button>
            <div class="truncate" style="display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;">
              <span style="font-weight:600;color:var(--text-secondary);">ASFC Bank /</span>
              <span style="font-weight:600;color:#fff;">${esc(currentNavLabel)}</span>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:1rem;flex-shrink:0;">
            <div style="text-align:right;" class="hidden-xs">
              <p style="font-size:0.75rem;font-weight:500;color:#fff;">${esc(account.holderName)}</p>
              <p class="font-mono" style="font-size:0.6875rem;color:var(--text-secondary);">${esc(account.accountType)}</p>
            </div>
            <button type="button" class="btn btn-primary" data-action="logout">
              ${icons.logout()} Logout
            </button>
          </div>
        </header>

        ${
          ui.mobileMenuOpen
            ? `<div class="mobile-drawer">
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-subtle);padding-bottom:0.75rem;">
                  <div>
                    <p style="font-size:0.875rem;font-weight:600;color:#fff;">${esc(account.holderName)}</p>
                    <p class="font-mono" style="font-size:0.75rem;color:var(--text-secondary);">${esc(account.accountNumber)}</p>
                  </div>
                  <p class="font-mono tabular-nums" style="font-size:1rem;font-weight:700;color:#fff;">${esc(formatCurrency(account.balance))}</p>
                </div>
                <nav aria-label="Mobile banking navigation" class="mobile-nav-grid">
                  ${NAV_ITEMS.map(
                    (item) => `
                      <button type="button" class="nav-item-btn ${ui.activeSection === item.id ? 'active' : ''}" style="background:${ui.activeSection === item.id ? 'var(--accent-red)' : 'var(--bg-surface)'};font-size:0.75rem;" data-action="nav-section" data-section="${item.id}">
                        ${icons[item.icon]()} <span class="truncate">${item.label}</span>
                      </button>
                    `
                  ).join('')}
                </nav>
              </div>`
            : ''
        }

        <main class="workspace-content">${sectionHtml}</main>
      </div>
    </div>
  `;
}
