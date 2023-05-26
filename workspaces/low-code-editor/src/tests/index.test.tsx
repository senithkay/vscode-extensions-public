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
import { fireEvent, render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { ModulePart, ResourceAccessorDefinition, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import 'jest-canvas-mock';
import path from "path";

import { ServiceDesignOverlay } from "../Diagram/components/ServiceDesignOverlay";

import { TestProvider } from "./TestContext";
import { createLangClient, getFileContent, getSyntaxTree } from "./utils/ls-utils";

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
    const currentFileContent = await getFileContent(filePath);
    render(
        <TestProvider
            completeST={completeST}
            focusedST={serviceDecl}
            currentFileContent={currentFileContent}
            fileName={BAL_FILE_NAME}
            fileUri={filePath}
            langClient={langClient}
        >
            <ServiceDesignOverlay model={serviceDecl} onCancel={undefined} />
        </TestProvider>
    );

    const serviceContainer = screen.getByTestId("service-container");
    const servicePath = within(serviceContainer).getByTestId("service-path");
    expect(within(servicePath).getByText(`Service ${serviceDecl.absoluteResourcePath[0].value}`)).toBeDefined();
    const listenerText = within(serviceContainer).getByTestId("listener-text");
    expect(within(listenerText).getByText(`listening on ${serviceDecl.expressions[0].source.trim()}`)).toBeDefined();

    expect(screen.queryByTestId('resource-loading')).toBeDefined();

    await waitForElementToBeRemoved(() => screen.getByTestId('resource-loading'));

    const resourceAccessorDefinition = serviceDecl.members[0] as ResourceAccessorDefinition;
    const resourceHeader = screen.getByTestId("resource-header-0");

    const resourceType = within(resourceHeader).getByTestId("resource-type-0");
    expect(resourceType).toBeDefined();
    const functionName = resourceAccessorDefinition.functionName.value;
    expect(within(resourceType).getByText(functionName.toUpperCase())).toBeDefined();

    const resourceQueryParams = screen.getByTestId("resource-query-params-0");
    expect(resourceQueryParams).toBeDefined();
    const resourcePath = resourceAccessorDefinition.relativeResourcePath.map(p => p.value).join("");
    expect(within(resourceQueryParams).getByText(resourcePath)).toBeDefined();

    fireEvent.click(within(resourceHeader).getByTestId("resource-expand-button-0"));
    const serviceMember = screen.getByTestId("service-member-0");
    expect(serviceMember).toBeDefined();

    const response1 = within(serviceMember).getByTestId("responses-row-0");
    expect(response1).toBeDefined();
    const response1Code = within(response1).getByTestId("response-code-0");
    expect(within(response1Code).getByText("200")).toBeDefined();
    const responseDescription = within(response1).getByTestId("response-description-0");
    expect(within(responseDescription).getByText("string")).toBeDefined();
});


//
// afterAll(async () => {
//     await stopLangServer(langClient);
// });
