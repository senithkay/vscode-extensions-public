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

// import { render, RenderResult } from "../../../../../../../../tests/utils/test-utils";
// import { ConditionConfig } from "../../types";

// import { ConditionForm } from "./index";

// describe('Condition form test suite', () => {
//     it.skip("If renders properly.", async () => {
//         const mockConditionConfig: ConditionConfig = {
//             scopeSymbols: ["a", "b", "c"],
//             conditionExpression: "",
//             type: "If"
//         };
//         const form: RenderResult = render(
//             <svg>
//                 <ConditionForm
//                     type={"If"}
//                     config={mockConditionConfig}
//                     onCancel={null}
//                     targetPosition={{column: 1, line: 1}}
//                     wizardType={1}
//                 />
//             </svg>
//         );
//         const resultForm = form.getByTestId("if-form");
//         expect(resultForm).toBeInTheDocument();
//         expect(resultForm).toHaveTextContent("Cancel");
//         expect(resultForm).toHaveTextContent("Save");
//         expect(resultForm).toHaveTextContent("If Condition");
//     });

//     it.skip("Foreach renders properly.", async () => {
//         const mockConditionConfig: ConditionConfig = {
//             scopeSymbols: ["a", "b", "c"],
//             conditionExpression: {
//                 collection: "",
//                 variable: "xyz",
//             },
//             type: "ForEach"
//         };
//         const form: RenderResult = render(
//             <svg>
//                 <ConditionForm
//                     type={"If"}
//                     config={mockConditionConfig}
//                     onCancel={null}
//                     targetPosition={{column: 1, line: 1}}
//                     wizardType={1}
//                 />
//             </svg>
//         );
//         const resultForm = form.getByTestId("foreach-form");
//         expect(resultForm).toBeInTheDocument();
//         expect(resultForm).toHaveTextContent("Cancel");
//         expect(resultForm).toHaveTextContent("Save");
//         expect(resultForm).toHaveTextContent("Foreach");
//     });
// });
