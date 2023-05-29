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
import { fireEvent, screen, within } from "@testing-library/react";
import { ResourceAccessorDefinition } from "@wso2-enterprise/syntax-tree";

export class ResourceFunction {
    private functionName: string;
    private resourcePath: string;

    constructor(private resourceIndex: number, private definition: ResourceAccessorDefinition) {
        this.functionName = definition.functionName.value;
        this.resourcePath = definition.relativeResourcePath.map(p => p.value).join("");
    }

    validateFunctionName = () =>
        expect(within(this.getResourceType()).getByText(this.functionName.toUpperCase())).toBeDefined();

    validateResourceParams = () => {
        const params = screen.getByTestId(`resource-query-params-${this.resourceIndex}`);
        expect(params).toBeDefined();
        expect(within(params).getByText(this.resourcePath)).toBeDefined();
    };

    expandResource = () => fireEvent.click(this.getResourceExpandButton());

    resourceInformationIsVisible = () => expect(this.getServiceMember(this.resourceIndex)).toBeDefined();

    getServiceMember = (index: number) => screen.getByTestId(`service-member-${index}`);

    private getResourceType = () => within(this.getResourceHeader()).getByTestId(`resource-type-${this.resourceIndex}`);

    private getResourceHeader = () => screen.getByTestId(`resource-header-${this.resourceIndex}`);

    private getResourceExpandButton = () =>
        within(this.getResourceHeader()).getByTestId(`resource-expand-button-${this.resourceIndex}`);
}
