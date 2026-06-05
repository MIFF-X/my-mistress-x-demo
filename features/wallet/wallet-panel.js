import { walletApi } from './wallet-api.js';
import { createReportButton } from '../dashboard/report-action.js';

function formatCredits(value) {
  const number = Number(value || 0);
  return `${number.toFixed(2)} credits`;
}

function createButton(label, className = 'button-secondary') {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  return button;
}

function createTransactionRow(transaction, statusEl) {
  const row = document.createElement('div');
  row.className = 'wallet-transaction-row panel';

  const title = document.createElement('strong');
  title.innerText = transaction.reason || transaction.type || 'Wallet transaction';

  const meta = document.createElement('p');
  meta.innerText = `${transaction.direction || 'OUT'} · ${formatCredits(transaction.amount)} · ${transaction.createdAt || ''}`;

  const reportBtn = createReportButton({
    label: 'Report transaction',
    title: `Reported wallet transaction: ${transaction.reason || transaction.type || transaction.id}`,
    description: 'Wallet/ledger transaction reported from wallet panel.',
    targetType: 'ledger',
    targetId: transaction.id,
    targetUserId: transaction.receiverUserId || transaction.senderUserId,
    area: 'LEDGER',
    priority: 'HIGH',
    metadata: {
      amount: transaction.amount,
      transactionType: transaction.type,
      direction: transaction.direction,
      senderUserId: transaction.senderUserId,
      receiverUserId: transaction.receiverUserId,
    },
    onCreated: () => {
      if (statusEl) statusEl.innerText = 'Transaction report sent to moderation.';
    },
    onError: (error) => {
      if (statusEl) statusEl.innerText = error.message || 'Could not report transaction.';
    },
  });

  row.appendChild(title);
  row.appendChild(meta);
  row.appendChild(reportBtn);

  return row;
}

export function createWalletPanel() {
  const shell = document.createElement('section');
  shell.className = 'page-shell wallet-panel';

  const title = document.createElement('h2');
  title.innerText = 'Wallet';

  const balancePanel = document.createElement('div');
  balancePanel.className = 'panel stat-card';

  const balanceValue = document.createElement('h1');
  balanceValue.innerText = 'Loading...';

  const balanceLabel = document.createElement('p');
  balanceLabel.innerText = 'Available Balance';

  balancePanel.appendChild(balanceValue);
  balancePanel.appendChild(balanceLabel);

  const actions = document.createElement('div');
  actions.className = 'button-row';

  const refreshBtn = createButton('Refresh Balance');
  const testCreditBtn = createButton('Create Top-Up Intent +100', 'button-primary');

  actions.appendChild(refreshBtn);
  actions.appendChild(testCreditBtn);

  const transactionsTitle = document.createElement('h3');
  transactionsTitle.innerText = 'Recent Transactions';

  const transactionsList = document.createElement('div');
  transactionsList.className = 'wallet-transactions-list';

  const status = document.createElement('p');
  status.className = 'wallet-status';

  const error = document.createElement('p');
  error.className = 'form-error';
  error.style.display = 'none';

  async function loadWallet() {
    error.style.display = 'none';
    transactionsList.innerHTML = '';

    try {
      const balanceResult = await walletApi.getBalance();
      const rawBalance = balanceResult.balance ?? balanceResult;
      balanceValue.innerText = formatCredits(rawBalance);

      const transactions = await walletApi.getTransactions();

      if (!Array.isArray(transactions) || transactions.length === 0) {
        const empty = document.createElement('p');
        empty.innerText = 'No wallet transactions yet.';
        transactionsList.appendChild(empty);
        return;
      }

      transactions.slice(0, 10).forEach((transaction) => {
        transactionsList.appendChild(createTransactionRow(transaction, status));
      });
    } catch (err) {
      error.innerText = err.message || 'Could not load wallet.';
      error.style.display = 'block';
      balanceValue.innerText = 'Unavailable';
    }
  }

  refreshBtn.onclick = loadWallet;

  testCreditBtn.onclick = async () => {
    error.style.display = 'none';

    try {
      const result = await walletApi.credit({ amount: 100, reason: 'frontend-test-credit' });
      status.innerText = `Top-up intent ${result?.intent?.id || 'created'} is ${result?.intent?.status || 'pending_manual_verification'}.`;
      await loadWallet();
    } catch (err) {
      error.innerText = err.message || 'Could not create top-up intent.';
      error.style.display = 'block';
    }
  };

  shell.appendChild(title);
  shell.appendChild(balancePanel);
  shell.appendChild(actions);
  shell.appendChild(status);
  shell.appendChild(error);
  shell.appendChild(transactionsTitle);
  shell.appendChild(transactionsList);

  loadWallet();

  return shell;
}
