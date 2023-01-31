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

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    GraphqlDesignServiceRequest, GraphqlDesignServiceResponse
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { GraphqlDiagramContainer } from "../GraphqlDiagramContainer/GraphqlDiagramContainer";
import { GraphqlDesignModel } from "../resources/model";
import { getModelForGraphqlService } from "../utils/ls-util";

export interface GraphqlDesignDiagramProps {
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
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            height: "100%",
            overflow: "hidden"
        }
    }),
);

export function GraphqlDesignDiagram(props: GraphqlDesignDiagramProps) {
    const { targetPosition, langClientPromise, filePath, currentFile, ballerinaVersion, syntaxTree } = props;

    const [designModel, setDesignModel] = useState<GraphqlDesignModel>(null);
    const [isIncompleteModel, setModelStatus] = useState(false);

    const classes = useStyles();

    useEffect(() => {
        (async () => {
            await getGraphqlDesignModel();
        })();
    }, []);

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

    return (
        // TODO: Add overlay header
        <>
            {designModel && <GraphqlDiagramContainer designModel={designModel} />}
        </>
        // TODO: Add the error banner in-case of an incompleteModel (compilation errors will be handled at the initial level)
    );
}
