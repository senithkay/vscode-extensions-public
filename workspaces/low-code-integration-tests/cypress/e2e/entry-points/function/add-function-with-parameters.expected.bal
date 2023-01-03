import ballerina/log;

function myfunction(string name) returns error? {

    log:printDebug(name);
}

function getGreeting(string name, int quantity) returns string {

    return name + quantity.toString();
}
