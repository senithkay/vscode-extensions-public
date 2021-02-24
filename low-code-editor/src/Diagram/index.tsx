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
// tslint:disable: jsx-no-multiline-js
import * as React from "react";

import { STNode } from "@ballerina/syntax-tree";
import Container from "@material-ui/core/Container";

import { STModification } from "../Definitions";
import { TextPreLoader } from "../PreLoader/TextPreLoader";

import { Canvas } from "./components/Canvas";
import { OverlayBackground } from "./components/OverlayBackground";
import PanAndZoom from "./components/PanAndZoom";
import { TriggerType } from "./models";
import { useStyles } from "./styles";
import { getSTComponent } from "./utils";
import { ViewState } from "./view-state";
import { DefaultConfig } from "./visitors/default";

export interface DiagramProps {
    isReadOnly: boolean;
    syntaxTree: STNode;
    isLoadingAST: boolean;
    isWaitingOnWorkspace: boolean;
    error?: Error;
    dispatchMutations?: (modifications: STModification[]) => void;
    dispatchModifyTrigger?: (triggerType: TriggerType, model?: any, configObject?: any) => void;
    isMutationInProgress: boolean;
    isCodeEditorActive: boolean;
    isConfigPanelOpen: boolean;
    isConfigOverlayFormOpen: boolean;
    triggerType?: TriggerType;
}

export function Diagram(props: DiagramProps) {
    const {
        isReadOnly,
        syntaxTree,
        isLoadingAST,
        error,
        isWaitingOnWorkspace,
        dispatchMutations,
        dispatchModifyTrigger,
        isMutationInProgress,
        isCodeEditorActive,
        isConfigPanelOpen,
        isConfigOverlayFormOpen,
        triggerType
    } = props;
    const classes = useStyles();

    const textLoader = (
        <div className={classes.progressContainer}>
            <TextPreLoader position="absolute" />
        </div>
    );

    const diagramDisabledStatus = (
        <div>
            <img src="../../../../../../images/diagram-disabled.svg" />
        </div>
    );

    const diagramEnabledStatus = (
        <div>
            <img src="../../../../../../images/diagram-enabled.svg" />
        </div>
    );

    if (!syntaxTree) {
        if (isLoadingAST) {
            return textLoader;
        } else if (error) {
            return null;
        }
    }

    // TODO: This flag corresponds to diagram is invalid and code is being updated.
    const codeTriggerredUpdateInProgress = syntaxTree && isLoadingAST;

    // todo: need to handle this when file is empty
    // AST node passed in to this is can be a top level node or a compilation unit.
    const child = getSTComponent(syntaxTree);
    const viewState = syntaxTree.viewState as ViewState;
    let h = viewState.bBox.h ? (viewState.bBox.h + DefaultConfig.canvas.paddingY) : DefaultConfig.canvas.height;
    const w = viewState.bBox.w ? (viewState.bBox.w + DefaultConfig.canvas.paddingX) : DefaultConfig.canvas.width;

    if (h < window.innerHeight) {
        h = h + (window.innerHeight - h);
    }

    return (
        <div id="canvas">
            {(codeTriggerredUpdateInProgress || isMutationInProgress) && textLoader}
            {triggerType !== undefined && isWaitingOnWorkspace && textLoader}

            <div className={classes.diagramStateWrapper}>
                {(!isCodeEditorActive && !isWaitingOnWorkspace) && !isConfigPanelOpen && !isReadOnly && diagramEnabledStatus}
                {(isCodeEditorActive || isWaitingOnWorkspace) && !isConfigPanelOpen && !isReadOnly && diagramDisabledStatus}
            </div>
            <PanAndZoom>
                <Container className={classes.DesignContainer}>
                    <div id="canvas-overlay" className={classes.OverlayContainer} />
                    <Canvas h={h} w={w} >
                        {child}
                    </Canvas>
                    {isConfigOverlayFormOpen && <OverlayBackground />}
                </Container>
            </PanAndZoom>
        </div>
    );
}
