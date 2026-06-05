import { getSocket } from '../../services/socket';

const MONEY_EVENT_NAMES = [
  'wallet.event',
  'wallet.transactionCreated',
  'system.walletEvent',
  'money.pulse',
];

export function connectMoneyFeed(onEvent) {
  const socket = getSocket();

  const handler = (payload) => {
    onEvent(payload);
  };

  MONEY_EVENT_NAMES.forEach((eventName) => {
    socket.on(eventName, handler);
  });

  return {
    close() {
      MONEY_EVENT_NAMES.forEach((eventName) => {
        socket.off(eventName, handler);
      });
    },
  };
}
