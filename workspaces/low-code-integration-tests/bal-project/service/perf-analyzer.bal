// Copyright (c) 2022 WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
//
// WSO2 Inc. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
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
