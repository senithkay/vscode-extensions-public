import ballerina/http;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

mysql:Client mysqlEp = check new ();

function myfunction() returns error? {
    http:Client httpEp = check new (url = "https://foo.com");
    record {} getResponse = check httpEp->get(path = "");
    stream<record {}, error?> queryResponse = mysqlEp->query(sqlQuery = ``);
}
