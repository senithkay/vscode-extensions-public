/*
* Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein is strictly forbidden, unless permitted by WSO2 in accordance with
* the WSO2 Commercial License available at http://wso2.com/licenses.
* For specific language governing the permissions and limitations under
* this license, please see the license as well as any agreement you’ve
* entered into with WSO2 governing the purchase of this software and any
* associated services.
*/
import * as React from "react";

import { expect } from "@jest/globals";
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { ModulePart, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import 'jest-canvas-mock';
import path from "path";

import { createLangClient, getSyntaxTree } from "./utils/ls-utils";
import { renderServiceDesignOverlay } from "./utils/service/renderer";
import { testResourceFunction } from "./utils/service/resourceFunction";
import { Service } from "./utils/service/service";
import { indexer, ResourceInfo, waitForResourceLoadersToDisappear } from "./utils/service/utils";

const BAL_FILE_NAME = "service.bal";

let langClient: BalleriaLanguageClient;
let completeST: ModulePart;
let serviceDecl: ServiceDeclaration;
let filePath: string;

beforeAll(async () => {
    langClient = await createLangClient();
    filePath = path.resolve(__dirname, "bal-project", BAL_FILE_NAME);
    const st = await getSyntaxTree(langClient, filePath);
    expect(st.parseSuccess).toBeTruthy();
    expect(st.syntaxTree).toBeDefined();
    completeST = st.syntaxTree as ModulePart;
    serviceDecl = completeST.members[0] as ServiceDeclaration;
    expect(serviceDecl).toBeDefined();
});

beforeEach(async () => {
    await renderServiceDesignOverlay(filePath, completeST, serviceDecl, BAL_FILE_NAME, langClient);
    await waitForResourceLoadersToDisappear(serviceDecl.members.length);
});

test('test service', async () => {
    Service.serviceHeaderTextShouldInclude(`/foo`);
    Service.listenerHeaderTextShouldInclude(`new http:Listener(9090)`);
});

const testData: ResourceInfo[] = [
    {
        functionName: "POST",
        resourcePath: "orders",
        responses: [
            { code: "500", description: "error?" },
            { code: "201", description: "http:Created" }
        ],
        parameters: [{ type: "string", description: "id" }],
        body: ["Order"]
    },
    {
        functionName: "GET",
        resourcePath: "orders/[string id]",
        responses: [
            { code: "500", description: "error?" },
            { code: "200", description: "Order" }
        ],
        parameters: [
            { type: "@http:Header", description: "string" },
            { type: "http:Request", description: "req" },
            { type: "http:Caller", description: "caller" },
            { type: "http:Headers", description: "header" }
        ]
    },
    {
        functionName: "DELETE",
        resourcePath: "orders",
        responses: [
            { code: "500", description: "error?" },
            { code: "200", description: "http:Ok" }
        ]
    },
    {
        functionName: "PUT",
        resourcePath: "orders",
        responses: [
            { code: "500", description: "error?" },
            { code: "200", description: "http:Ok" },
            { code: "202", description: "http:Accepted" }
        ],
        parameters: [{ type: "string", description: "id" }],
        body: ["Order"]
    },
    {
        functionName: "PATCH",
        resourcePath: "orders/[string id]",
        responses: [
            { code: "500", description: "error?" },
            { code: "200", description: "http:Ok" },
            { code: "404", description: "http:NotFound" }
        ],
        parameters: [
            { type: "@http:Header", description: "string" },
            { type: "http:Request", description: "req" },
            { type: "http:Caller", description: "caller" },
            { type: "http:Headers", description: "header" }
        ],
        body: ["Order"]
    },
    {
        functionName: "POST",
        resourcePath: "orders/success/[string Id]",
        responses: [
            { code: "500", description: "error?" },
            { code: "201", description: "http:Created" },
            { code: "200", description: "http:Ok" },
            { code: "404", description: "http:NotFound" },
            { code: "100", description: "http:ContinueRecord Schema :Order" }
        ],
        parameters: [
            { type: "string", description: "param" },
            { type: "@http:Header", description: "string" },
            { type: "string?", description: "param3" },
            { type: "http:Request", description: "param4" },
            { type: "http:Caller", description: "param5" },
            { type: "http:Headers", description: "param6" }
        ],
        body: ["@http:Payload string payload"],
        metadata: "A post method with all possible values"
    }
];

test.each(indexer(testData))("test resource function: %#", async (resourceInfo) => {
    const { index, functionName, resourcePath, responses, parameters, body, metadata } = resourceInfo;
    testResourceFunction(
        index,
        functionName,
        resourcePath,
        responses,
        parameters,
        body,
        metadata
    );
});

//
// afterAll(async () => {
//     await stopLangServer(langClient);
// });


