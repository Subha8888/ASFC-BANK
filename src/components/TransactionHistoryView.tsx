import { useState } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import type { BankAccount, TransactionRecord } from '../types/bank';
import {
  filterTransactions,
  formatCurrency,
  formatDateTime,
  generateTransactionsCsv,
  getTransactionSignAndLabel,
  type TransactionFilter,
} from '../utils/banking';

interface TransactionHistoryViewProps {
  account: BankAccount;
  transactions: TransactionRecord[];
  onOpenReceipt: (tx: TransactionRecord) => void;
}

const FILTER_TABS: { id: TransactionFilter; label: string }[] = [
  { id: 'all', label: 'All Activity' },
  { id: 'withdrawals', label: 'Withdrawals' },
  { id: 'deposits', label: 'Deposits' },
  { id: 'transfers', label: 'Transfers' },
];

export function TransactionHistoryView({
  account,
  transactions,
  onOpenReceipt,
}: TransactionHistoryViewProps) {
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const visibleTransactions = filterTransactions(
    transactions,
    account.accountNumber,
    filter,
    searchQuery
  );

  const handleDownloadCsv = () => {
    const csvContent = generateTransactionsCsv(visibleTransactions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asfc-statement-${account.accountNumber}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Transaction History</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Complete ATM &amp; transfer ledger for {account.holderName} · {account.accountNumber}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadCsv}
          disabled={visibleTransactions.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#121216] px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex flex-wrap rounded-lg border border-zinc-800 bg-[#121216] p-1"
          role="tablist"
          aria-label="Filter transactions by type"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                filter === tab.id ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search transactions"
            placeholder="Search reference or description..."
            className="w-full rounded-lg border border-zinc-800 bg-[#121216] py-2 pl-9 pr-3 text-xs text-white placeholder:text-zinc-500 focus:border-red-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#121216]">
        {visibleTransactions.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-zinc-300">No matching transactions found</p>
            <p className="mt-1 text-xs text-zinc-500">
              Try switching the activity filter or clearing your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0D0D11] text-xs font-medium text-zinc-400">
                  <th className="px-5 py-3.5">Date &amp; Time</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Type &amp; Channel</th>
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-right">Balance</th>
                  <th className="px-5 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {visibleTransactions.map((tx) => {
                  const { sign, label, isCredit } = getTransactionSignAndLabel(
                    tx.type,
                    tx.adjustmentDirection
                  );
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-xs text-zinc-400 font-mono tabular-nums whitespace-nowrap">
                        {formatDateTime(tx.timestamp)}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-white">{tx.description}</p>
                        {tx.counterpartyAccount && (
                          <p className="text-xs text-zinc-500 font-mono tabular-nums">
                            Account {tx.counterpartyAccount}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-zinc-400 whitespace-nowrap">
                        {label} · {tx.channel}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-zinc-400 tabular-nums whitespace-nowrap">
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
                      <td className="px-5 py-3.5 text-right font-mono text-xs text-zinc-300 tabular-nums whitespace-nowrap">
                        {formatCurrency(tx.balanceAfter)}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onOpenReceipt(tx)}
                          aria-label={`View receipt ${tx.referenceCode}`}
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
  );
}
