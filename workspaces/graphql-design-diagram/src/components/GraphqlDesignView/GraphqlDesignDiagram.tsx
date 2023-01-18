// import { LinePosition } from "@wso2-enterprise/ballerina-languageclient";
// import { getModelForGraphqlService } from "../utils/ls-util";

import React, { useEffect, useState } from "react";

import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    DiagramEditorLangClientInterface,
    GraphqlDesignServiceRequest, GraphqlDesignServiceResponse
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

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

export function GraphqlDesignDiagram(props: GraphqlDesignDiagramProps){
    const {targetPosition, langClientPromise, filePath, currentFile, ballerinaVersion, syntaxTree} = props;

    const[designModel, setDesignModel] = useState<GraphqlDesignModel>(null);
    const[isIncompleteModel, setModelStatus] = useState(false);

    useEffect(() => {
        (async () => {
            await getGraphqlDesignModel()
        })();
    }, []);

    const getGraphqlDesignModel = async () => {
        // const startLineRange : LinePosition = {
        //     line: 3,
        //     offset: 0,
        // }
        // const endLineRange : LinePosition = {
        //     line: 10,
        //     offset: 1,
        // }
        const request : GraphqlDesignServiceRequest = {
            filePath: currentFile.path,
            startLine: {line: targetPosition.startLine, offset: targetPosition.startColumn},
            endLine: {line: targetPosition.endLine, offset: targetPosition.endColumn}
        }
        const graphqlModel: GraphqlDesignServiceResponse = await getModelForGraphqlService(request, langClientPromise);
        setDesignModel(graphqlModel.graphqlDesignModel);
        setModelStatus(graphqlModel.isIncompleteModel);
    }

    return(
        // diagram header
        // diagram container
        <div/>
    );
}
