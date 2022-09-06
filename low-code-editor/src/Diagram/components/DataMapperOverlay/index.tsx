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
import React, { useContext, useEffect } from 'react';

import {
    DataMapper
} from "@wso2-enterprise/ballerina-data-mapper";
import {
    ConfigOverlayFormStatus,
    DiagramEditorLangClientInterface
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FunctionDefinition, ModulePart,
    NodePosition, STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Contexts/Diagram";

import { dataMapperStyles } from "./style";
import { DiagramOverlay, DiagramOverlayContainer } from '../Portals/Overlay';
import { IBallerinaLangClient } from '@wso2-enterprise/ballerina-languageclient';

export interface DataMapperProps {
    model?: STNode;
    targetPosition?: NodePosition;
    onCancel?: () => void;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function DataMapperOverlay(props: DataMapperProps) {
    const { targetPosition, onCancel: onClose, model } = props;

    const dataMapperClasses = dataMapperStyles();

    const {
        props: {
            currentFile,
            stSymbolInfo
        },
        api: {
            code: {
                modifyDiagram
            },
            ls: {
                getDiagramEditorLangClient,
            },
            library
        }
    } = useContext(Context);

    const [functionST, setFunctionST] = React.useState<FunctionDefinition>(undefined);
    const [newFnName, setNewFnName] = React.useState("");

    useEffect(() => {
        (async () => {
            if (model && STKindChecker.isFunctionDefinition(model)) {
                handleFunctionST(model.functionName.value).then();
            } else if (!!functionST) {
                handleFunctionST(functionST.functionName.value).then();
            } else {
                handleFunctionST(newFnName).then();
            }
        })();
    }, [currentFile.content]);

    const handleFunctionST = async (funcName: string) => {
        const langClient: DiagramEditorLangClientInterface = await getDiagramEditorLangClient();
        const { parseSuccess, syntaxTree } = await langClient.getSyntaxTree({
            documentIdentifier: {
                uri: `file://${currentFile.path}`
            }
        });
        if (parseSuccess) {
            const modPart = syntaxTree as ModulePart;
            const fns = modPart.members.filter((mem) => STKindChecker.isFunctionDefinition(mem)) as FunctionDefinition[];
            setFunctionST(fns.find((mem) => mem.functionName.value === funcName));
            return;
        }
        setFunctionST(undefined);
    }

    const onSave = (fnName: string) => {
        setNewFnName(fnName);
    };

    return (<DiagramOverlayContainer>
                    <DiagramOverlay position={{ x: 0, y: 0 }} stylePosition={"absolute"} className={dataMapperClasses.overlay}>
                        <div className={dataMapperClasses.dataMapperContainer}>
                            <DataMapper
                                library={library}
                                targetPosition={targetPosition}
                                fnST={functionST}
                                langClientPromise={getDiagramEditorLangClient() as unknown as Promise<IBallerinaLangClient>}
                                filePath={currentFile.path}
                                currentFile={currentFile}
                                stSymbolInfo={stSymbolInfo}
                                applyModifications={modifyDiagram}
                                onClose={onClose}
                                onSave={onSave}
                            />
                        </div>
                    </DiagramOverlay>
                </DiagramOverlayContainer>
            );
}
