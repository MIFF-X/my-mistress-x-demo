import { sendTribute } from './send-tribute.js';

export function createTributeFlow({ toUser, amount = 25 } = {}) {
  if (!toUser) {
    throw new Error('Tribute flow requires a target user');
  }

  sendTribute(toUser, amount);
  return {
    targetUserId: toUser.id,
    targetUserName: toUser.name,
    amount,
    status: 'recorded',
  };
}
