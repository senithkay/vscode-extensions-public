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

import Container from "@material-ui/core/Container";
import { ConfigOverlayFormStatus } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ModulePart, NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import classnames from 'classnames';

import { Context as DiagramContext } from "../Contexts/Diagram";
import { TextPreLoader } from "../PreLoader/TextPreLoader";

import { FormGenerator, FormGeneratorProps } from "./components/FormComponents/FormGenerator";
import LowCodeDiagram from "./components/LowCodeDiagram";
import { DiagramDisableState } from "./components/LowCodeDiagram/DiagramState/DiagramDisableState";
import { DiagramErrorState } from "./components/LowCodeDiagram/DiagramState/DiagramErrorState";
import { ErrorList } from "./components/LowCodeDiagram/DiagramState/ErrorList";
import { ViewState } from "./components/LowCodeDiagram/ViewState";
import { OverlayBackground } from "./components/OverlayBackground";
import { LowcodeEvent, OPEN_LOW_CODE } from "./models";
import "./style.scss";
import { useStyles } from "./styles";
import { DefaultConfig } from "./visitors/default";

export function Diagram() {
    const {
        api: {
            code: {
                gotoSource,
                isMutationInProgress,
                isModulePullInProgress,
                loaderText
            },
            insights: {
                onEvent
            }
        },
        props: {
            diagnostics,
            warnings,
            syntaxTree,
            isLoadingAST,
            isReadOnly,
            error,
            experimentalEnabled
        },
    } = useContext(DiagramContext);

    const classes = useStyles();
    const diagnosticInDiagram = diagnostics && diagnostics.length > 0;
    const numberOfErrors = diagnostics && diagnostics.length;
    const numberOfWarnings = (warnings && warnings.length);
    const diagramErrors = diagnostics && diagnostics.length > 0;
    const diagramWarnings = warnings && warnings.length > 0;
    const warningsInDiagram = warnings && warnings.length > 0;
    const [isErrorStateDialogOpen, setIsErrorStateDialogOpen] = useState(diagramErrors);
    const [isErrorDetailsOpen, setIsErrorDetailsOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formConfig, setFormConfig] = useState<FormGeneratorProps>(undefined);

    React.useEffect(() => {
        setIsErrorStateDialogOpen(diagramErrors);
        setIsErrorDetailsOpen(diagramErrors);
    }, [diagramErrors, diagramWarnings])

    React.useEffect(() => {
        // Identify low-code open event
        const event: LowcodeEvent = {
            type: OPEN_LOW_CODE,
        };
        onEvent(event);
    }, []);

    const openErrorDialog = () => {
        setIsErrorStateDialogOpen(true);
        setIsErrorDetailsOpen(true);
    }

    const closeErrorDialog = () => {
        setIsErrorStateDialogOpen(false);
        setIsErrorDetailsOpen(false);
    }

    const handleDiagramAdd = (targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose: () => void, onSave: () => void) => {
        setFormConfig({
            configOverlayFormStatus,
            onCancel: () => {
                setIsFormOpen(false);
                onClose();
            },
            onSave: () => {
                setIsFormOpen(false);
                onSave();
            },
            targetPosition
        });
        setIsFormOpen(true);
    };

    const handleDiagramEdit = (model: STNode, targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose: () => void, onSave: () => void) => {
        setFormConfig({
            model,
            configOverlayFormStatus,
            onCancel: () => {
                setIsFormOpen(false);
                onClose();
            },
            onSave: () => {
                setIsFormOpen(false);
                onSave();
            },
            targetPosition
        });
        setIsFormOpen(true);
    };

    const textLoader = (
        <div className={classes.progressContainer}>
            <TextPreLoader position="absolute" text={loaderText} />
        </div>
    );

    const diagramErrorMessage = (
        <div className={classes.diagramErrorStateWrapper}>
            <DiagramErrorState
                x={5}
                y={-100}
                errorCount={numberOfErrors}
                warningCount={numberOfWarnings}
                onClose={closeErrorDialog}
                onOpen={openErrorDialog}
                isErrorMsgVisible={isErrorStateDialogOpen}
            />
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

    // let hasConfigurable = false;
    // if (originalSyntaxTree) {
    //     hasConfigurable = hasConfigurables(originalSyntaxTree as ModulePart)
    // }

    return (
        <div id="canvas">
            {(codeTriggerredUpdateInProgress || isMutationInProgress || isModulePullInProgress) && textLoader}
            {(diagnosticInDiagram || warningsInDiagram) && (
                <div className={classnames(classes.diagramErrorStateWrapper)}>
                    {diagnosticInDiagram && <OverlayBackground />}
                    {diagramStatus}
                </div>
            )}
            {isErrorDetailsOpen && <ErrorList />}
            <Container className={classes.DesignContainer}>
                <LowCodeDiagram
                    syntaxTree={syntaxTree}
                    isReadOnly={isReadOnly}
                    experimentalEnabled={experimentalEnabled}
                    api={{
                        edit: {
                            renderAddForm: handleDiagramAdd,
                            renderEditForm: handleDiagramEdit
                        },
                        code: {
                            gotoSource
                        }
                    }}
                />
                {isFormOpen && (
                    <FormGenerator {...formConfig} />
                )}
            </Container>
        </div>
    );
}
