// A record on a name you own, the others kept. editRecords replaces the whole set, so the new one
// goes in beside what the name says now, and `basedOn` refuses the edit if the name changed in
// between. Records sit in the transaction's witness: writing one costs a fee and holds no CKB.
//
// Usage: npm run write-record <label> <key> <text> [--send]
import { cellula, names, sending, signer } from '../src/lib.ts';

const [label, key, ...words] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!label || !key || !words.length) throw new Error('usage: npm run write-record <label> <key> <text> [--send]');
const { cells } = names();
const a = await cells.getAccount(label);
if (!a) throw new Error(`${label}.cell is not registered`);
const records = [...a.records.filter((r) => r.key !== key), { key, label: '', value: cellula.textToValue(words.join(' ')), ttl: 300 }];
console.log(`${label}.cell would carry ${records.length} record(s): ${records.map((r) => r.key).join(', ')}`);
if (!sending) {
  console.log('not sent (add --send; the key must own or manage the name)');
  process.exit(0);
}
console.log('sent:', await cells.editRecords(signer(), label, records, { basedOn: a.witnessHash }));
