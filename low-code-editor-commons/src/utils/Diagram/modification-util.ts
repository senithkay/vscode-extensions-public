/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { compile } from "handlebars";

import { default as templates } from "../../templates/components";
import { HTTPServiceConfigState, ListenerConfigFormState, STModification } from "../../types";

import { getInsertComponentSource } from "./template-utils";

export async function InsertorDelete(modifications: STModification[]): Promise<STModification[]> {
    const stModifications: STModification[] = [];
    /* tslint:disable prefer-for-of */
    for (let i = 0; i < modifications.length; i++) {
        const value: STModification = modifications[i];
        let stModification: STModification;
        if (value.type && value.type.toLowerCase() === "delete") {
            stModification = value;
        } else if (value.type && value.type.toLowerCase() === "import") {
            const source = await getInsertComponentSource(value.type, value.config);
            stModification = {
                startLine: value.startLine,
                startColumn: value.startColumn,
                endLine: value.endLine,
                endColumn: value.endColumn,
                type: "INSERT",
                isImport: true,
                config: {
                    "TYPE": value?.config?.TYPE,
                    "STATEMENT": source,
                }
            }
        } else if (value.type && value.type.toLowerCase() === 'insert') {
            stModification = value;
        } else {
            const source = await getInsertComponentSource(value.type, value.config);
            stModification = {
                startLine: value.startLine,
                startColumn: value.startColumn,
                endLine: value.endLine,
                endColumn: value.endColumn,
                type: "INSERT",
                config: {
                    "STATEMENT": source,
                }
            };
        }
        stModifications.push(stModification);
    }
    return stModifications;
}

export function createFunctionSignature(accessModifier: string, name: string, parameters: string, returnTypes: string,
                                        targetPosition: NodePosition, isLastMember?: boolean): STModification {
    const functionStatement: STModification = {
        startLine: targetPosition.startLine,
        startColumn: isLastMember ? targetPosition.endColumn : 0,
        endLine: targetPosition.startLine,
        endColumn: isLastMember ? targetPosition.endColumn : 0,
        type: "FUNCTION_DEFINITION",
        config: {
            "ACCESS_MODIFIER": accessModifier,
            "NAME": name,
            "PARAMETERS": parameters,
            "RETURN_TYPE": returnTypes
        }
    };

    return functionStatement;
}

export function updateFunctionSignature(name: string, parameters: string, returnTypes: string, targetPosition: NodePosition): STModification {
    const functionStatement: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "FUNCTION_DEFINITION_SIGNATURE",
        config: {
            "NAME": name,
            "PARAMETERS": parameters,
            "RETURN_TYPE": returnTypes
        }
    };

    return functionStatement;
}

export function createServiceDeclartion(
    config: HTTPServiceConfigState, targetPosition: NodePosition, isLastMember?: boolean): STModification {
    const { serviceBasePath, listenerConfig: { fromVar, listenerName, listenerPort, createNewListener } } = config;

    const modification: STModification = {
        startLine: targetPosition.startLine,
        endLine: targetPosition.startLine,
        startColumn: isLastMember ? targetPosition.endColumn : 0,
        endColumn: isLastMember ? targetPosition.endColumn : 0,
        type: ''
    };

    if (createNewListener && fromVar) {
        return {
            ...modification,
            type: 'SERVICE_AND_LISTENER_DECLARATION',
            config: {
                'LISTENER_NAME': listenerName,
                'PORT': listenerPort,
                'BASE_PATH': serviceBasePath,
            }
        }
    } else if (!fromVar) {
        return {
            ...modification,
            type: 'SERVICE_DECLARATION_WITH_NEW_INLINE_LISTENER',
            config: {
                'PORT': listenerPort,
                'BASE_PATH': serviceBasePath,
            }
        }

    } else {
        return {
            ...modification,
            type: 'SERVICE_DECLARATION_WITH_SHARED_LISTENER',
            config: {
                'LISTENER_NAME': listenerName,
                'BASE_PATH': serviceBasePath,
            }
        }
    }
}

export function createListenerDeclartion(config: ListenerConfigFormState, targetPosition: NodePosition, isNew: boolean,
                                         isLastMember?: boolean): STModification {
    const { listenerName, listenerPort } = config;
    let modification: STModification;
    if (isNew) {
        modification = {
            startLine: targetPosition.startLine,
            endLine: targetPosition.startLine,
            startColumn: isLastMember ? targetPosition.endColumn : 0,
            endColumn: isLastMember ? targetPosition.endColumn : 0,
            type: ''
        };
    } else {
        modification = {
            ...targetPosition,
            type: ''
        };
    }

    return {
        ...modification,
        type: 'LISTENER_DECLARATION',
        config: {
            'LISTENER_NAME': listenerName,
            'PORT': listenerPort
        }
    }
}

export function updateServiceDeclartion(config: HTTPServiceConfigState, targetPosition: NodePosition): STModification {
    const { serviceBasePath, listenerConfig: { fromVar, listenerName, listenerPort, createNewListener } } = config;

    const modification: STModification = {
        ...targetPosition,
        type: ''
    };

    if (createNewListener) {
        return {
            ...modification,
            type: 'SERVICE_WITH_LISTENER_DECLARATION_UPDATE',
            config: {
                'LISTENER_NAME': listenerName,
                'PORT': listenerPort,
                'BASE_PATH': serviceBasePath,
            }
        }
    } else if (!fromVar) {
        return {
            ...modification,
            type: 'SERVICE_DECLARATION_WITH_INLINE_LISTENER_UPDATE',
            config: {
                'PORT': listenerPort,
                'BASE_PATH': serviceBasePath,
            }
        }

    } else {
        return {
            ...modification,
            type: 'SERVICE_DECLARATION_WITH_SHARED_LISTENER_UPDATE',
            config: {
                'LISTENER_NAME': listenerName,
                'BASE_PATH': serviceBasePath,
            }
        }
    }
}

export function getComponentSource(insertTempName: string, config: { [key: string]: any }) {
    const hbTemplate = compile(templates[insertTempName]);
    return hbTemplate(config);
}

export function getSource(modification: STModification): string {
    const source = getComponentSource(modification.type, modification.config);
    return source;
}
