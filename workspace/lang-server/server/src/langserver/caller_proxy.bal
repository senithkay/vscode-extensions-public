import ballerina/http;
import ballerina/log;

public type WSCallerProxy object {

    private http:WebSocketCaller caller;

    public function __init(http:WebSocketCaller caller) {
        self.caller = caller;
    }

    public function isOpen() returns (boolean) {
        return self.caller.isOpen();
    }

    public function pushText(string msg) {
        log:printInfo("responding to caller. " + msg);
        error? pushText = self.caller->pushText(msg);
        if (pushText is error) {
            log:printInfo("error responding to caller. " + pushText.reason());
        } 
    }

};
