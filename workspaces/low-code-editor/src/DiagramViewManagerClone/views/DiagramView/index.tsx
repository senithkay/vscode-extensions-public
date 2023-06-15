/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React from "react";

import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../Contexts/Diagram";
import { Diagram } from "../../../Diagram";
import { DataMapperOverlay } from "../../../Diagram/components/DataMapperOverlay";
import { useHistoryContext } from "../../context/history";
import { extractFilePath } from "../../utils";

import { ServiceView } from "./components/ServiceView";

interface DiagramViewProps {
    projectComponents: BallerinaProjectComponents;
}

export function DiagramView(props: DiagramViewProps) {
    const { historyClearAndPopulateWith, historyPop, history, historyUpdateCurrentEntry } = useHistoryContext();
    const {
        props: { syntaxTree, fullST, ballerinaVersion, currentFile },
        api: { openArchitectureView },
    } = useDiagramContext();
    const { projectComponents } = props;

    let viewComponent: React.ReactElement;


    if (STKindChecker.isServiceDeclaration(syntaxTree)) {
        viewComponent = <ServiceView />;
    } else if (currentFile && currentFile.content && STKindChecker.isFunctionDefinition(syntaxTree)
        && STKindChecker.isExpressionFunctionBody(syntaxTree.functionBody)) {


        const handleNavigationHome = () => {
            historyClearAndPopulateWith({
                file: extractFilePath(projectComponents?.packages[0]?.filePath)
            })
        }

        viewComponent = (
            <DataMapperOverlay
                targetPosition={{ ...syntaxTree.position, startColumn: 0, endColumn: 0 }}
                model={syntaxTree}
                ballerinaVersion={ballerinaVersion}
                onCancel={handleNavigationHome}
            />
        )
    } else if (STKindChecker.isTypeDefinition(syntaxTree)
        && STKindChecker.isRecordTypeDesc(syntaxTree.typeDescriptor)) {
        const name = syntaxTree.typeName.value;
        const module = syntaxTree.typeData?.symbol?.moduleID;
        if (!(name && module)) {
            // TODO: Handle error properly
            // tslint:disable-next-line
            console.error('Couldn\'t generate record nodeId to open Architecture view', syntaxTree);
        } else {
            const nodeId = `${module?.orgName}/${module?.moduleName}:${module?.version}:${name}`
            openArchitectureView(nodeId);
        }
        historyPop();
    } else {
        viewComponent = <Diagram />;
    }

    return (
        <>
            {viewComponent}
        </>
    )
}

