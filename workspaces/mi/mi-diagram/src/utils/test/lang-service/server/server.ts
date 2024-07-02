import { ChildProcess, spawn } from "child_process";
import * as path from "path";
import treekill from "tree-kill";
import { toSocket } from "@codingame/monaco-jsonrpc";
// tslint:disable-next-line:no-submodule-imports
import * as serverRPC from "@codingame/monaco-jsonrpc/lib/server";
import { Server } from "ws";

const main: string = 'org.eclipse.lemminx.XMLServerLauncher';

export function spawnStdioServer(javaHome: string): ChildProcess {
    let executable: string = path.join(javaHome, 'bin', 'java');
    // let schemaPath = this.context.asAbsolutePath(path.join("synapse-schemas", "synapse_config.xsd"));
    const currentDir = process.cwd();
    console.log("testPath: " + currentDir);
    let schemaPath = path.join(currentDir, "../", "mi-extension", "synapse-schemas", "synapse_config.xsd");
    // let langServerCP = this.context.asAbsolutePath(path.join('ls', '*'));     // Folder path for jars           
    let langServerCP = path.join(currentDir, "../", "mi-extension", "ls", "*");         
    let schemaPathArg = '-DSCHEMA_PATH=' + schemaPath;
    const args: string[] = [schemaPathArg, '-cp', langServerCP];
    const env = {...process.env};
    const lsProcess = spawn('java', [
        '-cp',
        '/Users/tharinduj/Documents/wso2/git/ballerina-plugin-vscode/workspaces/mi/mi-extension/ls/org.eclipse.lemminx-0.24.0-wso2v19-SNAPSHOT.jar:/Users/tharinduj/Documents/wso2/git/ballerina-plugin-vscode/workspaces/mi/mi-extension/ls/org.eclipse.lemminx-uber.jar',
        'org.eclipse.lemminx.XMLServerLauncher'
    ]);
    console.log("LS Process started with PID: " , lsProcess);
    return lsProcess;
}

export function spawnWSServer(javaHome: string, port: number): Server {
    // start web-server
    const wsServer = new Server({ port });
    wsServer.on("connection", (socket: WebSocket) => {
        // start lang-server process
        const lsProcess = spawnStdioServer(javaHome);
        const serverConnection = serverRPC.createProcessStreamConnection(lsProcess);
        // forward websocket messages to stdio of ls process
        const clientConnection = serverRPC.createWebSocketConnection(toSocket(socket));
        serverRPC.forward(clientConnection, serverConnection);
        const killLSProcess = () => {
            treekill(lsProcess.pid);
            clientConnection.dispose();
        };
        socket.onclose = killLSProcess;
        socket.onerror = killLSProcess;
    });
    return wsServer;
}
