import { getLogger } from "../logger/logger";
import { RPCClient } from "./client";
import { exec, spawn } from "child_process";
import * as fs from "fs";
import { getCliVersion, downloadCLI, getChoreoExecPath } from "./cli-install";

export function isChoreoCliInstalled(): boolean {
    const rpcPath = getChoreoExecPath();
    if (fs.existsSync(rpcPath)) {
        return true;
    } else {
        return false;
    }
}

export async function initRPCServer() {
    const installed = isChoreoCliInstalled();
    if (!installed) {
        console.log(`Choreo RPC version ${getCliVersion()} not installed`);
        await downloadCLI();
    }

    await RPCClient.getInstance();
}
