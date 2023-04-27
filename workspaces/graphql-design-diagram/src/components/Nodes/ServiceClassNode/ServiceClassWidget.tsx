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

// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect, useState } from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../../DiagramContext/GraphqlDiagramContext";
import { getParentSTNodeFromRange } from "../../utils/common-util";
import { getSyntaxTree } from "../../utils/ls-util";
import { ServiceNode } from "../GraphqlServiceNode/styles/styles";

import { ServiceClassHeadWidget } from "./ClassHead/ClassHead";
import { ServiceField } from "./FunctionCard/ServiceField";
import { ServiceClassNodeModel } from "./ServiceClassNodeModel";

interface ServiceClassNodeWidgetProps {
    node: ServiceClassNodeModel;
    engine: DiagramEngine;
}

export function ServiceClassNodeWidget(props: ServiceClassNodeWidgetProps) {
    const { node, engine } = props;
    const { langClientPromise } = useContext(DiagramContext);

    const [parentModel, setParentModel] = useState<STNode>(null);
    const [st, setST] = useState<STNode>(null);

    useEffect(() => {
        const location = node.classObject.position;
        const nodePosition: NodePosition = {
            endColumn: location.endLine.offset,
            endLine: location.endLine.line,
            startColumn: location.startLine.offset,
            startLine: location.startLine.line
        };
        (async () => {
            // parent node is retrieved as the classObject.position only contains the position of the class name
            const syntaxTree: STNode = await getSyntaxTree(location.filePath, langClientPromise);
            const parentNode = getParentSTNodeFromRange(nodePosition, syntaxTree);
            setParentModel(parentNode);
            setST(syntaxTree)
        })();
    }, [node.classObject.position]);

    return (
        <ServiceNode>
            <ServiceClassHeadWidget node={node} engine={engine} parentModel={parentModel} st={st}/>
            {node.classObject.functions?.map((classFunction, index) => {
                return (
                    <ServiceField key={index} node={node} engine={engine} functionElement={classFunction} parentModel={parentModel} st={st}/>
                );
            })}
        </ServiceNode>
    );
}
