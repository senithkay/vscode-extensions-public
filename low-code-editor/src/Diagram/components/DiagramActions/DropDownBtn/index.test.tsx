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

// import { DropDownMenuTrigger } from "./index";

// describe('dropdownBtn button test suit', () => {
//     let dropdownBtn: RenderResult;
//     let dropdownBtnNode: HTMLElement[];

//     beforeEach(() => {
//         dropdownBtn = render(
//             <svg>
//                 <DropDownMenuTrigger
//                     cx={100}
//                     cy={100}
//                     // tslint:disable-next-line: jsx-no-multiline-js
//                     menuOptions={{
//                         genLabel: (val) => val,
//                         options: [""],
//                         position: {
//                             x: 110,
//                             y: 110
//                         },
//                         title: "Test"
//                     }}
//                     active={false}
//                 />
//             </svg>
//         );
//         dropdownBtnNode = dropdownBtn.getAllByTestId("dropdownBtn");
//     });

//     it("dropdown button renders properly", async () => {
//         expect(dropdownBtnNode[0]).toBeInTheDocument();
//     });

//     it("dropdown button on mouse enter event", async () => {
//         expect(dropdownBtnNode[0].classList[0]).toEqual("dropdown-icon-hide");
//         fireEvent.mouseEnter(dropdownBtnNode[0]);
//         expect(dropdownBtnNode[0].classList[0]).toEqual("dropdown-icon-show");
//     });

//     it("dropdown button on mouse leave event", async () => {
//         expect(dropdownBtnNode[0].classList[0]).toEqual("dropdown-icon-hide");
//         fireEvent.mouseEnter(dropdownBtnNode[0]);
//         expect(dropdownBtnNode[0].classList[0]).toEqual("dropdown-icon-show");
//         fireEvent.mouseLeave(dropdownBtnNode[0]);
//         expect(dropdownBtnNode[0].classList[0]).toEqual("dropdown-icon-hide");
//     });

// });
