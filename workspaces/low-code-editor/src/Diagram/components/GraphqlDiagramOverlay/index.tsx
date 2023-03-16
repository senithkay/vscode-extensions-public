/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useContext, useState } from "react";

import { GraphqlDesignDiagram } from "@wso2-enterprise/ballerina-graphql-design-diagram";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    ConfigOverlayFormStatus, STModification,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    NodePosition, STKindChecker,
    STNode,
} from "@wso2-enterprise/syntax-tree";

import { Context, useDiagramContext } from "../../../Contexts/Diagram";
import { useHistoryContext } from "../../../DiagramViewManager/context/history";
import { ComponentViewInfo } from "../../../OverviewDiagram/util";
import { removeStatement } from "../../utils";
import { FormGenerator, FormGeneratorProps } from "../FormComponents/FormGenerator";

import { graphQLOverlayStyles } from "./style";

export interface GraphqlDesignOverlayProps {
    model?: STNode;
    targetPosition?: NodePosition;
    ballerinaVersion?: string;
    onCancel?: () => void;
    configOverlayFormStatus?: ConfigOverlayFormStatus;
}

export function GraphqlDiagramOverlay(props: GraphqlDesignOverlayProps) {
    const { targetPosition, ballerinaVersion, onCancel: onClose, model } = props;

    const graphQLStyleClasses = graphQLOverlayStyles();

    const {
        props: { currentFile, syntaxTree: lowcodeST },
        api: {
            code: { modifyDiagram },
            ls: { getDiagramEditorLangClient },
        },
    } = useContext(Context);

    const { history } = useHistoryContext();
    const { api: { navigation: { updateSelectedComponent } } } = useDiagramContext();

    const [enableFunctionForm, setEnableFunctionForm] = useState(false);
    const [enableServicePanel, setServicePanel] = useState(false);
    const [formConfig, setFormConfig] = useState<FormGeneratorProps>(undefined);

    const renderFunctionForm = (position: NodePosition, functionType: string, functionModel?: STNode) => {
        if (STKindChecker.isServiceDeclaration(model)) {
            const lastMemberPosition: NodePosition = {
                endColumn: model.closeBraceToken.position.endColumn,
                endLine: model.closeBraceToken.position.endLine,
                startColumn: model.closeBraceToken.position.startColumn,
                startLine: model.closeBraceToken.position.startLine
            };
            setFormConfig({
                model: functionModel,
                configOverlayFormStatus: { formType: "GraphqlConfigForm", isLoading: false },
                targetPosition: position,
                onCancel: () => {
                    setEnableFunctionForm(false);
                },

            });
            setEnableFunctionForm(true);
        }
    };

    const renderServicePanel = () => {
        if (STKindChecker.isServiceDeclaration(model)) {
            setFormConfig({
                model,
                configOverlayFormStatus: { formType: "ServiceDeclaration", isLoading: false },
                targetPosition: model.position,
                onCancel: () => {
                    setServicePanel(false);
                },

            });
            setServicePanel(true);
        }
    }

    const handleDesignOperationClick = (functionPosition: NodePosition) => {
        const currentElementInfo = history[history.length - 1];
        const componentViewInfo: ComponentViewInfo = {
            filePath: currentElementInfo.file,
            position: functionPosition
        }
        updateSelectedComponent(componentViewInfo);
    }

    const handleDeleteBtnClick = (position: NodePosition) => {
        const modifications: STModification[] = [];
        const deleteAction: STModification = removeStatement(
            position
        );
        modifications.push(deleteAction);
        modifyDiagram(modifications);
    }


    return (
        <div className={graphQLStyleClasses.graphqlDesignViewContainer}>
            <GraphqlDesignDiagram
                model={model}
                targetPosition={targetPosition}
                langClientPromise={
                    getDiagramEditorLangClient() as unknown as Promise<IBallerinaLangClient>
                }
                filePath={currentFile.path}
                currentFile={currentFile}
                ballerinaVersion={ballerinaVersion}
                syntaxTree={lowcodeST}
                functionPanel={renderFunctionForm}
                servicePanel={renderServicePanel}
                operationDesignView={handleDesignOperationClick}
                onDelete={handleDeleteBtnClick}
            />
            {enableFunctionForm &&
            <FormGenerator {...formConfig}/>
            }
            {enableServicePanel &&
            <FormGenerator {...formConfig}/>}
        </div>
    );
}
