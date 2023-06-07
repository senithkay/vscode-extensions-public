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

export class Parameter {
    constructor(private paramIndex: number, private paramContainer: HTMLElement) {
        expect(paramContainer).toBeDefined();
    }

    validateParamType = (expectedType: string) => {
        const renderedCode = within(this.paramContainer).getByTestId(`type-name-${this.paramIndex}`);
        expect(renderedCode.textContent.trim()).toEqual(expectedType);
    }

    validateParamName = (expectedName: string) => {
        const renderedDes = within(this.paramContainer).getByTestId(`argument-name-${this.paramIndex}`);
        expect(renderedDes.textContent.trim()).toEqual(expectedName);
    }
}
