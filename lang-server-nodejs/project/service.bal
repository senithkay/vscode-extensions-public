import ballerina/http;

function sayHello(http:Caller caller, http:Request req) {
   error? d = caller->created("");
   
}
