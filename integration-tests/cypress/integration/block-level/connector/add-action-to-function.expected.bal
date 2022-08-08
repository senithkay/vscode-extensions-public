import ballerina/http;
import ballerinax/googleapis.sheets;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

mysql:Client mysqlEp = check new ();

function myfunction(sheets:Client sheetsEp) returns error? {
    http:Client httpEp = check new (url = "https://foo.com");
    record {} getResponse = check httpEp->get(path = "");
    stream<sheets:File, error?> getAllSpreadsheetsResponse = check sheetsEp->getAllSpreadsheets();
    stream<record {}, error?> queryResponse = mysqlEp->query(sqlQuery = ``);
}
