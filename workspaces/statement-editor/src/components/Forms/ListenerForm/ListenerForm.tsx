/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect, useState } from 'react';

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
import { ListenerDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";
import debounce from "lodash.debounce";

import { StatementSyntaxDiagnostics } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModuleMembers } from "../../../utils/ls-utils";
import { FormEditorField } from "../Types";

export interface FunctionProps {
    model: ListenerDeclaration;
}

const HTTP_IMPORT = new Set<string>(['ballerina/http']);
const GRAPHQL_IMPORT = new Set<string>(['ballerina/graphql']);

export function ListenerForm(props: FunctionProps) {
    const { model} = props;

    const { targetPosition, isEdit, isLastMember, onChange, applyModifications, onCancel, getLangClient } =
        useContext(FormEditorContext);

    const formClasses = useFormStyles();
    const connectorClasses = connectorStyles();

    let port = "";
    let parenthesizedArgList;
    if (model?.initializer && (STKindChecker.isExplicitNewExpression(model?.initializer)
        || STKindChecker.isImplicitNewExpression(model?.initializer))) {
        parenthesizedArgList = model?.initializer?.parenthesizedArgList;
        model?.initializer?.parenthesizedArgList?.arguments.forEach((argument) => {
            port += argument.source?.trim();
        });
    }
    const type = (model?.typeDescriptor && STKindChecker.isQualifiedNameReference(model?.typeDescriptor)) ?
        model?.typeDescriptor?.modulePrefix?.value : "";

    // States related to component model
    const [listenerName, setListenerName] = useState<FormEditorField>({
        value: model ? model.variableName.value : "", isInteracted: false
    });
    const [listenerPort, setListenerPort] = useState<FormEditorField>({
        value: model ? port : "", isInteracted: false
    });
    const [listenerType, setListenerType] = useState<string>(type === "graphql" ? "GraphQL" : "HTTP");

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StatementSyntaxDiagnostics[]>(undefined);

    const listenerParamChange = async (name: string, portValue: string) => {
        const serviceType = listenerType === 'GraphQL' ? 'graphql' : 'http';
        const codeSnippet = getSource(createListenerDeclartion({listenerPort: portValue, listenerName: name},
            targetPosition, false, serviceType));
        const updatedContent = getUpdatedSource(codeSnippet, model?.source, model?.position, undefined,
            true);
        const partialST = await getPartialSTForModuleMembers(
            {codeSnippet: updatedContent.trim()}, getLangClient
        );
        if (!partialST.syntaxDiagnostics.length) {
            setCurrentComponentSyntaxDiag(undefined);
            const module = listenerType === 'GraphQL' ? GRAPHQL_IMPORT : HTTP_IMPORT;
            onChange(updatedContent, partialST,  module);
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
    const debouncedNameChange = debounce(handleNameChange, 800);

    // Functions related to port
    const handlePortFocus = (value: string) => {
        setCurrentComponentName("Port");
    }
    const handlePortChange = async (value: string) => {
        setListenerPort({value, isInteracted: true});
        await listenerParamChange(listenerName.value, value);
    }
    const debouncedPortChange = debounce(handlePortChange, 800);

    const handleOnSave = () => {
        const module = listenerType === 'GraphQL' ? 'graphql' : 'http';
        applyModifications([
            createImportStatement('ballerina', module, {startColumn: 0, startLine: 0}),
            createListenerDeclartion({listenerPort: listenerPort.value, listenerName: listenerName.value},
                targetPosition, !isEdit, module, isLastMember)
        ]);
        onCancel();
    }

    useEffect(() => {
        let argList;
        if (model?.initializer && (STKindChecker.isExplicitNewExpression(model?.initializer)
            || STKindChecker.isImplicitNewExpression(model?.initializer))) {
            argList = model?.initializer?.parenthesizedArgList;
        }
        setListenerName({
            value: model ? model.variableName.value : "", isInteracted:
            listenerName.isInteracted
        })
        setListenerPort({
            value: model ? argList?.arguments[0]?.source : "", isInteracted:
            listenerPort.isInteracted
        })
    }, [model]);

    const handleListenerTypeChange = async (value: string) => {
        setListenerType(value);
    }

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
                        customProps={{ values: ['HTTP', 'GraphQL'], disableCreateNew: true }}
                        defaultValue={listenerType}
                        placeholder="Select Type"
                        onChange={handleListenerTypeChange}
                    />
                    <FormTextInput
                        label="Listener Name"
                        dataTestId="listener-name"
                        defaultValue={listenerName.value}
                        onChange={debouncedNameChange}
                        customProps={{
                            isErrored: ((currentComponentSyntaxDiag !== undefined && currentComponentName === "Name") ||
                                model?.variableName?.viewState?.diagnosticsInRange[0]?.message)
                        }}
                        errorMessage={(currentComponentSyntaxDiag && currentComponentName === "Name"
                                && currentComponentSyntaxDiag[0].message) ||
                            model?.variableName?.viewState?.diagnosticsInRange[0]?.message}
                        onBlur={null}
                        onFocus={handleNameFocus}
                        placeholder={"Enter Name"}
                        size="small"
                        disabled={currentComponentSyntaxDiag && currentComponentName !== "Name"}
                    />
                    <FormTextInput
                        label="Listener Port"
                        dataTestId="listener-port"
                        defaultValue={listenerPort.value}
                        onChange={debouncedPortChange}
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
                        placeholder={"Enter Port"}
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
                validForm={(listenerPort.value !== "")
                    && !(model?.variableName?.viewState?.diagnosticsInRange[0]?.message)
                    && !(parenthesizedArgList?.arguments[0]?.viewState?.
                        diagnosticsInRange[0]?.message)
                    && (model?.viewState?.diagnosticsInRange ? model?.viewState?.diagnosticsInRange.length === 0 : true)
                    && !(currentComponentSyntaxDiag && currentComponentSyntaxDiag[0]?.message)}
            />
        </FormControl>
    )
}
