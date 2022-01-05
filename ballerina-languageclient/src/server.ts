
import { StdioConnection } from "./StdioConnection";
import { Server } from "ws";
import { toSocket } from "vscode-ws-jsonrpc";
// tslint:disable-next-line: no-submodule-imports
import * as serverRPC from "vscode-ws-jsonrpc/lib/server";

const port = 9095;


export function startBallerinaLS() {
    const wsServer = new Server({ port });
    wsServer.on("connection", (socket: WebSocket) => {
        // start lang-server process
        const stdioConnection = new StdioConnection();


        const serverConnection = serverRPC.createProcessStreamConnection(stdioConnection.getChildProcess());
        // forward websocket messages to stdio of ls process
        const clientConnection = serverRPC.createWebSocketConnection(toSocket(socket));
        serverRPC.forward(clientConnection, serverConnection);

        stdioConnection.getChildProcess().on("exit", () => {
            // process.exit(0);
        })

        socket.onclose = () => {
            // stdioConnection.getChildProcess().kill('SIGINT');
            // process.exit(0);
        };
        socket.onerror = () => {
            // stdioConnection.getChildProcess().kill('SIGINT');
            // process.exit(1)
        };
    });
    return wsServer;
}
