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
import React, { useReducer } from "react";

import { STNode } from "@ballerina/syntax-tree";

import { DataMapperConfig } from "../Diagram/components/Portals/ConfigForm/types";
import { recalculateSizingAndPositioning, sizingAndPositioning } from "../Diagram/utils/diagram-util";
import { LowCodeEditorProps } from "../types";

const reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'UPDATE_STATE':
            return { ...state, ...action.payload, targetPosition: state.targetPosition };
        case 'DIAGRAM_CLEAN_DRAW':
            return {
                ...state,
                syntaxTree: sizingAndPositioning(action.payload),
            }
        case 'DIAGRAM_REDRAW':
            return {
                ...state,
                syntaxTree: recalculateSizingAndPositioning(action.payload)
            }
        case 'INSERT_COMPONENT_START':
            return {
                ...state,
                targetPosition: action.payload
            }
        case 'EDITOR_COMPONENT_START':
            return {
                ...state,
                targetPosition: action.payload
            }
        case 'SWITCH_TO_DATAMAPPER':
            return {
                ...state,
                isDataMapperShown: !state.isDataMapperShown,
                dataMapperConfig: action.payload
            }
        case 'TOGGLE_DIAGRAM_OVERLAY':
            return {
                ...state,
                isConfigOverlayFormOpen: !state.isConfigOverlayFormOpen,
                dataMapperConfig: undefined
            }
        case 'UPDATE_DATAMAPPER_CONFIG':
            return {
                ...state,
                dataMapperConfig: action.payload
            }
        default:
            return state;
    }
};

const updateState = (dispatch: any) => {
    return (payload: any) => {
        dispatch({ type: 'UPDATE_STATE', payload });
    };
}

const diagramCleanDraw = (dispatch: any) => {
    return (payload: STNode) => {
        dispatch({ type: 'DIAGRAM_CLEAN_DRAW', payload });
    }
}

const diagramRedraw = (dispatch: any) => {
    return (payload: STNode) => {
        dispatch({ type: 'DIAGRAM_REDRAW', payload })
    }
}

const insertComponentStart = (dispatch: any) => {
    return (payload: STNode) => {
        dispatch({ type: 'INSERT_COMPONENT_START', payload })
    }
}

const editorComponentStart = (dispatch: any) => {
    return (payload: STNode) => {
        dispatch({ type: 'EDITOR_COMPONENT_START', payload })
    }
}

const dataMapperStart = (dispatch: any) => {
    return (dataMapperConfig: DataMapperConfig) => {
        dispatch({ type: 'SWITCH_TO_DATAMAPPER', payload: dataMapperConfig })
    }
}

const toggleDiagramOverlay = (dispatch: any) => {
    return () => {
        dispatch({ type: 'TOGGLE_DIAGRAM_OVERLAY' })
    }
}

const updateDataMapperConfig = (dispatch: any) => {
    return (dataMapperConfig: DataMapperConfig) => {
        dispatch({ type: 'UPDATE_DATAMAPPER_CONFIG', payload: dataMapperConfig })
    }
}
const defaultState: any = {};

export const Context = React.createContext(defaultState);

export const Provider = (props: any) => {
  const { children, initialState } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  const boundActions = {
    updateState: updateState(dispatch),
    diagramCleanDraw: diagramCleanDraw(dispatch),
    diagramRedraw: diagramRedraw(dispatch),
    insertComponentStart: insertComponentStart(dispatch),
    editorComponentStart: editorComponentStart(dispatch),
    dataMapperStart: dataMapperStart(dispatch),
    toggleDiagramOverlay: toggleDiagramOverlay(dispatch),
    updateDataMapperConfig: updateDataMapperConfig(dispatch),
  };

  return (
    <Context.Provider value={{ state, ...boundActions }}>
      {children}
    </Context.Provider>
  );
}
