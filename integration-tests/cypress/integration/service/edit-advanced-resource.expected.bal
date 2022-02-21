import ballerina/http;

service /wso2 on new http:Listener(8080) {
    resource function get .() returns error? {
    }

    resource function get path2(string query, http:Request request) returns error? {

    }
}
