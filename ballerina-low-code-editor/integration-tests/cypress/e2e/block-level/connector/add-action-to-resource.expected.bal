import ballerina/http;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

mysql:Client mysqlEp = check new ();

service /hello on new http:Listener(9090) {
    resource function get .() returns error? {
        stream<record {}, error?> queryResponse = mysqlEp->query(sqlQuery = ``);
        http:Client httpEp = check new (url = "https://foo.com");
        record {} getResponse = check httpEp->get(path = "");
    }
    resource function post .() returns error? {
    }
}
