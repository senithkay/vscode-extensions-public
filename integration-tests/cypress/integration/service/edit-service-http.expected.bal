import ballerina/http;
import ballerina/log;

service /hello on new http:Listener(9090) {
    resource function get world() returns error? {
        log:printDebug("This is a debug message.");
    }

    resource function post world() returns error? {
        log:printDebug("This is a debug message.");
    }
}
