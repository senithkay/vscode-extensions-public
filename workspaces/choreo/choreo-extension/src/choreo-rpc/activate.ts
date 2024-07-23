import * as fs from "fs";
import { downloadCLI, getChoreoExecPath, getCliVersion } from "./cli-install";
import { RPCClient } from "./client";

function isChoreoCliInstalled(): boolean {
	const rpcPath = getChoreoExecPath();
	if (fs.existsSync(rpcPath)) {
		return true;
	}
	return false;
}

export async function initRPCServer() {
	const installed = isChoreoCliInstalled();
	if (!installed) {
		console.log(`Choreo RPC version ${getCliVersion()} not installed`);
		await downloadCLI();
	}

	await RPCClient.getInstance();
}
