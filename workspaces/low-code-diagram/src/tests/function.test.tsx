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
import { screen, within } from "@testing-library/react";
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { createLangClient, getSyntaxTree } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, ModulePart } from "@wso2-enterprise/syntax-tree";
import 'jest-canvas-mock';
import path from "path";

import { Parameter } from "./utils/function/parameter";
import { renderFunctionDiagram } from "./utils/function/renderer";

const BAL_FILE_NAME = "function.bal";

let langClient: BalleriaLanguageClient;
let completeST: ModulePart;
let functionDefinition: FunctionDefinition;
let filePath: string;

beforeAll(async () => {
    langClient = await createLangClient();
    filePath = path.resolve(__dirname, "bal-project", BAL_FILE_NAME);
    const st = await getSyntaxTree(langClient, filePath);
    expect(st.parseSuccess).toBeTruthy();
    expect(st.syntaxTree).toBeDefined();
    completeST = st.syntaxTree as ModulePart;
    functionDefinition = completeST.members[0] as FunctionDefinition;
    expect(functionDefinition).toBeDefined();
});

test('test function', async () => {
    renderFunctionDiagram(functionDefinition, completeST);

    const functionDiagram = screen.getByTestId("module-level-function");
    expect(functionDiagram).toBeDefined();

    const functionTitle = within(functionDiagram).getByTestId(`fn-def-title`);
    expect(functionTitle.textContent).toEqual('Function getPerson');

    const fnDefParams = within(functionDiagram).getByTestId(`argument-container`);
    const params = [
        { type: 'string', name: 'name' },
        { type: 'int', name: 'age' },
        { type: 'Address', name: 'address' }
    ];

    params.forEach((param, index) => {
        const parameter = new Parameter(index, fnDefParams);
        parameter.validateParamType(param.type);
        parameter.validateParamName(param.name);
    });

    const diagramCanvas = within(functionDiagram).getByTestId(`diagram-canvas`);
    expect(diagramCanvas).toBeDefined();
});

// afterAll(async () => {
//     await stopLangServer(langClient);
// });
