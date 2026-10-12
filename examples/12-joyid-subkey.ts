// The town's door again, for a JoyID account used on a second device. That passkey is a sub key,
// and its signature names the key, not the account. With the account's address (the wallet gives
// it), the CoTA aggregator says whether the key belongs to it. Together: the signature fits the
// words, the address's lock is the name's owner, and the key is one of that account's sub keys.
//
// Usage: npm run joyid-subkey [<joyid-address> <public-key>]   (mainnet; a made-up account by default)
import { randomBytes } from 'node:crypto';
import { ccc, client } from '../src/lib.ts';
import { COTA_AGGREGATOR, isJoyIdSubKey } from '../src/joyid.ts';

const c = client('mainnet');
let [address, publicKey] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!address || !publicKey) {
  // A JoyID account nobody has, and a key nobody registered: the aggregator does not know it.
  const joy = await c.getKnownScript(ccc.KnownScript.JoyId);
  const lock = ccc.Script.from({ codeHash: joy.codeHash, hashType: joy.hashType, args: ccc.hexFrom(new Uint8Array([0, 1, ...randomBytes(20)])) });
  address = ccc.Address.fromScript(lock, c).toString();
  publicKey = ccc.hexFrom(new Uint8Array([4, ...randomBytes(64)]));
}
console.log('account:', address.slice(0, 14) + '...' + address.slice(-8));
console.log('a sub key of it:', await isJoyIdSubKey(c, address, publicKey, COTA_AGGREGATOR.mainnet));
