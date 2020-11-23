import ballerina/http;
import ballerina/log;

public class WSCallerProxy {

    private http:WebSocketCaller caller;

    public function init(http:WebSocketCaller caller) {
        self.caller = caller;
    }

    public function isOpen() returns (boolean) {
        return self.caller.isOpen();
    }

    public function pushText(string msg) returns (boolean) {
        log:printInfo("responding to caller. " + self.caller.getConnectionId());
        error? pushTextError = self.caller->pushText(msg);
        if (pushTextError is error) {
            log:printError("error responding to caller. " + pushTextError.message());
        } 
        return !(pushTextError is error);
    }

}
