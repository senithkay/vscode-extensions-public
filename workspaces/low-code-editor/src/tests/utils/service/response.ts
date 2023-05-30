/*
* Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein is strictly forbidden, unless permitted by WSO2 in accordance with
* the WSO2 Commercial License available at http://wso2.com/licenses.
* For specific language governing the permissions and limitations under
* this license, please see the license as well as any agreement you’ve
* entered into with WSO2 governing the purchase of this software and any
* associated services.
*/
import { expect } from "@jest/globals";
import { within } from "@testing-library/react";

export class Response {
    private responseRow: any;
    constructor(private responseIndex: number, private resourceInfoContainer: HTMLElement) {
        this.responseRow = within(this.resourceInfoContainer).getByTestId(`responses-row-${responseIndex}`);
        expect(this.responseRow).toBeDefined();
    }

    validateResponseCode = (expectedCode: string) => {
        const renderedCode = within(this.responseRow).getByTestId(`response-code-${this.responseIndex}`);
        expect(renderedCode.textContent.trim()).toEqual(expectedCode);
    }

    validateResponseDescription = (expectedDes: string) => {
        const renderedDes = within(this.responseRow).getByTestId(`response-description-${this.responseIndex}`);
        expect(renderedDes.textContent.trim()).toEqual(expectedDes);
    }
}
