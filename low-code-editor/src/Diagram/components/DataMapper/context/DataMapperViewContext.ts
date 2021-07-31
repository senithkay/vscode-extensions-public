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

import createContext from '../../../../Contexts/createContext';
import { dataMapperSizingAndPositioningRecalculate } from '../util';
import { DataMapperState } from '../util/types';

const reducer = (state: DataMapperState, action: any) => {
    switch (action.type) {
        case 'UPDATE_STATE':
            return { ...state, ...action.payload };
        case 'DATA_MAPPER_REDRAW':
            const {
                inputSTNodes,
                stSymbolInfo,
                showAddVariableForm,
                dataMapperConfig,
                updateDataMapperConfig,
                squashConstants,
                showConfigureOutputForm,
                isExistingOutputSelected,
                isJsonRecordTypeSelected
            } = state;

            const updatedValues = dataMapperSizingAndPositioningRecalculate(
                inputSTNodes,
                action.payload,
                stSymbolInfo,
                showAddVariableForm,
                dataMapperConfig,
                updateDataMapperConfig,
                showConfigureOutputForm,
                isJsonRecordTypeSelected,
                isExistingOutputSelected,
                squashConstants
            );

            return {
                ...state,
                ...updatedValues
            }
        case 'TOGGLE_ADD_VARIABLE_FORM':
            return {
                ...state,
                showAddVariableForm: !state.showAddVariableForm
            }
        case 'TOGGLE_OUTPUT_CONFIGURE_FORM':
            return {
                ...state,
                showConfigureOutputForm: !state.showConfigureOutputForm
            }
        case 'TOGGLE_EXISTING_OUTPUT_FORM':
            return {
                ...state,
                isExistingOutputSelected: !state.isExistingOutputSelected,
            }
        case 'TOGGLE_JSON_RECORD_TYPE_FORM':
            return {
                ...state,
                isJsonRecordTypeSelected: !state.isJsonRecordTypeSelected
            }
        case 'TOGGLE_ADD_JSON_FIELD_FORM':
            return {
                ...state,
                showAddJsonFieldForm: !state.showAddJsonFieldForm
            }
        case 'NOTIFY_INITIALIZATION_IN_PROGRESS':
            return {
                ...state,
                isInitializationInProgress: action.payload
            }
        case 'ADD_DRAFT_ARROW':
            return {
                ...state,
                draftArrows: [...state.draftArrows, action.payload]
            }
        default:
            return state;
    }
}

const actions = {
    updateState: (dispatch: any) => {
        return (payload: any) => {
            dispatch({ type: 'UPDATE_STATE', payload });
        };
    },
    dataMapperViewRedraw: (dispatch: any) => {
        return (payload: any) => {
            dispatch({ type: 'DATA_MAPPER_REDRAW', payload })
        };
    },
    toggleAddVariableForm: (dispatch: any) => {
        return (payload: any) => {
            dispatch({ type: 'TOGGLE_ADD_VARIABLE_FORM' });
        };
    },
    toggleOutputConfigureForm: (dispatch: any) => {
        return () => {
            dispatch({ type: 'TOGGLE_OUTPUT_CONFIGURE_FORM' });
        };
    },
    toggleSelectExistingOutputForm: (dispatch: any) => {
        return () => {
            dispatch({ type: 'TOGGLE_EXISTING_OUTPUT_FORM' });
        };
    },
    toggleJsonRecordTypeOutputForm: (dispatch: any) => {
        return () => {
            dispatch({ type: 'TOGGLE_JSON_RECORD_TYPE_FORM' })
        }
    },
    toggleAddJsonFieldForm: (dispatch: any) => {
        return () => {
            dispatch({ type: 'TOGGLE_ADD_JSON_FIELD_FORM' })
        }
    },
    notifyInitializationInProgress: (dispatch: any) => {
        return (payload: any) => {
            dispatch({ type: 'NOTIFY_INITIALIZATION_IN_PROGRESS', payload });
        };
    },
    addDraftArrow: (dispatch: any) => {
        return (payload: any) => {
            dispatch({ type: 'ADD_DRAFT_ARROW', payload });
        };
    }
}

const initialState: any = {};

export const { Context, Provider } = createContext(
    reducer,
    actions,
    initialState
);
