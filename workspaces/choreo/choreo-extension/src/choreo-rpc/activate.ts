import { getLogger } from "../logger/logger";
import { RPCClient } from "./client";
import { exec } from "child_process";
import * as fs from "fs";
import { getCliVersion, downloadCLI, getChoreoExecPath } from "./cli-install";

export function isChoreoCliInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
        const rpcPath = getChoreoExecPath();
        if (fs.existsSync(rpcPath)) {
            exec(`${rpcPath} --version`, (error) => {
                if (error) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        } else {
            resolve(false);
        }
    });
}

export async function initRPCServer(){
    const installed = await isChoreoCliInstalled();
    if (!installed) {
        console.log(`Choreo RPC version ${getCliVersion()} not installed`);
        await downloadCLI();
    }

    await RPCClient.getInstance();
}
