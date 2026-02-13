// Replace 'https://api.mainnet-beta.solana.com/' with a dedicated Helius/QuickNode DAS endpoint for best reliability.
// The public endpoint might still fail with high traffic.

import { tokenDetails } from "./types";

const TOKEN_MINT_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_URL || "http://api.mainnet-beta.solana.com"; // Use a specialized RPC URL here for best results

export const tokenName = async (mintAddress: string):Promise<tokenDetails | null> => {
    try {
        const response = await fetch(RPC_ENDPOINT, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "id": "text",
                "method": "getAsset",
                "params": { id: mintAddress }
            }),
        });
        
        const data = await response.json();
        
        const image = data.result.content.links.image;
        const name = data.result.content.metadata.name;
        const symbol = data.result.content.metadata.symbol;

        console.log('token sent');
        return {
            image,
            name,
            symbol
        }
        
    } catch (error) {
        console.error("Error fetching token asset:", error);
        return null;
    }
}
