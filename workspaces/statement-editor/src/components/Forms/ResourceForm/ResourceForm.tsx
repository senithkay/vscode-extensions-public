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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useContext, useEffect, useState } from 'react';
import { useIntl } from "react-intl";
import { monaco } from 'react-monaco-editor';

import { Button, Divider, FormControl, TextField } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import { LiteTextField } from '@wso2-enterprise/ballerina-expression-editor';
import {
    createResource,
    getSource,
    updateResourceSignature
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ConfigPanelSection,
    dynamicConnectorStyles as connectorStyles,
    FormHeaderSection,
    PrimaryButton, SecondaryButton,
    SelectDropdownWithButton
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    NodePosition,
    ResourceAccessorDefinition,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from 'vscode-languageserver-protocol';

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getCompletionsForType, getPartialSTForModuleMembers } from "../../../utils/ls-utils";
import { completionEditorTypeKinds, EXPR_SCHEME, FILE_SCHEME } from '../../InputEditor/constants';
import { FieldTitle } from '../components/FieldTitle/fieldTitle';

import { AdvancedParamEditor } from "./AdvancedParamEditor";
import { PayloadEditor } from "./PayloadEditor";
import { ResourceParamEditor } from "./ResourceParamEditor";
import { ResourceReturnEditor } from './ResourceReturnEditor';
import { useStyles } from "./styles";
import { ResourceDiagnostics } from "./types";
import {
    generateParameterSectionString,
    genParamName, getParamDiagnostics,
    getParamString,
    getResourcePath,
    SERVICE_METHODS
} from "./util";

export interface FunctionProps {
    model: ResourceAccessorDefinition; // model + diagnostics
    completions: SuggestionItem[]; // completions
}

export function ResourceForm(props: FunctionProps) {
    const { model } = props;
    const {
        targetPosition, isEdit, onChange, onCancel, getLangClient, applyModifications,
        changeInProgress, currentFile, fullST
    } = useContext(FormEditorContext);

    const classes = useStyles();
    const connectorClasses = connectorStyles();
    const intl = useIntl();

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StatementSyntaxDiagnostics[]>([]);
    const [isEditInProgress, setIsEditInProgress] = useState<boolean>(false);
    const [shouldUpdatePath, setShouldUpdatePath] = useState<boolean>(false);
    const [resourcePath, setResourcePath] = useState<string>(getResourcePath(model?.relativeResourcePath).trim());

    const resourceConfigTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.resourceConfig.title",
        defaultMessage: "Configure Resource"
    });
    const httpMethodTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.httpMethod.title",
        defaultMessage: "HTTP Method"
    });
    const saveButtonText = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.saveButton.text",
        defaultMessage: "Save"
    });


    const fileURI = monaco.Uri.file(currentFile.path).toString().replace(FILE_SCHEME, EXPR_SCHEME);
    const [completions, setCompletions] = useState([]);


    const handleCompletions = async (newValue: string, currentModel: any, completionKinds: number[], newTargetPosition: NodePosition) => {
        const lsSuggestions = await getCompletionsForType(fileURI, newTargetPosition, null,
            currentModel, getLangClient, newValue, completionKinds);
        setCompletions(lsSuggestions);
    };


    const updateDiag = () => {
        const updatedDiagnostics = (model?.viewState.diagnosticsInRange.concat(model?.functionSignature?.returnTypeDesc?.viewState.diagnosticsInRange.concat(model?.functionBody?.viewState.diagnosticsInRange)));
        const typeRelated: Diagnostic[] = updatedDiagnostics?.filter((diag: any) => diag?.message.includes("unknown type"));
        const componentDiag: StatementSyntaxDiagnostics[] = [];
        typeRelated.forEach(diag => {
            const newDiag: StatementSyntaxDiagnostics = {
                message: diag.message,
            };
            componentDiag.push(newDiag);
        })
        setCurrentComponentSyntaxDiag(componentDiag);
    }
    useEffect(() => {
        handleCompletions("", null, [22, 25], targetPosition);
        updateDiag();
    }, [model])


    // When a type is created and full ST is updated trigger the onChange to remove diagnostics // TODO: Find a better fix
    useEffect(() => {
        handlePathChange(resourcePath);
    }, [fullST]);

    let pathNameSemDiagnostics = "";
    let pathTypeSemDiagnostics = "";
    let paramDiagnostics: ResourceDiagnostics;
    if (model) {
        const diagPath = model.relativeResourcePath?.find(
            resPath => resPath?.viewState?.diagnosticsInRange?.length > 0);
        if (diagPath && STKindChecker.isResourcePathSegmentParam(diagPath)) {
            pathNameSemDiagnostics = diagPath?.paramName?.viewState?.diagnosticsInRange && diagPath?.paramName?.
                viewState?.diagnosticsInRange[0]?.message;
            pathTypeSemDiagnostics = diagPath?.typeDescriptor?.viewState?.diagnosticsInRange && diagPath?.
                typeDescriptor?.viewState?.diagnosticsInRange[0]?.message;
        } else if (diagPath && STKindChecker.isIdentifierToken(diagPath)) {
            pathNameSemDiagnostics = diagPath?.viewState?.diagnostics[0]?.message;
        }
        paramDiagnostics = getParamDiagnostics(model.functionSignature?.parameters)
    }
    const getResourcePathDiagnostics = () => {
        const diagPath = model.relativeResourcePath?.find(
            resPath => resPath?.viewState?.diagnosticsInRange?.length > 0);

        let resourcePathDiagnostics = [];

        if (diagPath && STKindChecker.isResourcePathSegmentParam(diagPath)) {
            resourcePathDiagnostics = diagPath?.paramName?.viewState?.diagnosticsInRange && diagPath?.paramName?.
                viewState?.diagnosticsInRange || [];
            resourcePathDiagnostics = diagPath?.typeDescriptor?.viewState?.diagnosticsInRange && diagPath?.
                typeDescriptor?.viewState?.diagnosticsInRange || [];
        } else if (diagPath && STKindChecker.isIdentifierToken(diagPath)) {
            resourcePathDiagnostics = diagPath?.viewState?.diagnostics || [];
        }

        return resourcePathDiagnostics;
    }

    const handleResourceParamChange = async (
        resMethod: string,
        pathStr: string,
        paramStr: string,
        returnStr: string,
        stModel?: STNode,
        currentValue?: string) => {
        const pathString = pathStr ? pathStr : ".";
        const codeSnippet = getSource(
            updateResourceSignature(resMethod, pathString, paramStr, returnStr, targetPosition));
        const position = model ? ({
            startLine: model.functionName.position.startLine - 1,
            startColumn: model.functionName.position.startColumn,
            endLine: model.functionSignature.position.endLine - 1,
            endColumn: model.functionSignature.position.endColumn
        }) : targetPosition;
        const updatedContent = getUpdatedSource(codeSnippet, model?.source, position, undefined,
            true);
        const partialST = await getPartialSTForModuleMembers(
            { codeSnippet: updatedContent.trim() }, getLangClient, true
        );

        if (!partialST.syntaxDiagnostics.length) {
            onChange(updatedContent, partialST, undefined, { model: stModel }, currentValue, completionEditorTypeKinds, 0,
                { startLine: -1, startColumn: -4 });

            setCurrentComponentSyntaxDiag(undefined);
        } else {
            setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
        }

    };

    const handlePathAddClick = async () => {
        setShouldUpdatePath(true);
        setCurrentComponentName("Path");
        const variables = model.relativeResourcePath
            .filter(pathSegment => STKindChecker.isResourcePathSegmentParam(pathSegment)
                || STKindChecker.isResourcePathRestParam(pathSegment))
            .map(pathSegment => STKindChecker.isResourcePathSegmentParam(pathSegment)
                || STKindChecker.isResourcePathRestParam(pathSegment) ? pathSegment?.paramName.value : "");
        let newPath = '';
        if (resourcePath.length === 1 && resourcePath === '.') {
            newPath = `[string ${genParamName("param", variables)}]`;
        } else {
            const genPath = (resourcePath.charAt(resourcePath.length - 1) !== '/') ?
                `/[string ${genParamName("param", variables)}]`
                : `[string ${genParamName("param", variables)}]`;
            newPath = resourcePath + genPath;
        }
        setResourcePath(newPath);
        await handleResourceParamChange(
            model?.functionName?.value,
            newPath,
            getParamString(model.functionSignature?.parameters),
            model?.functionSignature?.returnTypeDesc?.type?.source);
    };

    const handleMethodChange = async (value: string) => {
        await handleResourceParamChange(
            value.toLowerCase(),
            getResourcePath(model.relativeResourcePath),
            generateParameterSectionString(model?.functionSignature?.parameters),
            model.functionSignature?.returnTypeDesc?.type?.source
        );
    };

    const onPathFocus = () => {
        setCurrentComponentName("Path");
    }

    const onReturnFocus = () => {
        setCurrentComponentName("Return");
    }

    const handlePathChange = async (value: string) => {
        setShouldUpdatePath(false);
        setResourcePath(value);
        await handleResourceParamChange(
            model.functionName.value,
            value,
            generateParameterSectionString(model?.functionSignature?.parameters),
            model.functionSignature?.returnTypeDesc?.type?.source,
        );
    };

    const handleParamEditorChange = async (paramString: string, stModel?: STNode, currentValue?: string) => {
        // if (!avoidValueCommit) {
        //     setQueryParam(value);
        // }
        // setCurrentComponentName("QueryParam");
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            paramString,
            model.functionSignature?.returnTypeDesc?.type?.source,
            stModel,
            currentValue
        );
    };


    // Return type related functions
    const onReturnTypeChange = async (value: string) => {
        // setIsEditInProgress(true);
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            generateParameterSectionString(model?.functionSignature?.parameters),
            value,
            model.functionSignature?.returnTypeDesc?.type,
            value
        );
    }

    const handleOnSave = () => {
        if (isEdit) {
            applyModifications([
                updateResourceSignature(
                    model.functionName.value,
                    getResourcePath(model.relativeResourcePath),
                    getParamString(model.functionSignature.parameters),
                    model.functionSignature?.returnTypeDesc?.type?.source,
                    targetPosition)
            ]);
        } else {
            applyModifications([
                createResource(
                    model.functionName.value,
                    getResourcePath(model.relativeResourcePath),
                    getParamString(model.functionSignature.parameters),
                    model.functionSignature?.returnTypeDesc?.type?.source,
                    targetPosition
                )
            ]);
        }

        onCancel();
    }

    return (
        <FormControl data-testid="resource-form" className={connectorClasses.wizardFormControlExtended}>
            <div
                key={"resource"}
                className={classes.resourceWrapper}
            >
                <FormHeaderSection
                    onCancel={onCancel}
                    formTitle={resourceConfigTitle}
                    defaultMessage={'Configure Resource'}
                />
                <div className={connectorClasses.formWrapper}>
                    <div className={connectorClasses.formFeilds}>
                        <div className={connectorClasses.resourceMethodPathWrapper}>
                            <div className={connectorClasses.methodTypeContainer}>
                                <SelectDropdownWithButton
                                    dataTestId='api-method'
                                    defaultValue={model?.functionName?.value?.toUpperCase() || ""}
                                    customProps={{ values: SERVICE_METHODS, disableCreateNew: true, autoFocus: true }}
                                    onChange={handleMethodChange}
                                    label={httpMethodTitle}
                                    disabled={false}
                                />
                            </div>
                            <div className={connectorClasses.resourcePathWrapper}>
                                <FieldTitle title='Resource Path' optional={true} />
                                <LiteTextField
                                    value={resourcePath}
                                    isLoading={false}
                                    onChange={handlePathChange}
                                    diagnostics={currentComponentName === "Path" && currentComponentSyntaxDiag}
                                    onFocus={onPathFocus}
                                />
                            </div>
                        </div>
                        <div className={connectorClasses.queryParam}>
                            <Button
                                data-test-id="query-param-add-button"
                                onClick={handlePathAddClick}
                                className={connectorClasses.addParameterBtn}
                                startIcon={<AddIcon />}
                                color="primary"
                                disabled={false}
                            >
                                Add Path Param
                            </Button>
                        </div>
                    </div>
                    <div className={connectorClasses.resourceParamWrapper}>
                        {/* FIXME: Check and remove if dont need the path editor */}
                        {/*{isAdvanceView && (*/}
                        {/*    <PathEditor*/}
                        {/*        relativeResourcePath={path}*/}
                        {/*        syntaxDiag={currentComponentSyntaxDiag}*/}
                        {/*        readonly={(!isParamInProgress && (currentComponentSyntaxDiag?.length > 0 ||*/}
                        {/*            (pathTypeSemDiagnostics !== "" || pathNameSemDiagnostics !== "")) || isQueryInProgress)}*/}
                        {/*        pathNameSemDiag={pathNameSemDiagnostics}*/}
                        {/*        pathTypeSemDiag={pathTypeSemDiagnostics}*/}
                        {/*        onChange={handlePathParamEditorChange}*/}
                        {/*        onChangeInProgress={handleParamChangeInProgress}*/}
                        {/*    />*/}
                        {/*)}*/}
                        <Divider className={connectorClasses.sectionSeperatorHR} />
                        <ConfigPanelSection title={"Parameters"}>
                            <ResourceParamEditor
                                parameters={model.functionSignature?.parameters || []}
                                syntaxDiag={currentComponentSyntaxDiag}
                                onChange={handleParamEditorChange}
                                completions={completions}
                                readonly={isEditInProgress} // todo: implement the disable logic
                                onChangeInProgress={setIsEditInProgress}
                            />
                            {
                                !model.functionName.value.includes('get') && (
                                    <PayloadEditor
                                        parameters={model.functionSignature?.parameters || []}
                                        onChange={handleParamEditorChange}
                                        syntaxDiag={currentComponentSyntaxDiag}
                                        completions={completions}
                                        readonly={isEditInProgress}
                                        onChangeInProgress={setIsEditInProgress}
                                    />
                                )
                            }
                            <AdvancedParamEditor
                                parameters={model.functionSignature?.parameters || []}
                                syntaxDiag={currentComponentSyntaxDiag ? currentComponentSyntaxDiag : []}
                                onChange={handleParamEditorChange}
                                readonly={isEditInProgress}
                                onChangeInProgress={setIsEditInProgress}
                            />
                        </ConfigPanelSection>
                        <Divider className={connectorClasses.sectionSeperatorHR} />
                        <ConfigPanelSection title='Responses'>
                            <ResourceReturnEditor
                                returnSource={model.functionSignature?.returnTypeDesc?.source}
                                syntaxDiag={(currentComponentName === "Return" && currentComponentSyntaxDiag) || []}
                                onChange={onReturnTypeChange}
                                completions={completions}
                                readonly={isEditInProgress} // todo: implement the disable logic
                                onChangeInProgress={setIsEditInProgress}
                                model={model}
                                onFocus={onReturnFocus}
                            />
                        </ConfigPanelSection>
                        <div className={classes.serviceFooterWrapper}>
                            <SecondaryButton
                                text="Cancel"
                                fullWidth={false}
                                onClick={onCancel}
                            />
                            <div id="product-tour-save" >
                                <PrimaryButton
                                    dataTestId="save-btn"
                                    text={saveButtonText}
                                    className={classes.saveBtn}
                                    onClick={handleOnSave}
                                    disabled={currentComponentSyntaxDiag?.length > 0
                                        || getResourcePathDiagnostics().length > 0
                                        || isEditInProgress
                                        || changeInProgress}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FormControl>
    )
}
