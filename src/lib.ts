import { existsSync, readFileSync } from 'node:fs';
import { ccc } from '@ckb-ccc/core';
import * as cellula from 'cellula-sdk';

export { ccc, cellula };

/** Where the examples keep their testnet key (made by `npm run key`, never printed). */
export const KEY_FILE = '.key';

export type Network = 'testnet' | 'mainnet';

/** A public client for the network. Plain HTTP: some networks block the WebSocket a client tries first. */
export function client(network: Network = 'testnet'): ccc.Client {
  return network === 'mainnet' ? new ccc.ClientPublicMainnet({ url: 'https://mainnet.ckb.dev/' }) : new ccc.ClientPublicTestnet({ url: 'https://testnet.ckb.dev/' });
}

/** The Cells protocol (the .cell names) on the network, through cellula-sdk. */
export function names(network: Network = 'testnet'): { cells: cellula.CellsClient; ns: `0x${string}` } {
  const deployment = cellula.deploymentFor(network);
  return { cells: new cellula.CellsClient(client(network), deployment), ns: deployment.configTypeHash as `0x${string}` };
}

/** The examples' own testnet signer, from the key file. */
export function signer(network: Network = 'testnet'): ccc.SignerCkbPrivateKey {
  if (!existsSync(KEY_FILE)) throw new Error('No key yet: run `npm run key` first.');
  return new ccc.SignerCkbPrivateKey(client(network), readFileSync(KEY_FILE, 'utf8').trim());
}

/** A name's records as text, by key. */
export function recordsOf(account: cellula.LiveAccount): { key: string; text: string }[] {
  return account.records.map((r) => ({ key: r.key, text: cellula.valueToText(r.value) }));
}

/** Whether the command line asks to send what the example builds. Without `--send`, nothing is sent. */
export const sending = process.argv.includes('--send');

/** The first argument that is not a flag. */
export function arg(fallback?: string): string | undefined {
  return process.argv.slice(2).find((a) => !a.startsWith('--')) ?? fallback;
}

/** An address shortened for the screen: the start and the end are what people compare. */
export const short = (address: string): string => (address.length > 24 ? `${address.slice(0, 12)}...${address.slice(-8)}` : address);

/** Whole CKB from shannons. */
export const ckb = (shannons: bigint): string => (Number(shannons) / 1e8).toLocaleString('en-US', { maximumFractionDigits: 8 });
