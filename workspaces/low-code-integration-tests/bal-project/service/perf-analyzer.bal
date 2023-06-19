// Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import ballerina/http;

type Stats record {|
    string country;
    decimal totalCasesPerMillion;
|};

// Service declaration specifies base path for the resource names. The base path is `/` in this example.
service / on new http:Listener(9095) {
    resource function get hello(string name) returns json|error? {
        http:Client httpEndpoint = check new ("https://api.chucknorris.io/");
        json getResponse = check httpEndpoint->get("/jokes/random");
        // json|error? hello2Result = hello2("ss");
        json getResponse2 = check httpEndpoint->get("/jokes/random");
        json getResponse3 = check httpEndpoint->get("/jokes/random");

        return "Hello, " + name;
    }

    resource function get stats/[string shortCountryName]() returns Stats|error {

        http:Client httpEp = check new (url = "");
        decimal totalCases;

        if (shortCountryName == "LK") {
            record {} getResponse = check httpEp->get(path = "https://postman-echo.com");
            totalCases = <decimal>getResponse.get("/get");
        } else {
            record {} getResponse = check httpEp->get(path = "https://postman-echo.com");
            totalCases = <decimal>getResponse.get("/post");
        }

        decimal totalCasesPerMillion = totalCases / <decimal>100;
        Stats payload = {country: shortCountryName, totalCasesPerMillion: totalCasesPerMillion};
        return payload;
    }
}
