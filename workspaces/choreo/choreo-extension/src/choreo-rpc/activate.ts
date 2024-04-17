import { getLogger } from "../logger/logger";
import { RPCClient } from "./client";

export const initRPCServer = async ():Promise<RPCClient | undefined> =>{
    try{
        const client = await RPCClient.getInstance();
        console.log("Initialized Choreo RPC Client successfully");
        return client;
    }catch(err){
        console.error("Error while initializing rpc client", err);
        getLogger().error("Error while initializing rpc client", err);
    }
}
