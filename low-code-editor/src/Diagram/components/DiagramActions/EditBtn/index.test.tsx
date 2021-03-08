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

// import { EditBtn } from "./index";

// describe('editBtn button test suit', () => {
//     let editBtn: RenderResult;
//     let editBtnNode: HTMLElement[];

//     beforeEach(() => {
//         editBtn = render(
//             <svg>
//                 <EditBtn
//                     cx={100}
//                     cy={100}
//                     model={null}
//                 />
//             </svg>
//         );
//         editBtnNode = editBtn.getAllByTestId("editBtn");
//     });

//     it("Edit button renders properly", async () => {
//         expect(editBtnNode[0]).toBeInTheDocument();
//     });

//     it("Edit button on is on", async () => {
//         expect(editBtnNode[0].classList[0]).toEqual("edit-icon-wrapper");
//         fireEvent.mouseLeave(editBtnNode[0]);
//     });

// });
