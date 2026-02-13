curl https://api.devnet.solana.com -s -X \
   POST -H "Content-Type: application/json" -d ' 
   {
     "jsonrpc": "2.0",
     "id": 1,
     "method": "getTokenSupply",
     "params": [
       "3wyAj7Rt1TWVPZVteFJPLa26JmLvdb1CAKEFZm3NY75E",
       {
         "commitment": "finalized"
       }
     ]
   }
 '