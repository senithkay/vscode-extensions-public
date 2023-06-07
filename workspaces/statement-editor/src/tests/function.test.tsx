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
import {screen, within} from "@testing-library/react";
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { createLangClient, getSyntaxTree } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, ModulePart } from "@wso2-enterprise/syntax-tree";
import 'jest-canvas-mock';
import path from "path";

import {renderFunctionForm} from "./utils/function/renderer";

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
    renderFunctionForm(functionDefinition);
    const functionForm = screen.getByTestId("function-form");
    expect(functionForm).toBeDefined();
    const functionName = within(functionForm).getByTestId(`lite-expression-editor-function-name`);
    expect(functionName).toBeDefined();
    // function name assertion fails since the value is handled by the useRef (which is not covered by the mocked MonacoEditor)
    // expect(functionName.textContent).toEqual('getPerson');
    expect(within(functionForm).getByTestId(`function-param-0`).textContent).toEqual('string name');
    expect(within(functionForm).getByTestId(`function-param-1`).textContent).toEqual('int age');
    expect(within(functionForm).getByTestId(`function-param-2`).textContent).toEqual('Address address');
    const returnType = within(functionForm).getByTestId(`lite-expression-editor-return-type`);
    expect(returnType).toBeDefined();
    // return type assertion fails since the value is handled by the useRef (which is not covered by the mocked MonacoEditor)
    // expect(returnType.textContent).toEqual('Person|error?');
});

//
// afterAll(async () => {
//     await stopLangServer(langClient);
// });


