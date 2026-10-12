// Medals written on a name. The game signs a line of words with a key of its own (it holds no CKB),
// and the name's owner writes the result as a `poi.medals` record. Anyone checks it with CCC and the
// game's published key; words copied to another name, or changed by hand, do not check.
//
// Usage: npm run seal [label]   (with a label: that name's record on testnet, against POI's key)
import { randomBytes } from 'node:crypto';
import { arg, ccc, client, names, recordsOf } from '../src/lib.ts';

const WORDS = /^Proof of Self medals of ([a-z0-9-]{1,63})\.cell on the CKB testnet: .*\. Sealed \d{4}-\d{2}-\d{2}\.$/;

/** A record checked: sealed by `publicKey`, for `label`, unchanged. */
function check(record: string, label: string, publicKey: string): boolean {
  const [words, k, s] = record.split('\n');
  const key = /^key (0x[0-9a-f]{66})$/.exec(k ?? '')?.[1];
  const sig = /^sig (0x[0-9a-f]{130})$/.exec(s ?? '')?.[1];
  const named = WORDS.exec(words ?? '')?.[1];
  if (!words || !key || !sig || named !== label || key !== publicKey) return false;
  try {
    return ccc.verifyMessageCkbSecp256k1(words, sig, key);
  } catch {
    return false;
  }
}

const label = arg();
if (label) {
  // The game publishes its key with every answer about a name's medals.
  const { publicKey } = (await (await fetch(`https://poi.cellula.id/api/medals/onname?name=${label}`)).json()) as { publicKey: string };
  const a = await names().cells.getAccount(label);
  const record = a ? recordsOf(a).find((r) => r.key === 'poi.medals')?.text : undefined;
  console.log(record ? `${label}.cell's medals ${check(record, label, publicKey) ? 'check' : 'do NOT check'} against POI's key` : `${label}.cell carries no poi.medals record`);
  process.exit(0);
}

// The whole round, with a seal key made here.
const seal = new ccc.SignerCkbPrivateKey(client(), ccc.hexFrom(randomBytes(32)));
const words = 'Proof of Self medals of sofia.cell on the CKB testnet: climb (2026-10-06), quick (2026-10-06). Sealed 2026-10-09.';
const record = `${words}\nkey ${seal.publicKey}\nsig ${await seal.signMessageRaw(words)}`;
console.log(record, '\n');
console.log('for sofia.cell:          ', check(record, 'sofia', seal.publicKey));
console.log('copied to lunarx.cell:   ', check(record.replace('sofia.cell', 'lunarx.cell'), 'lunarx', seal.publicKey));
console.log('a medal added by hand:   ', check(record.replace('quick (2026-10-06)', 'quick (2026-10-06), week (2026-10-05)'), 'sofia', seal.publicKey));
