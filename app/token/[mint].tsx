import { useLocalSearchParams,useRouter} from "expo-router";
import { useState,useEffect } from "react";
import {
    ActivityIndicator,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { mintStyles as styles } from "@/styles/mintStyles";
import { JSONRPCRequest,JSONRPCResponse } from "@/types";

const RPC_URL =  process.env.EXPO_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";

export default function TokenDetailScreen() {
    // Read dynamic parameters from teh URL
    // If URL is /token/jskjpjqsp
    // then mint = "jskjpjqsp"

    const {mint} = useLocalSearchParams<{mint: string}>();
    const router = useRouter();

    const [tokenInfo, setTokenInfo] = useState<any>(null);
    const [loading , setLoading] = useState(true);

    // Creating request objects to send a batch RPC request
    // That did not work.
    // {
    //  "error": {
    //              "code": -32403,
    //              "message": "Batch requests are only available for paid plans.
    //                          Please upgrade if you would like to gain access"
    //            },
    // "jsonrpc": "2.0"
    // }
    const tokenSupply: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: "token-supply-1",
        method: "getTokenSupply",
        params: { id: mint  }
    };
    const tokenAsset: JSONRPCRequest ={
        jsonrpc: '2.0',
        id: "token-asset-1",
        method: "getAsset",
        params: {id: mint}
    } ;

    // Add this temporarily to debug
    useEffect(() => {
    if (tokenInfo?.image) {
        console.log('Image URL:', tokenInfo.image);
        console.log('Image URL type:', typeof tokenInfo.image);
    }
    }, [tokenInfo]);

    // Usig helius 
    const fetchTokenInfo = async () => {
        try {
            // Using RPC to get token supply info
            // For Solana RPC the param must be an array []
            const supply = await fetch(
                "https://api.mainnet-beta.solana.com",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: "token-supply-1",
                        method: "getTokenSupply",
                        params: [mint]
                    })
                }   
            );

            // Using Helius RPC to get token supply info
            // For Helius RPC the param can be an object
            const asset = await fetch(
                `${RPC_URL}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(tokenAsset)
                }   
            );


            // Receiving batchec RPC response didn't work. Because 'free plan'.
            const jsonTokenValue = await supply.json();
            //console.log(jsonTokenValue);

            const jsonTokenAsset = await asset.json();
            //console.log(jsonTokenAsset?.result?.content?.links?.image);

            setTokenInfo({
                mint: mint,
                supply: jsonTokenValue.result?.value?.uiAmount || 0,
                decimals: jsonTokenValue.result?.value.decimals || 0,
                //name: tokenMetadata?.result.content.links.image || "Unknown",
                //symbol: jsonTokenAsset?.result.metadata.symbol || "NA",
                image: jsonTokenAsset?.result?.content?.links?.image || null,
            });
            //console.log('t: ',tokenInfo.image);

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
                        {tokenInfo?.image ? 
                            (<Image source={{uri: tokenInfo?.image}} style ={styles.tokenIcon} />):
                            (<Ionicons name="help-circle-outline" size={18} color="#888" />)
                        }
                        <View style = {styles.infoRow}>
                            <Text style = {styles.infoLabel}>Total Supply</Text>
                            <Text style = {styles.infoValue}>
                                {tokenInfo?.supply || "Unknown" }
                            </Text>
                        </View>
                        <View style = {styles.divider}/>
                        <View style = {styles.infoRow}>
                            <Text style= {styles.infoLabel}>Decimals</Text>
                            <Text style= {styles.infoLabel}>{tokenInfo?.decimals}</Text>
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
