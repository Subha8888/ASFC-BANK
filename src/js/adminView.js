import { esc } from './dom.js';
import {
  filterTransactions,
  formatAadhaarNumber,
  formatAddress,
  formatCardNumber,
  formatCurrency,
  formatDateTime,
  getTransactionSignAndLabel,
} from './banking.js';
import { brandMarkHtml, icons } from './icons.js';

function renderManageAccountModal(account, ui) {
  if (!account || !ui.editDraft) return '';
  const d = ui.editDraft;

  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-account-title" data-modal-backdrop="edit-account">
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <h2 id="edit-account-title" style="font-size:1.05rem;font-weight:700;color:#fff;">Manage Account Holder Details</h2>
            <p class="font-mono tabular-nums" style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.15rem;">
              ${esc(account.accountNumber)} · Opened ${esc(account.openedDate)}
            </p>
          </div>
          <button type="button" class="btn-icon" data-action="admin-close-edit" aria-label="Close edit account modal">
            ${icons.x()}
          </button>
        </div>

        <form id="admin-edit-account-form" class="modal-body form-stack" style="margin-top:0;">
          <div class="form-grid-2">
            <div class="col-span-2">
              <label for="edit-account-number" class="field-label">Account Number (Editable ASFC Sequence)</label>
              <input id="edit-account-number" type="text" required value="${esc(d.accountNumber)}" placeholder="ASFC-1234567899" class="input-control font-mono" style="text-transform:uppercase;" />
              <p class="field-sub-label" style="margin-top:0.25rem;">All historical ledger records automatically migrate if you change the account number.</p>
            </div>

            <div>
              <label for="edit-holder-name" class="field-label">Account Holder Name</label>
              <input id="edit-holder-name" type="text" required value="${esc(d.holderName)}" class="input-control" />
            </div>

            <div>
              <label for="edit-email" class="field-label">Email Address</label>
              <input id="edit-email" type="email" required value="${esc(d.email)}" class="input-control" />
            </div>

            <div>
              <label for="edit-phone" class="field-label">Phone Number</label>
              <input id="edit-phone" type="text" required value="${esc(d.phone)}" class="input-control font-mono" />
            </div>

            <div>
              <label for="edit-aadhaar" class="field-label">Aadhaar No. (12 Digits)</label>
              <input id="edit-aadhaar" type="text" inputmode="numeric" maxlength="14" required value="${esc(d.aadhaarNumber)}" placeholder="648219304812" class="input-control font-mono" />
            </div>

            <div>
              <label for="edit-pan" class="field-label">PAN No.</label>
              <input id="edit-pan" type="text" maxlength="12" required value="${esc(d.panNumber)}" placeholder="QJ45678" class="input-control font-mono" style="text-transform:uppercase;" />
            </div>

            <div>
              <label for="edit-pin" class="field-label">4-Digit ATM PIN</label>
              <input id="edit-pin" type="text" inputmode="numeric" maxlength="4" required value="${esc(d.pin)}" class="input-control font-mono" />
            </div>

            <div class="col-span-2 modal-address-box">
              <p class="field-label" style="margin-bottom:0.5rem;">Address (Vill, Dist, State, Country)</p>
              <div class="form-grid-2">
                <div>
                  <label for="edit-address-village" class="field-sub-label">Vill / Locality</label>
                  <input id="edit-address-village" type="text" required value="${esc(d.village)}" class="input-control input-compact" />
                </div>
                <div>
                  <label for="edit-address-district" class="field-sub-label">Dist</label>
                  <input id="edit-address-district" type="text" required value="${esc(d.district)}" class="input-control input-compact" />
                </div>
                <div>
                  <label for="edit-address-state" class="field-sub-label">State</label>
                  <input id="edit-address-state" type="text" required value="${esc(d.state)}" class="input-control input-compact" />
                </div>
                <div>
                  <label for="edit-address-country" class="field-sub-label">Country</label>
                  <input id="edit-address-country" type="text" required value="${esc(d.country)}" class="input-control input-compact" />
                </div>
              </div>
            </div>

            <div>
              <label for="edit-account-type" class="field-label">Account Tier</label>
              <select id="edit-account-type" class="select-control">
                <option value="Checking" ${d.accountType === 'Checking' ? 'selected' : ''}>Checking</option>
                <option value="Savings" ${d.accountType === 'Savings' ? 'selected' : ''}>Savings</option>
                <option value="Private Reserve" ${d.accountType === 'Private Reserve' ? 'selected' : ''}>Private Reserve</option>
              </select>
            </div>

            <div>
              <label for="edit-status" class="field-label">Account &amp; Card Status</label>
              <select id="edit-status" class="select-control">
                <option value="Active" ${d.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Frozen" ${d.status === 'Frozen' ? 'selected' : ''}>Frozen</option>
              </select>
            </div>

            <div class="col-span-2">
              <label for="edit-branch-name" class="field-label">Home Branch</label>
              <input id="edit-branch-name" type="text" required value="${esc(d.branchName)}" class="input-control" />
            </div>

            <div>
              <label for="edit-daily-limit" class="field-label">Daily ATM Withdrawal Limit (INR)</label>
              <input id="edit-daily-limit" type="number" min="1000" step="100" required value="${esc(d.dailyWithdrawalLimit)}" class="input-control font-mono tabular-nums" />
            </div>

            <div>
              <label for="edit-balance" class="field-label">Ledger Balance (INR)</label>
              <input id="edit-balance" type="number" min="0" step="0.01" required value="${esc(d.balance)}" class="input-control font-mono tabular-nums" />
            </div>

            <div class="col-span-2">
              <label for="edit-adjustment-note" class="field-label">Admin Adjustment Reason (Logged if balance changed)</label>
              <input id="edit-adjustment-note" type="text" value="${esc(d.adjustmentNote)}" placeholder="e.g., Audit reconciliation credit" class="input-control" />
            </div>
          </div>

          ${ui.editError ? `<div role="alert" class="alert-error">${esc(ui.editError)}</div>` : ''}

          <div class="modal-footer">
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;">
              <button type="button" class="btn btn-secondary" data-action="admin-reset-daily">
                ${icons.rotateCcw()} Reset Daily Limit
              </button>
              ${
                ui.confirmDeleteAccount
                  ? `<button type="button" class="btn btn-danger-solid" data-action="admin-confirm-delete">Confirm Delete</button>
                     <button type="button" class="btn btn-secondary" data-action="admin-cancel-delete">Cancel</button>`
                  : `<button type="button" class="btn btn-danger-outline" data-action="admin-request-delete">${icons.trash()} Delete Account</button>`
              }
            </div>
            <div style="display:flex;gap:0.5rem;">
              <button type="button" class="btn btn-secondary" data-action="admin-close-edit">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderNewAccountModal(ui) {
  if (!ui.newAccountModalOpen) return '';
  const d = ui.newAccountDraft;

  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="new-account-title" data-modal-backdrop="new-account">
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <h2 id="new-account-title" style="font-size:1.05rem;font-weight:700;color:#fff;">New Account Open (Admin Provisioning)</h2>
            <p style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.15rem;">Create a new ASFC Bank customer account with KYC details &amp; opening deposit</p>
          </div>
          <button type="button" class="btn-icon" data-action="admin-close-new-modal" aria-label="Close new account modal">
            ${icons.x()}
          </button>
        </div>

        <form id="admin-new-account-form" class="modal-body form-stack" style="margin-top:0;">
          <div class="form-grid-2">
            <div class="col-span-2">
              <label for="admin-new-account-number" class="field-label">Custom Account Number (Optional)</label>
              <input id="admin-new-account-number" type="text" value="${esc(d.accountNumber)}" placeholder="ASFC-1234567899 (Leave blank to auto-generate)" class="input-control font-mono" style="text-transform:uppercase;" />
            </div>

            <div>
              <label for="admin-new-holder-name" class="field-label">Account Holder Full Name</label>
              <input id="admin-new-holder-name" type="text" required value="${esc(d.holderName)}" placeholder="Priya Nair" class="input-control" />
            </div>

            <div>
              <label for="admin-new-email" class="field-label">Email Address</label>
              <input id="admin-new-email" type="email" required value="${esc(d.email)}" placeholder="priya.nair@asfc-client.example" class="input-control" />
            </div>

            <div>
              <label for="admin-new-phone" class="field-label">Phone Number</label>
              <input id="admin-new-phone" type="text" value="${esc(d.phone)}" placeholder="+91 98200 11223" class="input-control font-mono" />
            </div>

            <div>
              <label for="admin-new-aadhaar" class="field-label">Aadhaar No. (12 Digits, Optional)</label>
              <input id="admin-new-aadhaar" type="text" inputmode="numeric" maxlength="14" value="${esc(d.aadhaarNumber)}" placeholder="12-digit Aadhaar (auto if blank)" class="input-control font-mono" />
            </div>

            <div>
              <label for="admin-new-pan" class="field-label">PAN No. (Optional)</label>
              <input id="admin-new-pan" type="text" maxlength="12" value="${esc(d.panNumber)}" placeholder="QJ45678" class="input-control font-mono" style="text-transform:uppercase;" />
            </div>

            <div>
              <label for="admin-new-account-type" class="field-label">Account Tier</label>
              <select id="admin-new-account-type" class="select-control">
                <option value="Checking" ${d.accountType === 'Checking' ? 'selected' : ''}>Checking</option>
                <option value="Savings" ${d.accountType === 'Savings' ? 'selected' : ''}>Savings</option>
                <option value="Private Reserve" ${d.accountType === 'Private Reserve' ? 'selected' : ''}>Private Reserve</option>
              </select>
            </div>

            <div class="col-span-2 modal-address-box">
              <p class="field-label" style="margin-bottom:0.5rem;">Address (Vill, Dist, State, Country)</p>
              <div class="form-grid-2">
                <div>
                  <label for="admin-new-village" class="field-sub-label">Vill / Locality</label>
                  <input id="admin-new-village" type="text" value="${esc(d.village)}" placeholder="Mumbai Central" class="input-control input-compact" />
                </div>
                <div>
                  <label for="admin-new-district" class="field-sub-label">Dist</label>
                  <input id="admin-new-district" type="text" value="${esc(d.district)}" placeholder="Mumbai City" class="input-control input-compact" />
                </div>
                <div>
                  <label for="admin-new-state" class="field-sub-label">State</label>
                  <input id="admin-new-state" type="text" value="${esc(d.state)}" placeholder="Maharashtra" class="input-control input-compact" />
                </div>
                <div>
                  <label for="admin-new-country" class="field-sub-label">Country</label>
                  <input id="admin-new-country" type="text" value="${esc(d.country)}" placeholder="India" class="input-control input-compact" />
                </div>
              </div>
            </div>

            <div>
              <label for="admin-new-pin" class="field-label">4-Digit ATM PIN</label>
              <input id="admin-new-pin" type="text" inputmode="numeric" maxlength="4" required value="${esc(d.pin)}" placeholder="4567" class="input-control font-mono" />
            </div>

            <div>
              <label for="admin-new-deposit" class="field-label">Opening Deposit (Min ₹500)</label>
              <input id="admin-new-deposit" type="number" min="500" step="0.01" required value="${esc(d.initialDeposit)}" placeholder="5000" class="input-control font-mono tabular-nums" />
            </div>
          </div>

          ${ui.newAccountError ? `<div role="alert" class="alert-error">${esc(ui.newAccountError)}</div>` : ''}

          <div class="modal-footer" style="justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" data-action="admin-close-new-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">${icons.userPlus()} Open Customer Account</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderAccountHistoryModal(account, transactions, ui) {
  if (!account) return '';
  const rows = filterTransactions(
    transactions,
    account.accountNumber,
    ui.adminHistoryFilter,
    ui.adminHistorySearch
  );

  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="account-history-title" data-modal-backdrop="account-history">
      <div class="modal-dialog modal-dialog-wide">
        <div class="modal-header">
          <div>
            <h2 id="account-history-title" style="font-size:1.05rem;font-weight:700;color:#fff;">Account Transaction History — ${esc(account.holderName)}</h2>
            <p class="font-mono tabular-nums" style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.15rem;">
              ${esc(account.accountNumber)} · Balance: ${esc(formatCurrency(account.balance))} · PAN: ${esc(account.panNumber)}
            </p>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <button type="button" class="btn btn-secondary" data-action="admin-export-account-csv" ${rows.length === 0 ? 'disabled' : ''}>
              ${icons.download()} Export CSV
            </button>
            <button type="button" class="btn-icon" data-action="admin-close-history" aria-label="Close account history">
              ${icons.x()}
            </button>
          </div>
        </div>

        <div class="modal-body" style="overflow-y:auto;display:flex;flex-direction:column;gap:1rem;">
          <div class="workspace-controls">
            <div class="tablist" role="tablist" aria-label="Account history filters">
              ${[
                { id: 'all', label: 'All Activity' },
                { id: 'withdrawals', label: 'Withdrawals' },
                { id: 'deposits', label: 'Deposits' },
                { id: 'transfers', label: 'Transfers' },
              ]
                .map(
                  (t) =>
                    `<button type="button" role="tab" aria-selected="${ui.adminHistoryFilter === t.id}" class="tab-btn ${ui.adminHistoryFilter === t.id ? 'active' : ''}" data-action="admin-set-history-filter" data-filter="${t.id}">${t.label}</button>`
                )
                .join('')}
            </div>

            <div class="search-box">
              <span class="search-box-icon">${icons.search()}</span>
              <input id="admin-history-search" type="search" class="search-input" value="${esc(ui.adminHistorySearch)}" placeholder="Search account transactions..." aria-label="Search account transaction history" />
            </div>
          </div>

          <div class="table-wrap">
            ${
              rows.length === 0
                ? `<div style="padding:2.5rem;text-align:center;color:var(--text-secondary);font-size:0.875rem;">No transactions recorded for this filter.</div>`
                : `<div class="table-scroll">
                    <table class="data-table compact">
                      <thead>
                        <tr>
                          <th>Date &amp; Time</th>
                          <th>Description</th>
                          <th>Type &amp; Channel</th>
                          <th>Reference</th>
                          <th class="text-right">Amount</th>
                          <th class="text-right">Balance After</th>
                          <th class="text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rows
                          .map((tx) => {
                            const { sign, label, isCredit } = getTransactionSignAndLabel(
                              tx.type,
                              tx.adjustmentDirection
                            );
                            return `
                              <tr>
                                <td class="font-mono tabular-nums whitespace-nowrap" style="font-size:0.75rem;color:var(--text-secondary);">${esc(formatDateTime(tx.timestamp))}</td>
                                <td style="color:#fff;">${esc(tx.description)}</td>
                                <td class="whitespace-nowrap" style="font-size:0.75rem;color:var(--text-secondary);">${esc(label)} · ${esc(tx.channel)}</td>
                                <td class="font-mono tabular-nums whitespace-nowrap" style="font-size:0.75rem;color:var(--text-secondary);">${esc(tx.referenceCode)}</td>
                                <td class="text-right font-mono tabular-nums whitespace-nowrap" style="font-weight:600;color:${isCredit ? 'var(--accent-emerald)' : 'var(--accent-red-light)'};">${sign}${esc(formatCurrency(tx.amount))}</td>
                                <td class="text-right font-mono tabular-nums whitespace-nowrap" style="font-size:0.75rem;color:#d4d4d8;">${esc(formatCurrency(tx.balanceAfter))}</td>
                                <td class="text-right whitespace-nowrap">
                                  <button type="button" class="btn btn-secondary" style="padding:0.3rem 0.6rem;" data-action="open-receipt" data-tx-id="${esc(tx.id)}">
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
        </div>
      </div>
    </div>
  `;
}

function renderEditAdminModal(targetAdmin, ui) {
  if (!targetAdmin || !ui.adminProfileDraft) return '';
  const d = ui.adminProfileDraft;

  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-admin-title" data-modal-backdrop="edit-admin">
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <h2 id="edit-admin-title" style="font-size:1.05rem;font-weight:700;color:#fff;">Edit Admin Details</h2>
            <p class="font-mono tabular-nums" style="font-size:0.75rem;color:var(--accent-red-light);margin-top:0.15rem;">
              ${esc(targetAdmin.adminId)} · Restricted Executive Profile
            </p>
          </div>
          <button type="button" class="btn-icon" data-action="admin-close-profile-edit" aria-label="Close admin profile editor">
            ${icons.x()}
          </button>
        </div>

        <form id="admin-edit-profile-form" class="modal-body form-stack" style="margin-top:0;">
          <div class="form-grid-2">
            <div>
              <label for="edit-admin-name" class="field-label">Admin Full Name</label>
              <input id="edit-admin-name" type="text" required value="${esc(d.name)}" class="input-control" />
            </div>

            <div>
              <label for="edit-admin-position" class="field-label">Position / Title (e.g., MD, Joint MD)</label>
              <input id="edit-admin-position" type="text" required value="${esc(d.position)}" class="input-control" />
            </div>

            <div>
              <label for="edit-admin-phone" class="field-label">Phone No.</label>
              <input id="edit-admin-phone" type="text" required value="${esc(d.phone)}" class="input-control font-mono" />
            </div>

            <div>
              <label for="edit-admin-aadhaar" class="field-label">Aadhaar No. (12 Digits)</label>
              <input id="edit-admin-aadhaar" type="text" inputmode="numeric" maxlength="14" required value="${esc(d.aadhaarNumber)}" class="input-control font-mono" />
            </div>

            <div class="col-span-2">
              <label for="edit-admin-pan" class="field-label">PAN No.</label>
              <input id="edit-admin-pan" type="text" maxlength="12" required value="${esc(d.panNumber)}" class="input-control font-mono" style="text-transform:uppercase;" />
            </div>

            <div class="col-span-2 modal-address-box">
              <p class="field-label" style="margin-bottom:0.5rem;">Admin Address (Vill, Dist, State, Country)</p>
              <div class="form-grid-2">
                <div>
                  <label for="edit-admin-village" class="field-sub-label">Vill / Locality</label>
                  <input id="edit-admin-village" type="text" required value="${esc(d.village)}" class="input-control input-compact" />
                </div>
                <div>
                  <label for="edit-admin-district" class="field-sub-label">Dist</label>
                  <input id="edit-admin-district" type="text" required value="${esc(d.district)}" class="input-control input-compact" />
                </div>
                <div>
                  <label for="edit-admin-state" class="field-sub-label">State</label>
                  <input id="edit-admin-state" type="text" required value="${esc(d.state)}" class="input-control input-compact" />
                </div>
                <div>
                  <label for="edit-admin-country" class="field-sub-label">Country</label>
                  <input id="edit-admin-country" type="text" required value="${esc(d.country)}" class="input-control input-compact" />
                </div>
              </div>
            </div>
          </div>

          ${ui.adminProfileError ? `<div role="alert" class="alert-error">${esc(ui.adminProfileError)}</div>` : ''}

          <div class="modal-footer" style="justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" data-action="admin-close-profile-edit">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Admin Details</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function renderAdminView(admin, admins, accounts, transactions, ui) {
  const totalDeposits = accounts.reduce((sum, a) => sum + a.balance, 0);
  const activeCount = accounts.filter((a) => a.status === 'Active').length;
  const frozenCount = accounts.filter((a) => a.status === 'Frozen').length;
  const totalWithdrawnToday = accounts.reduce((sum, a) => sum + a.withdrawnToday, 0);

  const accountQuery = ui.adminSearch.trim().toLowerCase();
  const filteredAccounts = accounts.filter((acct) => {
    if (!accountQuery) return true;
    const haystack = [
      acct.holderName,
      acct.accountNumber,
      acct.email,
      acct.phone,
      acct.accountType,
      acct.aadhaarNumber ?? '',
      acct.panNumber ?? '',
      formatAddress(acct.address),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(accountQuery);
  });

  const ledgerRows = transactions.filter((tx) => {
    if (ui.adminTxAccountFilter !== 'all' && tx.accountNumber !== ui.adminTxAccountFilter) {
      return false;
    }
    if (!accountQuery) return true;
    const acct = accounts.find((a) => a.accountNumber === tx.accountNumber);
    const haystack = [
      tx.referenceCode,
      tx.accountNumber,
      acct?.holderName ?? '',
      tx.description,
      tx.channel,
      String(tx.amount),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(accountQuery);
  });

  const editingAccount = ui.editingAccountNumber
    ? accounts.find((a) => a.accountNumber === ui.editingAccountNumber) ?? null
    : null;
  const historyAccount = ui.historyAccountNumber
    ? accounts.find((a) => a.accountNumber === ui.historyAccountNumber) ?? null
    : null;
  const editingAdmin = ui.editingAdminId
    ? admins.find((a) => a.adminId === ui.editingAdminId) ?? null
    : null;

  return `
    <div class="admin-shell">
      <header class="admin-header">
        <div class="admin-header-inner">
          <div style="display:flex;align-items:center;gap:1rem;min-width:0;">
            ${brandMarkHtml()}
            <div style="border-left:1px solid var(--border-subtle);padding-left:1rem;" class="truncate">
              <p style="font-size:0.7rem;font-weight:600;color:var(--accent-red-light);letter-spacing:0.04em;">ADMIN PORTAL</p>
              <p class="truncate" style="font-size:0.8125rem;font-weight:600;color:#fff;">
                ${esc(admin.name)} · ${esc(admin.position)} <span class="font-mono" style="color:var(--text-secondary);">(${esc(admin.adminId)})</span>
              </p>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:0.75rem;flex-shrink:0;">
            <button type="button" class="btn btn-primary" data-action="admin-open-new-modal">
              ${icons.userPlus()} New Account Open
            </button>
            <button type="button" class="btn btn-secondary" data-action="logout">
              ${icons.logout()} Logout
            </button>
          </div>
        </div>
      </header>

      <main class="admin-main">
        ${
          ui.adminNotice
            ? `<div role="status" class="alert-notice">
                <span>${esc(ui.adminNotice)}</span>
                <button type="button" class="btn-icon" style="color:#6ee7b7;" data-action="dismiss-admin-notice" aria-label="Dismiss notification">
                  ${icons.x()}
                </button>
              </div>`
            : ''
        }

        <section class="kpi-grid" aria-label="Bank vault metrics">
          <div class="kpi-card">
            <p style="font-size:0.75rem;color:var(--text-secondary);">Total Customer Balances</p>
            <p class="font-mono tabular-nums" style="margin-top:0.5rem;font-size:1.45rem;font-weight:700;color:#fff;">${esc(formatCurrency(totalDeposits))}</p>
          </div>
          <div class="kpi-card">
            <p style="font-size:0.75rem;color:var(--text-secondary);">Managed Customer Accounts</p>
            <p class="font-mono tabular-nums" style="margin-top:0.5rem;font-size:1.45rem;font-weight:700;color:#fff;">${accounts.length}</p>
            <p style="margin-top:0.2rem;font-size:0.75rem;color:var(--text-muted);">${activeCount} Active · ${frozenCount} Frozen</p>
          </div>
          <div class="kpi-card">
            <p style="font-size:0.75rem;color:var(--text-secondary);">Ledger Entries</p>
            <p class="font-mono tabular-nums" style="margin-top:0.5rem;font-size:1.45rem;font-weight:700;color:#fff;">${transactions.length}</p>
          </div>
          <div class="kpi-card">
            <p style="font-size:0.75rem;color:var(--text-secondary);">ATM Dispensed Today</p>
            <p class="font-mono tabular-nums" style="margin-top:0.5rem;font-size:1.45rem;font-weight:700;color:#fff;">${esc(formatCurrency(totalWithdrawnToday))}</p>
          </div>
        </section>

        <div class="workspace-controls">
          <div class="tablist" role="tablist" aria-label="Admin management sections">
            <button type="button" role="tab" aria-selected="${ui.adminTab === 'accounts'}" class="tab-btn ${ui.adminTab === 'accounts' ? 'active' : ''}" data-action="admin-set-tab" data-tab="accounts">Accounts Directory (${accounts.length})</button>
            <button type="button" role="tab" aria-selected="${ui.adminTab === 'transactions'}" class="tab-btn ${ui.adminTab === 'transactions' ? 'active' : ''}" data-action="admin-set-tab" data-tab="transactions">Bank-Wide Transactions (${transactions.length})</button>
            <button type="button" role="tab" aria-selected="${ui.adminTab === 'admin-profile'}" class="tab-btn ${ui.adminTab === 'admin-profile' ? 'active' : ''}" data-action="admin-set-tab" data-tab="admin-profile">Admin Details</button>
          </div>

          ${
            ui.adminTab !== 'admin-profile'
              ? `<div class="controls-group">
                  ${
                    ui.adminTab === 'transactions'
                      ? `<select id="admin-tx-account-filter" class="select-control" style="width:auto;margin-top:0;padding:0.45rem 0.75rem;font-size:0.75rem;background:var(--bg-surface);" aria-label="Filter transactions by account">
                          <option value="all" ${ui.adminTxAccountFilter === 'all' ? 'selected' : ''}>All Accounts (${transactions.length})</option>
                          ${accounts
                            .map(
                              (a) =>
                                `<option value="${esc(a.accountNumber)}" ${ui.adminTxAccountFilter === a.accountNumber ? 'selected' : ''}>${esc(a.holderName)} (${esc(a.accountNumber)})</option>`
                            )
                            .join('')}
                        </select>`
                      : ''
                  }
                  <div class="search-box">
                    <span class="search-box-icon">${icons.search()}</span>
                    <input id="admin-search-input" type="search" class="search-input" value="${esc(ui.adminSearch)}" placeholder="${ui.adminTab === 'accounts' ? 'Search name, ASFC no., Aadhaar, PAN...' : 'Search reference, holder, description...'}" aria-label="Search admin records" />
                  </div>
                  ${
                    ui.adminTab === 'transactions'
                      ? `<button type="button" class="btn btn-secondary" data-action="admin-export-csv" ${ledgerRows.length === 0 ? 'disabled' : ''}>
                          ${icons.download()} Export Ledger CSV
                        </button>`
                      : ''
                  }
                </div>`
              : ''
          }
        </div>

        ${
          ui.adminTab === 'accounts'
            ? `<div class="table-wrap">
                ${
                  filteredAccounts.length === 0
                    ? `<div style="padding:3rem;text-align:center;color:var(--text-secondary);">No customer accounts match your search.</div>`
                    : `<div class="table-scroll">
                        <table class="data-table">
                          <thead>
                            <tr>
                              <th>Account Holder</th>
                              <th>ASFC Account &amp; Card</th>
                              <th>KYC (Aadhaar, PAN &amp; Address)</th>
                              <th class="text-right">Balance &amp; ATM Limit</th>
                              <th>Status</th>
                              <th class="text-right">Admin Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${filteredAccounts
                              .map(
                                (acct) => `
                                  <tr>
                                    <td>
                                      <p style="font-weight:600;color:#fff;">${esc(acct.holderName)}</p>
                                      <p style="font-size:0.75rem;color:var(--text-secondary);">${esc(acct.email)}</p>
                                      <p class="font-mono" style="font-size:0.7rem;color:var(--text-muted);">${esc(acct.phone)}</p>
                                    </td>
                                    <td>
                                      <p class="font-mono tabular-nums" style="font-weight:600;color:#fff;">${esc(acct.accountNumber)}</p>
                                      <p class="font-mono tabular-nums" style="font-size:0.75rem;color:var(--text-secondary);">IFSC: ${esc(acct.ifscCode)} · ${esc(acct.accountType)}</p>
                                      <p class="font-mono tabular-nums" style="font-size:0.7rem;color:var(--text-muted);">${esc(formatCardNumber(acct.cardNumber, false))}</p>
                                    </td>
                                    <td>
                                      <p class="font-mono tabular-nums" style="font-size:0.75rem;color:#e4e4e7;">Aadhaar: ${esc(formatAadhaarNumber(acct.aadhaarNumber, true))}</p>
                                      <p class="font-mono" style="font-size:0.75rem;color:var(--accent-red-light);">PAN: ${esc(acct.panNumber || '—')}</p>
                                      <p style="font-size:0.75rem;color:var(--text-secondary);max-width:16rem;">${esc(formatAddress(acct.address))}</p>
                                    </td>
                                    <td class="text-right">
                                      <p class="font-mono tabular-nums" style="font-weight:700;color:#fff;">${esc(formatCurrency(acct.balance))}</p>
                                      <p class="font-mono tabular-nums" style="font-size:0.7rem;color:var(--text-muted);">
                                        Today: ${esc(formatCurrency(acct.withdrawnToday))} / ${esc(formatCurrency(acct.dailyWithdrawalLimit))}
                                      </p>
                                    </td>
                                    <td class="whitespace-nowrap">
                                      <span style="display:inline-flex;align-items:center;border-radius:0.375rem;padding:0.2rem 0.55rem;font-size:0.7rem;font-weight:600;border:1px solid ${
                                        acct.status === 'Active' ? 'var(--accent-emerald-border)' : 'var(--border-red)'
                                      };background:${acct.status === 'Active' ? 'var(--accent-emerald-bg)' : 'var(--accent-red-soft)'};color:${
                                        acct.status === 'Active' ? 'var(--accent-emerald)' : '#fca5a5'
                                      };">
                                        ${esc(acct.status)}
                                      </span>
                                    </td>
                                    <td class="text-right whitespace-nowrap">
                                      <div style="display:inline-flex;gap:0.4rem;flex-wrap:wrap;justify-content:flex-end;">
                                        <button type="button" class="btn btn-secondary" style="padding:0.35rem 0.65rem;" data-action="admin-open-edit" data-acct="${esc(acct.accountNumber)}">
                                          ${icons.pencil()} Manage Details
                                        </button>
                                        <button type="button" class="btn btn-secondary" style="padding:0.35rem 0.65rem;" data-action="admin-open-history" data-acct="${esc(acct.accountNumber)}">
                                          ${icons.history()} History
                                        </button>
                                        <button type="button" class="btn ${acct.status === 'Active' ? 'btn-danger-outline' : 'btn-primary'}" style="padding:0.35rem 0.65rem;" data-action="admin-toggle-status" data-acct="${esc(acct.accountNumber)}">
                                          ${acct.status === 'Active' ? 'Freeze' : 'Unfreeze'}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                `
                              )
                              .join('')}
                          </tbody>
                        </table>
                      </div>`
                }
              </div>`
            : ui.adminTab === 'transactions'
            ? `<div class="table-wrap">
                ${
                  ledgerRows.length === 0
                    ? `<div style="padding:3rem;text-align:center;color:var(--text-secondary);">No transactions match your filters.</div>`
                    : `<div class="table-scroll">
                        <table class="data-table">
                          <thead>
                            <tr>
                              <th>Date &amp; Time</th>
                              <th>Account</th>
                              <th>Description</th>
                              <th>Type &amp; Channel</th>
                              <th>Reference</th>
                              <th class="text-right">Amount</th>
                              <th class="text-right">Balance After</th>
                              <th class="text-right">Receipt</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${ledgerRows
                              .map((tx) => {
                                const acct = accounts.find((a) => a.accountNumber === tx.accountNumber);
                                const { sign, label, isCredit } = getTransactionSignAndLabel(
                                  tx.type,
                                  tx.adjustmentDirection
                                );
                                return `
                                  <tr>
                                    <td class="font-mono tabular-nums whitespace-nowrap" style="font-size:0.75rem;color:var(--text-secondary);">${esc(formatDateTime(tx.timestamp))}</td>
                                    <td>
                                      <p style="font-weight:600;color:#fff;">${esc(acct?.holderName ?? 'Deleted Account')}</p>
                                      <p class="font-mono tabular-nums" style="font-size:0.75rem;color:var(--text-muted);">${esc(tx.accountNumber)}</p>
                                    </td>
                                    <td style="color:#e4e4e7;">${esc(tx.description)}</td>
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
              </div>`
            : `<div style="display:flex;flex-direction:column;gap:1.5rem;">
                <div class="alert-info-red">
                  <span style="color:var(--accent-red-light);flex-shrink:0;">${icons.lock()}</span>
                  <span><strong>Restricted Admin Records:</strong> Executive administrator details (Name, Position such as MD, Phone No., Aadhaar No., PAN No., and Address) are visible and editable exclusively by authenticated ASFC Bank administrators.</span>
                </div>

                <div class="surface-card">
                  <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;border-bottom:1px solid var(--border-subtle);padding-bottom:1rem;">
                    <div>
                      <p style="font-size:0.75rem;color:var(--accent-red-light);font-weight:600;">ACTIVE SIGNED-IN ADMINISTRATOR</p>
                      <h2 style="font-size:1.25rem;font-weight:700;color:#fff;margin-top:0.25rem;">${esc(admin.name)} · ${esc(admin.position)}</h2>
                      <p style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.15rem;">${esc(admin.roleTitle)}</p>
                    </div>
                    <button type="button" class="btn btn-primary" data-action="admin-open-profile-edit" data-admin-id="${esc(admin.adminId)}">
                      ${icons.pencil()} Edit My Admin Details
                    </button>
                  </div>

                  <dl class="profile-dl">
                    <div class="profile-row">
                      <dt class="profile-dt">Admin ID</dt>
                      <dd class="profile-dd font-mono tabular-nums">${esc(admin.adminId)}</dd>
                    </div>
                    <div class="profile-row">
                      <dt class="profile-dt">Position</dt>
                      <dd class="profile-dd">${esc(admin.position)}</dd>
                    </div>
                    <div class="profile-row">
                      <dt class="profile-dt">Phone No.</dt>
                      <dd class="profile-dd font-mono tabular-nums">${esc(admin.phone)}</dd>
                    </div>
                    <div class="profile-row">
                      <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                        <dt class="profile-dt">Aadhaar No. (12-Digit KYC)</dt>
                        <button type="button" class="btn-link-red" data-action="toggle-admin-aadhaar">
                          ${ui.revealAdminAadhaar ? icons.eyeOff() : icons.eye()}
                          ${ui.revealAdminAadhaar ? 'Mask' : 'Show'}
                        </button>
                      </div>
                      <dd class="profile-dd font-mono tabular-nums">${esc(formatAadhaarNumber(admin.aadhaarNumber, ui.revealAdminAadhaar))}</dd>
                    </div>
                    <div class="profile-row">
                      <dt class="profile-dt">PAN No.</dt>
                      <dd class="profile-dd font-mono tabular-nums" style="text-transform:uppercase;">${esc(admin.panNumber)}</dd>
                    </div>
                    <div class="col-span-2">
                      <dt class="profile-dt">Address (Vill, Dist, State, Country)</dt>
                      <dd class="address-box">
                        <div>
                          <span style="display:block;font-size:0.6875rem;color:var(--text-muted);">Vill</span>
                          <span style="display:block;margin-top:0.15rem;font-size:0.75rem;font-weight:500;color:#f4f4f5;">${esc(admin.address?.village || '—')}</span>
                        </div>
                        <div>
                          <span style="display:block;font-size:0.6875rem;color:var(--text-muted);">Dist</span>
                          <span style="display:block;margin-top:0.15rem;font-size:0.75rem;font-weight:500;color:#f4f4f5;">${esc(admin.address?.district || '—')}</span>
                        </div>
                        <div>
                          <span style="display:block;font-size:0.6875rem;color:var(--text-muted);">State</span>
                          <span style="display:block;margin-top:0.15rem;font-size:0.75rem;font-weight:500;color:#f4f4f5;">${esc(admin.address?.state || '—')}</span>
                        </div>
                        <div>
                          <span style="display:block;font-size:0.6875rem;color:var(--text-muted);">Country</span>
                          <span style="display:block;margin-top:0.15rem;font-size:0.75rem;font-weight:500;color:#f4f4f5;">${esc(admin.address?.country || '—')}</span>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div class="surface-card">
                  <h3 style="font-size:1rem;font-weight:600;color:#fff;">Authorized Administrators Directory</h3>
                  <div class="grid-2" style="margin-top:1rem;">
                    ${admins
                      .map(
                        (adm) => `
                          <div class="feature-item" style="display:flex;flex-direction:column;gap:0.65rem;">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;">
                              <div>
                                <p style="font-size:0.9375rem;font-weight:600;color:#fff;">${esc(adm.name)} · <span style="color:var(--accent-red-light);">${esc(adm.position)}</span></p>
                                <p class="font-mono" style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.15rem;">${esc(adm.adminId)}</p>
                              </div>
                              <button type="button" class="btn btn-secondary" style="padding:0.3rem 0.65rem;" data-action="admin-open-profile-edit" data-admin-id="${esc(adm.adminId)}">
                                ${icons.pencil()} Edit
                              </button>
                            </div>
                            <div style="font-size:0.75rem;color:var(--text-secondary);display:grid;gap:0.25rem;">
                              <p>Phone: <span class="font-mono" style="color:#e4e4e7;">${esc(adm.phone)}</span></p>
                              <p>Aadhaar: <span class="font-mono" style="color:#e4e4e7;">${esc(formatAadhaarNumber(adm.aadhaarNumber, ui.revealAdminAadhaar))}</span> · PAN: <span class="font-mono" style="color:#e4e4e7;">${esc(adm.panNumber)}</span></p>
                              <p>Address: <span style="color:#e4e4e7;">${esc(formatAddress(adm.address))}</span></p>
                            </div>
                          </div>
                        `
                      )
                      .join('')}
                  </div>
                </div>
              </div>`
        }
      </main>
    </div>

    ${renderManageAccountModal(editingAccount, ui)}
    ${renderNewAccountModal(ui)}
    ${renderAccountHistoryModal(historyAccount, transactions, ui)}
    ${renderEditAdminModal(editingAdmin, ui)}
  `;
}
