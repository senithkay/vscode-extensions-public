import ballerina/http;

service /hello on new http:Listener(8080) {
    resource function get .() returns error? {
    }
}
