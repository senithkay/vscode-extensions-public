import ballerina/http;

function myfunction() returns error? {
    http:Client httpEp = check new (url = "", config = {
        httpVersion: "",
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
