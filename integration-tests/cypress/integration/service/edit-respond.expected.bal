import ballerina/http;

service /getData on new http:Listener(8080) {
    resource function get .() returns error? {
    }

    resource function get path1(@http:Payload string payload, http:Request request, http:Caller caller) returns error? {

        http:Response resp = new;
        resp.statusCode = 400;
        resp.setPayload("Success");
        check caller->respond("Updated success");
    }
}
