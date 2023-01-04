import ballerina/http;

service /hello on new http:Listener(9090) {

    resource function post .() returns error? {

        return null;
    }

}
