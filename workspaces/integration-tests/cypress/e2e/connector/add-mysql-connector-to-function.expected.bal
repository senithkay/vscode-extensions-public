import ballerinax/mysql;
import ballerinax/mysql.driver as _;

function myfunction() returns error? {
    mysql:Client mysqlEp = check new ();
}
