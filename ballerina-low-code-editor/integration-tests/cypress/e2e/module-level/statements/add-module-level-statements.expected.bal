import ballerina/log;

function myfunction() returns json|error? {

    log:printDebug("This is a debug message.");
}

function getGreeting() returns string? {

    log:printDebug("This is a debug message.");
    log:printWarn("This is a warning message.");
    return;
}
