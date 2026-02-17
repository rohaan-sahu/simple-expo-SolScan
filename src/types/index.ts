 interface JSONRPCRequest {
    jsonrpc: '2.0';
    id?: string | number | null;
    method: string;
    params?: any;
 }

 interface JSONRPCResponse {
    jsonrpc: '2.0';
    id: string | number | null;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
 }

 interface JSONRPCNotification {
    jsonrpc: '2.0';
    method: string;
    param?: any;
 }

 export {
    JSONRPCRequest,
    JSONRPCResponse,
    JSONRPCNotification
}