import { walletStyles } from "@/styles/walletStyles";
import { View,TextInput } from "react-native";

interface Prop {
    address: string,
    setAddress: (addr: string) => void
}

export default function AddressSearchBar({address,setAddress}:Prop) {
    return (
        <View style={walletStyles.inputContainer}>
            <TextInput
            style={walletStyles.input}
            placeholder="Enter wallet address..." 
            placeholderTextColor="#6B7280"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
            autoCorrect={false}
            />
        </View>
    )
    
}