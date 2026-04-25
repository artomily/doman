/**
 * Deterministic keccak256 hashing for reason data.
 *
 * IMPORTANT: Key order and array sort order are fixed here to ensure the
 * hash produced on the frontend always matches what is stored in the DB.
 * Never change the key order or sort without a migration + rehash.
 */

import { keccak256, toBytes } from 'viem';

export interface ReasonData {
  selectedReasons: string[];
  customText: string;
}

/**
 * Produce a canonical JSON string from a ReasonData object.
 * selectedReasons are sorted alphabetically to guarantee determinism
 * regardless of the order the user checked boxes.
 */
export function canonicalise(data: ReasonData): string {
  return JSON.stringify({
    selectedReasons: [...data.selectedReasons].sort(),
    customText: data.customText,
  });
}

/**
 * Hash reason data to a bytes32-compatible 0x-prefixed hex string.
 */
export function hashReasonData(data: ReasonData): `0x${string}` {
  const json = canonicalise(data);
  return keccak256(toBytes(json));
}
