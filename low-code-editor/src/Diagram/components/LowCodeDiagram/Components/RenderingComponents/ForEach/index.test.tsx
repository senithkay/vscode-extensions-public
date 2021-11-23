// /*
//  * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
//  *
//  *  This software is the property of WSO2 Inc. and its suppliers, if any.
//  *  Dissemination of any information or reproduction of any material contained
//  *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
//  *  the WSO2 Commercial License available at http://wso2.com/licenses. For specific
//  *  language governing the permissions and limitations under this license,
//  *  please see the license as well as any agreement you’ve entered into with
//  *  WSO2 governing the purchase of this software and any associated services.
//  *
//  */
// import * as React from 'react';

// import { BlockStatement, ForeachStatement } from '@wso2-enterprise/syntax-tree';

// import { render, RenderResult, waitForElement } from "../../../../../tests/utils/test-utils"
// import { BlockViewState, ForEachViewState, SimpleBBox } from '../../view-state';

// import { ForEach } from "./index";

// describe('Foreach test suite', () => {
//     const bodyNode: BlockStatement = {
//         kind: "Foreach",
//         viewState: new BlockViewState(),
//         statements: [],
//         closeBraceToken: undefined,
//         openBraceToken: undefined,
//         source: ""
//     };
//     const node: ForeachStatement = {
//         kind: "Foreach",
//         viewState: new ForEachViewState(),
//         blockStatement: bodyNode,
//         source: "",
//         actionOrExpressionNode: undefined,
//         forEachKeyword: undefined,
//         inKeyword: undefined,
//         typedBindingPattern: undefined
//     };

//     if (!node.viewState) {
//         node.viewState.bbox.cx = 0;
//         node.viewState.bbox.cy = 0;
//     }

//     const { getByTestId  } = render(<svg><ForEach model={node}/></svg>);
//     it("renders properly.", async () => {
//         const foreachBlock = getByTestId("foreach-block");
//         expect(foreachBlock).toBeInTheDocument();
//     });
// });
