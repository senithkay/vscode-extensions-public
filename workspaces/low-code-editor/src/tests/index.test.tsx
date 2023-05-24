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

import { fireEvent, render, screen } from "@testing-library/react";
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { ModulePart, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import 'jest-canvas-mock';
import path from "path";

import { ServiceDesignOverlay } from "../Diagram/components/ServiceDesignOverlay";

import { TestProvider } from "./TestContext";
import { createLangClient, getFileContent, getSyntaxTree } from "./utils/ls-utils";

let langClient: BalleriaLanguageClient;

beforeAll(async () => {
    langClient = await createLangClient();
}, 20000);

test('Test Lang Server wiring', async () => {
    const balFile = path.resolve(__dirname, "resources", "test.bal");
    const st = await getSyntaxTree(langClient, balFile);
    expect(st.parseSuccess).toBeTruthy();
    expect(st.syntaxTree).toBeDefined();
    const syntaxTree = st.syntaxTree as ModulePart;
    const serviceDecl = syntaxTree.members[0] as ServiceDeclaration;
    expect(serviceDecl).toBeDefined();
    expect(serviceDecl.absoluteResourcePath.length).toBe(1);
});

// test('Test adding new resource', async () => {
//     render(<ServiceDesignOverlay model={undefined} onCancel={undefined} />);
//     fireEvent.click(screen.getByText("Resource"));
// });

test('Test adding new resource', async () => {
    const balFile = path.resolve(__dirname, "resources", "test.bal");
    const st = await getSyntaxTree(langClient, balFile);
    const currentFileContent = await getFileContent(balFile);
    expect(st.parseSuccess).toBeTruthy();
    expect(st.syntaxTree).toBeDefined();
    const syntaxTree = st.syntaxTree as ModulePart;
    const serviceDecl = syntaxTree.members[0] as ServiceDeclaration;
    expect(serviceDecl).toBeDefined();
    expect(serviceDecl.absoluteResourcePath.length).toBe(1);
    render(
        <TestProvider
            completeST={st.syntaxTree}
            focusedST={serviceDecl}
            currentFileContent={currentFileContent}
            fileName={"test.bal"}
            fileUri={balFile}
            langClient={langClient}
        >
            <ServiceDesignOverlay model={serviceDecl} onCancel={undefined} />
        </TestProvider>
    );
    fireEvent.click(screen.getByText("Resource"));
});


//
// afterAll(async () => {
//     await stopLangServer(langClient);
// });
