// The town's door: a name registered on mainnet, proved by signing words with it. Nothing is paid
// and nothing is sent to the chain: the words are signed, then checked against mainnet, read only.
// The examples' key owns no mainnet name, so it shows the refusals; with the key that holds one,
// the same words check out.
//
// Usage: npm run mainnet-proof <mainnet-name> [climb-name]
import { arg, cellula, names, signer } from '../src/lib.ts';

const name = arg();
if (!name) throw new Error('usage: npm run mainnet-proof <mainnet-name> [climb-name]');
const climb = process.argv.slice(2).filter((a) => !a.startsWith('--'))[1] ?? name;
const { cells, ns } = names('mainnet');
const text = `I am ${name}.cell. I climbed POI as ${climb}.cell and join the first wave of its town.`;
const words = await cellula.createStatement(signer('mainnet'), { ns, name, text });
const v = await cellula.verifyStatement(cells, words);
console.log(`"${text}"`);
console.log(v.ok ? 'checks out on mainnet' : `refused: ${v.problems[0]}`, `(registered: ${v.registered})`);

// Words for the testnet deployment are worth nothing on mainnet: `ns` names the deployment.
const testnetWords = await cellula.createStatement(signer('mainnet'), { ns: names('testnet').ns, name, text });
const t = await cellula.verifyStatement(cells, testnetWords);
console.log('the same words for testnet, checked on mainnet:', t.ok ? 'checks out' : `refused (deployment matches: ${t.namespaceOk})`);
