import ballerina/http;
import ballerina/log;

const RPC_HANDLER = "rpcHandler";

string ping = "ping";
byte[] pingData = ping.toBytes();

@http:WebSocketServiceConfig {
    path: "/",
    subProtocols: ["json"],
    idleTimeoutInSeconds: 900
}
service serviceName on new http:Listener(9090) {
    resource function onOpen(http:WebSocketCaller caller) {
        log:printInfo("New client connected: " + caller.getConnectionId());
        WSCallerProxy callerProxy = new WSCallerProxy(caller);
        BWebSocketRPCHandler rpcHandler = newBWebSocketRPCHandler1(callerProxy);
        caller.setAttribute(RPC_HANDLER, rpcHandler);
    }
    resource function onText(http:WebSocketCaller caller, string data, boolean finalFrame) {
        log:printDebug("Text message received: " + caller.getConnectionId());
        log:printDebug(data);
        BWebSocketRPCHandler rpcHandler = <BWebSocketRPCHandler>caller.getAttribute(RPC_HANDLER);
        rpcHandler.onMessage(data);
    }

    resource function onPing(http:WebSocketCaller caller, byte[] data) {
        log:printDebug("Sending PONG: " + caller.getConnectionId());
        var err = caller->pong(data);
        if (err is http:WebSocketError) {
            log:printError("Error occurred when responding to PING.", err);
        }
    }

    resource function onIdleTimeout(http:WebSocketCaller caller) {
        log:printWarn("Reached idle timeout: " + caller.getConnectionId());
        var err = caller->close(statusCode = 1001, reason =
                                    "Connection timeout");
        if (err is http:WebSocketError) {
            log:printError("Error occurred when closing the connection", err);
        }
    }

    resource function onError(http:WebSocketCaller caller, error err) {
        log:printError("Error occurred: " + caller.getConnectionId(), err);
    }

    resource function onClose(http:WebSocketCaller caller, int statusCode, string reason) {
        log:printInfo("Connection closing: " + caller.getConnectionId());
        BWebSocketRPCHandler rpcHandler = <BWebSocketRPCHandler>caller.getAttribute(RPC_HANDLER);
        rpcHandler.close();
    }
}
