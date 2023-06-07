/*
* Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein is strictly forbidden, unless permitted by WSO2 in accordance with
* the WSO2 Commercial License available at http://wso2.com/licenses.
* For specific language governing the permissions and limitations under
* this license, please see the license as well as any agreement you’ve
* entered into with WSO2 governing the purchase of this software and any
* associated services.
*/
import { jest } from "@jest/globals";
import { STNode } from "@wso2-enterprise/syntax-tree";

import {
    LowCodeDiagramActions,
    LowCodeDiagramAPI,
    LowCodeDiagramProperties, LowCodeDiagramState
} from "../../Context/types";

export function getDiagramAPIProps(): LowCodeDiagramAPI {
    return {
        code: {},
        configPanel: {
            closeConfigOverlayForm: jest.fn(),
            closeConfigPanel: jest.fn(),
            configOverlayFormPrepareStart: jest.fn()
        },
        edit: {},
        insights: {},
        navigation: {
            navigateUptoParent: jest.fn(),
            updateActiveFile: jest.fn(),
            updateSelectedComponent: jest.fn()
        },
        panNZoom: {
            fitToScreen: jest.fn(),
            pan: jest.fn(),
            zoomIn: jest.fn(),
            zoomOut: jest.fn(),
        },
        project: {
            run: jest.fn(),
        },
        webView: {}
    };
}

export function getDiagramProperties(completeST: STNode, functionDef: STNode): LowCodeDiagramProperties {
    return {
        error: undefined,
        experimentalEnabled: false,
        fullST: completeST,
        getListenerSignature: jest.fn(() => Promise.resolve("")),
        isReadOnly: false,
        onDiagramDoubleClick: jest.fn(),
        selectedPosition: undefined,
        stSymbolInfo: undefined,
        syntaxTree: functionDef,
        zoomStatus: undefined
    }
}

export function getDiagramActions(): LowCodeDiagramActions {
    return {
        diagramCleanDraw: jest.fn(),
        diagramRedraw: jest.fn(),
        editorComponentStart: jest.fn(),
        insertComponentStart: jest.fn(),
        updateState: jest.fn()
    }
}

export function getDiagramState(): LowCodeDiagramState {
    return {
        experimentalEnabled: false,
        isConfigOverlayFormOpen: false,
        isDataMapperShown: false,
        isDiagramFunctionExpanded: false,
        targetPosition: undefined,
        triggerUpdated: false
    }
}
