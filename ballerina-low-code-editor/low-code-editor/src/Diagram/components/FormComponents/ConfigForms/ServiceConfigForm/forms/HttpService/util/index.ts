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

import { ServiceDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { STSymbolInfo } from "../../../../../../../..";
import { isServicePathValid } from "../../../../../../../../utils/validator";

import { HTTPServiceConfigState } from "./reducer";

export function isServiceConfigValid(config: HTTPServiceConfigState): boolean {
    const { serviceBasePath, listenerConfig: { createNewListener, fromVar, listenerName, listenerPort } } = config;

    const servicePathValidity = serviceBasePath.length === 0 || isServicePathValid(serviceBasePath);
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    if (createNewListener && fromVar) {
        return servicePathValidity
            && listenerPort.length > 0
            && listenerName.length > 0 && nameRegex.test(listenerName);
    } else if (!fromVar) {
        return servicePathValidity
            && listenerPort.length > 0
    } else {
        return servicePathValidity && listenerName.length > 0;
    }
}

export function getFormStateFromST(model: ServiceDeclaration, symbolInfo: STSymbolInfo): HTTPServiceConfigState {

    const state: HTTPServiceConfigState = {
        serviceBasePath: '/',
        listenerConfig: {
            createNewListener: false,
            fromVar: true,
            listenerName: '',
            listenerPort: ''
        },
        hasInvalidConfig: false
    }

    if (model) {
        const serviceListenerExpression = model.expressions.length > 0 && model.expressions[0];
        const servicePath = model.absoluteResourcePath
            .map((pathSegments) => pathSegments.value)
            .join('');

        if (STKindChecker.isSimpleNameReference(serviceListenerExpression)) {

            return {
                ...state,
                serviceBasePath: servicePath,
                listenerConfig: {
                    ...state.listenerConfig,
                    fromVar: true,
                    listenerName: serviceListenerExpression.name.value
                }
            }
        } else if (STKindChecker.isExplicitNewExpression(serviceListenerExpression)) {
            return {
                ...state,
                serviceBasePath: servicePath,
                listenerConfig: {
                    ...state.listenerConfig,
                    fromVar: false,
                    listenerPort: serviceListenerExpression.parenthesizedArgList.arguments.length > 0
                        && serviceListenerExpression.parenthesizedArgList.arguments[0].source,

                }
            }
        }
    }

    return state;
}
