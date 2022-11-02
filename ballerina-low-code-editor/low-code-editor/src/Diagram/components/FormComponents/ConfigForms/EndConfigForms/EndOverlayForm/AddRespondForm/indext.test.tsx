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
// import { EndConfig } from "../../../../Portals/ConfigForm/types";

// import { AddRespondForm } from "./index";

// describe('Respond form test suite', () => {
//     it("renders properly.", async () => {
//         const mockEndConfig: EndConfig = {
//             scopeSymbols: ["a", "b", "c"],
//             expression : "e",
//             type: "Respond"
//         };
//         const logForm: RenderResult = render(
//             <svg>
//                 <AddRespondForm onCancel={null} onSave={null} config={mockEndConfig} />
//             </svg>
//         );
//         const resultForm = logForm.getByTestId("respond-form");
//         expect(resultForm).toBeInTheDocument();
//         expect(resultForm).toHaveTextContent("Cancel");
//         expect(resultForm).toHaveTextContent("Save");
//     });
//     it.skip("display no items without scope symbols.", async () => {
//         const mockEndConfig: EndConfig = {
//             scopeSymbols: [],
//             expression: "e",
//             type: "Respond"
//         };
//         const logForm: RenderResult = render(
//             <svg>
//                 <AddRespondForm onCancel={null} onSave={null} config={mockEndConfig} />
//             </svg>
//         );
//         const resultForm = logForm.getByTestId("respond-form");
//         expect(resultForm).toHaveTextContent("No Items to Select");
//     });
// });
