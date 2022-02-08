import ballerina/log;
import ballerina/http;

service /hello on new http:Listener(9090) {
    resource function get .() returns error? {
    }

    resource function get world() returns error? {

        http:Client boo = check new ("https://foo.com");
        json getResponse = check boo->get("foo");
        log:printDebug("This is a debug message.");
    }
}
