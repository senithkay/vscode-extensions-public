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

import React, { useEffect, useState } from "react";

import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    GraphqlDesignServiceRequest, GraphqlDesignServiceResponse
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

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
    functionPanel?: (position: NodePosition, functionType: string, model?: STNode) => void;
    servicePanel?: () => void;
    operationDesignView?: (functionPosition: NodePosition) => void;
    onDelete?: (position: NodePosition) => void;
    fullST?: STNode;
    goToSource?: (filePath: string, position: NodePosition) => void;
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
        goToSource
    } = props;

    const [designModel, setDesignModel] = useState<GraphqlDesignModel>(null);
    const [isIncompleteModel, setModelStatus] = useState(false);

    useEffect(() => {
        (async () => {
            await getGraphqlDesignModel();
        })();
    }, [model]);

    const getGraphqlDesignModel = async () => {
        const request: GraphqlDesignServiceRequest = {
            filePath: currentFile.path,
            startLine: { line: targetPosition.startLine, offset: targetPosition.startColumn },
            endLine: { line: targetPosition.endLine, offset: targetPosition.endColumn }
        };
        const graphqlModel: GraphqlDesignServiceResponse = await getModelForGraphqlService(request, langClientPromise);
        setDesignModel(graphqlModel.graphqlDesignModel);
        setModelStatus(graphqlModel.isIncompleteModel);
    };

    const ctxt = {
        model,
        functionPanel,
        servicePanel,
        operationDesignView,
        onDelete,
        fullST,
        goToSource
    };

    return (
        <>
            <GraphqlDiagramContext {...ctxt}>
                {designModel && <GraphqlDiagramContainer designModel={designModel} />}
            </GraphqlDiagramContext>
            {isIncompleteModel && <GraphqlUnsupportedOverlay />}
        </>
    );
}
