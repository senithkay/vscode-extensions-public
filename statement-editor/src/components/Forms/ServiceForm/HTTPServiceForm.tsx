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
import { FormattedMessage } from "react-intl";

import { FormHelperText } from "@material-ui/core";
import { LiteExpressionEditor } from "@wso2-enterprise/ballerina-expression-editor";
import {
    createImportStatement,
    createServiceDeclartion,
    getSource,
    STModification,
    updateServiceDeclartion
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    CheckBoxGroup,
    dynamicConnectorStyles as useFormStyles,
    FormActionButtons,
    Panel,
    SelectDropdownWithButton
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    ListenerDeclaration, ModulePart,
    NodePosition,
    ServiceDeclaration,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";
import debounce from "lodash.debounce";

import { StatementSyntaxDiagnostics } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModulePart } from "../../../utils/ls-utils";
import { FormEditor } from "../../FormEditor/FormEditor";
import { FieldTitle } from "../components/FieldTitle/fieldTitle";
import { getListenerConfig } from "../Utils/FormUtils";

interface HttpServiceFormProps {
    model?: ServiceDeclaration | ModulePart;
}

const HTTP_MODULE_QUALIFIER = 'http';
const HTTP_IMPORT = new Set<string>(['ballerina/http']);

export function HttpServiceForm(props: HttpServiceFormProps) {
    const formClasses = useFormStyles();
    const { model } = props;

    const {
        targetPosition, isEdit, isLastMember, currentFile, stSymbolInfo, onChange, applyModifications,
        onCancel, getLangClient } = useContext(FormEditorContext);

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StatementSyntaxDiagnostics[]>(undefined);

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


    // States related fields
    const [basePath, setBsePath] = useState<string>(path);
    const [listenerPort, setListenerPort] = useState<string>(listenerConfig.listenerPort);
    const [listenerName, setListenerName] = useState<string>(listenerConfig.listenerName);
    const [shouldAddNewLine, setShouldAddNewLine] = useState<boolean>(false);
    const [createdListnerCount, setCreatedListnerCount] = useState<number>(0);
    const [isInline, setIsInline] = useState<boolean>(!listenerName);
    const [isAddListenerInProgress, setIsAddListenerInProgress] = useState<boolean>(false);

    const handleListenerDefModeChange = async (mode: string[]) => {
        if (listenerList.length === 0 && mode.length === 0) {
            setIsAddListenerInProgress(true);
        } else {
            setListenerPort("");
            setListenerName(undefined);
        }
        setIsInline(mode.length > 0);
        await serviceParamChange(basePath, listenerPort, listenerName);
    }

    const listenerList = Array.from(stSymbolInfo.listeners)
        .filter(([, value]) => {
            const typeDescriptor = (value as ListenerDeclaration).typeDescriptor;
            return STKindChecker.isQualifiedNameReference(typeDescriptor)
                && typeDescriptor.modulePrefix.value === HTTP_MODULE_QUALIFIER
        })
        .map(([key]) => key);

    const serviceParamChange = async (servicePath: string, port: string, name: string, fieldType?: string) => {
        const modelPosition = model.position as NodePosition;
        const openBracePosition = serviceModel.openBraceToken.position as NodePosition;
        const updatePosition = {
            startLine: modelPosition.startLine,
            startColumn: 0,
            endLine: openBracePosition.startLine,
            endColumn: openBracePosition.startColumn - 1
        };
        const codeSnippet = getSource(updateServiceDeclartion({
            serviceBasePath: servicePath, listenerConfig:
                { createNewListener: false, listenerName: name, listenerPort: port, fromVar: false }
        }, updatePosition));
        const updatedContent = getUpdatedSource(codeSnippet, model?.source, updatePosition, undefined,
            true);
        const partialST = await getPartialSTForModulePart(
            { codeSnippet: updatedContent.trim() }, getLangClient
        );
        if (!partialST.syntaxDiagnostics.length) {
            setCurrentComponentSyntaxDiag(undefined);
            const offset = isEdit ? (createdListnerCount * 2) :
                (shouldAddNewLine ? (createdListnerCount * 2 + 1) : createdListnerCount * 2);
            let currentValue = "";
            let currentModel;
            switch (fieldType) {
                case 'listenerName':
                    currentValue = name;
                    if (STKindChecker.isServiceDeclaration(model)
                        && model.expressions.length > 0
                        && STKindChecker.isSimpleNameReference(model.expressions[0])) {
                        currentModel = { model: model.expressions[0] };
                    }
                    break;
                case 'port':
                    currentValue = port;
                    break;
                case 'path':
                    currentValue = path;
                    break;
            }
            onChange(updatedContent, partialST, HTTP_IMPORT, currentModel, currentValue, [], offset);
        } else {
            setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
        }
    }

    const onBasePathFocus = async () => {
        setCurrentComponentName("path");
    }

    const onBasePathChange = async (value: string) => {
        setBsePath(value);
        await serviceParamChange(value, listenerPort, listenerName);
    }

    const debouncedPathChange = debounce(onBasePathChange, 1000);

    const onPortTextFieldFocus = async () => {
        setCurrentComponentName("port");
    }
    const onPortChange = async (value: string) => {
        setListenerPort(value);
        await serviceParamChange(basePath, value, listenerName, 'port');
    }
    const debouncedPortChange = debounce(onPortChange, 1000);

    const onListenerSelect = async (name: string) => {
        setCurrentComponentName("Listener Selector");
        if (name === 'Create New') {
            setListenerName("");
            setIsAddListenerInProgress(true);
        } else {
            setListenerName(name);
            setIsAddListenerInProgress(false);
        }

        await serviceParamChange(basePath, listenerPort, name, 'listenerName');
    }

    const onListenerFormCancel = () => {
        setIsAddListenerInProgress(false);
        setListenerName("");
    }

    const handleOnSave = () => {
        if (isEdit) {
            const serviceUpdatePosition: NodePosition = {
                ...targetPosition, endLine: targetPosition.endLine + (createdListnerCount * 2),
                startLine: targetPosition.startLine + (createdListnerCount * 2)
            }

            applyModifications([
                updateServiceDeclartion(
                    {
                        serviceBasePath: basePath,
                        listenerConfig: { createNewListener: false, listenerName, listenerPort, fromVar: listenerPort && listenerPort.length === 0 }
                    },
                    serviceUpdatePosition
                )
            ]);

        } else {
            const serviceInsertPosition: NodePosition = {
                startColumn: 0, endColumn: 0, endLine: targetPosition.endLine + (createdListnerCount * 2),
                startLine: targetPosition.startLine + (createdListnerCount * 2)
            }

            applyModifications([
                createImportStatement('ballerina', 'http', { startColumn: 0, startLine: 0 }),
                createServiceDeclartion({
                    serviceBasePath: basePath, listenerConfig:
                        { createNewListener: false, listenerName, listenerPort, fromVar: listenerPort && listenerPort.length === 0 }
                },
                    shouldAddNewLine ? {
                        ...serviceInsertPosition,
                        startLine: serviceInsertPosition.startLine + 1,
                        endLine: serviceInsertPosition.endLine + 1
                    } : serviceInsertPosition,
                    isLastMember
                )

            ]);
        }

        onCancel();
    }

    const getPathInput = () => (
        <>
            <FieldTitle title='Path' optional={false} />
            <LiteExpressionEditor
                testId="service-base-path"
                diagnostics={currentComponentName === 'path' ?
                    currentComponentSyntaxDiag || serviceModel?.viewState?.diagnosticsInRange : []}
                defaultValue={basePath}
                onChange={debouncedPathChange}
                completions={[]}
                onFocus={onBasePathFocus}
                customProps={{
                    index: 1,
                    optional: false
                }}
            />
        </>
    );
    const getPortInput = () => (
        <>
            <FieldTitle title='Port' optional={false} />
            <LiteExpressionEditor
                testId="port-number"
                diagnostics={currentComponentName === 'port' ?
                    currentComponentSyntaxDiag || serviceModel?.viewState?.diagnosticsInRange : []}
                defaultValue={listenerPort}
                onChange={debouncedPortChange}
                completions={[]}
                onFocus={onPortTextFieldFocus}
                customProps={{
                    index: 2,
                    optional: false
                }}
            />
        </>
    );

    const onListenerConfigSave = (modifications: STModification[]) => {
        const listenerMod: STModification = modifications.find(l => l.type === "LISTENER_DECLARATION");
        if (modifications.find(l => l.type === "IMPORT")) {
            HTTP_IMPORT.forEach(module => {
                if (!currentFile.content.includes(module)) {
                    setShouldAddNewLine(true);
                }
            })
        }

        setListenerName(listenerMod.config.LISTENER_NAME);
        setListenerPort("");
        setCreatedListnerCount(createdListnerCount + 1);
        applyModifications(modifications);
    }

    const getListenerSelector = () => (
        <>
            <FormHelperText className={formClasses.inputLabelForRequired}>
                <FormattedMessage
                    id="lowcode.develop.connectorForms.HTTP.selectlListener"
                    defaultMessage="Select Listener :"
                />
            </FormHelperText>
            <SelectDropdownWithButton
                customProps={{ disableCreateNew: false, values: listenerList || [] }}
                onChange={onListenerSelect}
                placeholder="Select Property"
                defaultValue={
                    isAddListenerInProgress ?
                        "" : listenerName
                }
            />
            {isAddListenerInProgress && (
                <Panel onClose={onListenerFormCancel}>
                    <FormEditor
                        initialSource={undefined}
                        initialModel={undefined}
                        targetPosition={targetPosition}
                        onCancel={onListenerFormCancel}
                        type={"Listener"}
                        currentFile={currentFile}
                        getLangClient={getLangClient}
                        topLevelComponent={true}
                        applyModifications={onListenerConfigSave}
                    />
                </Panel>
            )}
        </>
    )

    return (
        <>
            <div className={formClasses.formContentWrapper}>
                <div className={formClasses.formNameWrapper}>
                    {getPathInput()}
                    <div className={classNames(formClasses.groupedForm, formClasses.marginTB)}>
                        <CheckBoxGroup
                            values={["Define Inline"]}
                            defaultValues={isInline ? ['Define Inline'] : []}
                            onChange={handleListenerDefModeChange}
                        />
                        {isInline ? getPortInput() : getListenerSelector()}
                    </div>
                </div>
            </div>
            <FormActionButtons
                cancelBtnText="Cancel"
                cancelBtn={true}
                saveBtnText={"Save"}
                onSave={handleOnSave}
                onCancel={onCancel}
                validForm={(listenerPort !== "" || listenerName !== "") && (listenerPort !== "" ? portSemDiagMsg ===
                    undefined : true) && (currentComponentSyntaxDiag === undefined)}
            />
        </>
    )
}
