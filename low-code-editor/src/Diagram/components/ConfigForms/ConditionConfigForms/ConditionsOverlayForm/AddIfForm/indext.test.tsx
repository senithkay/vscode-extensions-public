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
// import { ConditionConfig } from "../../../../Portals/ConfigForm/types";

// import { AddIfForm, DEFINE_CONDITION, EXISTING_PROPERTY } from "./index";

// describe('If form test suite', () => {
//     it("renders properly.", async () => {
//         const mockConditionConfig: ConditionConfig = {
//             scopeSymbols: ["a", "b", "c"],
//             conditionExpression: "",
//             type: "If"
//         };
//         const form: RenderResult = render(
//             <svg>
//                 <AddIfForm
//                     onCancel={null}
//                     onSave={null}
//                     condition={mockConditionConfig}
//                 />
//             </svg>
//         );
//         const resultForm = form.getByTestId("if-form");
//         expect(resultForm).toBeInTheDocument();
//         expect(resultForm).toHaveTextContent("Cancel");
//         expect(resultForm).toHaveTextContent("Save");
//     });
// });
