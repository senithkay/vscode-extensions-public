import ballerina/http;

service /hello on new http:Listener(8080) {

    resource function post test/[string user](string test, @http:Payload string param, http:Headers contentType) returns error|int? {

    }
}
