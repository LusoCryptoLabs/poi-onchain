// Floor 2: a key, and the address it stands for.
//
// The address is public: anyone may read it and pay it. The key signs, and stays where it was made.
// This example makes a testnet key in `.key` (git ignores it) and prints only the address.
// In a browser the player picks a wallet instead; see browser/connect.ts.
import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { KEY_FILE, ccc, client, signer } from '../src/lib.ts';

if (!existsSync(KEY_FILE)) {
  writeFileSync(KEY_FILE, ccc.hexFrom(randomBytes(32)), { mode: 0o600 });
  console.log(`A new testnet key is in ${KEY_FILE}. Keep it there; it is never printed.`);
}
const s = signer();
const address = await s.getRecommendedAddressObj();
const balance = await client().getBalanceSingle(address.script);
console.log('address:', address.toString());
console.log('balance:', ccc.fixedPointToString(balance), 'CKB');
