/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import {
    createFunctionSignature,
    createServiceDeclartion,
    getSource,
    STSymbolInfo
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ListenerDeclaration, NodePosition, ServiceDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { ListenerConfig } from "../ServiceForm/ListenerConfigFrom";

export function recalculateItemIds(items: any[]) {
    items.forEach((item, index) => {
        item.id = index;
    });
}

export function getInitialSource(type: string, targetPosition: NodePosition): string {
    switch (type) {
        case "Function": {
            return getSource(createFunctionSignature("", "name", "", "",
                targetPosition));
        }
        case "Service": {
            const s = getSource(createServiceDeclartion({serviceBasePath: "/", listenerConfig: {
                    createNewListener: true, listenerName: "listener", listenerPort: "9090"}
            }, targetPosition, false))
            return s;
        }
    }
    return;
}

export function getServiceTypeFromModel(model: ServiceDeclaration, symbolInfo: STSymbolInfo): string {
    if (model) {
        const listenerExpression = model.expressions.length > 0 && model.expressions[0];
        if (listenerExpression) {
            if (STKindChecker.isExplicitNewExpression(listenerExpression)) {
                if (STKindChecker.isQualifiedNameReference(listenerExpression.typeDescriptor)) {
                    return listenerExpression.typeDescriptor.modulePrefix.value;
                } else {
                    return undefined;
                }
            } else if (STKindChecker.isSimpleNameReference(listenerExpression)) {
                const listenerNode: ListenerDeclaration
                    = symbolInfo.listeners.get(listenerExpression.name.value) as ListenerDeclaration;
                if (STKindChecker.isQualifiedNameReference(listenerNode.typeDescriptor)) {
                    return listenerNode.typeDescriptor.modulePrefix.value;
                } else {
                    return undefined;
                }
            }
        }
    }

    return undefined;
}

export function getListenerConfig(model: ServiceDeclaration, isEdit: boolean): ListenerConfig {
    if (isEdit) {
        const serviceListenerExpression = model.expressions.length > 0 && model.expressions[0];

        if (STKindChecker.isSimpleNameReference(serviceListenerExpression)) {
            return { listenerName: serviceListenerExpression.name.value, fromRef: true }
        } else if (STKindChecker.isExplicitNewExpression(serviceListenerExpression)) {
            return { listenerPort: serviceListenerExpression.parenthesizedArgList.arguments.length > 0 &&
                    serviceListenerExpression.parenthesizedArgList.arguments[0].source,
                     fromRef: false };
        }
    } else {
        return { listenerName: "", listenerPort: "", fromRef: true };
    }
}
