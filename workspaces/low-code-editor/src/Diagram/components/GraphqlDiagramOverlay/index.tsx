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
    ConfigOverlayFormStatus,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    NodePosition, STKindChecker,
    STNode,
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Contexts/Diagram";
import { FormGenerator, FormGeneratorProps } from "../FormComponents/FormGenerator";

import { GraphqlServicePanel } from "./GraphqlServicePanel";
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
            ls: { getDiagramEditorLangClient },
        },
    } = useContext(Context);

    const [enableFunctionForm, setEnableFunctionForm] = useState(false);
    const [enableServicePanel, setServicePanel] = useState(false);
    const [formConfig, setFormConfig] = useState<FormGeneratorProps>(undefined);

    const renderFunctionForm = (position: NodePosition, functionType: string) => {
        if (STKindChecker.isServiceDeclaration(model)) {
            const lastMemberPosition: NodePosition = {
                endColumn: model.closeBraceToken.position.endColumn,
                endLine: model.closeBraceToken.position.endLine,
                startColumn: model.closeBraceToken.position.startColumn,
                startLine: model.closeBraceToken.position.startLine
            };
            setFormConfig({
                configOverlayFormStatus: { formType: "GraphqlConfigForm", isLoading: false },
                targetPosition: lastMemberPosition,
                onCancel: () => {
                    setEnableFunctionForm(false);
                },

            });
            setEnableFunctionForm(true);
        }
    };

    const renderServicePanel = () => {
        if (STKindChecker.isServiceDeclaration(model)) {
            setServicePanel(true);
        }
    }

    return (
        <div className={graphQLStyleClasses.graphqlDesignViewContainer}>
            {!enableServicePanel &&
            <GraphqlDesignDiagram
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
            />
            }
            {enableFunctionForm &&
            <FormGenerator {...formConfig}/>
            }
            {enableServicePanel && STKindChecker.isServiceDeclaration(model) &&
            <GraphqlServicePanel model={model}/> }
        </div>
    );
}
