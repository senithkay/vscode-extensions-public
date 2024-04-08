import { getLogger } from "../logger/logger";
import { ChoreoRPCClient } from "./client";

export function initRPCServer() {
    ChoreoRPCClient.getInstance()
        .then(() => {
            console.log("Initialized Choreo RPC Client successfully");
        })
        .catch((err) => {
            console.error("Error while initializing rpc client", err);
            getLogger().error("Error while initializing rpc client", err);
        });
}
