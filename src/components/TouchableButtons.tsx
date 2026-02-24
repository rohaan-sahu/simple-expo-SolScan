import { walletStyles } from "@/styles/walletStyles";
import { TouchableOpacity,View,Text } from "react-native";

interface Props {
    isDevnet: boolean,
    toggleNetwork: () => void,
}

function SwitchNetwork({isDevnet,toggleNetwork}:Props) {
    return (
        <TouchableOpacity style={walletStyles.networkToggle} onPress={toggleNetwork}>
            <View style={[walletStyles.networkDot, isDevnet && walletStyles.networkDotDevnet]} />
            <Text style={walletStyles.networkText}>{isDevnet ? "Devnet" : "Mainnet"}</Text>
        </TouchableOpacity>
        )
}

export {
    SwitchNetwork
}