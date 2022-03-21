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

import { STSymbolInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { CaptureBindingPattern, MappingConstructor, ModuleVarDecl, SimpleNameReference, SpecificField, STKindChecker, TypedBindingPattern } from "@wso2-enterprise/syntax-tree";

import { getAllModuleVariables } from "../../../../../utils/mixins";
import { genVariableName } from "../../../../Portals/utils";

export const ModuleVarNameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

export interface ConfigurableFormState {
    isPublic: boolean;
    varType: string;
    varName: string;
    varValue: string;
    isExpressionValid: boolean;
    hasDefaultValue: boolean;
    label: string;
}

export enum VariableQualifiers {
    NONE = 'None',
    FINAL = 'final',
    CONFIGURABLE = 'configurable',
}

export function getFormConfigFromModel(model: any, stSymbolInfo: STSymbolInfo): ConfigurableFormState {
    // FixMe: model is set to any type due to missing properties in ST interface
    const defaultFormState: ConfigurableFormState = {
        isPublic: false,
        varType: 'int',
        varName: '',
        varValue: '',
        isExpressionValid: true,
        hasDefaultValue: false,
        label: ''
    }

    if (model) {
        const typeData = model.initializer.typeData;

        if (model?.typedBindingPattern?.typeDescriptor) {
            if (STKindChecker.isQualifiedNameReference(model.typedBindingPattern.typeDescriptor)) {
                defaultFormState.varType = model?.typedBindingPattern?.typeDescriptor?.source.trim();
            } else if (STKindChecker.isSimpleNameReference(model.typedBindingPattern.typeDescriptor)) {
                defaultFormState.varType = model?.typedBindingPattern?.typeDescriptor?.name?.value;
            }
        } else if (typeData) {
            const typeSymbol = typeData.typeSymbol;
            if (typeSymbol) {
                defaultFormState.varType = typeSymbol.typeKind;
            }
        }

        defaultFormState.isPublic = model.visibilityQualifier
            && STKindChecker.isPublicKeyword(model.visibilityQualifier);
        defaultFormState.hasDefaultValue = !!model.initializer.source && model.initializer.source !== "?";
        defaultFormState.varValue = model.initializer.source === "?" ? "" : model.initializer.source;
        const configurableNameValue = ((model.typedBindingPattern as TypedBindingPattern)
            .bindingPattern as CaptureBindingPattern).variableName.value;
        defaultFormState.varName = configurableNameValue;

        const displayAnnotation = (model as ModuleVarDecl)
            .metadata?.annotations?.filter(annotation =>
                (annotation.annotReference as SimpleNameReference).name.value === 'display');

        if (displayAnnotation && displayAnnotation.length > 0) {
            const value: MappingConstructor = displayAnnotation[0].annotValue as MappingConstructor;

            const labelNodes = value.fields
                .filter(field => STKindChecker.isSpecificField(field) && field.fieldName.value === 'label');

            if (labelNodes && labelNodes.length > 0) {
                defaultFormState.label = (labelNodes[0] as SpecificField).valueExpr.source;
            }
        }
    }

    return defaultFormState;
}

export function isFormConfigValid(config: ConfigurableFormState): boolean {
    const { varName, varValue, isExpressionValid, hasDefaultValue } = config;

    return varName?.length > 0 && (!hasDefaultValue || varValue?.length > 0) && isExpressionValid;
}
