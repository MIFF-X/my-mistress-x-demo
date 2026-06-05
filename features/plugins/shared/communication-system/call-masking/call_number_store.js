// Call masking number store adapter for Mistress-X.
//
// Local preview uses a process-local Map only when no database adapter is provided.
// Production must provide a database-backed implementation that encrypts numbers at rest.

const previewStore = new Map();

function createCallNumberStore(options = {}) {
  const db = options.db;
  const crypto = options.crypto;

  async function encryptPhoneNumber(phoneNumber) {
    if (crypto?.encrypt) return crypto.encrypt(phoneNumber);
    return phoneNumber;
  }

  async function decryptPhoneNumber(storedPhoneNumber) {
    if (crypto?.decrypt) return crypto.decrypt(storedPhoneNumber);
    return storedPhoneNumber;
  }

  return {
    async setMistressNumber({ mistressId, phoneNumber }) {
      if (!mistressId || !phoneNumber) throw new Error('Missing mistressId or phoneNumber');
      const encryptedPhoneNumber = await encryptPhoneNumber(phoneNumber);

      if (db?.mistressCallNumber?.upsert) {
        return db.mistressCallNumber.upsert({
          where: { mistressId },
          update: { encryptedPhoneNumber, updatedAt: new Date() },
          create: { mistressId, encryptedPhoneNumber },
        });
      }

      previewStore.set(mistressId, encryptedPhoneNumber);
      return { mistressId, storage: 'preview_memory' };
    },

    async getMistressNumber(mistressId) {
      if (!mistressId) return null;

      if (db?.mistressCallNumber?.findUnique) {
        const row = await db.mistressCallNumber.findUnique({ where: { mistressId } });
        return row?.encryptedPhoneNumber ? decryptPhoneNumber(row.encryptedPhoneNumber) : null;
      }

      const storedPhoneNumber = previewStore.get(mistressId);
      return storedPhoneNumber ? decryptPhoneNumber(storedPhoneNumber) : null;
    },

    getMode() {
      return db?.mistressCallNumber ? 'database' : 'preview_memory';
    },
  };
}

module.exports = { createCallNumberStore };
