import ballerinax/mysql;
import ballerinax/mysql.driver as _;
import ballerina/http;

service /hello on new http:Listener(9090) {
    resource function get .() returns error? {
    }
    resource function post .() returns error? {
        mysql:Client dbcon = check new (database = "testdb");
        stream<record {}, error?> queryResponse = dbcon->query(`SELECT * FROM uses;`);
        record {|record {} value;|}|error? recordResult = queryResponse.next();
        while recordResult is record {|record {} value;|} {
            // do something
            recordResult = queryResponse.next();
        }
        check queryResponse.close();
        check dbcon.close();
    }
}
