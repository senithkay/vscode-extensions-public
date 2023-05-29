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
import { ModulePart, ResourceAccessorDefinition, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import 'jest-canvas-mock';
import path from "path";

import { createLangClient, getSyntaxTree } from "./utils/ls-utils";
import { Parameter } from "./utils/service/parameter";
import { renderServiceDesignOverlay } from "./utils/service/renderer";
import { ResourceFunction } from "./utils/service/resourceFunction";
import { Response } from "./utils/service/response";
import { Service } from "./utils/service/service";
import { ParameterInfo, ResponseInfo, waitForResourceLoadersToDisappear } from "./utils/service/utils";

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
    expect(serviceDecl.absoluteResourcePath.length).toBe(1);
});

test('Test simple service', async () => {
    await renderServiceDesignOverlay(filePath, completeST, serviceDecl, BAL_FILE_NAME, langClient);

    Service.serviceHeaderTextShouldInclude(serviceDecl.absoluteResourcePath[0].value);
    Service.listenerHeaderTextShouldInclude(serviceDecl.expressions[0].source.trim());

    await waitForResourceLoadersToDisappear(serviceDecl.members.length);

    // ##### Test resource function 1 #####
    const resourceIndex1 = 0;
    const functionName1 = "GET";
    const resourcePath1 = "greeting";
    const responses1: ResponseInfo[] = [{ code: "200", description: "string" }];

    testResourceFunction(resourceIndex1, functionName1, resourcePath1, responses1);

    // ##### Test resource function 2 #####
    const resourceIndex2 = 1;
    const functionName2 = "GET";
    const resourcePath2 = "greeting2";
    const responses2: ResponseInfo[] = [
        { code: "200", description: "string" },
        { code: "500", description: "error" }
    ];
    const parameters2: ParameterInfo[] = [{ type: "string", description: "name" }];

    testResourceFunction(resourceIndex2, functionName2, resourcePath2, responses2, parameters2);
});

const testResourceFunction = (resourceIndex: number,
                              functionName: string,
                              resourcePath: string,
                              responses: ResponseInfo[],
                              parameters?: ParameterInfo[]) => {
    const resourceFn = new ResourceFunction(resourceIndex);

    resourceFn.functionNameShouldInclude(functionName.toUpperCase());
    resourceFn.resourcePathShouldInclude(resourcePath);
    resourceFn.expandResource();
    resourceFn.resourceInformationIsVisible();

    const serviceMember = resourceFn.getServiceMember(resourceIndex);

    responses.forEach((response, index) => {
        const expectedCode = response.code;
        const expectedDescription = response.description;
        validateResponse(index, serviceMember, expectedCode, expectedDescription);
    });

    if (parameters !== undefined) {
        parameters.forEach((param, index) => {
            const expectedType = param.type;
            const expectedDescription = param.description;
            validateParameter(index, serviceMember, expectedType, expectedDescription);
        });
    }
};

const validateResponse = (responseIndex: number,
                          serviceMember: HTMLElement,
                          expectedCode: string,
                          expectedDescription: string) => {
    const response = new Response(responseIndex, serviceMember);
    response.validateResponseCode(expectedCode);
    response.validateResponseDescription(expectedDescription);
};

const validateParameter = (paramIndex: number,
                           serviceMember: HTMLElement,
                           expectedType: string,
                           expectedDescription: string) => {
    const parameter = new Parameter(paramIndex, serviceMember);
    parameter.validateParamType(expectedType);
    parameter.validateParamDescription(expectedDescription);
};

//
// afterAll(async () => {
//     await stopLangServer(langClient);
// });
