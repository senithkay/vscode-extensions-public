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
        case 'EXPRESSION_EDITOR_START':
            return {
                ...state,
                exprEditorState: action.payload
            }
        case 'EXPRESSION_EDITOR_CLOSE':
            return {
                ...state,
                exprEditorState: defaultExprEditorState
            }
        case 'EXPRESSION_EDITOR_CONTENT_CHANGE':
            return {
                ...state,
                exprEditorState: {
                    ...state.exprEditorState,
                    content: action.payload.content,
                    diagnostic: action.payload.diagnostic
                }
            }
        case 'EXPRESSION_EDITOR_DIAGNOSTICS_CHANGE':
            return {
                ...state,
                exprEditorState: {
                    ...state.exprEditorState,
                    diagnostic: action.payload
                }
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
    expressionEditorStart: (dispatch: any) => {
        return (editor: ExpressionEditorState) => {
            dispatch({ type: 'EXPRESSION_EDITOR_START', payload: editor })
        }
    },
    expressionEditorClose: (dispatch: any) => {
        return () => {
            dispatch({ type: 'EXPRESSION_EDITOR_CLOSE' })
        }
    },
    expressionEditorContentChange: (dispatch: any) => {
        return (editor: ExpressionEditorState) => {
            dispatch({ type: 'EXPRESSION_EDITOR_CONTENT_CHANGE', payload: editor })
        }
    },
    expressionEditorDiagnosticsChange: (dispatch: any) => {
        return (diagnostics: Diagnostic[]) => {
            dispatch({ type: 'EXPRESSION_EDITOR_DIAGNOSTICS_CHANGE', payload: diagnostics })
        }
    },
};

const initialState: any = {};

export const { Context, Provider } = createContext(
    reducer,
    actions,
    initialState
);
