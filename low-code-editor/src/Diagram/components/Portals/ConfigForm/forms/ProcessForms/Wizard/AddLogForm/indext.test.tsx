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

// import { render, RenderResult } from "../../../../../../../../../../tests/utils/test-utils";
// import { ProcessConfig } from "../../../../types";

// import { AddLogForm, DEFINE_LOG_EXR, SELECT_PROPERTY } from "./index";

// describe('Log form test suite', () => {
//     it("renders properly.", async () => {
//         const mockProcessConfig: ProcessConfig = {
//             scopeSymbols: ["a", "b", "c"],
//             config: {
//                 type: "Log",
//                 expression: "e"
//             },
//             type: "Log"
//         };
//         const logForm: RenderResult = render(
//             <svg>
//                 <AddLogForm onCancel={null} onSave={null} config={mockProcessConfig}/>
//             </svg>
//         );
//         const resultForm = logForm.getByTestId("log-form");
//         expect(resultForm).toBeInTheDocument();
//         expect(resultForm).toHaveTextContent("Cancel");
//         expect(resultForm).toHaveTextContent("Save");
//     });

//     it("radio buttons render properly for scope symbols.", async () => {
//         const mockProcessConfig: ProcessConfig = {
//             scopeSymbols: ["a", "b", "c"],
//             config: {
//                 type: "Log",
//                 expression: "e"
//             },
//             type: "Log"
//         };
//         const logForm: RenderResult = render(
//             <svg>
//                 <AddLogForm onCancel={null} onSave={null} config={mockProcessConfig}/>
//             </svg>
//         );
//         const resultForm = logForm.getByTestId("log-form");
//         expect(resultForm).toHaveTextContent(DEFINE_LOG_EXR);
//         expect(resultForm).toHaveTextContent(SELECT_PROPERTY);
//     });

//     it("No items loads without scope symbols.", async () => {
//         const mockProcessConfig: ProcessConfig = {
//             scopeSymbols: [],
//             config: {
//                 type: "Log",
//                 expression: "e"
//             },
//             type: "Log"
//         };
//         const logForm: RenderResult = render(
//             <svg>
//                 <AddLogForm onCancel={null} onSave={null} config={mockProcessConfig}/>
//             </svg>
//         );
//         const resultForm = logForm.getByTestId("log-form");
//         expect(resultForm).toHaveTextContent("No Items to Select");
//     });
// });
