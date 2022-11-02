import ballerinax/mysql;
import ballerinax/mysql.driver as _;
import ballerina/http;

http:Client httpEp = check new (url = "https://foo.com");
mysql:Client mysqlEp = check new ();
