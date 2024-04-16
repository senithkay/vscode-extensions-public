import { getLogger } from "../logger/logger";
import { RPCClient } from "./client";

export function initRPCServer() {
    RPCClient.getInstance()
        .then(() => {
            console.log("Initialized Choreo RPC Client successfully");
        })
        .catch((err) => {
            console.error("Error while initializing rpc client", err);
            getLogger().error("Error while initializing rpc client", err);
        });
}
