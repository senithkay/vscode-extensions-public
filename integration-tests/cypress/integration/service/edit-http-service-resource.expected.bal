import ballerina/http;

service /wso2 on new http:Listener(8080) {
    resource function get .() returns error? {
    }

    resource function get [int p3](int q3) returns error? {

    }
}
