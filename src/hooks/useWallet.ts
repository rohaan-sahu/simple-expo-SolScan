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
  uri: "https://solscan.io",
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

  const connection = new Connection(clusterApiUrl(cluster), "confirmed");

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
      console.log("public key iniialized correctly as string",publicKey instanceof String );    // Some issue here. Not an instance of String or PublicKey
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
      if (!publicKey) throw new Error("Wallet not connected");

      // Verification of proper initialization of Pubkey
      // if (!(publicKey instanceof PublicKey)) {
      //   throw new Error("Invalid publicKey: not a PublicKey instance");
      // }

      setSending(true);
      try {
        // Step 1: Build the transaction
        const fromPublicKey = new PublicKey(publicKey);     // Public Key is 
        const toPublicKey = new PublicKey(toAddress);
        console.log("to public key: ",toPublicKey);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: toPublicKey,
            lamports: Math.round(amountSOL * LAMPORTS_PER_SOL),
          })
        );
        console.log("lamports to be sent: ",Math.round(amountSOL * LAMPORTS_PER_SOL));
        console.log("Before step 2 ");

        // Step 2: Get recent blockhash (needed for transaction)
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        //transaction.feePayer = publicKey;
        transaction.feePayer = fromPublicKey;

        console.log("Before step 3 ");
        //console.log("Transaction object: ",JSON.stringify(transaction));


        // Step 3: Send to Phantom for signing + submission
        const txSignature = await transact(
          async (wallet: Web3MobileWallet) => {
            console.log("Before step 3.1 ");
            // Re-authorize (Phantom needs this each session)
            // await wallet.authorize({
            //   chain: `solana:${cluster}`,
            //   identity: APP_IDENTITY,
            // });

            try {
              console.log("Starting authorization...");
              const authResult = await wallet.authorize({
                chain: `solana:${cluster}`,
                identity: APP_IDENTITY,
              });
              console.log("Authorization successful:", authResult);
            } catch (authError) {
              console.error("Authorization error:", authError);
              throw authError; // Re-throw so it doesn't silently fail
            }

            console.log("Before step 3.2 ");

            // Sign and send — Phantom shows the transaction details
            // User approves → Phantom signs → sends to network
            const signatures = await wallet.signAndSendTransactions({
              transactions: [transaction],
            });


            // try {
            //     const signatures = await wallet.signAndSendTransactions({
            //       transactions: [transaction],
            //     });
            //     // Handle result here
            // } catch (error) {
            //     console.error('Error during wallet signing operation:', error);
            //     // Additional error handling if needed
            // }            console.log("Before step 3.3 ");

            return signatures[0];
          }
        );

        return txSignature;
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
