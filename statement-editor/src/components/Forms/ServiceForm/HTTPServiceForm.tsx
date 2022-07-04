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

import {
    createImportStatement,
    createServiceDeclartion,
    getSource,
    STModification,
    updateServiceDeclartion
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    dynamicConnectorStyles as useFormStyles,
    FormActionButtons,
    FormTextInput
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    ListenerDeclaration, ModulePart,
    NodePosition,
    ServiceDeclaration,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { StmtDiagnostic } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getModuleElementDeclPosition, getUpdatedSource } from "../../../utils";
import { getPartialSTForModulePart } from "../../../utils/ls-utils";
import { FormEditorField } from "../Types";
import { getListenerConfig } from "../Utils/FormUtils";

import { ListenerConfigForm } from "./ListenerConfigFrom";

interface HttpServiceFormProps {
    model?: ServiceDeclaration | ModulePart;
}

const HTTP_MODULE_QUALIFIER = 'http';
const HTTP_IMPORT = new Set<string>(['ballerina/http']);

export function HttpServiceForm(props: HttpServiceFormProps) {
    const formClasses = useFormStyles();
    const { model } = props;

    const { targetPosition, isEdit, isLastMember, currentFile, stSymbolInfo, syntaxTree, onChange, applyModifications,
            onCancel, getLangClient } = useContext(FormEditorContext);

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StmtDiagnostic[]>(undefined);

    let serviceModel: ServiceDeclaration;
    let portSemDiagMsg: string;
    if (STKindChecker.isModulePart(model)) {
        model.members.forEach(m => {
            if (STKindChecker.isServiceDeclaration(m)) {
                serviceModel = m;
                if (STKindChecker.isExplicitNewExpression(m?.expressions[0])) {
                    portSemDiagMsg = m.expressions[0]?.viewState?.diagnosticsInRange[0]?.message;
                }
            } else if (STKindChecker.isListenerDeclaration(m)) {
                portSemDiagMsg = m.initializer?.viewState?.diagnosticsInRange[0]?.message;
            }
        })
    } else if (STKindChecker.isServiceDeclaration(model)) {
        serviceModel = model;
        const serviceListenerExpression = model.expressions.length > 0 && model.expressions[0];
        if (STKindChecker.isExplicitNewExpression(serviceListenerExpression)) {
            portSemDiagMsg = serviceListenerExpression?.viewState?.diagnosticsInRange[0]?.message;
        }
    }

    const path = serviceModel?.absoluteResourcePath
        .map((pathSegments) => pathSegments.value)
        .join('');
    const listenerConfig = getListenerConfig(serviceModel, isEdit);

    const moduleElementPosition = getModuleElementDeclPosition(syntaxTree);

    // States related fields
    const [basePath, setBsePath] = useState<FormEditorField>({isInteracted: true, value: path});
    const [isListenerInteracted, setIsListenerInteracted] = useState<boolean>(
        !!listenerConfig.listenerPort || !!listenerConfig.listenerName);
    const [listenerPort, setListenerPort] = useState<FormEditorField>(
        {isInteracted: false, value: listenerConfig.listenerPort});
    const [listenerName, setListenerName] = useState<string>(listenerConfig.listenerName);
    const [shouldAddNewLine, setShouldAddNewLine] = useState<boolean>(false);
    const [createdListerCount, setCreatedListerCount] = useState<number>(0);

    const listenerList = Array.from(stSymbolInfo.listeners)
        .filter(([key, value]) => {
            const typeDescriptor = (value as ListenerDeclaration).typeDescriptor;
            return STKindChecker.isQualifiedNameReference(typeDescriptor)
                && typeDescriptor.modulePrefix.value === HTTP_MODULE_QUALIFIER
        })
        .map(([key, value]) => key);

    const serviceParamChange = async (servicePath: string, port: string, name: string) => {
        const modelPosition = model.position as NodePosition;
        const openBracePosition = serviceModel.openBraceToken.position as NodePosition;
        const updatePosition = {
            startLine: modelPosition.startLine,
            startColumn: 0,
            endLine: openBracePosition.startLine,
            endColumn: openBracePosition.startColumn - 1
        };
        const codeSnippet = getSource(updateServiceDeclartion({serviceBasePath: servicePath, listenerConfig:
                {createNewListener: false, listenerName: name, listenerPort: port, fromVar: false}
        }, updatePosition));
        const updatedContent = getUpdatedSource(codeSnippet, model?.source, updatePosition, undefined,
            true);
        const partialST = await getPartialSTForModulePart(
            {codeSnippet: updatedContent.trim()}, getLangClient
        );
        if (!partialST.syntaxDiagnostics.length) {
            setCurrentComponentSyntaxDiag(undefined);
            const offset = isEdit ? (createdListerCount * 2) :
                (shouldAddNewLine ? (createdListerCount * 2 + 1) : createdListerCount * 2);
            onChange(updatedContent, partialST, HTTP_IMPORT, undefined, "", [], offset);
        } else {
            setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
        }
    }

    const onBasePathFocus = async (value: string) => {
        setCurrentComponentName("path");
    }

    const onBasePathChange = async (value: string) => {
        setBsePath({isInteracted: true, value});
        await serviceParamChange(value, listenerPort.value, listenerName);
    }

    const onListenerChange = async (port: string, name: string, isInteracted: boolean) => {
        setIsListenerInteracted(isInteracted);
        setListenerPort({isInteracted: true, value: port});
        setListenerName(name);
        setCurrentComponentName("Listener");
        await serviceParamChange(basePath.value, port, name);
    }

    const onListenerConfigSave = (modifications: STModification[]) => {
        const listenerMod: STModification = modifications.find(l => l.type === "LISTENER_DECLARATION");
        if (modifications.find(l => l.type === "IMPORT")) {
            HTTP_IMPORT.forEach(module => {
                if (!currentFile.content.includes(module)){
                    setShouldAddNewLine(true);
                }
            })
        }
        setListenerName(listenerMod.config.LISTENER_NAME);
        setListenerPort({isInteracted: true, value: ""});
        setIsListenerInteracted(true);
        setCreatedListerCount(createdListerCount + 1);
        applyModifications(modifications);
    }

    const handleOnSave = () => {
        if (isEdit) {
            const serviceUpdatePosition: NodePosition = {
                ...targetPosition , endLine: targetPosition.endLine + (createdListerCount * 2),
                startLine: targetPosition.startLine + (createdListerCount * 2)
            }
            applyModifications([
                updateServiceDeclartion({serviceBasePath: basePath.value, listenerConfig:
                            {createNewListener: false, listenerName, listenerPort: listenerPort.value, fromVar: false}}
                    , serviceUpdatePosition
                )
            ]);
        } else {
            const serviceInsertPosition: NodePosition = {
                startColumn: 0, endColumn: 0, endLine: targetPosition.endLine + (createdListerCount * 2),
                startLine: targetPosition.startLine + (createdListerCount * 2)
            }
            applyModifications([
                createImportStatement('ballerina', 'http', {startColumn: 0, startLine: 0}),
                createServiceDeclartion({serviceBasePath: basePath.value, listenerConfig:
                        {createNewListener: false, listenerName, listenerPort: listenerPort.value, fromVar: false}},
                    shouldAddNewLine ? {
                    ...serviceInsertPosition, startLine: serviceInsertPosition.startLine + 1, endLine:
                            serviceInsertPosition.endLine + 1} : serviceInsertPosition, isLastMember)
            ]);
        }
        onCancel();
    }

    return (
        <>
            <div className={formClasses.formContentWrapper}>
                <div className={formClasses.formNameWrapper}>
                    <FormTextInput
                        label="Path"
                        dataTestId="base-path"
                        defaultValue={basePath.value}
                        onChange={onBasePathChange}
                        customProps={{
                            isErrored: (currentComponentSyntaxDiag !== undefined && currentComponentName === "path") ||
                                (portSemDiagMsg === undefined /*&& nameSemDiagMsg === undefined*/ && serviceModel?.
                                    viewState?.diagnosticsInRange[0]?.message)
                        }}
                        errorMessage={(currentComponentSyntaxDiag && currentComponentName === "path"
                            && currentComponentSyntaxDiag[0].message) ||
                            portSemDiagMsg === undefined /*&& nameSemDiagMsg === undefined*/ && serviceModel?.viewState?.
                                diagnosticsInRange[0]?.message}
                        onBlur={null}
                        onFocus={onBasePathFocus}
                        placeholder={"/"}
                        size="small"
                        disabled={currentComponentSyntaxDiag && currentComponentName !== "path"}
                    />
                    <div className={classNames(formClasses.groupedForm, formClasses.marginTB)}>
                        <ListenerConfigForm
                            listenerConfig={listenerConfig}
                            listenerList={listenerList}
                            isEdit={isEdit}
                            syntaxDiag={currentComponentName === "Listener" ? currentComponentSyntaxDiag : undefined}
                            portSemDiagMsg={portSemDiagMsg}
                            activeListener={listenerName}
                            isDisabled={currentComponentSyntaxDiag !== undefined && currentComponentName !== "Listener"}
                            onChange={onListenerChange}
                            currentFile={currentFile}
                            getLangClient={getLangClient}
                            applyModifications={onListenerConfigSave}
                            targetPosition={moduleElementPosition}
                        />
                    </div>
                </div>
            </div>
            <FormActionButtons
                cancelBtnText="Cancel"
                cancelBtn={true}
                saveBtnText={"Save"}
                onSave={handleOnSave}
                onCancel={onCancel}
                validForm={listenerPort.isInteracted && (isEdit || basePath.isInteracted) && (listenerName !== "" ||
                    (listenerPort && portSemDiagMsg === undefined)) && (currentComponentSyntaxDiag === undefined)
                    && isListenerInteracted}
            />
        </>
    )
}
