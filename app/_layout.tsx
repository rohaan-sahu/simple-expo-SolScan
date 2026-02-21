import "react-native-get-random-values";
import { Buffer } from "buffer";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import "@/lib/polyfills";

global.Buffer = global.Buffer || Buffer;

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }} >
                <Stack.Screen name="(tabs)"/>
                <Stack.Screen name="token/[mint]"/>
                <Stack.Screen
                    name="send"
                    options={{
                    presentation: "modal",  // slides up from bottom like a sheet
                    }}
                />
            </Stack>
        </SafeAreaProvider>
    )
}
