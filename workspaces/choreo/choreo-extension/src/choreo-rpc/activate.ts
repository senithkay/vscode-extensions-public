import { getLogger } from "../logger/logger";
import { RPCClient } from "./client";
import { ChildProcess, exec } from 'child_process'
import * as vscode from 'vscode';

export function isChoreoCliInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
        exec('choreo --version', (error) => {
            if (error) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

export async function initRPCServer() {
    const installed = await isChoreoCliInstalled();

    if (!installed) {
        getLogger().debug("Choreo CLI is not installed. Prompting user to install.");
        const resp = await vscode.window.showInformationMessage(
            "Choreo CLI is not installed. Please install it to use the extension.",
            "Install",
            "Learn More"
        );

        if (resp === "Install") {
            // check which platform the user is on and install the cli accordingly

            let cp: ChildProcess | undefined;
            switch (process.platform) {
                case 'win32':
                    cp = exec('pwsh -Command "iwr -useb https://cli.choreo.dev/install.ps1 | iex"');
                    break;
                case 'darwin':
                case 'linux':
                    cp = exec('curl -o- https://cli.choreo.dev/install.sh | bash');
                    break;
                default:
                    cp = undefined;
            }

            if (!cp) {
                return;
            }

            const channel = vscode.window.createOutputChannel("Choreo CLI Installation");
            channel.show();

            cp.stdout?.on('data', (data) => {
                channel.append(data);
            });

            cp.stderr?.on('data', (data) => {
                channel.append(data);
            });

            cp.on('close', (code) => {
                if (code === 0) {
                    vscode.window.showInformationMessage(
                        "Choreo CLI installed successfully. Please reload the window to continue."
                    );
                } else {
                    vscode.window.showErrorMessage("Failed to install Choreo CLI. Please try again.");
                }
            });

        } else if (resp === "Learn More") {
            vscode.env.openExternal(vscode.Uri.parse("https://wso2.com/choreo/docs/choreo-cli/get-started-with-the-choreo-cli/"));
        }
        return;
    }

    try {
        await RPCClient.getInstance();
    } catch (e) {
        getLogger().error("failed to initialize rpc client", e);
    }
}
