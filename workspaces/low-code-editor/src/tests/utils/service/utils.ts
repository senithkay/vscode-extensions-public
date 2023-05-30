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
import { screen, waitForElementToBeRemoved } from "@testing-library/react";

export interface ResponseInfo {
    code: string;
    description: string;
}

export interface ParameterInfo {
    type: string;
    description: string;
}

export interface ResourceInfo {
    functionName: string;
    resourcePath: string;
    responses: ResponseInfo[];
    parameters?: ParameterInfo[];
    body?: string[];
}

export const waitForResourceLoadersToDisappear = async (noOfResources: number) => {
    for (let i = 0; i < noOfResources; i++) {
        const resourceLoadingElement = screen.queryByTestId(`resource-loader-${i}`);
        if (resourceLoadingElement) {
            await waitForElementToBeRemoved(() => screen.getByTestId(`resource-loader-${i}`));
        }
    }
};

export const indexer = (testData: ResourceInfo[]) => testData.map((resource, index) => ({ ...resource, index }));
