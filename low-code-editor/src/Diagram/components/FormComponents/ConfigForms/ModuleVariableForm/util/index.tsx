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

import { STKindChecker } from "@wso2-enterprise/syntax-tree";

import { getVariableNameFromST } from "../../../../../utils/st-util";

export const ModuleVarNameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

export interface ModuleVariableFormState {
    varType: string;
    varName: string;
    varValue: string;
    varOptions: string[];
}

export interface ModuleVariableFormStateWithValidity extends ModuleVariableFormState{
    isExpressionValid: boolean;
}

export enum VariableOptions {
    FINAL = 'final',
    PUBLIC = 'public',
}

export function getFormConfigFromModel(model: any): ModuleVariableFormStateWithValidity {
    // FixMe: model is set to any type due to missing properties in ST interface
    const defaultFormState: ModuleVariableFormStateWithValidity = {
        varType: 'int',
        varName: '',
        varValue: '',
        varOptions: [],
        isExpressionValid: true,
    }

    if (model) {
        if (model?.qualifiers?.length > 0
            && model.qualifiers.filter((qualifier: any) => STKindChecker.isFinalKeyword(qualifier)).length > 0) {
            defaultFormState.varOptions.push(VariableOptions.FINAL);
        }

        const typeData = model?.initializer?.typeData;

        if (model?.typedBindingPattern?.typeDescriptor) {
            defaultFormState.varType = model?.typedBindingPattern?.typeDescriptor?.name?.value;
        } else if (typeData) {
            const typeSymbol = typeData.typeSymbol;
            if (typeSymbol) {
                defaultFormState.varType = typeSymbol.typeKind;
            }
        }

        if (model.visibilityQualifier && STKindChecker.isPublicKeyword(model.visibilityQualifier)) {
            defaultFormState.varOptions.push(VariableOptions.PUBLIC);
        }

        defaultFormState.varValue = model.initializer.source;
        defaultFormState.varName = getVariableNameFromST(model).value;

        return defaultFormState;
    }

    return defaultFormState;
}

export function isFormConfigValid(config: ModuleVariableFormStateWithValidity): boolean {
    const { varName, varValue, isExpressionValid } = config;

    return varName.length > 0 && ModuleVarNameRegex.test(varName) && varValue.length > 0 && isExpressionValid;
}
