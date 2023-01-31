/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext, useEffect } from "react";

import { GraphqlDesignDiagram } from "@wso2-enterprise/ballerina-graphql-design-diagram";
import { IBallerinaLangClient, LinePosition } from "@wso2-enterprise/ballerina-languageclient";
import {
    ConfigOverlayFormStatus,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    NodePosition,
    STNode,
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Contexts/Diagram";
import { DiagramOverlay, DiagramOverlayContainer } from "../Portals/Overlay";

import { graphQLOverlayStyles } from "./style";

export interface DataMapperProps {
    model?: STNode;
    targetPosition?: NodePosition;
    ballerinaVersion?: string;
    onCancel?: () => void;
    configOverlayFormStatus?: ConfigOverlayFormStatus;
}

export function GraphqlDiagramOverlay(props: DataMapperProps) {
    const { targetPosition, ballerinaVersion, onCancel: onClose, model } = props;

    const graphQLStyleClasses = graphQLOverlayStyles();

    const {
        props: { currentFile, stSymbolInfo, importStatements, syntaxTree: lowcodeST },
        api: {
            code: { modifyDiagram, updateFileContent },
            ls: { getDiagramEditorLangClient },
        },
    } = useContext(Context);
    // <DiagramOverlayContainer>
    //     <DiagramOverlay
    //         position={{ x: 0, y: 0 }}
    //         stylePosition={"absolute"}
    //         className={graphQLStyleClasses.overlay}
    //     >
    return (
        <div className={graphQLStyleClasses.graphqlDesignViewContainer}>
            <GraphqlDesignDiagram
                targetPosition={targetPosition}
                langClientPromise={
                    getDiagramEditorLangClient() as unknown as Promise<IBallerinaLangClient>
                }
                filePath={currentFile.path}
                currentFile={currentFile}
                ballerinaVersion={ballerinaVersion}
                syntaxTree={lowcodeST}
            />
        </div>
    );
    // </DiagramOverlay>
    // </DiagramOverlayContainer>
}
