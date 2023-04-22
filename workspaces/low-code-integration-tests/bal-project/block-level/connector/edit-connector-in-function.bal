import ballerina/http;

function myfunction() returns error? {
    http:Client httpEp = check new (url = "", config = {
        httpVersion: "2.0",
        timeout: 0,
        cache: {
            enabled: true
        },
        compression: "AUTO",
        auth: {
            username: "",
            password: ""
        }
    });
}
