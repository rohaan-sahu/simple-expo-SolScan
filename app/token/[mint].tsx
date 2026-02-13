import { useLocalSearchParams,useRouter} from "expo-router";
import { useState,useEffect } from "react";
import {
    ActivityIndicator,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { mintStyles as styles } from "@/styles/mintStyles";

const RPC_URL = "https://api.mainnet-beta.solana.com";

export default function TokenDetailScreen() {
    // Read dynamic parameters from teh URL
    // If URL is /token/jskjpjqsp
    // then mint = "jskjpjqsp"

    const {mint} = useLocalSearchParams<{mint: string}>();
    const router = useRouter();

    const [tokenInfo, setTokenInfo] = useState<any>(null);
    const [loading , setLoading] = useState(true);

    const fetchTokenInfo = async () => {
        try {
            // Using Solana RPC to get token supply info
            const res = await fetch(
                `${RPC_URL}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        id: 1,
                        method: "getTokenSupply",
                        param: "[mint]",
                    })

                }   
            );

            const json = await res.json();

            setTokenInfo({
                mint: mint,
                supply: json.result?.value?.uiAmount || 0,
                decimals: json.result?.value?.decimals || 0
            });

        }catch(error){
            console.error("Failed to fetch token info:",error);
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch token metadata
        fetchTokenInfo();
    }, [mint]);

    if (loading){
        return(
            <View style = {styles.center}>
                <ActivityIndicator size = "large" color = "#14F195"/>
            </View>
        )
    }

    return (
        <ScrollView style = {styles.container}>
            { /* Back Buttons */}
            <TouchableOpacity style = {styles.backButton} onPress = {() => router.back()}>
                <Ionicons name = "arrow-back" size={24} color= "#fff"/>
                <Text style = {styles.backButton}>Back</Text>
            </TouchableOpacity>

            {/* Token header */}
            <View style = {styles.header}>
                <Text style = {styles.title}>Token Details</Text>
            </View>

            {/* Mint Address */}
            <View style={styles.card}>
                <Text style = {styles.cardLabel}>Mint Address</Text>
                <Text style = {styles.mintAddress}>{mint}</Text>
            </View>

            {/* Token info */}
            {
                tokenInfo && (
                    <View style = {styles.card}>
                        <View style = {styles.infoRow}>
                            <Text style = {styles.infoLabel}>Total Supply</Text>
                            <Text style = {styles.infoValue}>
                                {tokenInfo.amount?.toLocalString() || "Unknown" }
                            </Text>
                        </View>
                        <View style = {styles.divider}/>
                        <View style = {styles.infoRow}>
                            <Text style= {styles.infoLabel}>Decimals</Text>
                            <Text style= {styles.infoLabel}>{tokenInfo.decimals}</Text>
                        </View>
                    </View>
                )
            }

            {/* View on Solscan */}

            <TouchableOpacity
                style = {styles.linkButton}
                onPress={() => {
                    // Plece holder for URL
                }}
            >
                <Text style = {styles.linkButtonText}>View on SolScan web</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}
