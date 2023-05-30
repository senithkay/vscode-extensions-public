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

import { Body } from "./body";
import { Parameter } from "./parameter";
import { Response } from "./response";
import { ParameterInfo, ResponseInfo } from "./utils";

export class ResourceFunction {

    constructor(private resourceIndex: number) {}

    functionNameShouldInclude = (functionName: string) =>
        expect(this.getResourceType().textContent.trim()).toEqual(functionName);

    resourcePathShouldInclude = (resourcePath: string) => {
        const path = screen.getByTestId(`resource-${this.resourceIndex}-relative-resource-path`);
        expect(path.textContent.trim()).toEqual(resourcePath);
    };

    expandResource = () => fireEvent.click(this.getResourceExpandButton());

    resourceInformationIsVisible = () => expect(this.getResourceInfo(this.resourceIndex)).toBeDefined();

    getResourceInfo = (index: number) => screen.getByTestId(`resource-info-${index}`);

    private getResourceType = () => within(this.getResourceHeader()).getByTestId(`resource-type-${this.resourceIndex}`);

    private getResourceHeader = () => screen.getByTestId(`resource-header-${this.resourceIndex}`);

    private getResourceExpandButton = () =>
        within(this.getResourceHeader()).getByTestId(`resource-expand-button-${this.resourceIndex}`);
}

export const testResourceFunction = (resourceIndex: number,
                                     functionName: string,
                                     resourcePath: string,
                                     responses: ResponseInfo[],
                                     parameters?: ParameterInfo[],
                                     body?: string[],
                                     metadata?: string) => {
    const resourceFn = new ResourceFunction(resourceIndex);

    resourceFn.functionNameShouldInclude(functionName.toUpperCase());
    resourceFn.resourcePathShouldInclude(resourcePath);
    resourceFn.expandResource();
    resourceFn.resourceInformationIsVisible();

    const resourceInfo = resourceFn.getResourceInfo(resourceIndex);

    responses.forEach((response, index) => {
        const expectedCode = response.code;
        const expectedDescription = response.description;
        validateResponse(index, resourceInfo, expectedCode, expectedDescription);
    });

    if (parameters) {
        parameters.forEach((param, index) => {
            const expectedType = param.type;
            const expectedDescription = param.description;
            validateParameter(index, resourceInfo, expectedType, expectedDescription);
        });
    }

    if (body) {
        body.forEach((item, index) => {
            const resourceBody = new Body(index, resourceInfo);
            resourceBody.validateBodyDescription(item);
        });
    }

    if (metadata) {
        const metaData = within(resourceInfo).getByTestId(`resource-metadata-${resourceIndex}`);
        expect(metaData.textContent.trim()).toEqual(metadata);
    }
};

const validateResponse = (responseIndex: number,
                          resourceInfo: HTMLElement,
                          expectedCode: string,
                          expectedDescription: string) => {
    const response = new Response(responseIndex, resourceInfo);
    response.validateResponseCode(expectedCode);
    response.validateResponseDescription(expectedDescription);
};

const validateParameter = (paramIndex: number,
                           resourceInfo: HTMLElement,
                           expectedType: string,
                           expectedDescription: string) => {
    const parameter = new Parameter(paramIndex, resourceInfo);
    parameter.validateParamType(expectedType);
    parameter.validateParamDescription(expectedDescription);
};
