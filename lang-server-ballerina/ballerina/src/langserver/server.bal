import ballerina/http;
import ballerina/io;

const RPC_HANDLER = "rpcHandler";

@http:WebSocketServiceConfig {
    path: "/",
    subProtocols: ["json"],
    idleTimeoutInSeconds: 120
}
service serviceName on new http:Listener(9090) {
    resource function onOpen(http:WebSocketCaller caller) {
        io:println("\nNew client connected");
        WSCallerProxy callerProxy = new WSCallerProxy(caller);
        BWebSocketRPCHandler rpcHandler = newBWebSocketRPCHandler1(callerProxy);
        caller.setAttribute(RPC_HANDLER, rpcHandler);
    }
    resource function onText(http:WebSocketCaller caller, string data, boolean finalFrame) {
        io:println("\ntext message");
        BWebSocketRPCHandler rpcHandler = <BWebSocketRPCHandler>caller.getAttribute(RPC_HANDLER);
        rpcHandler.onMessage(data);
    }

    resource function onBinary(http:WebSocketCaller caller, byte[] b) {
    }

    resource function onPing(http:WebSocketCaller caller, byte[] data) {
    }

    resource function onPong(http:WebSocketCaller caller, byte[] data) {
    }

    resource function onIdleTimeout(http:WebSocketCaller caller) {
    }

    resource function onError(http:WebSocketCaller caller, error err) {
    }

    resource function onClose(http:WebSocketCaller caller, int statusCode, string reason) {
        io:println("\non close");
        BWebSocketRPCHandler rpcHandler = <BWebSocketRPCHandler>caller.getAttribute(RPC_HANDLER);
        rpcHandler.close();
    }
}
