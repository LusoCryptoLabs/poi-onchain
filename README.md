# poi-onchain

The CKB steps behind [POI: Proof of Identity](https://poi.cellula.id), a browser platformer that teaches identity on Nervos CKB, as small runnable examples. Each floor of the game is one real chain operation; each example here is that operation alone, in a few lines of [CCC](https://github.com/ckb-devrel/ccc) and [cellula-sdk](https://www.npmjs.com/package/cellula-sdk).

Everything runs on the CKB testnet, except one example that reads mainnet. Examples that would spend CKB build and sign the transaction, and send it only with `--send`.

## Run

```sh
npm install
npm run key            # makes a testnet key in .key (never printed) and shows its address
npm run faucet         # 10,000 testnet CKB from Nervos' faucet
npm run read-name      # any example below
```

## Examples

| Example | Floor | What it does |
| --- | --- | --- |
| `01-key` | 2 | a key and its address; in a browser, `browser/connect.ts` uses CCC's wallet list |
| `02-faucet` | 3 | testnet CKB from the faucet, then the balance read until it arrives |
| `03-read-name` | 4 | a `.cell` name cut open: owner, manager, records, expiry |
| `04-pay-by-name` | 4 | pays the address a name's CKB record gives, read just before paying |
| `05-check-statements` | 5 | signed statements checked on chain: a real letter, and four forgeries |
| `06-quantum-name` | 6 | a name owned by a SPHINCS+ lock and managed by an ordinary key |
| `07-register` | 7 | the price, then commit, the wait, the reveal, and the name's first signed words |
| `08-write-record` | | a record added to a name, the others kept |
| `09-seal` | | medals written on a name as a record sealed by the game, and why a copy does not check |
| `10-mainnet-proof` | | proving a mainnet name by signing words with it, checked on mainnet |
| `11-fiber-link` | 4 | a name's Fiber pay link, checked before paying: published by the owner now, invoice signed by the payee |
| `12-joyid-subkey` | | a JoyID passkey from a second device (a sub key), tied to its account through JoyID's CoTA aggregator |

Arguments: `read-name`, `pay-by-name` and `fiber-link` take a name (`maria` by default); `register <name>`; `write-record <name> <key> <text>`; `seal [name]`; `mainnet-proof <name> [climb-name]`; `joyid-subkey [<address> <public-key>]`.

## Notes

- A name's cell keeps its owner and manager as the first 20 bytes of a lock hash. `06-quantum-name` shows how to tell which lock is which from the public lock scripts.
- `editRecords` replaces a name's whole set of records, so `08-write-record` reads them first and passes `basedOn`, which refuses the edit if the name changed in between.
- Records live in the transaction's witness: writing one costs a network fee and holds no CKB.
- The commit of a registration must be a minute old by the chain's median time, which trails real time; in practice the wait is a few minutes.
- A statement names its deployment (`ns`), so words signed for testnet do not check on mainnet.
- A JoyID passkey added on another device signs as a sub key: the signature names the key, not the account. `12-joyid-subkey` ties such a key to its account through JoyID's CoTA aggregator.

## License

MIT
