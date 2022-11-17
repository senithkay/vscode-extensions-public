// /*
//  * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
//  *
//  * This software is the property of WSO2 Inc. and its suppliers, if any.
//  * Dissemination of any information or reproduction of any material contained
//  * herein is strictly forbidden, unless permitted by WSO2 in accordance with
//  * the WSO2 Commercial License available at http://wso2.com/licenses.
//  * For specific language governing the permissions and limitations under
//  * this license, please see the license as well as any agreement you’ve
//  * entered into with WSO2 governing the purchase of this software and any
//  * associated services.
//  */
// import * as React from 'react';

// import { BlockStatement } from '@wso2-enterprise/syntax-tree';

// import { store } from '../../../../../$store';
// import { waitOnWorkspaceSuccess } from '../../../../../$store/actions'; // TODO
// import { fireEvent, render, RenderResult, waitForElement } from "../../../../../tests/utils/test-utils"
// import { BlockViewState } from '../../view-state';
// import { PlusViewState } from '../../view-state/plus';

// import { PlusButton } from '.';

// describe('plus button test suit', () => {
//     let plusButton: RenderResult;
//     let plusButtonNode: HTMLElement[];
//     const node: BlockStatement = {
//         kind: "Block",
//         statements: [],
//         viewState: new BlockViewState(),
//         source: "",
//         closeBraceToken: undefined,
//         openBraceToken: undefined
//     };

//     beforeEach(() => {
//         const plusViewState: PlusViewState = new PlusViewState();
//         plusViewState.bBox.cx = 100;
//         plusViewState.bBox.cy = 100;
//         store.dispatch(waitOnWorkspaceSuccess());
//         plusButton = render(
//             <svg>
//                 <PlusButton viewState={plusViewState} model={node} initPlus={false}/>
//             </svg>
//         );
//         plusButtonNode = plusButton.getAllByTestId("plus-button");
//     });

//     it("plus circle renders properly", async () => {
//         expect(plusButtonNode[0]).toBeInTheDocument();
//     });

//     it("plus circle on mouse over event", async () => {
//         expect(plusButtonNode[0].classList[0]).toEqual("holder-hide");
//         fireEvent.mouseEnter(plusButtonNode[0]);
//         expect(plusButtonNode[0].classList[0]).toEqual("holder-show");
//     });

//     it("plus circle on mouse leave event", async () => {
//         expect(plusButtonNode[0].classList[0]).toEqual("holder-hide");
//         fireEvent.mouseEnter(plusButtonNode[0]);
//         expect(plusButtonNode[0].classList[0]).toEqual("holder-show");
//         fireEvent.mouseLeave(plusButtonNode[0]);
//         expect(plusButtonNode[0].classList[0]).toEqual("holder-hide");
//     });
// });
