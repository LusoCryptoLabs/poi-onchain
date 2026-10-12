import { ccc } from '@ckb-ccc/core';

/**
 * A JoyID passkey added on a second device is a sub key. It signs as itself, and the account's lock
 * (made from the first device's key) accepts it through CoTA, where JoyID keeps each account's sub
 * keys. A signature carries only the key, not the account, so a check that derives the lock from
 * the signer's key finds nothing for it. Given the account's address, JoyID's CoTA aggregator says
 * whether the key is one of its sub keys: the same question CCC asks before a sub key signs a
 * transaction. The aggregator's answer is trusted here; its proof is not checked against the chain.
 */

export const COTA_AGGREGATOR = { mainnet: 'https://cota.nervina.dev/mainnet-aggregator', testnet: 'https://cota.nervina.dev/aggregator' };

/** Whether `publicKey` is a sub key of the JoyID account at `address`. */
export async function isJoyIdSubKey(client: ccc.Client, address: string, publicKey: string, aggregator: string): Promise<boolean> {
  const lock = (await ccc.Address.fromString(address, client)).script;
  const joy = await client.getKnownScript(ccc.KnownScript.JoyId);
  if (lock.codeHash !== joy.codeHash || lock.hashType !== joy.hashType) throw new Error('not a JoyID address');
  const pubkey = (publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`) as `0x${string}`;
  const res = await fetch(aggregator, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'generate_subkey_unlock_smt', params: { alg_index: 1, pubkey_hash: ccc.hashCkb(pubkey).slice(0, 42), lock_script: ccc.hexFrom(lock.toBytes()) } }),
  });
  const body = (await res.json()) as { result?: { unlock_entry?: string }; error?: { message?: string } };
  return !body.error && typeof body.result?.unlock_entry === 'string' && body.result.unlock_entry.length > 2;
}
