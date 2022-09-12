import ballerinax/googleapis.sheets;
import ballerina/http;

service /hello on new http:Listener(9090) {
    resource function get .() returns error? {
        sheets:Client sheetsEp = check new (spreadsheetConfig = {
            auth: {
                token: ""
            }
        });
    }
    resource function post .() returns error? {
    }
}
