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

import { STKindChecker } from "@wso2-enterprise/syntax-tree";
import { useDiagramContext } from "../../../../../Contexts/Diagram";
import { getSTNodeForReference } from "../../../../utils";

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
    const [listenerType, setListenerType] = useState<string>();

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


    console.log('listener type >>>', listenerType);

    return (
        <div>Service view stuff</div>
    )
}

