import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { swapStyles as s } from "@/styles/swapStyles";

export default function SwapScreen() {
  const [fromAmount, setFromAmount] = useState("100");
  const [toAmount, setToAmount] = useState("0.28014");
  const [fromToken, setFromToken] = useState("USDC");
  const [toToken, setToToken] = useState("SOL");
  const [fromLogo, setFromLogo] = useState("https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=040");
  const [toLogo, setToLogo] = useState("https://cryptologos.cc/logos/solana-sol-logo.png?v=040");

    const swapTokens = () => {
        setFromToken(toToken);
        setToToken(fromToken);
        setFromAmount(toAmount);
        setToAmount(fromAmount);
        setFromLogo(toLogo);
        setToLogo(fromLogo);
    };

    const handleSwap = () => {
        if (!fromAmount) return Alert.alert("Enter an amount");
        Alert.alert(
            "Swap",
            `Swapping ${fromAmount} ${fromToken} to ${toAmount} ${toToken}`,
            );
    };

    return (
    <SafeAreaView style={s.safe} edges={["top"]}>
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
            <Text style={s.title}>Swap Tokens</Text>
            <View style={[s.card, { marginBottom: 10 }]}>
                <View style={s.cardHeader}>
                    <TouchableOpacity style={s.tokenSelector}>
                        <View style={[s.tokenIcon, { backgroundColor: "#9945FF" }]}>
                            <Image source={{uri: fromLogo}} style ={s.tokenIcon} />
                        </View>
                        <Text style={s.tokenName}>{fromToken}</Text>
                        <Ionicons name="chevron-down" size={18} color="#888" />
                    </TouchableOpacity>
                    <TextInput
                        style={s.amountInput}
                        value={fromAmount}
                        onChangeText={setFromAmount}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666"
                    />
                </View>
                

                <View style={s.cardFooter}>
                    <Text style={s.balanceText}>Balance: 0.0661 {fromToken}</Text>
                    <Text style={s.usdText}>$499.749</Text>
                </View>
            </View>

            <View style={[s.card, { marginBottom: 10 }]}>
                <View style={s.cardHeader}>
                    <TouchableOpacity style={s.tokenSelector}>
                        <View style={[s.tokenIcon, { backgroundColor: "#9945FF" }]}>
                            <Image source={{uri: toLogo}} style ={s.tokenIcon} />
                        </View>
                        <Text style={s.tokenName}>{toToken}</Text>
                        <Ionicons name="chevron-down" size={18} color="#888" />
                    </TouchableOpacity>
                    <TextInput
                        style={s.amountInput}
                        value={toAmount}
                        onChangeText={setToAmount}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666"
                    />
                </View>
                

                <View style={s.cardFooter}>
                    <Text style={s.balanceText}>Balance: 0.0661 {fromToken}</Text>
                    <Text style={s.usdText}>$499.749</Text>
                </View>
            </View>
            <View style={s.arrowContainer}>
                <TouchableOpacity style={s.swapArrow} onPress={swapTokens}>
                <Ionicons name="arrow-down" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={s.swapBtn} onPress={handleSwap}>
            <Text style={s.swapBtnText}>Swap</Text>
        </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
}