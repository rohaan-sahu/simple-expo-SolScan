import { Text } from "react-native";
import { walletStyles } from "@/styles/walletStyles";

function HomeHeaderTitle() {
    return(
        <Text style={walletStyles.title}>SolScan</Text>
    )
}

function HomeHeaderSubtitle() {
    return (
        <Text style={walletStyles.subtitle}>Explore any Solana wallet</Text>
    )
}



export {
    HomeHeaderTitle,
    HomeHeaderSubtitle
}