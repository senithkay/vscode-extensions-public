import ballerina/http;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

mysql:Client mysqlEp = check new ();

service /hello on new http:Listener(9090) {
    resource function get .() returns error? {
        http:Client httpEp = check new (url = "https://foo.com");
    }
    resource function post .() returns error? {
    }
}
