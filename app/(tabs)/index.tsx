import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { useState,useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Local imports
import { walletStyles as s } from '@/styles/walletStyles';
import { useWalletStore } from '@/stores/wallet-stores';
import { FavoriteButton } from '@/components/FavouriteButton';

const rpc = async (rpcUrl: string,method: string, params: any[]) => {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
};

const getBalance = async (rpcUrl:string,addr: string) => {
  const result = await rpc(rpcUrl,"getBalance", [addr]);
  return result.value / 1_000_000_000;
};

const getTokens = async (rpcUrl:string,addr: string) => {
  const result = await rpc(rpcUrl,"getTokenAccountsByOwner", [
    addr,
    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
    { encoding: "jsonParsed" },
  ]);
  return (result.value || [])
    .map((a: any) => ({
      mint: a.account.data.parsed.info.mint,
      amount: a.account.data.parsed.info.tokenAmount.uiAmount,
    }))
    .filter((t: any) => t.amount > 0);
};

const getTxns = async (rpcUrl:string,addr: string) => {
  const sigs = await rpc(rpcUrl,"getSignaturesForAddress", [addr, { limit: 10 }]);
  return sigs.map((s: any) => ({
    sig: s.signature,
    time: s.blockTime,
    ok: !s.err,
  }));
};

const short = (s: string, n = 4) => `${s.slice(0, n)}...${s.slice(-n)}`;

const timeAgo = (ts: number) => {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function WalletScreen() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);

  const router = useRouter();
  const addToHistory = useWalletStore((s) => s.addToHistory);
  const searchHistory = useWalletStore((s) => s.searchHistory);
  const isDevnet = useWalletStore((s) => s.isDevnet);
  const toggleNetwork = useWalletStore((s)=> s.toggleNetwork);
  const clearHistory = useWalletStore((s)=> s.clearHistory)

  const DEVNET_URL = "https://api.devnet.solana.com";
  const MAINNET_URL = "https://api.mainnet-beta.solana.com";
  const RPC_URL = isDevnet ? DEVNET_URL : MAINNET_URL;

  const handleSearch = async (address: string) => {
      addToHistory(address); // Save to history automatically
      // ...rest of your lookup code, now using the RPC variable
  };

  const search = async () => {
    const addr = address.trim();
    if (!addr) return Alert.alert("Enter a wallet address");

    setLoading(true);
    handleSearch(addr);
    try {
      const bal = await getBalance(RPC_URL,addr).catch(e => {
        Alert.alert("Balance Error", e.message);
        return null;
      });
      
      const tok = await getTokens(RPC_URL,addr).catch(e => {
        Alert.alert("Tokens Error", e.message);
        return [];
      });
      
      const tx = await getTxns(RPC_URL,addr).catch(e => {
        Alert.alert("Transactions Error", e.message);
        return [];
      });

      if (bal !== null) setBalance(bal);
      setTokens(tok);
      setTxns(tx);
    } finally {
      setLoading(false);
    }
  };

  const searchFromHistory = (addr: string) => {
    setAddress(addr);
    addToHistory(addr);
    setLoading(true);
    Promise.all([getBalance(RPC_URL,addr), getTokens(RPC_URL,addr), getTxns(RPC_URL,addr)])
      .then(([bal, tok, tx]) => {
        setBalance(bal);
        setTokens(tok);
        setTxns(tx);
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "Unknown error";
        Alert.alert("Error", message);
      })
      .finally(() => setLoading(false));
    }
  const tryExample = () => {
    const example1 = "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY";
    const example2 = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
    const example3 = "SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3";
    const example4 = "B6aJ3TGfme3SMnLSouHXqWXjVFqYyqj7czzhzr8WJFAi";
    setAddress(example3);
  };

  const clearResults = () => {
    setAddress("");
    setBalance(null);
    setTokens([]);
    setTxns([]);
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={s.scroll}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>SolScan</Text>
            <Text style={s.subtitle}>Explore any Solana wallet</Text>
          </View>
          <TouchableOpacity style={s.networkToggle} onPress={toggleNetwork}>
            <View style={[s.networkDot, isDevnet && s.networkDotDevnet]} />
            <Text style={s.networkText}>{isDevnet ? "Devnet" : "Mainnet"}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.inputContainer}>
          <TextInput
            style={s.input}
            placeholder="Enter wallet address..."
            placeholderTextColor="#6B7280"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={s.btnRow}>
          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={search}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={s.btnText}>Search</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={s.btnGhost} onPress={clearResults}>
            <Text style={s.btnGhostText}>Clear</Text>
          </TouchableOpacity>
        </View>
        <View style={s.btnRow}>
          <TouchableOpacity style={s.btnGhost} onPress={clearHistory}>
            <Text style={[s.btnGhostText, {flex: 1}]}>Clear History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={tryExample}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={s.btnText}>Demo</Text>
            )}
          </TouchableOpacity>
        </View>

        {searchHistory.length > 0 && balance === null && (
          <View style={s.historySection}>
            <Text style={s.historyTitle}>Recent Searches</Text>
            {searchHistory.slice(0, 5).map((addr) => (
              <TouchableOpacity
                key={addr}
                style={s.historyItem}
                onPress={() => searchFromHistory(addr)}
              >
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={s.historyAddress} numberOfLines={1}>
                  {short(addr, 8)}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {balance !== null && (
          <View style={s.card}>
            <View style={s.favoriteWrapper}>
              <FavoriteButton address={address.trim()} />
            </View>
            <Text style={s.label}>SOL Balance</Text>
            <View style={s.balanceRow}>
              <Text style={s.balance}>{balance.toFixed(4)}</Text>
              <Text style={s.sol}>SOL</Text>
            </View>
            <Text style={s.addr}>{short(address.trim(), 6)}</Text>
          </View>
        )}

        {tokens.length > 0 && (
          <>
            <Text style={s.section}>Tokens ({tokens.length})</Text>
            <FlatList
              data={tokens}
              keyExtractor={(t) => t.mint}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.row}
                  onPress={() =>
                    router.push(`/token/${item.mint}?amount=${item.amount}`)
                  }
                >
                  <Text style={s.mint}>{short(item.mint, 6)}</Text>
                  <View style={s.tokenRight}>
                    <Text style={s.amount}>{item.amount}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#6B7280"
                    />
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {txns.length > 0 && (
          <>
            <Text style={s.section}>Recent Transactions</Text>
            <FlatList
              data={txns}
              keyExtractor={(t) => t.sig}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.row}
                  onPress={() =>
                    Linking.openURL(`https://solscan.io/tx/${item.sig}`)
                  }
                >
                  <View>
                    <Text style={s.mint}>{short(item.sig, 8)}</Text>
                    <Text style={s.time}>
                      {item.time ? timeAgo(item.time) : "pending"}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: item.ok ? "#14F195" : "#EF4444",
                      fontSize: 18,
                    }}
                  >
                    {item.ok ? "+" : "-"}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
