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
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect } from 'react';

import { FormControl } from "@material-ui/core";
import {
    DataMapper
} from "@wso2-enterprise/ballerina-data-mapper";
import {
    ConfigOverlayFormStatus,
    DiagramEditorLangClientInterface,
    ExpressionEditorLangClientInterface
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    FunctionDefinition, ModulePart,
    NodePosition, STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import {wizardStyles} from "../style";

import { dataMapperStyles } from "./style";

export interface DataMapperProps {
    model?: STNode;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: (typeDesc: string, recModel: any) => void;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function DataMapperConfigForm(props: DataMapperProps) {
    const { onCancel, model } = props;

    const dataMapperClasses = dataMapperStyles();

    const {
        props: {
            currentFile
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
        if (model) {
            handleFunctionST().then();
        } else {
            createFunctionST().then();
        }
    }, [currentFile.content]);

    const handleFunctionST = async () => {
        const langClient: DiagramEditorLangClientInterface = await getDiagramEditorLangClient();
        const { parseSuccess, syntaxTree } = await langClient.getSyntaxTree({
            documentIdentifier: {
                uri: `file://${currentFile.path}`
            }
        });
        if (parseSuccess) {
            const modPart = syntaxTree as ModulePart;
            const fns = modPart.members.filter((mem) => STKindChecker.isFunctionDefinition(mem)) as FunctionDefinition[];
            setFunctionST(fns.find((mem) => mem.functionName.value === "transform"));
            return;
        }
        setFunctionST(undefined);
    }

    const createFunctionST = async () => {
        const defaultFunction = `function transform() returns  => {};`
        const langClient: ExpressionEditorLangClientInterface = await getExpressionEditorLangClient();
        const stPromise = await langClient.getSTForModuleMembers({ codeSnippet: defaultFunction});
        if (stPromise) {
            const fnST = stPromise.syntaxTree as FunctionDefinition;
            setFunctionST(fnST);
            return;
        }
        setFunctionST(undefined);
    }

    // useEffect(() => {
    //     async function getSyntaxTree() {
    //         if (model && STKindChecker.isFunctionDefinition(model)) {
    //             setFunctionST(model);
    //             return;
    //         } else {
    //             const langClient: DiagramEditorLangClientInterface = await getDiagramEditorLangClient();
    //             const { parseSuccess, syntaxTree } = await langClient.getSyntaxTree({
    //                 documentIdentifier: {
    //                     uri: `file://${currentFile.path}`
    //                 }
    //             });
    //             if (parseSuccess) {
    //                 const modPart = syntaxTree as ModulePart;
    //                 const fns = modPart.members.filter((mem) => STKindChecker.isFunctionDefinition(mem)) as FunctionDefinition[];
    //                 setFunctionST(fns.find((mem) => mem.functionName.value === "transform"));
    //                 return;
    //             }
    //         }
    //         setFunctionST(undefined);
    //     }
    //     getSyntaxTree();
    // }, [currentFile.content]);

    return (
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
                    getLangClient={getDiagramEditorLangClient}
                    filePath={currentFile.path}
                    currentFile={currentFile}
                    applyModifications={modifyDiagram}
                />
            </div>
        </FormControl>
    );
}
