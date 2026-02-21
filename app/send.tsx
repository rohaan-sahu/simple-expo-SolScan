import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Linking,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useWallet } from "@/hooks/useWallet";

import { sendStyles as s } from "@/styles/sendstyles";

export default function SendScreen() {
  const router = useRouter();
  const wallet = useWallet();
  //console.log("wallet pubkey: ", wallet.publicKey?.toString());

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const handleSend = async () => {
    // Validate
    if (!toAddress.trim()) return Alert.alert("Enter a recipient address");
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      return Alert.alert("Enter a valid amount");
    }

    try {
      const sig = await wallet.sendSOL(toAddress.trim(), Number(amount));
      setTxSignature(sig);
      Alert.alert(
        "Transaction Sent! ✅",
        `Sent ${amount} SOL\nSignature: ${sig.slice(0, 20)}...`,
        [
          { text: "View on Solscan", onPress: () => Linking.openURL(`https://solscan.io/tx/${sig}`) },
          { text: "Done", onPress: () => router.back() },
        ]
      );
    } catch (error: any) {
      Alert.alert("Transaction Failed here", error.message || "Something went wrong");
    }
  
  if (!wallet.connected) {
    return (
      <View style={s.center}>
        <Ionicons name="wallet-outline" size={64} color="#333" />
        <Text style={s.emptyTitle}>Wallet Not Connected</Text>
        <Text style={s.emptyText}>
          Connect your wallet from the Explorer tab first.
        </Text>
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <Text style={s.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.title}>Send SOL</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* From (your wallet) */}
      <View style={s.card}>
        <Text style={s.cardLabel}>From</Text>
        <Text style={s.cardAddress}>
          {wallet.publicKey?.toString().slice(0, 8)}...
          {wallet.publicKey?.toString().slice(-4)}
        </Text>
      </View>

      {/* To Address */}
      <View style={s.inputGroup}>
        <Text style={s.inputLabel}>Recipient Address</Text>
        <TextInput
          style={s.input}
          placeholder="Paste Solana address..."
          placeholderTextColor="#555"
          value={toAddress}
          onChangeText={setToAddress}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Amount */}
      <View style={s.inputGroup}>
        <Text style={s.inputLabel}>Amount (SOL)</Text>
        <TextInput
          style={s.input}
          placeholder="0.0"
          placeholderTextColor="#555"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[s.sendButton, wallet.sending && s.sendButtonDisabled]}
        onPress={handleSend}
        disabled={wallet.sending}
      >
        {wallet.sending ? (
          <ActivityIndicator color="#0a0a1a" />
        ) : (
          <Text style={s.sendButtonText}>Send SOL</Text>
        )}
      </TouchableOpacity>

      {/* Fee notice */}
      <Text style={s.feeText}>
        Network fee: ~0.000005 SOL ($0.001)
      </Text>
    </KeyboardAvoidingView>
  );
}