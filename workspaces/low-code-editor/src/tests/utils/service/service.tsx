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
import * as React from "react";

import {expect} from "@jest/globals";
import { render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { ServiceDesignOverlay } from "../../../Diagram/components/ServiceDesignOverlay";
import { TestProvider } from "../../TestContext";
import { getFileContent } from "../ls-utils";

export const renderServiceDesignOverlay = async (filePath: string,
                                                 completeST: STNode,
                                                 focusedST: STNode,
                                                 fileName: string,
                                                 langClient: BalleriaLanguageClient) => {
    const currentFileContent = await getFileContent(filePath);
    render(
        <TestProvider
            completeST={completeST}
            focusedST={focusedST}
            currentFileContent={currentFileContent}
            fileName={fileName}
            fileUri={filePath}
            langClient={langClient}
        >
            <ServiceDesignOverlay model={focusedST} onCancel={undefined} />
        </TestProvider>
    );
};

export const serviceHeaderTextShouldInclude = (resourcePath: string) => {
    const servicePath = getServicePath();
    const serviceHeader = within(servicePath).getByText(`Service ${resourcePath}`);
    expect(serviceHeader).toBeDefined();
};

export const listenerHeaderTextShouldInclude = (svcExpr: string) => {
    const listenerText = getListenerText();
    const listenerHeader = within(listenerText).getByText(`listening on ${svcExpr}`);
    expect(listenerHeader).toBeDefined();
};

export const waitForResourceLoadingToDisappear = async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId('resource-loading'));
};

const getServiceContainer = () => screen.getByTestId("service-container");

const getServicePath = () => within(getServiceContainer()).getByTestId("service-path");

const getListenerText = () => within(getServiceContainer()).getByTestId("listener-text");
