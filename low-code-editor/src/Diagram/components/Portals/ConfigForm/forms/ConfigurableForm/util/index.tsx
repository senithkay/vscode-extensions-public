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

import { CaptureBindingPattern, STKindChecker, TypedBindingPattern } from "@ballerina/syntax-tree";

export const ModuleVarNameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

export interface ModuleConfigurableFormState {
    isPublic: boolean;
    varType: string;
    varName: string;
    varValue: string;
    varQualifier: string;
    isExpressionValid: boolean;
    hasDefaultValue: boolean;
}

export enum VariableQualifiers {
    NONE = 'None',
    FINAL = 'final',
    CONFIGURABLE = 'configurable',
}

export function getFormConfigFromModel(model: any): ModuleConfigurableFormState {
    // FixMe: model is set to any type due to missing properties in ST interface
    const defaultFormState: ModuleConfigurableFormState = {
        isPublic: false,
        varType: 'int',
        varName: '',
        varValue: '',
        varQualifier: 'configurable',
        isExpressionValid: true,
        hasDefaultValue: false,
    }

    if (model) {
        if (model?.qualifiers?.length > 0) {
            if (STKindChecker.isConfigurableKeyword(model.qualifiers[0])) {
                defaultFormState.varQualifier = VariableQualifiers.CONFIGURABLE;
            } else if (STKindChecker.isFinalKeyword(model.qualifiers[0])) {
                defaultFormState.varQualifier = VariableQualifiers.FINAL;
            }
        }

        const typeData = model.initializer.typeData;

        if (typeData) {
            const typeSymbol = typeData.typeSymbol;
            if (typeSymbol) {
                defaultFormState.varType = typeSymbol.typeKind;
            }
        }

        defaultFormState.isPublic = model.visibilityQualifier && STKindChecker.isPublicKeyword(model.visibilityQualifier);
        defaultFormState.hasDefaultValue =  !!model.initializer.source;
        defaultFormState.varValue = model.initializer.source;
        defaultFormState.varName = ((model.typedBindingPattern as TypedBindingPattern)
            .bindingPattern as CaptureBindingPattern).variableName.value;

        return defaultFormState;
    }

    return defaultFormState;
}


export function isFormConfigValid(config: ModuleConfigurableFormState): boolean {
    const { varName, varValue, isExpressionValid, hasDefaultValue } = config;

    return varName?.length > 0 && ModuleVarNameRegex.test(varName) && (!hasDefaultValue || (varValue?.length > 0  && isExpressionValid));
}
