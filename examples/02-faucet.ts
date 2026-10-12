// Floor 3: the fountain. Testnet CKB from Nervos' faucet, then the balance read until it arrives.
//
// The faucet's CORS admits only Nervos' own sites, so a game asks it from its server; a script may
// ask it directly. It takes 10,000, 100,000 or 300,000 CKB a claim.
import { ccc, client, signer } from '../src/lib.ts';

const address = await signer().getRecommendedAddressObj();
const before = await client().getBalanceSingle(address.script);
const res = await fetch('https://faucet-api.nervos.org/claim_events', {
  method: 'POST',
  headers: { 'content-type': 'application/json', accept: 'application/json' },
  body: JSON.stringify({ claim_event: { address_hash: address.toString(), amount: '10000' } }),
});
console.log('faucet:', res.status, (await res.text()).slice(0, 200));
if (!res.ok) process.exit(1);
for (let t = 1; t <= 40; t++) {
  await new Promise((r) => setTimeout(r, 4000));
  const now = await client().getBalanceSingle(address.script);
  if (now > before) {
    console.log(`arrived after about ${t * 4} s: ${ccc.fixedPointToString(now)} CKB`);
    process.exit(0);
  }
}
console.log('not here yet: the faucet queues claims; `npm run key` shows the balance later');
