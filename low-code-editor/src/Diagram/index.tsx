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
import { ConfigOverlayFormStatus, ConnectorConfigWizardProps, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ModulePart, NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import classnames from 'classnames';

import { Context as DiagramContext } from "../Contexts/Diagram";
import { TextPreLoader } from "../PreLoader/TextPreLoader";

import { ConnectorConfigWizard } from "./components/FormComponents/ConnectorConfigWizard";
import { FormGenerator, FormGeneratorProps } from "./components/FormComponents/FormGenerator";
import LowCodeDiagram from "./components/LowCodeDiagram";
import { DiagramErrorState } from "./components/LowCodeDiagram/DiagramState/DiagramErrorState";
import { ErrorList } from "./components/LowCodeDiagram/DiagramState/ErrorList";
import { ViewState } from "./components/LowCodeDiagram/ViewState";
import { OverlayBackground } from "./components/OverlayBackground";
import "./style.scss";
import { useStyles } from "./styles";
import { removeStatement } from "./utils/modification-util";
import { DefaultConfig } from "./visitors/default";

export function Diagram() {
    const {
        api: {
            code: {
                modifyDiagram,
                gotoSource,
                isMutationInProgress,
                isModulePullInProgress,
                loaderText
            },
            webView: {
                showSwaggerView,
                showDocumentationView
            },
            project: {
                run
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
            stSymbolInfo,
            error,
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
    const [isConnectorConfigWizardOpen, setIsConnectorConfigWizardOpen] = useState(false);
    const [connectorConfigWizardProps, setConnectorConfigWizardProps] = useState<ConnectorConfigWizardProps>(undefined);

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

    const handleDiagramAdd = (targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => {
        setFormConfig({
            configOverlayFormStatus,
            onCancel: () => {
                setIsFormOpen(false);
                if (onClose) {
                    onClose();
                }
            },
            onSave: () => {
                setIsFormOpen(false);
                if (onSave) {
                    onSave();
                }
            },
            targetPosition
        });
        setIsFormOpen(true);
        setIsConnectorConfigWizardOpen(false);
    };

    const handleDiagramEdit = (model: STNode, targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => {
        setFormConfig({
            model,
            configOverlayFormStatus,
            onCancel: () => {
                setIsFormOpen(false);
                if (onClose) {
                    onClose();
                }
            },
            onSave: () => {
                setIsFormOpen(false);
                if (onSave) {
                    onSave();
                }
            },
            targetPosition
        });
        setIsFormOpen(true);
        setIsConnectorConfigWizardOpen(false);
    };

    const handleConnectorConfigWizard = (connectorConfig: ConnectorConfigWizardProps) => {
        setConnectorConfigWizardProps({
            ...connectorConfig,
            onSave: () => {
                setIsConnectorConfigWizardOpen(false);
                if (connectorConfig.onSave) {
                    connectorConfig.onSave();
                }
            },
            onClose: () => {
                setIsConnectorConfigWizardOpen(false);
                if (connectorConfig.onClose) {
                    connectorConfig.onClose();
                }
            }
        });
        setIsFormOpen(false);
        setIsConnectorConfigWizardOpen(true);
    };

    const handleDeleteComponent = (model: STNode, onDelete?: () => void) => {
        const modifications: STModification[] = [];
        // used configurable
        const configurables: Map<string, STNode> = stSymbolInfo.configurables;
        const usedConfigurables = Array.from(configurables.keys()).filter(config => model.source.includes(`${config}`));
        const variableReferences: Map<string, STNode[]> = stSymbolInfo.variableNameReferences;

        // delete unused configurables
        usedConfigurables.forEach(configurable => {
            // check used configurables usages
            if (variableReferences.has(configurable) && variableReferences.get(configurable).length === 1) {
                const deleteConfig: STModification = removeStatement(
                    configurables.get(configurable).position
                );
                modifications.push(deleteConfig);
            }
        });

        // delete action
        const deleteAction: STModification = removeStatement(
            model.position
        );
        modifications.push(deleteAction);

        modifyDiagram(modifications);

        // If onDelete callback is available invoke it.
        if (onDelete) {
            onDelete();
        }
    };

    const handleCloseAllOpenedForms = (callBack: () => void) => {
        setIsConnectorConfigWizardOpen(false);
        setIsFormOpen(false);
        if (callBack) {
            callBack();
        }
    }

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
                    api={{
                        edit: {
                            deleteComponent: handleDeleteComponent,
                            renderAddForm: handleDiagramAdd,
                            renderEditForm: handleDiagramEdit,
                            renderConnectorWizard: handleConnectorConfigWizard,
                            closeAllOpenedForms: handleCloseAllOpenedForms
                        },
                        code: {
                            gotoSource,
                            modifyDiagram
                        },
                        webView: {
                            showDocumentationView,
                            showSwaggerView
                        },
                        project: {
                            run
                        },
                        insights: {
                            onEvent
                        }
                    }}
                />
                {isFormOpen && !isConnectorConfigWizardOpen && (
                    <FormGenerator {...formConfig} />
                )}
                {!isFormOpen && isConnectorConfigWizardOpen && (
                    <ConnectorConfigWizard {...connectorConfigWizardProps} />
                )}
            </Container>
        </div>
    );
}
