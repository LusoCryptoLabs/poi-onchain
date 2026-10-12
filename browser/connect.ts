// Floor 2 in a browser: the player picks a wallet from CCC's list (JoyID with a passkey, MetaMask,
// OKX, UniSat and the rest). The page never sees a key.
//
// One thing to know about CCC 2.3's <ccc-connector>: it closes its window before it announces the
// wallet that was just connected. Taking the close as a cancel loses the connection. So on a close,
// wait for the announcement when the list shows a wallet was chosen, and use a connection the
// element already holds without opening the list again.
import { ccc } from '@ckb-ccc/connector';

type Connection = { wallet: { name: string }; signerInfo: { signer: ccc.Signer } };
type Connector = HTMLElement & { client: ccc.Client; connection?: Connection; walletName?: string; signerName?: string };

/** Opens the wallet list and resolves with the wallet the player connected (rejects when they close it). */
export function connectWallet(client: ccc.Client = new ccc.ClientPublicTestnet()): Promise<{ signer: ccc.Signer; address: string; wallet: string }> {
  const el = document.createElement('ccc-connector') as Connector;
  el.client = client;
  document.body.append(el);
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = async (conn: Connection | undefined) => {
      if (done) return;
      done = true;
      el.remove();
      if (!conn) return reject(new Error('No wallet connected.'));
      const signer = conn.signerInfo.signer;
      resolve({ signer, address: (await signer.getRecommendedAddressObj()).toString(), wallet: conn.wallet.name });
    };
    el.addEventListener('connection', (ev) => {
      const owner = (ev as Event & { connectionOwner?: { isValid?: boolean; value: Connection } }).connectionOwner;
      if (owner && owner.isValid !== false) void finish(owner.value);
    });
    el.addEventListener('close', () =>
      setTimeout(() => {
        if (el.connection) return void finish(el.connection);
        // A wallet was chosen: its announcement is on its way.
        if (el.walletName && el.signerName) setTimeout(() => void finish(el.connection), 8000);
        else void finish(undefined);
      }, 0),
    );
    if (el.connection) void finish(el.connection);
  });
}
