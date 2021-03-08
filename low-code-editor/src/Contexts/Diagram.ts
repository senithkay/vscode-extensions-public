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
import { STNode } from "@ballerina/syntax-tree";
import { Diagnostic } from "monaco-languageclient/lib/monaco-language-client";

import { ExpressionEditorState } from "../Definitions";
import { recalculateSizingAndPositioning, sizingAndPositioning } from "../Diagram/utils/diagram-util";

import createContext from "./createContext";

const defaultExprEditorState: ExpressionEditorState = {
    content: undefined,
    name: undefined,
    uri: undefined,
    diagnostic: []
};

const reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'UPDATE_STATE':
            return { ...state, ...action.payload };
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
        default:
            return state;
    }
};

const actions = {
    updateState: (dispatch: any) => {
        return (payload: any) => {
            dispatch({ type: 'UPDATE_STATE', payload });
        };
    },
    diagramCleanDraw: (dispatch: any) => {
        return (payload: STNode) => {
            dispatch({ type: 'DIAGRAM_CLEAN_DRAW', payload });
        }
    },
    diagramRedraw: (dispatch: any) => {
        return (payload: STNode) => {
            dispatch({ type: 'DIAGRAM_REDRAW', payload })
        }
    },
    insertComponentStart: (dispatch: any) => {
        return (payload: STNode) => {
            dispatch({ type: 'INSERT_COMPONENT_START', payload })
        }
    },
    editorComponentStart: (dispatch: any) => {
        return (payload: STNode) => {
            dispatch({ type: 'EDITOR_COMPONENT_START', payload })
        }
    }
};

const initialState: any = {};

export const { Context, Provider } = createContext(
    reducer,
    actions,
    initialState
);
