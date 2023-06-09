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

import { Button, Divider, FormControl } from "@material-ui/core";
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
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getCompletionsForType, getPartialSTForModuleMembers } from "../../../utils/ls-utils";
import { ResourcePathFinderVisitor } from '../../../visitors/resource-path-finder-visitor';
import { completionEditorTypeKinds, EXPR_SCHEME, FILE_SCHEME } from '../../InputEditor/constants';
import { FieldTitle } from '../components/FieldTitle/fieldTitle';

import { AdvancedParamEditor } from "./AdvancedParamEditor";
import { PayloadEditor } from "./PayloadEditor";
import { ResourceParamEditor } from "./ResourceParamEditor";
import { ResourceReturnEditor } from './ResourceReturnEditor';
import { useStyles } from "./styles";
import { ResourceDiagnostics, ResourceParam } from "./types";
import {
    genParamName, getParamArray, getParamDiagnostics,
    getParamString,
    getResourcePath,
    HTTP_GET,
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
    const [resourcePathDiagnostics, setResourcePathDiagnostics] = useState<StatementSyntaxDiagnostics[]>([]);
    const [otherDiagnostics, setOtherDiagnostics] = useState<StatementSyntaxDiagnostics[]>([]);
    const [isEditInProgress, setIsEditInProgress] = useState<boolean>(false);

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

    useEffect(() => {
        handleCompletions("", null, [22, 25], targetPosition);
        setParametersValue(getParamArray(model.functionSignature))
    }, [model])

    useEffect(() => {
        if (model) {
            handleResourceParamChange(
                setResourcePathDiagnostics,
                methodName,
                resourcePath,
                getParamString(parametersValue),
                resourceReturn.replace("returns", "")
            );
        }
    }, [])

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
        } else if (diagPath && diagPath?.viewState?.diagnostics?.length > 0 && STKindChecker.isIdentifierToken(diagPath)) {
            pathNameSemDiagnostics = diagPath?.viewState?.diagnostics[0]?.message;
        }
        paramDiagnostics = getParamDiagnostics(model.functionSignature?.parameters)
    }
    const getResourcePathDiagnostics = () => {
        const diagPath = model.relativeResourcePath?.find(
            resPath => resPath?.viewState?.diagnosticsInRange?.length > 0);

        let diagnostics = [];

        if (diagPath && STKindChecker.isResourcePathSegmentParam(diagPath)) {
            diagnostics = diagPath?.paramName?.viewState?.diagnosticsInRange && diagPath?.paramName?.
                viewState?.diagnosticsInRange || [];
            diagnostics = diagPath?.typeDescriptor?.viewState?.diagnosticsInRange && diagPath?.
                typeDescriptor?.viewState?.diagnosticsInRange || [];
        } else if (diagPath && STKindChecker.isIdentifierToken(diagPath)) {
            diagnostics = diagPath?.viewState?.diagnostics || [];
        }

        return diagnostics;
    }

    const handleResourceParamChange = async (
        setDiagnostics: (value: React.SetStateAction<StatementSyntaxDiagnostics[]>) => void,
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

            setDiagnostics(undefined);
        } else {
            setDiagnostics(partialST.syntaxDiagnostics);
        }

    };

    const onPathFocus = () => {
        setCurrentComponentName("Path");
    }

    const onReturnFocus = () => {
        setCurrentComponentName("Return");
    }

    const handlePathAddClick = async () => {
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
            setResourcePathDiagnostics,
            methodName,
            newPath,
            getParamString(parametersValue),
            resourceReturn.replace("returns", ""),
        );
    };

    const [methodName, setMethodName] = useState<string>(model?.functionName?.value.toUpperCase());
    const handleMethodChange = async (value: string) => {
        setMethodName(value.toUpperCase());
        // Path visiter to find the duplicate resource method and name
        setResourcePathDiagnostics(undefined);
        const visitor = new ResourcePathFinderVisitor(value, resourcePath);
        traversNode(fullST, visitor);
        const isValidPath = visitor.getResourcePathValidity();

        if (isValidPath) {
            await handleResourceParamChange(
                setResourcePathDiagnostics,
                value.toLowerCase(),
                resourcePath,
                getParamString(parametersValue),
                resourceReturn.replace("returns", "")
            );
        } else {
            setResourcePathDiagnostics([{ message: `Duplicated resource. '${value} ${resourcePath}'` }])
        }
    };

    const [resourcePath, setResourcePath] = useState<string>(getResourcePath(model?.relativeResourcePath).trim());
    const handlePathChange = async (value: string) => {
        const sanitizedValue = value.replace(/ /g, '');
        setResourcePath(sanitizedValue);
        // Path visiter to find the duplicate resource method and name
        setResourcePathDiagnostics(undefined);
        const visitor = new ResourcePathFinderVisitor(methodName, sanitizedValue);
        traversNode(fullST, visitor);
        const isValidPath = visitor.getResourcePathValidity();

        if (isValidPath) {
            await handleResourceParamChange(
                setResourcePathDiagnostics,
                methodName,
                sanitizedValue,
                getParamString(parametersValue),
                resourceReturn.replace("returns", ""),
            );
        } else {
            setResourcePathDiagnostics([{ message: `Duplicated resource. '${methodName} ${sanitizedValue}'` }])
        }

    };

    const [parametersValue, setParametersValue] = useState<ResourceParam[]>(getParamArray(model.functionSignature));

    const handleParamEditorChange = async (paramString: string, stModel?: STNode, currentValue?: string) => {
        setCurrentComponentName("QueryParam");
        await handleResourceParamChange(
            setOtherDiagnostics,
            methodName,
            resourcePath,
            paramString,
            resourceReturn.replace("returns", ""),
        );
    };


    // Return type related functions
    const [resourceReturn, setResourceReturn] = useState<string>(model.functionSignature?.returnTypeDesc?.source);
    const onReturnTypeChange = async (value: string) => {
        setResourceReturn(value);
        await handleResourceParamChange(
            setOtherDiagnostics,
            methodName,
            resourcePath,
            getParamString(parametersValue),
            value,
        );
    }

    const getReturnTypeDiagnostics = () => {
        const viewStateDiagnostics: StatementSyntaxDiagnostics[] = model?.viewState?.diagnosticsInRange;
        const returnValues = resourceReturn.split(" ");
        const filtered = viewStateDiagnostics.filter(diag => returnValues.some(val => diag.message.includes(val)));
        return filtered;
    }

    const handleOnSave = async () => {
        if (isEdit) {
            applyModifications([
                updateResourceSignature(
                    methodName.toLowerCase(),
                    resourcePath,
                    getParamString(parametersValue),
                    resourceReturn.replace("returns", ""),
                    targetPosition)
            ]);
        } else {
            applyModifications([
                createResource(
                    methodName.toLowerCase(),
                    resourcePath,
                    getParamString(parametersValue),
                    resourceReturn.replace("returns", ""),
                    targetPosition
                )
            ]);
        }
        onCancel();
    }

    return (
        <div data-testid="resource-form" className={connectorClasses.wizardFormControlExtended}>
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
                                    defaultValue={methodName || ""}
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
                                    diagnostics={resourcePathDiagnostics}
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
                        <Divider className={connectorClasses.sectionSeperatorHR} />
                        <ConfigPanelSection title={"Parameters"}>
                            <ResourceParamEditor
                                parameters={parametersValue}
                                syntaxDiag={otherDiagnostics}
                                onChange={handleParamEditorChange}
                                completions={completions}
                                readonly={isEditInProgress} // todo: implement the disable logic
                                onChangeInProgress={setIsEditInProgress}
                            />
                            {
                                methodName !== HTTP_GET && (
                                    <PayloadEditor
                                        parameters={parametersValue}
                                        onChange={handleParamEditorChange}
                                        syntaxDiag={otherDiagnostics}
                                        completions={completions}
                                        readonly={isEditInProgress}
                                        onChangeInProgress={setIsEditInProgress}
                                    />
                                )
                            }
                            <AdvancedParamEditor
                                parameters={parametersValue}
                                syntaxDiag={otherDiagnostics}
                                onChange={handleParamEditorChange}
                                readonly={isEditInProgress}
                                onChangeInProgress={setIsEditInProgress}
                            />
                        </ConfigPanelSection>
                        <Divider className={connectorClasses.sectionSeperatorHR} />
                        <ConfigPanelSection title='Responses'>
                            <ResourceReturnEditor
                                returnSource={resourceReturn}
                                syntaxDiag={getReturnTypeDiagnostics()}
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
                                    disabled={resourcePathDiagnostics?.length > 0
                                        || otherDiagnostics?.length > 0
                                        || getResourcePathDiagnostics().length > 0
                                        || isEditInProgress
                                        || changeInProgress}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
