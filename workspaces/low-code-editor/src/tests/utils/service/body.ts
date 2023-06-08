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

export class Body {
    private bodyRow: any;
    constructor(private bodyIndex: number, private bodyContainer: HTMLElement) {
        this.bodyRow = within(this.bodyContainer).getByTestId(`body-row-${bodyIndex}`);
        expect(this.bodyRow).toBeDefined();
    }

    validateBodyDescription = (expectedDes: string) => {
        const bodyDescription = document.querySelector(`[data-testid=body-description-${this.bodyIndex}]`);
        if (bodyDescription) {
            const renderedDes = within(this.bodyRow).getByTestId(`body-description-${this.bodyIndex}`);
            expect(renderedDes.textContent.trim()).toEqual(`Schema : ${expectedDes}`);
        } else {
            expect(this.bodyRow.textContent.trim()).toEqual(expectedDes);
        }
    }

    validateBodySchema = async (expectedSchema: string) => {
        // TODO: Implement this to check the payload schema after user clicks on the schema name
    }
}
