import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

// ─── AES key for local password encryption ────────────────────────────────────
// Protects the PDF password at rest in AsyncStorage. All data is device-local.
const AES_KEY = 'PrescriptorPro_RX_Vault_v1_2026';

const STORAGE_KEY = '@rx_blocks_v1';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsedReceta {
  pageIndex: number;   // 0-based page index in the PDF
  serial: string;      // full computed serial, e.g. "B2024-001-003"
  usedAt: string;      // ISO date-time string
}

export interface PrescriptionBlock {
  id: string;
  filename: string;
  fileUri: string;          // file:// URI of the local copy
  importedAt: string;       // ISO date-time
  blockSerial: string;      // base serial of the block, e.g. "B2024-001"
  totalRecetas: number;     // total pages / prescriptions in the PDF
  usedCount: number;        // = history.length
  nextIndex: number;        // 0-based index of the next prescription to use
  encryptedPwd: string;     // AES-256 encrypted PDF password; empty if none
  history: UsedReceta[];    // ordered list of used prescriptions
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function generateBlockId(): string {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function readAll(): Promise<PrescriptionBlock[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as PrescriptionBlock[]) : [];
}

async function writeAll(blocks: PrescriptionBlock[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const PrescriptionBlockService = {
  /**
   * Encrypt a plain-text PDF password using AES-256.
   * Empty string input returns empty string (no password).
   */
  encryptPwd(plain: string): string {
    if (!plain) return '';
    return CryptoJS.AES.encrypt(plain, AES_KEY).toString();
  },

  /**
   * Decrypt an AES-256 cipher back to plain text.
   */
  decryptPwd(cipher: string): string {
    if (!cipher) return '';
    try {
      return CryptoJS.AES.decrypt(cipher, AES_KEY).toString(CryptoJS.enc.Utf8);
    } catch {
      return '';
    }
  },

  /**
   * Build the individual serial number for a given page index.
   * e.g. ("B2024-001", 4) → "B2024-001-005"
   */
  computeSerial(blockSerial: string, pageIndex: number): string {
    return `${blockSerial}-${String(pageIndex + 1).padStart(3, '0')}`;
  },

  // ── CRUD ────────────────────────────────────────────────────────────────────

  getAll: readAll,

  async add(block: PrescriptionBlock): Promise<void> {
    const list = await readAll();
    list.unshift(block);
    await writeAll(list);
  },

  async update(updated: PrescriptionBlock): Promise<void> {
    const list = await readAll();
    const idx = list.findIndex(b => b.id === updated.id);
    if (idx >= 0) list[idx] = updated;
    await writeAll(list);
  },

  async remove(id: string): Promise<void> {
    const list = await readAll();
    await writeAll(list.filter(b => b.id !== id));
  },

  // ── Business logic ──────────────────────────────────────────────────────────

  /**
   * Mark the current `nextIndex` prescription as used, advance the pointer,
   * and return the recorded entry.
   */
  async markNextUsed(id: string): Promise<UsedReceta | null> {
    const list = await readAll();
    const block = list.find(b => b.id === id);
    if (!block || block.nextIndex >= block.totalRecetas) return null;

    const entry: UsedReceta = {
      pageIndex: block.nextIndex,
      serial: this.computeSerial(block.blockSerial, block.nextIndex),
      usedAt: new Date().toISOString(),
    };

    block.history.push(entry);
    block.usedCount = block.history.length;
    block.nextIndex += 1;
    await writeAll(list);
    return entry;
  },

  /**
   * Manually set which prescription (0-based) is the next to use.
   * Clamped to [0, totalRecetas - 1].
   */
  async setNextIndex(id: string, zeroBasedIndex: number): Promise<void> {
    const list = await readAll();
    const block = list.find(b => b.id === id);
    if (!block) return;
    block.nextIndex = Math.max(0, Math.min(zeroBasedIndex, block.totalRecetas - 1));
    await writeAll(list);
  },
};
