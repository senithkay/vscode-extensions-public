import ballerina/http;

const RPC_HANDLER = "rpcHandler";

@http:WebSocketServiceConfig {
    path: "/",
    subProtocols: ["json"],
    idleTimeoutInSeconds: 120
}
service serviceName on new http:Listener(9090) {
    resource function onOpen(http:WebSocketCaller caller) {
        WSCallerProxy callerProxy = new(caller);
        BWebSocketRPCHandler rpcHandler = newBWebSocketRPCHandler1(callerProxy);
        caller.setAttribute(RPC_HANDLER, rpcHandler);
    }
    resource function onText(http:WebSocketCaller caller, string data, boolean finalFrame) {
        BWebSocketRPCHandler rpcHandler = <BWebSocketRPCHandler> caller.getAttribute(RPC_HANDLER);
        rpcHandler.onMessage(data);
    }
    resource function onClose(http:WebSocketCaller caller, int statusCode, string reason) {
        BWebSocketRPCHandler rpcHandler = <BWebSocketRPCHandler> caller.getAttribute(RPC_HANDLER);
        rpcHandler.close();
    }
}
