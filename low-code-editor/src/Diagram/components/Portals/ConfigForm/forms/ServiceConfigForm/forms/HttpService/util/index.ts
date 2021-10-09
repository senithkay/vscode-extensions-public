/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import { ServiceDeclaration } from "@ballerina/syntax-tree";
import { STSymbolInfo } from "../../../../../../../../..";
import { isServicePathValid } from "../../../../../../../../../utils/validator";

import { HTTPServiceConfigState } from "./reducer";

export function isServiceConfigValid(config: HTTPServiceConfigState): boolean {
    const { createNewListener, serviceBasePath, listenerConfig: { formVar: fromVar, listenerName, listenerPort } } = config;

    const servicePathValidity = serviceBasePath.length === 0 || isServicePathValid(serviceBasePath);
    const portNumberRegex = /^\d+$/;
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    if (createNewListener && fromVar) {
        return servicePathValidity
            && listenerPort.length > 0 && portNumberRegex.test(listenerPort)
            && listenerName.length > 0 && nameRegex.test(listenerName);
    } else if (createNewListener && !fromVar) {
        return servicePathValidity
            && listenerPort.length > 0 && portNumberRegex.test(listenerPort)
    } else {
        return serviceBasePath && listenerName.length > 0;
    }
}

export function getFormStateFromST(model: ServiceDeclaration, symbolInfo: STSymbolInfo): HTTPServiceConfigState {

    const state: HTTPServiceConfigState = {
        serviceBasePath: '',
        createNewListener: false,
        listenerConfig: {
            formVar: false,
            listenerName: '',
            listenerPort: ''
        }
    }

    if (model) {

    }

    return state;
}
