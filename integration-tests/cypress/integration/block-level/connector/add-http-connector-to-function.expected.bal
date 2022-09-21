import ballerina/http;

function myfunction() returns error? {
    http:Client httpEp = check new (url = "");
}
