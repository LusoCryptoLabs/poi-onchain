import { ccc } from '@ckb-ccc/core';

/**
 * A Fiber pay link as a .cell name publishes it in its `fiber.link` record, in the format cellula.id
 * uses: `<id>:<key>:<holder>`, hex without 0x. The id names the link at a hosted LSP's gateway,
 * which hands a payer an invoice the payee made ahead. The gateway is not trusted to say whose an
 * invoice is: the payee signs each invoice's hash and amount with `key`, and a payer pays only with
 * a good signature. `holder` is the lock that held the name when the link was published, so a link
 * left by somebody who no longer holds the name is not offered.
 */

type Hex = `0x${string}`;

export interface PayLink {
  id: string;
  /** Compressed secp256k1 public key, 33 bytes. */
  key: Hex;
  /** Lock hash, 32 bytes. */
  holder: Hex;
}

export const PAY_LINK_KEY = 'fiber.link';

const TEXT = /^([0-9a-f]{12}):(0[23][0-9a-f]{64}):([0-9a-f]{64})$/;

/** A record's text read as a link, or null if it is not one. */
export function readPayLink(text: string): PayLink | null {
  const m = TEXT.exec(text.trim());
  return m ? { id: m[1]!, key: `0x${m[2]!}`, holder: `0x${m[3]!}` } : null;
}

/** The link to pay a name by: only while its owner now (the name's 20-byte owner id) is the one who published it. */
export function payLinkOf(records: { key: string; text: string }[], owner: string): PayLink | null {
  const text = records.find((r) => r.key === PAY_LINK_KEY)?.text;
  const link = text ? readPayLink(text) : null;
  return link && owner.length === 42 && link.holder.slice(0, 42) === owner.toLowerCase() ? link : null;
}

/** What a link's key signs for one invoice. */
function message(linkId: string, paymentHash: string, amount: bigint): Hex {
  return ccc.hashCkb(ccc.bytesFrom(`cellula.id fiber meal:${linkId}:${paymentHash.toLowerCase()}:${amount}`, 'utf8'));
}

/** The payee's signature of one invoice. */
export function signPayLink(linkId: string, paymentHash: Hex, amount: bigint, secret: Hex): Hex {
  return ccc.signMessageSecp256k1(message(linkId, paymentHash, amount), secret);
}

/** Whether an invoice's hash and amount were signed by the link's payee. */
export function verifyPayLink(link: PayLink, paymentHash: string, amount: bigint, signature: string): boolean {
  try {
    return ccc.verifyMessageSecp256k1(message(link.id, paymentHash, amount), signature as Hex, link.key);
  } catch {
    return false;
  }
}
