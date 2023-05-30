import ballerina/http;

service /foo on new http:Listener(9090) {

    resource function post orders(string id, @http:Payload Order payload) returns error?|http:Created {
        return;
    }

    resource function get orders/[string id](@http:Header string access, http:Request req, http:Caller caller, http:Headers header) returns error?|Order {

    }

    resource function delete orders(string id = "None") returns error?|http:Ok {

    }

    resource function put orders(@http:Payload Order payload, string id) returns error?|http:Ok|http:Accepted {

    }

    resource function patch orders/[string id](@http:Header string access, @http:Payload Order payload, http:Request req, http:Caller caller, http:Headers header) returns error?|http:Ok|http:NotFound {

    }

    # A post method with all possible values
    resource function post orders/success/[string Id](string param, @http:Header string param1, string? param3, @http:Payload string payload, http:Request param4, http:Caller param5, http:Headers param6, @http:Header string param7 = "world", string param2 = "foo") returns error?|http:Created|http:Ok|http:NotFound|record {|*http:Continue; Order body;|} {

    }
}

type Order record {
};
