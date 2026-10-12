// Floor 5: letters in a name, and the Impostor's notes. Each is a signed statement
// (cells.statement.v1); the chain says whether the name's owner today signed these exact words.
//
// data/statements.json: two letters signed by the key that owns maria.cell on testnet (one changed
// after signing), and three forgeries: changed words, a key that is not the owner, a look-alike name.
import { readFileSync } from 'node:fs';
import { cellula, names } from '../src/lib.ts';

type Signed = Parameters<typeof cellula.verifyStatement>[1];
const data = JSON.parse(readFileSync('data/statements.json', 'utf8')) as Record<string, { expected: string; signed: Signed }[]>;
const { cells } = names();
for (const [group, list] of Object.entries(data)) {
  for (const { expected, signed } of list) {
    const v = await cellula.verifyStatement(cells, signed);
    console.log(`${group.padEnd(9)} ${expected.padEnd(9)} ${v.ok ? 'OK  ' : 'FAIL'} ${signed.statement.name}.cell: "${signed.statement.text.slice(0, 48)}"`);
    if (!v.ok) console.log(`${' '.repeat(20)} ${v.problems[0]}`);
  }
}
