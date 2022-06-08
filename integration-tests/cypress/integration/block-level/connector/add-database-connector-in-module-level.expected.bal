import ballerinax/mysql.driver as _;
import ballerinax/mysql;
import ballerina/http;

public final mysql:Client dbcon = check new (database = "testdb");

service /hello on new http:Listener(9090) {
    resource function get .() returns error? {
        stream<record {}, error?> queryResponse = dbcon->query(`SELECT * FROM uses;`);
        record {|record {} value;|}|error? recordResult = queryResponse.next();
        while recordResult is record {|record {} value;|} {
            // do something
            recordResult = queryResponse.next();
        }
        check queryResponse.close();
    }
    resource function post .() returns error? {
    }
}
