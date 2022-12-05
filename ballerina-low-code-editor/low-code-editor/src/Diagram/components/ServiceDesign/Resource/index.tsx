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
import React, { useContext, useState } from "react";

import HomeIcon from '@material-ui/icons/Home';
import CloseIcon from '@material-ui/icons/Close';

import classNames from "classnames";


import { useStyles } from "../style";
import { NodePosition, ResourceAccessorDefinition, STNode } from "@wso2-enterprise/syntax-tree";
import { ResourceHeader } from "./ResourceHeader";
import { Divider } from "@material-ui/core";
import { ConfigPanelSection, SelectDropdownWithButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { Context } from "../../../../Contexts/Diagram";
import { ConfigOverlayFormStatus, createResource, getSource, updateResourceSignature } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { generateParameterSectionString, getParamString, getPartialSTForModuleMembers, getResourcePath, getUpdatedSource, SERVICE_METHODS } from "../util";
import { useIntl } from "react-intl";
import { EXPR_SCHEME, FILE_SCHEME, sendDidChange } from "../../FormComponents/Utils";
import { monaco } from "react-monaco-editor";

export interface ResourceBodyProps {
    model: ResourceAccessorDefinition;
    handleDiagramEdit: (model:STNode, targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => void;
}

export function ResourceBody(props: ResourceBodyProps) {
    const { model, handleDiagramEdit } = props;
    const classes = useStyles();
    const intl = useIntl();

    const [isExpanded, setIsExpanded] = useState(false);

    const handleIsExpand = () => {
        setIsExpanded(!isExpanded)
    }

    const onEdit = (e?: React.MouseEvent) => {
        e.stopPropagation();
        const lastMemberPosition: NodePosition = {
            endColumn: model.position.endColumn,
            endLine: model.position.endLine - 1,
            startColumn: model.position.startColumn,
            startLine: model.position.startLine -1
        }
        handleDiagramEdit(model, lastMemberPosition, {formType: "ResourceAccessorDefinition", isLoading: false });
    }

    const {
        props: { currentFile, stSymbolInfo, importStatements, syntaxTree: lowcodeST },
        api: {
            code: { modifyDiagram, updateFileContent },
            ls: { getDiagramEditorLangClient, getExpressionEditorLangClient },
            library,
        },
    } = useContext(Context);

    const handleOnSave = (value: string) => {
        if (model) {
            modifyDiagram([
                updateResourceSignature(
                    value.toLowerCase(),
                    getResourcePath(model.relativeResourcePath),
                    getParamString(model.functionSignature.parameters),
                    model.functionSignature?.returnTypeDesc?.type?.source,
                    model.position)
            ]);
        } else {
            // modifyDiagram([
            //     createResource(
            //         model.functionName.value,
            //         getResourcePath(model.relativeResourcePath),
            //         getParamString(model.functionSignature.parameters),
            //         model.functionSignature?.returnTypeDesc?.type?.source,
            //         targetPosition
            //     )
            // ]);
        }

        // onCancel();
    }

    const completionEditorTypeKinds : number[] = [
        // Type
        11,
        // Union
        25,
        // Record
        22,
        // Module
        9,
        // Class
        8
    ]

    // const onChange = async (
    //     genSource: string,
    //     partialST: STNode,
    //     moduleList: Set<string>,
    //     currentModel?: CurrentModel,
    //     newValue?: string,
    //     completionKinds?: number[], // todo: use the enums instead of number
    //     offsetLineCount: number = 0,
    //     diagnosticOffSet: NodePosition = { startLine: 0, startColumn: 0 }
    // ) => {
    //     // Offset line position is to add some extra line if we do multiple code generations
    //     setChangeInProgress(true);
    //     const newModuleList = new Set<string>();
    //     moduleList?.forEach(module => {
    //         if (!currentFile.content.includes(module)) {
    //             newModuleList.add(module);
    //         }
    //     })
    //     const updatedContent = getUpdatedSource(genSource.trim(), currentFile.content, initialModel ? { // todo : move this to a seperate variable
    //         ...initialModel.position,
    //         startLine: initialModel.position.startLine + offsetLineCount,
    //         endLine: initialModel.position.endLine + offsetLineCount
    //     } : isLastMember ? (
    //         {
    //             ...targetPosition,
    //             startLine: targetPosition.startLine + offsetLineCount,
    //             endLine: targetPosition.startLine + offsetLineCount
    //         }
    //     ) : (
    //         {
    //             ...targetPosition,
    //             startLine: targetPosition.startLine + offsetLineCount,
    //             endLine: targetPosition.startLine + offsetLineCount,
    //             startColumn: 0,
    //             endColumn: 0
    //         }
    //     ), newModuleList, true);
    //     sendDidChange(fileURI, updatedContent, getLangClient);
    //     const diagnostics = await handleDiagnostics(genSource, fileURI, targetPosition, getLangClient);
    //     const newTargetPosition = initialModel ? { // todo : convert the positions to functions.
    //         startLine: initialModel.position.startLine + offsetLineCount + diagnosticOffSet.startLine,
    //         endLine: initialModel.position.endLine + offsetLineCount + diagnosticOffSet.startLine,
    //         startColumn: initialModel.position.startColumn + offsetLineCount + diagnosticOffSet.startColumn,
    //         endColumn: initialModel.position.endColumn + offsetLineCount + diagnosticOffSet.startColumn
    //     } : (
    //         isLastMember ? (
    //             {
    //                 startLine: targetPosition.startLine + offsetLineCount + diagnosticOffSet.startLine,
    //                 endLine: targetPosition.startLine + offsetLineCount + diagnosticOffSet.startLine,
    //                 startColumn: targetPosition.startColumn + diagnosticOffSet.startColumn,
    //                 endColumn: targetPosition.endColumn + diagnosticOffSet.startColumn,
    //             }
    //         ) : (
    //             {
    //                 startLine: targetPosition.startLine + offsetLineCount + diagnosticOffSet.startLine,
    //                 endLine: targetPosition.startLine + offsetLineCount + diagnosticOffSet.startLine,
    //                 startColumn: diagnosticOffSet.startColumn,
    //                 endColumn: diagnosticOffSet.startColumn
    //             }
    //         )
    //     );
    //     setModel(enrichModel(partialST, newTargetPosition, diagnostics));
    //     if (currentModel && currentModel.model && newValue && completionKinds) {
    //         handleCompletions(newValue, currentModel, completionKinds, newTargetPosition);
    //     }
    //     setChangeInProgress(false);
    // };

    const fileURI = monaco.Uri.file(currentFile.path).toString().replace(FILE_SCHEME, EXPR_SCHEME);

    const handleMethodChange = async (value: string) => {
        await handleResourceParamChange(
            value.toLowerCase(),
            getResourcePath(model.relativeResourcePath),
            generateParameterSectionString(model?.functionSignature?.parameters),
            model.functionSignature?.returnTypeDesc?.type?.source
        );
    };

    const handleResourceParamChange = async (
        resMethod: string,
        pathStr: string,
        paramStr: string,
        returnStr: string,
        stModel?: STNode,
        currentValue?: string) => {
        const pathString = pathStr ? pathStr : ".";
        const codeSnippet = getSource(
            updateResourceSignature(resMethod, pathString, paramStr, returnStr, model.position));
        const position = model ? ({
            startLine: 0,
            startColumn: model.functionName.position.startColumn,
            endLine: 0,
            endColumn: model.functionSignature.position.endColumn
        }) : model.position;
        const updatedContent = getUpdatedSource(codeSnippet, model?.source.slice(1), position, undefined,
            true);

        sendDidChange(fileURI, updatedContent, getExpressionEditorLangClient);

        // onChange(updatedContent, partialST, undefined, { model: stModel }, currentValue, completionEditorTypeKinds, 0,
        //     { startLine: -1, startColumn: -4 });

    };

    const httpMethodTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.httpMethod.title",
        defaultMessage: "HTTP Method"
    });

    const body = (
        <div className="service-member">

            <Divider className="resource-divider" />


            <ConfigPanelSection title={"Resource"}>
                <div className={classes.methodTypeContainer}>
                    <SelectDropdownWithButton
                        dataTestId='api-method'
                        defaultValue={model?.functionName?.value?.toUpperCase() || ""}
                        customProps={{ values: SERVICE_METHODS, disableCreateNew: true }}
                        onChange={handleMethodChange}
                        label={httpMethodTitle}
                        disabled={false}
                    />
                </div>
            </ConfigPanelSection>


            <ConfigPanelSection title={"Parameters"}>
            </ConfigPanelSection>

            <Divider className="resource-divider" />

            <ConfigPanelSection title={"Body"}>
            </ConfigPanelSection>

            <Divider className="resource-divider" />

            <ConfigPanelSection title={"Responses"}>
            </ConfigPanelSection>

        </div>
    )

    return (
        <div className={classNames("function-box", model.functionName.value)}>
            <ResourceHeader isExpanded={isExpanded} onExpandClick={handleIsExpand} model={model} onEdit={onEdit}/>
            {isExpanded && body}
        </div>
    );
}
