// Floor 4, over Fiber: a name that publishes a pay link (`fiber.link`) can be paid in an instant
// from a channel. Before paying, the payer checks that the link was published by the name's owner
// now, and that the invoice the gateway hands over was signed by the link's key.
//
// Usage: npm run fiber-link [label]   (maria by default)
import { randomBytes } from 'node:crypto';
import { arg, ccc, names, recordsOf } from '../src/lib.ts';
import { payLinkOf, readPayLink, signPayLink, verifyPayLink } from '../src/paylink.ts';

const label = arg('maria')!;
const a = await names().cells.getAccount(label);
if (!a) throw new Error(`${label}.cell is not registered`);
const records = recordsOf(a);
const text = records.find((r) => r.key === 'fiber.link')?.text;
if (!text) {
  console.log(`${label}.cell publishes no pay link`);
  process.exit(0);
}
const link = payLinkOf(records, a.ownerLockHash);
console.log(`${label}.cell pay link ${readPayLink(text)?.id}:`, link ? 'published by its owner now' : 'NOT by its owner now: do not pay');

// An invoice's check, with a key made here standing in for the payee's.
const secret = ccc.hexFrom(randomBytes(32));
const probe = ccc.hashCkb(ccc.bytesFrom('probe', 'utf8'));
const demo = { id: 'a1b2c3d4e5f6', key: ccc.recoverMessageSecp256k1(probe, ccc.signMessageSecp256k1(probe, secret)), holder: ccc.hexFrom(randomBytes(32)) };
const hash = ccc.hexFrom(randomBytes(32));
const sig = signPayLink(demo.id, hash, 100_000_000n, secret);
console.log('invoice of 1 CKB, signed by the payee:', verifyPayLink(demo, hash, 100_000_000n, sig));
console.log('the same signature for 10 CKB:        ', verifyPayLink(demo, hash, 1_000_000_000n, sig));
