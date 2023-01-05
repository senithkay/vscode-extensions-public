/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { Dispatch, useEffect, useReducer } from "react";

import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { DiagramFocus } from "../../DiagramGenerator/vscode/Diagram";

interface DiagramFocusState {
    filePath: string;
    position: NodePosition;
}

export enum DiagramFocusActionTypes {
    UPDATE_FILE_PATH,
    UPDATE_POSITION,
    UPDATE_STATE,
    RESET_STATE
};

type FocusAction =
    | { type: DiagramFocusActionTypes.UPDATE_STATE, payload: DiagramFocusState }
    | { type: DiagramFocusActionTypes.UPDATE_FILE_PATH, payload: string }
    | { type: DiagramFocusActionTypes.UPDATE_POSITION, payload: NodePosition }
    | { type: DiagramFocusActionTypes.RESET_STATE, payload: string };

function diagramFocusReducer(state: DiagramFocusState, action: FocusAction): DiagramFocusState {
    switch (action.type) {
        case DiagramFocusActionTypes.UPDATE_STATE:
            return action.payload;
        case DiagramFocusActionTypes.UPDATE_FILE_PATH:
            return {
                ...state,
                filePath: action.payload
            };
        case DiagramFocusActionTypes.UPDATE_POSITION:
            return {
                ...state,
                position: action.payload
            };
        case DiagramFocusActionTypes.RESET_STATE:
            return undefined;
        default:
        // ignored
    }
}


export function useDiagramFocus(diagramFocus: DiagramFocus): [DiagramFocusState, Dispatch<FocusAction>] {

    const [state, dispatch] = useReducer(diagramFocusReducer, diagramFocus);

    useEffect(() => {
        dispatch({type: DiagramFocusActionTypes.UPDATE_STATE, payload: diagramFocus});
    }, [diagramFocus]);

    return [state, dispatch];
}

