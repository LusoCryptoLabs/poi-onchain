// Floor 6: a name with two keys. A post-quantum owner (SPHINCS+), kept offline, and an ordinary
// manager for everyday edits. The cell stores each as the first 20 bytes of the lock's hash, so the
// public lock scripts are enough to say which is which.
import { ccc, names } from '../src/lib.ts';

const owner = ccc.Script.from({ codeHash: '0x147ecbb5c5127d982ee1362d2c2bb4267803da2eb006d150e88af6caaa0a7eaf', hashType: 'data1', args: '0x5ea09d41003bb714874a268c4ba2332bb2bf755d3e195970b7fd21e67e61f7da' });
const manager = ccc.Script.from({ codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8', hashType: 'type', args: '0x87a174cb43b161c9d4329fd04e73f28943577220' });
const id = (s: ccc.Script) => s.hash().slice(0, 42);

const { cells } = names();
const a = await cells.getAccount('v3-first-name');
if (!a) throw new Error('v3-first-name.cell is not on the testnet just now');
console.log('owner is the SPHINCS+ lock: ', a.ownerLockHash === id(owner), a.ownerLockHash);
console.log('manager is a secp256k1 lock:', a.managerLockHash === id(manager), a.managerLockHash);
console.log('a SPHINCS+ signature is 7,856 bytes; a secp256k1 one, 65');
