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

// import { fireEvent, render, RenderResult } from "../../../../../../tests/utils/test-utils"

// import { DeleteBtn } from "./index";

// describe('deleteBtn button test suit', () => {
//     let deleteBtn: RenderResult;
//     let deleteBtnNode: HTMLElement[];

//     beforeEach(() => {
//         deleteBtn = render(
//             <svg>
//                 <DeleteBtn
//                     cx={100}
//                     cy={100}
//                     model={null}
//                 />
//             </svg>
//         );
//         deleteBtnNode = deleteBtn.getAllByTestId("deleteBtn");
//     });

//     it("delete button renders properly", async () => {
//         expect(deleteBtnNode[0]).toBeInTheDocument();
//     });

//     it("delete button on mouse enter event", async () => {
//         expect(deleteBtnNode[0].classList[0]).toEqual("delete-icon-show");
//         fireEvent.mouseLeave(deleteBtnNode[0]);
//     });

// });
