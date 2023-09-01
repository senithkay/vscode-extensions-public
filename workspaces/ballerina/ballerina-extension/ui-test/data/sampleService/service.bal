import ballerina/http;

service /breakingbad on new http:Listener(9090) {

    resource function get characters() returns error?|Character[] {

    }

    resource function post cooking() returns error?|Character {

    }

    resource function post selling() returns error?|record {|*http:Accepted; Character body;|} {

    }
}

type Character record {
};
