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
  serial: string;      // full computed serial, e.g. "29-8448969"
  usedAt: string;      // ISO date-time string
}

export interface PrescriptionBlock {
  id: string;
  filename: string;
  fileUri: string;          // file:// URI of the local copy
  importedAt: string;       // ISO date-time
  blockSerial: string;      // FULL serial of the FIRST prescription, e.g. "29-8448968"
  totalRecetas: number;     // total pages / prescriptions in the PDF
  usedCount: number;        // = history.length
  nextIndex: number;        // 0-based index of the next prescription to use
  encryptedPwd: string;     // AES-256 encrypted PDF password; empty if none
  history: UsedReceta[];    // ordered list of used prescriptions
  isActive: boolean;        // whether this block is the active one for new prescriptions
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function generateBlockId(): string {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Parse a prescription number to extract base and number.
 * Examples:
 *   "29-8448968" → { base: "29", number: 8448968 }
 *   "B2024-001" → { base: "B2024", number: 1 }
 *   "12345" → { base: "", number: 12345 }
 */
function parsePrescriptionNumber(serial: string): { base: string; number: number } {
  // Try to match pattern: PREFIX-NUMBER or PREFIX-SUBNUMBER-NUMBER
  const match = serial.match(/^(.+?)-(\d+)$/);
  if (match) {
    return {
      base: match[1],
      number: parseInt(match[2], 10),
    };
  }
  
  // If no dash, try to parse as pure number
  const numMatch = serial.match(/^(\d+)$/);
  if (numMatch) {
    return {
      base: '',
      number: parseInt(numMatch[1], 10),
    };
  }
  
  // Fallback: treat whole thing as base with number 0
  return {
    base: serial,
    number: 0,
  };
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
   * The blockSerial is the FULL number of the FIRST prescription.
   * We parse it to extract base and starting number, then add the page offset.
   * 
   * Examples:
   *   blockSerial="29-8448968", pageIndex=0 → "29-8448968"
   *   blockSerial="29-8448968", pageIndex=1 → "29-8448969"
   *   blockSerial="29-8448968", pageIndex=2 → "29-8448970"
   */
  computeSerial(blockSerial: string, pageIndex: number): string {
    const parsed = parsePrescriptionNumber(blockSerial);
    const newNumber = parsed.number + pageIndex;
    
    if (parsed.base) {
      return `${parsed.base}-${newNumber}`;
    } else {
      return String(newNumber);
    }
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

  /**
   * Set a block as active for new prescriptions.
   * Only one block can be active at a time.
   * Can only activate blocks with available prescriptions.
   */
  async setActive(id: string): Promise<void> {
    const list = await readAll();
    const block = list.find(b => b.id === id);
    
    if (!block) {
      throw new Error('Talonario no encontrado');
    }
    
    if (block.nextIndex >= block.totalRecetas) {
      throw new Error('Este talonario no tiene recetas disponibles');
    }
    
    // Deactivate all blocks
    list.forEach(b => b.isActive = false);
    
    // Activate the selected block
    block.isActive = true;
    
    await writeAll(list);
  },

  /**
   * Get the currently active block
   */
  async getActive(): Promise<PrescriptionBlock | null> {
    const list = await readAll();
    return list.find(b => b.isActive) || null;
  },
};
