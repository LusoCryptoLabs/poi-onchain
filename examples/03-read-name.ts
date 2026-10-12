// Floor 4: a name cut open. Who owns it, who manages it, what it says, until when it is held.
//
// Usage: npm run read-name [label]   (maria by default)
import { arg, names, recordsOf } from '../src/lib.ts';

const label = arg('maria')!;
const { cells } = names();
const a = await cells.getAccount(label);
if (!a) {
  console.log(`${label}.cell is not registered.`);
  process.exit(0);
}
// The cell keeps its owner and manager as the first 20 bytes of a lock hash.
console.log('name:   ', `${a.label}.cell`);
console.log('owner:  ', a.ownerLockHash);
console.log('manager:', a.managerLockHash, a.managerLockHash === a.ownerLockHash ? '(the owner)' : '');
console.log('expires:', new Date(a.expiredAt * 1000).toISOString().slice(0, 10));
for (const r of recordsOf(a)) console.log(`  ${r.key.padEnd(14)} ${r.text}`);
