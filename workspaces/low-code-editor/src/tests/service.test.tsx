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
import { screen } from "@testing-library/react";
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { ModulePart, ResourceAccessorDefinition, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import 'jest-canvas-mock';
import path from "path";

import { createLangClient, getSyntaxTree } from "./utils/ls-utils";
import { renderServiceDesignOverlay } from "./utils/service/renderer";
import { ResourceFunction } from "./utils/service/resourceFunction";
import { Response } from "./utils/service/response";
import { Service } from "./utils/service/service";
import { waitForResourceLoadingToDisappear } from "./utils/service/utils";

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

    expect(screen.queryByTestId('resource-loading')).toBeDefined();
    await waitForResourceLoadingToDisappear();

    const resourceIndex = 0;
    const resourceAccessorDefinition = serviceDecl.members[resourceIndex] as ResourceAccessorDefinition;
    const functionName = resourceAccessorDefinition.functionName.value;
    const resourcePath = resourceAccessorDefinition.relativeResourcePath.map(p => p.value).join("");

    const resourceFn = new ResourceFunction(resourceIndex);
    resourceFn.functionNameShouldInclude(functionName.toUpperCase());
    resourceFn.resourcePathShouldInclude(resourcePath);
    resourceFn.expandResource();
    resourceFn.resourceInformationIsVisible();

    const responseIndex = 0;
    const serviceMember = resourceFn.getServiceMember(resourceIndex);

    const response1 = new Response(responseIndex, serviceMember);
    response1.validateResponseCode("200");
    response1.validateResponseDescription("string");
});

//
// afterAll(async () => {
//     await stopLangServer(langClient);
// });
