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
    ConfigOverlayFormStatus, DiagramEditorLangClientInterface,
    ExpressionEditorLangClientInterface
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    getPartialSTForModuleMembers
// tslint:disable-next-line:no-submodule-imports
} from "@wso2-enterprise/ballerina-statement-editor/lib/utils/ls-utils";
import {
    FunctionDefinition, ModulePart,
    NodePosition, STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import {wizardStyles} from "../style";

export interface DataMapperProps {
    model?: STNode;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: (typeDesc: string, recModel: any) => void;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function DataMapperConfigForm(props: DataMapperProps) {
    const { model, onCancel } = props;

    const {
        props: {
            currentFile
        },
        api: {
            ls: {
                getExpressionEditorLangClient,
                getDiagramEditorLangClient
            }
        }
    } = useContext(Context);

    const overlayClasses = wizardStyles();

    const [functionST, setFunctionST] = React.useState<FunctionDefinition>(undefined);

    // useEffect(() => {
    //     async function getFunctionST() {
    //         // const partialST = await langClient.getSTForSingleStatement({codeSnippet: ""});
    //         const partialST = await getPartialSTForModuleMembers({codeSnippet: `function transform(InputMessage input) returns TransformedMessage => {};`}, getExpressionEditorLangClient);
    //         setFunctionST(partialST as FunctionDefinition);
    //         // const langClient: DiagramEditorLangClientInterface = await getDiagramEditorLangClient();
    //
    //         // const defReply = await langClient.definition({
    //         //     position: {
    //         //         line: 0,
    //         //         character: 0
    //         //     },
    //         //     textDocument: {
    //         //         uri: filePath
    //         //     }
    //         // });
    //     }
    //     getFunctionST();
    // }, []);

    useEffect(() => {
        async function getSyntaxTree() {
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
        getSyntaxTree();
    }, [])

    const updateFileContentOverride = (fPath: string, newContent: string) => {
        return Promise.resolve(true);
    }


    return (
        <FormControl data-testid="record-form" className={overlayClasses.wizardFormControlExtended}>
            <FormHeaderSection
                formTitle={"lowcode.develop.configForms.DataMapper.title"}
                defaultMessage={"Data Mapper"}
                onCancel={onCancel}
            />
            <DataMapper
                fnST={functionST}
                langClientPromise={getDiagramEditorLangClient}
                getLangClient={getDiagramEditorLangClient}
                filePath={currentFile.path}
                updateFileContent={updateFileContentOverride}
            />
        </FormControl>
    );
}
