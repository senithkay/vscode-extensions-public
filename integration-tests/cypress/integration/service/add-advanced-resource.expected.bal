import ballerina/http;

service /wso2 on new http:Listener(8080) {
    resource function get .() returns error? {
    }

    resource function get path1/path2(string query, @http:Payload string reqPayload, http:Request request, http:Caller caller) returns error? {

    }
}
