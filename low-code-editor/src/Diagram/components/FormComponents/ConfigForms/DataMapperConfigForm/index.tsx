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

import { FormControl } from "@material-ui/core";
import {
    DataMapper
} from "@wso2-enterprise/ballerina-data-mapper";
import {
    ConfigOverlayFormStatus,
    DiagramEditorLangClientInterface
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    FunctionDefinition, ModulePart,
    NodePosition, STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { wizardStyles } from "../style";

import { dataMapperStyles } from "./style";

export interface DataMapperProps {
    model?: STNode;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: (typeDesc: string, recModel: any) => void;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function DataMapperConfigForm(props: DataMapperProps) {
    const { targetPosition, onCancel, model } = props;

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
                getExpressionEditorLangClient
            }
        }
    } = useContext(Context);

    const overlayClasses = wizardStyles();

    const [functionST, setFunctionST] = React.useState<FunctionDefinition>(undefined);

    useEffect(() => {
        if (model && STKindChecker.isFunctionDefinition(model)) {
            handleFunctionST(model.functionName.value).then();
        } else if (!!functionST) {
            handleFunctionST(functionST.functionName.value).then();
        } else {
            createFunctionST().then();
        }
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

    const createFunctionST = async () => {
        const functionName = 'transform';
        const draftFunction = `function ${functionName}() returns XChoreoLCReturnType => {};`
        const langClientD: DiagramEditorLangClientInterface = await getDiagramEditorLangClient();
        const modifications = [
            {
                type: "INSERT",
                config: {
                    "STATEMENT": draftFunction,
                },
                endColumn: targetPosition.startColumn,
                endLine: targetPosition.startLine,
                startColumn: targetPosition.startColumn,
                startLine: targetPosition.startLine
            }
        ];
        const { parseSuccess, syntaxTree: newST } = await langClientD.stModify({
            astModifications: modifications,
            documentIdentifier: {
                uri: `file://${currentFile.path}`
            }
        });
        if (parseSuccess) {
            const modPart = newST as ModulePart;
            const fns = modPart.members.filter((mem) => STKindChecker.isFunctionDefinition(mem)) as FunctionDefinition[];
            setFunctionST(fns.find((mem) => mem.functionName.value === functionName));
            return;
        }
        setFunctionST(undefined);
    }

    return (!functionST ? <>Loading...</>
            :
            <FormControl data-testid="record-form" className={overlayClasses.dataMapperWizardFormControl}>
            <FormHeaderSection
                formTitle={"lowcode.develop.configForms.DataMapper.title"}
                defaultMessage={"Data Mapper"}
                onCancel={onCancel}
            />
            <div className={dataMapperClasses.dataMapperContainer}>
                <DataMapper
                    fnST={functionST}
                    langClientPromise={getDiagramEditorLangClient}
                    filePath={currentFile.path}
                    currentFile={currentFile}
                    stSymbolInfo={stSymbolInfo}
                    applyModifications={modifyDiagram}
                />
            </div>
            </FormControl>
            );
}
