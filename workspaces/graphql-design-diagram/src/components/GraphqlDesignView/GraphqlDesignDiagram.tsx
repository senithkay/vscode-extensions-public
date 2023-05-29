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
// tslint:disable: no-implicit-dependencies jsx-no-multiline-js jsx-wrap-multiline
import React, { useEffect, useState } from "react";

import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    GraphqlDesignServiceRequest, GraphqlDesignServiceResponse
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { TextPreLoader } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { Container } from "../Canvas/CanvasWidgetContainer";
import { GraphqlDiagramContext } from "../DiagramContext/GraphqlDiagramContext";
import { GraphqlDiagramContainer } from "../GraphqlDiagramContainer/GraphqlDiagramContainer";
import { GraphqlDesignModel } from "../resources/model";
import { getModelForGraphqlService } from "../utils/ls-util";

import { GraphqlUnsupportedOverlay } from "./GraphqlUnsupportedOverlay";

export interface GraphqlDesignDiagramProps {
    model?: STNode;
    targetPosition?: NodePosition;
    langClientPromise: Promise<IBallerinaLangClient>;
    filePath: string;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    ballerinaVersion?: string;
    syntaxTree?: STNode;
    functionPanel?: (position: NodePosition, functionType: string, model?: STNode, filePath?: string, completeST?: STNode) => void;
    servicePanel?: () => void;
    operationDesignView?: (functionPosition: NodePosition, filePath?: string) => void;
    onDelete?: (position: NodePosition) => void;
    fullST?: STNode;
    goToSource?: (filePath: string, position: NodePosition) => void;
    recordEditor?: (recordModel: STNode, filePath?: string, completeST?: STNode) => void;
}

interface GraphqlModelData {
    designModel: GraphqlDesignModel;
    isIncompleteModel: boolean;
}

export function GraphqlDesignDiagram(props: GraphqlDesignDiagramProps) {
    const {
        model,
        targetPosition,
        langClientPromise,
        currentFile,
        functionPanel,
        servicePanel,
        operationDesignView,
        onDelete,
        fullST,
        goToSource,
        recordEditor
    } = props;

    const [modelData, setModelData] = useState<GraphqlModelData>(undefined);

    useEffect(() => {
        if (fullST) {
            (async () => {
                await getGraphqlDesignModel();
            })();
        }
    }, [fullST]);

    const getGraphqlDesignModel = async () => {
        const request: GraphqlDesignServiceRequest = {
            filePath: currentFile.path,
            startLine: { line: targetPosition.startLine, offset: targetPosition.startColumn },
            endLine: { line: targetPosition.endLine, offset: targetPosition.endColumn }
        };
        const graphqlModel: GraphqlDesignServiceResponse = await getModelForGraphqlService(request, langClientPromise);
        setModelData({designModel: graphqlModel.graphqlDesignModel, isIncompleteModel: graphqlModel.isIncompleteModel});
    };

    const ctxt = {
        model,
        functionPanel,
        servicePanel,
        operationDesignView,
        onDelete,
        fullST,
        goToSource,
        recordEditor,
        langClientPromise,
        currentFile
    };

    return (
        <>
            <GraphqlDiagramContext {...ctxt}>
                {modelData?.designModel && fullST && <GraphqlDiagramContainer designModel={modelData.designModel} />}
            </GraphqlDiagramContext>
            {modelData?.isIncompleteModel && <GraphqlUnsupportedOverlay />}
            {!modelData?.designModel &&
                <Container className="dotted-background">
                    <TextPreLoader position="absolute" text="Fetching data..."/>
                </Container>
            }
        </>
    );
}
