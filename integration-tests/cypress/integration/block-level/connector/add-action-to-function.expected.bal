import ballerina/http;
import ballerinax/googleapis.sheets;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

mysql:Client mysqlEp = check new ();

function myfunction(sheets:Client sheetsEp) returns error? {
    stream<record {}, error?> queryResponse = mysqlEp->query(sqlQuery = ``);
    http:Client httpEp = check new (url = "https://foo.com");
    stream<sheets:File, error?> getAllSpreadsheetsResponse = check sheetsEp->getAllSpreadsheets();
    record {} getResponse = check httpEp->get(path = "");
}
