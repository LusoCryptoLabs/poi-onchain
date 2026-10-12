// Floor 7: a name of your own, in two steps. The commit hides the name (100 CKB held until the
// reveal), so nobody watching can take it first. A minute later by the chain's median time (which
// trails real time, so it is a few minutes), the reveal registers it with your CKB address as a
// record. Then the name signs its first words.
//
// Usage: npm run register <label> [--send]   (without --send: is it free, and what it costs)
import { arg, cellula, names, sending, signer } from '../src/lib.ts';

const label = arg();
if (!label || !cellula.isValidLabel(label)) throw new Error('usage: npm run register <label> [--send]');
const { cells, ns } = names();
const [{ available }, fee] = await Promise.all([cells.availability(label, { predecessor: false }), cells.effectiveFeeCkb(label, 1)]);
console.log(`${label}.cell: ${available ? 'free' : 'taken'}; a year is ${fee} CKB, and ${cellula.registerCapacityCkb(label)} CKB stays in the name's cell`);
if (!available || !sending) process.exit(0);

const s = signer();
const address = (await s.getRecommendedAddressObj()).toString();
const c = await cells.commit(s, label, { onSent: (h) => console.log('commit sent:', h) });
console.log('waiting for the median time to pass the commit by a minute');
for (;;) {
  const median = await cells.medianTimeSeconds();
  // Ten seconds past the line, so the reveal is not refused by a block that has not caught up.
  if (median !== null && median >= c.readyAtMedian + 10) break;
  await new Promise((r) => setTimeout(r, 5000));
}
const hash = await cells.register(s, label, {
  secret: c.secret,
  commit: c.outPoint,
  records: [{ key: cellula.CKB_ADDRESS_KEY, label: '', value: cellula.textToValue(address), ttl: 300 }],
});
console.log('registered:', hash);

// The first words, signed by the name (no fee) and checked the way anyone would check them.
await new Promise((r) => setTimeout(r, 20000));
const words = await cellula.createStatement(s, { ns, name: label, text: `I am ${label}.cell.` });
const v = await cellula.verifyStatement(cells, words);
console.log(v.ok ? `"I am ${label}.cell." checks out on chain` : v.problems[0]);
