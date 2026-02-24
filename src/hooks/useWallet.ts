import { useState, useCallback } from "react";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import { useShallow } from "zustand/shallow";

import { useWalletStore } from "@/stores/wallet-stores";

const APP_IDENTITY = {
  name: "SolScan",
  uri: "https://solscan-app.com",
  icon: "favicon.ico",
};

export function useWallet() {
  // const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  // const [connecting, setConnecting] = useState(false);
  // const [sending, setSending] = useState(false);

  // Zustand Wallet store
  // Wallet states
  const publicKey = useWalletStore((s)=> s.publicKey);        // Single stae 
  const {connecting,sending} = useWalletStore(
    useShallow(
      (s) => ({
        connecting: s.connecting,
        sending: s.sending,
      })
    )
  );

  // Wallet actions
  // Actions hold no state. The don't get mutated hence, don't cause any re-render. Hence we don't need useShallow
  const {setConnecting,setSending,setPublicKey} = useWalletStore(
    useShallow( 
      (s) => ({
          setConnecting: s.setConnecting,
          setSending: s.setSending,
          setPublicKey: s.setPublicKey,
      })
    )
  );
  const isDevnet = useWalletStore((s) => s.isDevnet);
  const cluster = isDevnet ? "devnet" : "mainnet-beta";
  const mwaCluster = isDevnet ? "devnet" : "mainnet";

  const connection = new Connection(clusterApiUrl(cluster), "confirmed");
  //const connection = new Connection(isDevnet? clusterApiUrl(cluster) : process.env.EXPO_PUBLIC_RPC_URL!, "confirmed");

  // ============================================
  // CONNECT — Ask Phantom to authorize our app
  // ============================================
  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const authResult = await transact(
        async (wallet: Web3MobileWallet) => {
          // This opens Phantom, shows an "Authorize" dialog
          // User taps "Approve" → we get their public key
          const result = await wallet.authorize({
            chain: `solana:${cluster}`,
            identity: APP_IDENTITY,
          });
          return result;
        }
      );

      console.log("auth result: ", authResult);

      // authResult.accounts[0].address is a base64 public key
      const authAddress = Buffer.from(authResult.accounts[0].address, "base64");
      const pubkey = new PublicKey(authAddress);
      setPublicKey(pubkey);
      console.log("auth address ",authAddress);
      console.log("pubkey: ",pubkey);
      console.log("public key: ",publicKey);
      console.log("pub key iniialized correctly as string",pubkey instanceof PublicKey );    // Some issue here. Not an instance of String or PublicKey
      return pubkey;
    } catch (error: any) {
      console.error("Connect failed:", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [cluster]);

  // ============================================
  // DISCONNECT
  // ============================================
  const disconnect = useCallback(() => {
    setPublicKey(null);
  }, []);

  // ============================================
  // GET BALANCE
  // ============================================
  const getBalance = useCallback(async () => {
    if (!publicKey) return 0;
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }, [publicKey, connection]);

  // ============================================
  // SEND SOL — Build, sign, and send a transaction
  // ============================================
  const sendSOL = useCallback(
    async (toAddress: string, amountSOL: number) => {
      console.log("[useWallet] sendSOL() called");
      console.log("[useWallet] to:", toAddress, "amount:", amountSOL);

      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      setSending(true);

      try {
        // step 1: get blockhash
        console.log("[useWallet] fetching blockhash...");
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        console.log("[useWallet] blockhash:", blockhash);

        // step 2: build transaction
        const fromPublicKey = new PublicKey(publicKey);
        const toPublicKey = new PublicKey(toAddress);
        const lamports = Math.round(amountSOL * LAMPORTS_PER_SOL);
        console.log("[useWallet] lamports:", lamports);

        const transaction = new Transaction();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPublicKey;
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: toPublicKey,
            lamports,
          })
        );
        console.log("[useWallet] transaction built");

        // step 3: sign transaction inside transact (shows wallet popup)
        console.log("[useWallet] starting transact for signing...");

        const signedTransaction = await transact(
          async (wallet: Web3MobileWallet) => {
            console.log("[useWallet] inside transact, calling authorize...");

            await wallet.authorize({
              cluster: cluster,
              identity: APP_IDENTITY,
            });
            console.log("[useWallet] authorized, calling signTransactions...");

            const signedTxs = await wallet.signTransactions({
              transactions: [transaction],
            });
            console.log("[useWallet] signTransactions completed");

            if (!signedTxs || signedTxs.length === 0) {
              throw new Error("No signed transaction returned from wallet");
            }

            return signedTxs[0];
          }
        );

        console.log("[useWallet] transaction signed, waiting before send...");

        // step 4: delay after phantom closes (network reconnect)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // step 5: send transaction with retry logic
        const rawTransaction = signedTransaction.serialize();
        console.log("[useWallet] serialized, sending to network...");

        let signature: string | null = null;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`[useWallet] send attempt ${attempt}...`);
            signature = await connection.sendRawTransaction(rawTransaction, {
              skipPreflight: true,
              maxRetries: 2,
            });
            console.log("[useWallet] sent, signature:", signature);
            break;
          } catch (err: unknown) {
            lastError = err as Error;
            console.log(`[useWallet] attempt ${attempt} failed:`, lastError.message);
            if (attempt < 3) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        if (!signature) {
          throw lastError || new Error("Failed to send transaction after 3 attempts");
        }

        // step 6: confirm transaction
        console.log("[useWallet] confirming transaction...");
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          "confirmed"
        );

        if (confirmation.value.err) {
          throw new Error(
            `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
          );
        }

        console.log("[useWallet] transaction confirmed!");
        return signature;
      } catch (error) {
        console.error("[useWallet] sendSOL error:", error);
        throw error;
      } finally {
        setSending(false);
      }
    },
    [publicKey, connection, cluster]
  );


  return {
    publicKey,
    connected: !!publicKey,
    connecting,
    sending,
    connect,
    disconnect,
    getBalance,
    sendSOL,
    connection,
  };
}
