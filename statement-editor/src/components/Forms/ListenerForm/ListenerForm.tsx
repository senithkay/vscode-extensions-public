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
import React, {useContext, useEffect, useState} from 'react';

import { FormControl } from "@material-ui/core";
import {
    createImportStatement,
    createListenerDeclartion,
    getSource,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    dynamicConnectorStyles as connectorStyles,
    FormActionButtons,
    FormHeaderSection, FormTextInput,
    SelectDropdownWithButton,
    TextLabel,
    useStyles as useFormStyles
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    ListenerDeclaration
} from "@wso2-enterprise/syntax-tree";

import { StmtDiagnostic } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModuleMembers } from "../../../utils/ls-utils";
import { FormEditorField } from "../Types";

export interface FunctionProps {
    model: ListenerDeclaration;
}

const HTTP_IMPORT = new Set<string>(['ballerina/http']);

export function ListenerForm(props: FunctionProps) {
    const { model} = props;

    const { targetPosition, isEdit, onChange, applyModifications, onCancel, getLangClient } = useContext(FormEditorContext);

    const formClasses = useFormStyles();
    const connectorClasses = connectorStyles();

    // States related to component model
    const [listenerName, setListenerName] = useState<FormEditorField>({
        value: model ? model.variableName.value : "", isInteracted: false
    });
    const [listenerPort, setListenerPort] = useState<FormEditorField>({
        value: model ? model.initializer.parenthesizedArgList.arguments[0]?.source : "", isInteracted: false
    });
    const type = model?.typeDescriptor.modulePrefix.value.toUpperCase();
    const [listenerType, setListenerType] = useState<string>(type ? type : "HTTP");

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StmtDiagnostic[]>(undefined);

    const listenerParamChange = async (name: string, port: string) => {
        const codeSnippet = getSource(createListenerDeclartion({listenerPort: port, listenerName: name},
            targetPosition, false));
        const updatedContent = getUpdatedSource(codeSnippet, model?.source, model?.position, undefined,
            true);
        const partialST = await getPartialSTForModuleMembers(
            {codeSnippet: updatedContent.trim()}, getLangClient
        );
        if (!partialST.syntaxDiagnostics.length) {
            setCurrentComponentSyntaxDiag(undefined);
            onChange(updatedContent, partialST, HTTP_IMPORT);
        } else {
            setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
        }
    }

    // Functions related to name
    const handleNameFocus = (value: string) => {
        setCurrentComponentName("Name");
    }
    const handleNameChange = async (value: string) => {
        setListenerName({value, isInteracted: true});
        await listenerParamChange(value, listenerPort.value);
    }

    // Functions related to port
    const handlePortFocus = (value: string) => {
        setCurrentComponentName("Port");
    }
    const handlePortChange = async (value: string) => {
        setListenerPort({value, isInteracted: true});
        await listenerParamChange(listenerName.value, value);
    }

    const handleOnSave = () => {
        applyModifications([
            createImportStatement('ballerina', 'http', {startColumn: 0, startLine: 0}),
            createListenerDeclartion({listenerPort: listenerPort.value, listenerName: listenerName.value},
                {...targetPosition, endLine: targetPosition.startLine, startColumn: 0,
                 endColumn: 0}, false)
        ]);
        onCancel();
    }

    useEffect(() => {
        // const type = model?.typeDescriptor.modulePrefix.value.toUpperCase();
        // setListenerType(type ? type :  'HTTP');
        setListenerName({
            value: model ? model.variableName.value : "", isInteracted:
            listenerName.isInteracted
        })
        setListenerPort({
            value: model ? model.initializer.parenthesizedArgList.arguments[0]?.source : "", isInteracted:
            listenerPort.isInteracted
        })
    }, [model]);

    return (
        <FormControl data-testid="listener-form" className={formClasses.wizardFormControl}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"lowcode.develop.connectorForms.HTTP.title"}
                defaultMessage={"Listener"}
            />
            <div className={connectorClasses.formContentWrapper}>
                <div className={connectorClasses.formNameWrapper}>
                    <TextLabel
                        required={true}
                        textLabelId="lowcode.develop.connectorForms.HTTP.listenerType"
                        defaultMessage="Listener Type :"
                    />
                    <SelectDropdownWithButton
                        customProps={{ values: ['HTTP'], disableCreateNew: true }}
                        defaultValue={listenerType}
                        placeholder="Select Type"
                    />
                    <FormTextInput
                        label="Listener Name"
                        dataTestId="listener-name"
                        defaultValue={(listenerName?.isInteracted || isEdit) ? listenerName.value : ""}
                        onChange={handleNameChange}
                        customProps={{
                            isErrored: ((currentComponentSyntaxDiag !== undefined && currentComponentName === "Name") ||
                                model?.variableName?.viewState?.diagnosticsInRange[0]?.message)
                        }}
                        errorMessage={(currentComponentSyntaxDiag && currentComponentName === "Name"
                                && currentComponentSyntaxDiag[0].message) ||
                            model?.variableName?.viewState?.diagnosticsInRange[0]?.message}
                        onBlur={null}
                        onFocus={handleNameFocus}
                        placeholder={"name"}
                        size="small"
                        disabled={currentComponentSyntaxDiag && currentComponentName !== "Name"}
                    />
                    <FormTextInput
                        label="Listener Port"
                        dataTestId="listener-port"
                        defaultValue={(listenerPort?.isInteracted || isEdit) ? listenerPort.value : ""}
                        onChange={handlePortChange}
                        customProps={{
                            isErrored: ((currentComponentSyntaxDiag !== undefined && currentComponentName === "Port") ||
                                (model?.initializer?.viewState?.
                                    diagnosticsInRange[0]?.message !== undefined))
                        }}
                        errorMessage={(currentComponentSyntaxDiag && currentComponentName === "Port"
                                && currentComponentSyntaxDiag[0]?.message) || model?.initializer?.
                            viewState?.diagnosticsInRange[0]?.message}
                        onBlur={null}
                        onFocus={handlePortFocus}
                        placeholder={"9090"}
                        size="small"
                        disabled={currentComponentSyntaxDiag && currentComponentName !== "Port"}
                    />
                </div>
            </div>
            <FormActionButtons
                cancelBtnText="Cancel"
                cancelBtn={true}
                saveBtnText="Save"
                onSave={handleOnSave}
                onCancel={onCancel}
                validForm={(isEdit || (listenerName.isInteracted === true && listenerPort.isInteracted))
                    && !(model?.variableName?.viewState?.diagnosticsInRange[0]?.message)
                    && !(model?.initializer?.parenthesizedArgList?.arguments[0]?.viewState?.
                        diagnosticsInRange[0]?.message)
                    && (model?.viewState?.diagnosticsInRange.length === 0)
                    && !(currentComponentSyntaxDiag && currentComponentSyntaxDiag[0]?.message)}
            />
        </FormControl>
    )
}
