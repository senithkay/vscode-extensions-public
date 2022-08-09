import ballerinax/googleapis.sheets;
import ballerina/http;

service /hello on new http:Listener(9090) {
    resource function get .() returns error? {
        sheets:Client sheetsEp = check new (spreadsheetConfig = {
            auth: {
                token: "foo"
            }
        });
    }
    resource function post .() returns error? {
    }
}
