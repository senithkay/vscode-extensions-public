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

import React, { useEffect, useState } from "react";

import { ServiceDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../Contexts/Diagram";
import { getSTNodeForReference } from "../../../../utils";
import { ServiceDesignOverlay } from "../../../../../Diagram/components/ServiceDesignOverlay";
import { GraphqlDiagramOverlay } from "../../../../../Diagram/components/GraphqlDiagramOverlay";
import { ServiceInvalidOverlay } from "../../../../../Diagram/components/ServiceInvalidOverlay";
import { ServiceUnsupportedOverlay } from "../../../../../Diagram/components/ServiceUnsupported";

interface ServiceViewProps {
    a: string;
}

export function ServiceView() {
    const {
        api: {
            ls: { getDiagramEditorLangClient }
        },
        props: { syntaxTree, fullST, ballerinaVersion, currentFile }
    } = useDiagramContext();
    const [listnerType, setListenerType] = useState<string>();

    useEffect(() => {
        (async () => {
            let listenerSignature: string;
            if (syntaxTree && STKindChecker.isServiceDeclaration(syntaxTree)) {
                const listenerExpression = syntaxTree.expressions[0];
                if (STKindChecker.isExplicitNewExpression(listenerExpression)) {
                    const typeData = listenerExpression.typeData;
                    const typeSymbol = typeData?.typeSymbol;
                    listenerSignature = typeSymbol?.signature;
                } else {
                    try {
                        const langClient = await getDiagramEditorLangClient();
                        const listenerSTDecl = await getSTNodeForReference(currentFile.path, listenerExpression.position, langClient);
                        if (listenerSTDecl) {
                            const typeData = listenerExpression.typeData;
                            const typeSymbol = typeData?.typeSymbol;
                            listenerSignature = typeSymbol?.signature;
                        }
                    } catch (err) {
                        // tslint:disable-next-line: no-console
                        console.error(err);
                    }
                }
            }

            setListenerType(listenerSignature);
        })();
    }, [syntaxTree])

    let serviceComponent: JSX.Element;

    if (listnerType) {

        const listenerExpression = (syntaxTree as ServiceDeclaration).expressions[0];
        const typeData = listenerExpression.typeData;
        const typeSymbol = typeData?.typeSymbol;
        const signature = typeSymbol?.signature;
        if (listnerType.includes("http")) {
            serviceComponent = (
                <ServiceDesignOverlay
                    model={syntaxTree}
                    targetPosition={{ ...syntaxTree.position, startColumn: 0, endColumn: 0 }}
                    onCancel={() => {/*TODO: fix this*/ }}
                />
            );
        } else if (listnerType.includes('graphql')) {
            serviceComponent = (
                <GraphqlDiagramOverlay
                    model={syntaxTree}
                    targetPosition={syntaxTree.position}
                    ballerinaVersion={ballerinaVersion}
                    onCancel={() => {/*TODO: fix this*/ }}
                    goToSource={() => {/*TODO: handle go to source*/ }}
                    isLoadingST={false}
                />
            );
        } else if (signature && signature === "$CompilationError$") {
            serviceComponent = (
                <ServiceInvalidOverlay />
            );
        } else {
            serviceComponent = (
                <ServiceUnsupportedOverlay />
            )
        }
    }

    return (
        <>
            {serviceComponent}
        </>
    )
}

