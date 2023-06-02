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

import { render } from "@testing-library/react";
import { FunctionDefinition, STNode } from "@wso2-enterprise/syntax-tree";

import { RegularFuncComponent } from "../../../Components/RenderingComponents/Function/RegularFunction";
import { sizingAndPositioning } from "../../../Utils";
import { TestProvider } from "../../TestContext";

jest.mock('react-monaco-editor');

export const renderFunctionDiagram = (focusedST: FunctionDefinition, completeST: STNode) => {
    const visitedST = sizingAndPositioning(focusedST) as FunctionDefinition;
    render(
        <TestProvider
            completeST={completeST}
            focusedST={visitedST}
        >
            <RegularFuncComponent model={visitedST} />
        </TestProvider>
    );
};
