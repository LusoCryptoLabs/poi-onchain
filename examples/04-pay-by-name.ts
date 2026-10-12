// Floor 4: pay a name, not an address. The name's CKB record (address.309) says where the money
// goes, read from the chain just before paying; a copy kept anywhere else is never paid.
//
// Usage: npm run pay-by-name [label] [--send]
// (maria and 100 CKB by default; without --send the transaction is built and signed, not sent)
import { arg, ccc, client, names, recordsOf, sending, short, signer } from '../src/lib.ts';

const label = arg('maria')!;
const amount = 100;
const { cells } = names();
const a = await cells.getAccount(label);
const to = a ? recordsOf(a).find((r) => r.key === 'address.309')?.text : undefined;
if (!to) {
  console.log(`${label}.cell has no CKB address on it.`);
  process.exit(1);
}
console.log(`Pay to: ${label}.cell -> ${short(to)}`);
const s = signer();
const lock = (await ccc.Address.fromString(to, client())).script;
const tx = ccc.Transaction.from({ outputs: [{ lock, capacity: ccc.fixedPointFrom(amount) }], outputsData: ['0x'] });
await tx.completeInputsByCapacity(s);
await tx.completeFeeBy(s, 1000);
const signed = await s.signTransaction(tx);
console.log(`built: ${amount} CKB to ${label}.cell, ${signed.inputs.length} input(s), ${signed.hash()}`);
if (!sending) console.log('not sent (add --send)');
else console.log('sent:', await client().sendTransaction(signed));
