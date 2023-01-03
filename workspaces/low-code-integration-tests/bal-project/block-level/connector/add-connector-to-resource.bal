import ballerina/http;

service /hello on new http:Listener(9090) {
    resource function get .() returns error? {
    }
    resource function post .() returns error? {
    }
}
