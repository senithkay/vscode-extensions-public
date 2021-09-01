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
import React, { useContext, useState } from "react";

import { ModulePart, STNode } from "@ballerina/syntax-tree";
import Container from "@material-ui/core/Container";
import classnames from 'classnames';

import { Context as DiagramContext } from "../Contexts/Diagram";
import { TextPreLoader } from "../PreLoader/TextPreLoader";

import { Canvas } from "./components/Canvas";
import { DataMapper } from './components/DataMapper';
import { DiagramDisableState } from "./components/DiagramState/DiagramDisableState";
import { DiagramErrorState } from "./components/DiagramState/DiagramErrorState";
import { ErrorList } from "./components/DiagramState/ErrorList";
import { OverlayBackground } from "./components/OverlayBackground";
import PanAndZoom from "./components/PanAndZoom";
import { TriggerType } from "./models";
import "./style.scss";
import { useStyles } from "./styles";
import { getSTComponent } from "./utils";
import { ViewState } from "./view-state";
import { DefaultConfig } from "./visitors/default";
import { CanvasDiagram } from "./components/CanvasContainer";
export interface DiagramProps {
    isReadOnly: boolean;
    syntaxTree: STNode;
    originalSyntaxTree: STNode;
    isLoadingAST: boolean;
    isWaitingOnWorkspace: boolean;
    error?: Error;
    isMutationInProgress: boolean;
    isCodeEditorActive: boolean;
    isConfigPanelOpen: boolean;
    isConfigOverlayFormOpen: boolean;
    triggerType?: TriggerType;
    dispatchFileChange?: (content: string) => Promise<void>;
    dispatchCodeChangeCommit?: () => Promise<void>;
    hasConfigurables: (templateST: ModulePart) => boolean;
}

export function Diagram(props: DiagramProps) {
    const {
        isReadOnly,
        syntaxTree,
        originalSyntaxTree,
        isLoadingAST,
        error,
        isWaitingOnWorkspace,
        isMutationInProgress,
        isCodeEditorActive,
        isConfigPanelOpen,
        triggerType,
        hasConfigurables
    } = props;
    const { state: {
        diagnostics,
        isDataMapperShown,
        isConfigOverlayFormOpen,
        warnings
    } } = useContext(DiagramContext);

    const classes = useStyles();
    const diagnosticInDiagram = diagnostics && diagnostics.length > 0;
    const numberOfErrors = diagnostics && diagnostics.length;
    const numberOfWarnings = (warnings && warnings.length);
    const diagramErrors = diagnostics && diagnostics.length > 0;
    const diagramWarnings = warnings && warnings.length > 0;
    const warningsInDiagram = warnings && warnings.length > 0;
    const [isErrorStateDialogOpen, setIsErrorStateDialogOpen] = useState(diagramErrors);
    const [isErrorDetailsOpen, setIsErrorDetailsOpen] = useState(false);

    React.useEffect(() => {
        setIsErrorStateDialogOpen(diagramErrors);
        setIsErrorDetailsOpen(diagramErrors);
    }, [diagramErrors, diagramWarnings])

    const openErrorDialog = () => {
        setIsErrorStateDialogOpen(true);
        setIsErrorDetailsOpen(true);
    }

    const closeErrorDialog = () => {
        setIsErrorStateDialogOpen(false);
        setIsErrorDetailsOpen(false);
    }

    const textLoader = (
        <div className={classes.progressContainer}>
            <TextPreLoader position="absolute" />
        </div>
    );

    const disableIconClassCheck = (triggerType === "API") ? classes.disableAPIDiagramIcon : classes.disableDiagramIcon;
    const enableIconClassCheck = (triggerType === "API") ? classes.diagramAPIStateWrapper : classes.diagramStateWrapper;

    const diagramDisabledStatus = (
        <div className={disableIconClassCheck}>
            <DiagramDisableState />
        </div>
    );
    const diagramDisabledWithTextLoaderStatus = (
        <div className={classes.disableDiagramIconWithTextLoader}>
            <DiagramDisableState />
        </div>
    );

    const diagramErrorMessage = (
        <div className={classes.diagramErrorStateWrapper}>
            <DiagramErrorState x={5} y={-100} errorCount={numberOfErrors} warningCount={numberOfWarnings} onClose={closeErrorDialog} onOpen={openErrorDialog} isErrorMsgVisible={isErrorStateDialogOpen} />
        </div>
    );

    const diagramStatus = (diagnosticInDiagram || warningsInDiagram) ? diagramErrorMessage : null;

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
    // const child = getSTComponent(syntaxTree); // TODO: Handle datamapper switching logic
    const viewState = syntaxTree.viewState as ViewState;
    let h = viewState.bBox.h ? (viewState.bBox.h + DefaultConfig.canvas.childPaddingY) : DefaultConfig.canvas.height;
    const w = viewState.bBox.w ? (viewState.bBox.w + DefaultConfig.canvas.childPaddingX) : DefaultConfig.canvas.width;

    if (h < window.innerHeight) {
        h = h + (window.innerHeight - h);
    }

    const child = getSTComponent(syntaxTree);

    let hasConfigurable = false;
    if (originalSyntaxTree) {
        hasConfigurable = hasConfigurables(originalSyntaxTree as ModulePart)
    }

    return (
        <div id="canvas">
            {(codeTriggerredUpdateInProgress || isMutationInProgress) && textLoader}
            {triggerType !== undefined && isWaitingOnWorkspace && textLoader && diagramDisabledWithTextLoaderStatus}
            {(isWaitingOnWorkspace && (triggerType !== undefined)) ? textLoader : null}

            <div className={enableIconClassCheck}>
                {(!isCodeEditorActive && !isWaitingOnWorkspace) && !isConfigPanelOpen && !isReadOnly && diagramStatus}
                {isWaitingOnWorkspace && !isConfigPanelOpen && !isReadOnly && diagramDisabledWithTextLoaderStatus}
                {isCodeEditorActive && diagramDisabledStatus}
            </div>

            {(diagnosticInDiagram || warningsInDiagram) && (
                <div className={classnames(classes.diagramErrorStateWrapper, hasConfigurable && classes.diagramErrorStateWrapperWithConfig)}>
                    {diagnosticInDiagram && <OverlayBackground />}
                    {diagramStatus}
                </div>
            )}

            {isErrorDetailsOpen && <ErrorList />}

            <Container className={classes.DesignContainer}>
                <div id="canvas-overlay" className={classes.OverlayContainer} />
                {isDataMapperShown && (
                    <DataMapper width={w} />
                )}
                {!isDataMapperShown && (
                    <CanvasDiagram>
                        {child}
                    </CanvasDiagram>
                )}
                {diagramDisabledWithTextLoaderStatus && triggerType !== undefined && isWaitingOnWorkspace && <OverlayBackground />}
                {isCodeEditorActive && !isConfigOverlayFormOpen && diagramDisabledStatus && <OverlayBackground />}
                {isConfigOverlayFormOpen && <OverlayBackground />}
            </Container>

            {/* <PanAndZoom>
                <Container className={classes.DesignContainer}>
                    <div id="canvas-overlay" className={classes.OverlayContainer} />
                    {isDataMapperShown && (
                        <DataMapper width={w} />
                    )}
                    {!isDataMapperShown && (
                        <Canvas h={h} w={w} >
                            {child}
                        </Canvas>
                    )}
                    {diagramDisabledWithTextLoaderStatus && triggerType !== undefined && isWaitingOnWorkspace && <OverlayBackground />}
                    {isCodeEditorActive && !isConfigOverlayFormOpen && diagramDisabledStatus && <OverlayBackground />}
                    {isConfigOverlayFormOpen && <OverlayBackground />}
                </Container>
            </PanAndZoom> */}
        </div>
    );
}
