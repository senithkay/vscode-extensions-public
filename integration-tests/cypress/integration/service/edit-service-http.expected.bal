import ballerina/http;
import ballerina/log;

service /hello on new http:Listener(9090) {
    resource function get .() returns error? {
        log:printDebug("This is a debug message.");
    }
}
