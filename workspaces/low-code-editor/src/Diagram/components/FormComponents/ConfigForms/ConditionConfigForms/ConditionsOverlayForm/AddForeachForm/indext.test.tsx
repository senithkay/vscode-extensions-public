// /**
//  * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
//  *
//  * This software is the property of WSO2 LLC. and its suppliers, if any.
//  * Dissemination of any information or reproduction of any material contained
//  * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
//  * You may not alter or remove any copyright or other notice from copies of this content.
//  */
// import * as React from 'react';

// import { render, RenderResult } from "../../../../../../../../tests/utils/test-utils";
// import { AddForeachForm, DEFINE_RANGE, EXISTING_PROPERTY } from '../../../../Portals/ConfigForm/forms/ConditionForm/Wizard/AddForeachForm';
// import { ConditionConfig } from "../../../../Portals/ConfigForm/types";

// describe('Foreach form test suite', () => {
//     it("renders properly.", async () => {
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
//                 <AddForeachForm
//                     onCancel={null}
//                     onSave={null}
//                     condition={mockConditionConfig}
//                     isNewConditionForm={true}
//                 />
//             </svg>
//         );
//         const resultForm = form.getByTestId("foreach-form");
//         expect(resultForm).toBeInTheDocument();
//         expect(resultForm).toHaveTextContent("Cancel");
//         expect(resultForm).toHaveTextContent("Save");
//     });

//     it("radio buttons render properly for scope symbols.", async () => {
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
//                 <AddForeachForm
//                     onCancel={null}
//                     onSave={null}
//                     condition={mockConditionConfig}
//                     isNewConditionForm={true}
//                 />
//             </svg>
//         );
//         const resultForm = form.getByTestId("foreach-form");
//         expect(resultForm).toHaveTextContent(DEFINE_RANGE);
//         expect(resultForm).toHaveTextContent(EXISTING_PROPERTY);
//     });

//     it("render without scope symbols.", async () => {
//         const mockConditionConfig: ConditionConfig = {
//             scopeSymbols: [],
//             conditionExpression: {
//                 collection: "",
//                 variable: "xyz",
//             },
//             type: "ForEach"
//         };
//         const form: RenderResult = render(
//             <svg>
//                 <AddForeachForm
//                     onCancel={null}
//                     onSave={null}
//                     condition={mockConditionConfig}
//                     isNewConditionForm={true}
//                 />
//             </svg>
//         );
//         const resultForm = form.getByTestId("foreach-form");
//         expect(resultForm).toHaveTextContent("Start");
//         expect(resultForm).toHaveTextContent("End");
//         expect(resultForm).toHaveTextContent("No Items to Select");
//     });
// });
