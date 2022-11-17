import ballerina/http;

service /wso2 on new http:Listener(8080) {
    resource function get .() returns error? {
    }

    resource function post path1/path2(string query, @http:Payload string payload, http:Request request, http:Caller caller) returns error? {

    }
}
