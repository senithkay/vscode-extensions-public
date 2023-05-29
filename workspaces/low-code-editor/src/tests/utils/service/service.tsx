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

import { expect } from "@jest/globals";
import { screen, within } from "@testing-library/react";

export class Service {
    static serviceHeaderTextShouldInclude = (resourcePath: string) => {
        const servicePath = this.getServicePath();
        const serviceHeader = within(servicePath).getByText(`Service ${resourcePath}`);
        expect(serviceHeader).toBeDefined();
    };

    static listenerHeaderTextShouldInclude = (svcExpr: string) => {
        const listenerText = this.getListenerText();
        const listenerHeader = within(listenerText).getByText(`listening on ${svcExpr}`);
        expect(listenerHeader).toBeDefined();
    };

    private static getServiceContainer = () => screen.getByTestId("service-container");

    private static getServicePath = () => within(this.getServiceContainer()).getByTestId("service-path");

    private static getListenerText = () => within(this.getServiceContainer()).getByTestId("listener-text");

}
