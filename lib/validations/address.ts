/**
 * Address Validation Schemas
 */

import { z } from 'zod';

/**
 * Ethereum address validation schema
 * Accepts: 0x followed by 40 hex characters
 */
export const addressSchema = z
  .string()
  .min(1)
  .refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), {
    message: 'Invalid Ethereum address format',
  });

/**
 * ENS name validation schema
 * Accepts: valid ENS names like "vitalik.eth" or "vitalik"
 */
export const ensNameSchema = z
  .string()
  .min(1)
  .max(255)
  .refine((val) => /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*(\.eth)?$/.test(val), {
    message: 'Invalid ENS name format',
  });

/**
 * Domain validation schema
 * Accepts: valid domain names
 */
export const domainSchema = z
  .string()
  .min(1)
  .max(500)
  .refine((val) => {
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$/;
    return domainRegex.test(val);
  }, {
    message: 'Invalid domain format',
  });
