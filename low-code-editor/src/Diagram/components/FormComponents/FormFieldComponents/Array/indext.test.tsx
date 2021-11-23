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
// import { FormField } from "../../../../../../ConfigurationSpec/types";

// import { Array } from "./index";

// describe('Array element test suite', () => {
//     it("renders properly.", async () => {
//         const mockFormField: FormField = {
//             type: "string",
//             name: "name",
//             collectionDataType: "string"
//         };
//         const form: RenderResult = render(
//             <svg>
//                 <Array model={mockFormField} />
//             </svg>
//         );
//         const resultForm = form.getByTestId("array");
//         expect(resultForm).toBeInTheDocument();
//     });

//     it("renders string type array properly.", async () => {
//         const mockFormField: FormField = {
//             type: "string",
//             name: "name",
//             collectionDataType: "string"
//         };
//         const form: RenderResult = render(
//             <svg>
//                 <Array model={mockFormField} />
//             </svg>
//         );
//         const resultFormArray = form.getByText("Add Value");
//     });

//     it("renders json type array properly.", async () => {
//         const mockFormField: FormField = {
//             type: "json",
//             name: "name",
//             collectionDataType: "json"
//         };
//         const form: RenderResult = render(
//             <svg>
//                 <Array model={mockFormField} />
//             </svg>
//         );
//         const resultFormArray = form.getByTestId("ison-add-btn");
//         expect(resultFormArray).toHaveTextContent("Add");
//     });
// });
