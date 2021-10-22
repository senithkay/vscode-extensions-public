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

import { ModuleVariableFormState } from ".";

export enum ModuleVarFormActionTypes {
    UPDATE_ACCESS_MODIFIER,
    SET_VAR_TYPE,
    SET_VAR_NAME,
    SET_VAR_VALUE,
    SET_VAR_OPTIONS,
    UPDATE_EXPRESSION_VALIDITY,
    RESET_VARIABLE_TYPE
}

export type ModuleVarFormAction =
    | { type: ModuleVarFormActionTypes.SET_VAR_TYPE, payload: string }
    | { type: ModuleVarFormActionTypes.SET_VAR_NAME, payload: string }
    | { type: ModuleVarFormActionTypes.SET_VAR_VALUE, payload: string }
    | { type: ModuleVarFormActionTypes.SET_VAR_OPTIONS, payload: string[] }
    | { type: ModuleVarFormActionTypes.UPDATE_EXPRESSION_VALIDITY, payload: boolean }
    | { type: ModuleVarFormActionTypes.RESET_VARIABLE_TYPE };

export function moduleVarFormReducer(state: ModuleVariableFormState, action: ModuleVarFormAction): ModuleVariableFormState {
    switch (action.type) {
        case ModuleVarFormActionTypes.SET_VAR_NAME:
            return { ...state, varName: action.payload };
        case ModuleVarFormActionTypes.SET_VAR_VALUE:
            return { ...state, varValue: action.payload };
        case ModuleVarFormActionTypes.SET_VAR_TYPE:
            return { ...state, varType: action.payload, varValue: '' };
        case ModuleVarFormActionTypes.SET_VAR_OPTIONS:
            return { ...state,  };
        case ModuleVarFormActionTypes.UPDATE_EXPRESSION_VALIDITY:
            return { ...state, isExpressionValid: action.payload };
        case ModuleVarFormActionTypes.RESET_VARIABLE_TYPE:
            return { ...state, varType: '', varValue: '' };
    }
}
