import ballerina/log;

function testStatementEditorComponents() returns error? {
    var variable = log:printInfo("Message", newArg = "newArgText");
    int var1 = 1;
    int var2 = 2;
}
