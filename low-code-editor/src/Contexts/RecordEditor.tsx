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

import React, { useContext, useReducer } from "react";

import { RecordModel, SimpleField } from "../Diagram/components/ConfigForms/RecordEditor/types";

export enum FormState {
    EDIT_RECORD_FORM = 1,
    ADD_FIELD = 2,
    UPDATE_FIELD = 3,
    ADD_RECORD = 4,
    UPDATE_RECORD = 5,
}

export interface RecordEditorState {
    recordModel?: RecordModel;
    currentRecord?: RecordModel;
    currentField?: SimpleField;
    currentForm?: FormState;
}

export interface RecordEditorProps {
    state?: RecordEditorState;
    callBacks?: {
        onUpdateModel?: (mode: RecordModel) => void;
        onUpdateCurrentRecord?: (formState: RecordModel) => void;
        onUpdateCurrentField?: (field: SimpleField) => void;
        onChangeFormState?: (formState: FormState) => void;
    };
}

const reducer = (state: RecordEditorState, action: any) => {
    switch (action.type) {
        case 'UPDATE_MODEL':
            return {
                ...state,
                recordModel: action.payload
            }
        case 'UPDATE_FORM_STATE':
            return {
                ...state,
                currentForm: action.payload
            }
        case 'UPDATE_CURRENT_RECORD':
            return {
                ...state,
                currentRecord: action.payload
            }
        case 'UPDATE_CURRENT_FIELD':
            return {
                ...state,
                currentField: action.payload
            }
    }
};

const initialState: RecordEditorProps = {
    state: {
        recordModel: null,
        currentForm: FormState.ADD_FIELD
    }
};

export const Context = React.createContext<RecordEditorProps>(initialState);

export const Provider: React.FC<RecordEditorProps> = (props) => {
    const { children, state } = props;
    const [recordEditorState, dispatch] = useReducer(reducer, {
        currentForm: state.currentForm,
        recordModel: state.recordModel,
        currentRecord: state.currentRecord,
        currentField: state.currentField,
    });

    const updateModel = (recordModel: RecordModel) => {
        dispatch({ type: 'UPDATE_MODEL', payload: recordModel });
    }

    const updateCurrentRecord = (recordModel: RecordModel) => {
        dispatch({ type: 'UPDATE_CURRENT_RECORD', payload: recordModel });
    }

    const updateCurrentField = (filed: SimpleField) => {
        dispatch({ type: 'UPDATE_CURRENT_FIELD', payload: filed});
    }

    const updateFormState = (formState: FormState) => {
        dispatch({ type: 'UPDATE_FORM_STATE', payload: formState });
    }

    const callBacks = {
        onUpdateModel: updateModel,
        onUpdateCurrentRecord: updateCurrentRecord,
        onUpdateCurrentField: updateCurrentField,
        onChangeFormState: updateFormState
    };

    return (
        <Context.Provider value={{ state: recordEditorState, callBacks }}>
            {children}
        </Context.Provider>
    );
}

export const useRecordEditorContext = () => useContext(Context);
