import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useState } from "react";
import {
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";


const RPC = "https://api.mainnet-beta.solana.com";

const rpc = async (method: string, params: any[]) => {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
};

const getBalance = async (addr: string) => {
  const result = await rpc("getBalance", [addr]);
  return result.value / 1_000_000_000;
};

const getTokens = async (addr: string) => {
  const result = await rpc("getTokenAccountsByOwner", [
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

const getTxns = async (addr: string) => {
  const sigs = await rpc("getSignaturesForAddress", [addr, { limit: 10 }]);
  return sigs.map((s: any) => ({
    sig: s.signature,
    time: s.blockTime,
    ok: !s.err,
  }));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0D0D12",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 15,
    marginBottom: 28,
    fontWeight: "400",
  },

  inputContainer: {
    backgroundColor: "#16161D",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 14,
    fontWeight: "400",
  },

  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    backgroundColor: "#14F195",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#14F195",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius:5
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 14,
    fontWeight: "400",
  },
});

const short = (s: string, n = 4) => `${s.slice(0, n)}...${s.slice(-n)}`;

const timeAgo = (ts: number) => {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function App() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);

  const search = async () => {
  const addr = address.trim();
  if (!addr) return Alert.alert("Enter a wallet address");

  setLoading(true);
  try {
    const [bal, tok, tx] = await Promise.all([
      getBalance(addr),
      getTokens(addr),
      getTxns(addr),
    ]);
    setBalance(bal);
    setTokens(tok);
    setTxns(tx);
  } catch (e: any) {
    Alert.alert("Error", e.message);
  }
  setLoading(false);
};

  return (
    <SafeAreaView style = {s.safe}>
      <ScrollView style = {s.scroll}>
          <TextInput
              style={s.input}
              placeholder="Solana wallet address..."
              placeholderTextColor="#555"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="none"
              autoCorrect={false}
            />
          <StatusBar style="auto" />
          <TextInput onChangeText={setAddress} />
          <TouchableOpacity style={s.btn} onPress={search} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={s.btnText}>Search</Text>
            )}
          </TouchableOpacity>
          {/*balance !== null && (
            <View style={s.card}>
              <Text style={s.label}>SOL Balance</Text>
              <Text style={s.balance}>{balance.toFixed(4)}</Text>
              <Text style={s.sol}>SOL</Text>
              <Text style={s.addr}>{short(address.trim(), 6)}</Text>
            </View>
          )*/}
      </ScrollView>
    </SafeAreaView>
  );
}
