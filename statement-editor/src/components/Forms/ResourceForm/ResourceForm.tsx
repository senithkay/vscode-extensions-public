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
import React, { useContext, useEffect, useState } from 'react';
import { useIntl } from "react-intl";

import { Button, Divider, FormControl } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import { LiteExpressionEditor } from '@wso2-enterprise/ballerina-expression-editor';
import {
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
    ResourceAccessorDefinition,
    ResourcePathRestParam,
    ResourcePathSegmentParam,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";
import debounce from "lodash.debounce";

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModuleMembers } from "../../../utils/ls-utils";
import { completionEditorTypeKinds } from '../../InputEditor/constants';
import { FieldTitle } from '../components/FieldTitle/fieldTitle';

import { AdvancedParamEditor } from "./AdvancedParamEditor";
import { PayloadEditor } from "./PayloadEditor";
import { ResourceParamEditor } from "./ResourceParamEditor";
import { useStyles } from "./styles";
import { AdvancedParams, Path, PathSegment, Payload, ResourceDiagnostics } from "./types";
import {
    convertPathStringToSegments,
    generateAdvancedParamString,
    generateParameterSectionString,
    generatePayloadParamFromST,
    generateQueryParamFromST, genParamName, getParamDiagnostics,
    getParamString,
    getPathOfResources,
    getPayloadString,
    getResourcePath,
    SERVICE_METHODS
} from "./util";

export interface FunctionProps {
    model: ResourceAccessorDefinition;
    completions: SuggestionItem[];
}

export function ResourceForm(props: FunctionProps) {
    const { model, completions } = props;

    const { targetPosition, onChange, onCancel, getLangClient } = useContext(FormEditorContext);
    console.log('model init >>>', model);
    const classes = useStyles();
    const connectorClasses = connectorStyles();
    const intl = useIntl();

    const resources = getPathOfResources(model?.relativeResourcePath);
    const genAdvancedParams = generatePayloadParamFromST(model?.functionSignature?.parameters);
    // States related to component model
    const [functionName, setFunctionName] = useState<string>(model?.functionName?.value);
    const [path, setPath] = useState<string>(model ? (resources === "." ? "" : resources) : "");
    const [isParamInProgress, setIsParamInProgress] = useState(false);
    const [queryParam, setQueryParam] = useState<string>(generateQueryParamFromST(model?.functionSignature?.
        parameters));
    const [isQueryInProgress, setIsQueryInProgress] = useState(false);
    const [returnType, setReturnType] = useState<string>(model ? model.functionSignature?.
        returnTypeDesc?.type?.source?.trim() : "");
    // const [isAdvanceView, setIsAdvanceView] = useState<boolean>(false);
    const [isPayloadInProgress, setIsPayloadInProgress] = useState(false);
    const [isAdvancedInProgress, setIsAdvancedInProgress] = useState(false);
    const [advancedParams, setAdvancedParams] = useState<AdvancedParams>(genAdvancedParams);
    const [isEdited, setIsEdited] = useState<boolean>(false);

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StatementSyntaxDiagnostics[]>(undefined);

    const resourceConfigTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.resourceConfig.title",
        defaultMessage: "Configure Resource"
    });
    const httpMethodTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.httpMethod.title",
        defaultMessage: "HTTP Method"
    });
    const pathTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.path.title",
        defaultMessage: "Path"
    });
    const saveButtonText = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.saveButton.text",
        defaultMessage: "Save"
    });

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

        let resourcePathDiagnostics;

        if (diagPath && STKindChecker.isResourcePathSegmentParam(diagPath)) {
            resourcePathDiagnostics = diagPath?.paramName?.viewState?.diagnosticsInRange && diagPath?.paramName?.
                viewState?.diagnosticsInRange;
            resourcePathDiagnostics = diagPath?.typeDescriptor?.viewState?.diagnosticsInRange && diagPath?.
                typeDescriptor?.viewState?.diagnosticsInRange;
        } else if (diagPath && STKindChecker.isIdentifierToken(diagPath)) {
            resourcePathDiagnostics = diagPath?.viewState?.diagnostics;
        }

        const payloadString = getPayloadString(advancedParams.payload);
        const advancedString = generateAdvancedParamString(advancedParams.requestParamName,
            advancedParams.callerParamName, advancedParams.headerParamName);

        const pathSegments: Path = convertPathStringToSegments(path);
        const segmentNames: string[] = [];
        pathSegments?.segments?.forEach((s: PathSegment) => {
            if (s.isParam) {
                segmentNames.push(s.name);
            }
        });

        console.log('resource path diagnostic', resourcePathDiagnostics);
        return resourcePathDiagnostics;
    }

    const handleResourceParamChange = async (
        resMethod: string,
        pathStr: string,
        paramStr: string,
        returnStr: string,
        stModel?: STNode,
        currentValue?: string) => {

        // setIsEdited(true);
        const pathString = pathStr ? pathStr : ".";
        const codeSnippet = getSource(
            updateResourceSignature(resMethod, pathString, paramStr, "",
                false, false, returnStr, targetPosition));
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
            setCurrentComponentSyntaxDiag(undefined);
            onChange(updatedContent, partialST, undefined, { model: stModel }, currentValue, completionEditorTypeKinds, 0,
                { startLine: -1, startColumn: -4 });
        } else {
            setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
        }

    };

    const handlePathAddClick = async () => {
        setCurrentComponentName("Path");
        const variables = model.relativeResourcePath
            .filter(pathSegment => STKindChecker.isResourcePathSegmentParam(pathSegment)
                || STKindChecker.isResourcePathRestParam(pathSegment))
            .map(pathSegment => STKindChecker.isResourcePathSegmentParam(pathSegment)
                || STKindChecker.isResourcePathRestParam(pathSegment) ? pathSegment?.paramName.value : "");
        const genPath = (model.relativeResourcePath.length > 0) ? `/[string ${genParamName("param", variables)}]` : `[string ${genParamName("param", variables)}]`;
        const newPath = getResourcePath(model.relativeResourcePath) + genPath;
        await handleResourceParamChange(
            functionName,
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

    const handlePathChange = async (value: string, avoidValueCommit?: boolean) => {
        if (!avoidValueCommit) {
            setPath(value);
        }
        // setCurrentComponentName("Path");
        await handleResourceParamChange(
            model.functionName.value,
            value,
            generateParameterSectionString(model?.functionSignature?.parameters),
            model.functionSignature?.returnTypeDesc?.type?.source
        );
    };
    const debouncedPathChange = debounce(handlePathChange, 800);

    const handlePathParamEditorChange = async (value: string, avoidValueCommit?: boolean) => {
        if (!avoidValueCommit) {
            setPath(value);
        }
        setCurrentComponentName("PathParam");
    };

    const handleQueryParamEditorChange = async (value: string, stModel?: STNode, avoidValueCommit?: boolean) => {
        if (!avoidValueCommit) {
            setQueryParam(value);
        }
        setCurrentComponentName("QueryParam");
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            value,
            model.functionSignature?.returnTypeDesc?.type?.source
        );
    };

    // Return type related functions
    const onReturnFocus = () => {
        setCurrentComponentName("Return");
    }

    const onReturnTypeChange = async (value: string) => {
        // setReturnType(value);
        // await handleResourceParamChange(functionName, path, generateParamString(queryParam, payloadString,
        //     advancedString), "", false, false, value, -3);
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            generateParameterSectionString(model?.functionSignature?.parameters),
            value,
            model.functionSignature?.returnTypeDesc?.type,
            value
        );
    }
    const debouncedReturnTypeChange = debounce(onReturnTypeChange, 800);

    // Payload related functions
    const handlePayloadChange = async (text: string, payload: Payload, avoidValueCommit?: boolean) => {
        setCurrentComponentName("Payload");
        if (!avoidValueCommit) {
            setAdvancedParams({
                requestParamName: advancedParams.requestParamName, headerParamName: advancedParams.headerParamName,
                callerParamName: advancedParams.callerParamName, payload
            });
        }
        // await handleResourceParamChange(functionName, path, generateParamString(queryParam, text, advancedString),
        //     "", undefined, undefined, returnType);
    };

    const handleAdvancedParamChange = async (
        requestName: string, headerName: string, callerName: string,
        avoidValueCommit?: boolean) => {
        setCurrentComponentName("Advanced");
        if (!avoidValueCommit) {
            setAdvancedParams({
                requestParamName: requestName, headerParamName: headerName,
                callerParamName: callerName, payload: advancedParams.payload
            });
        }
        // await handleResourceParamChange(functionName, path, generateParamString(queryParam, payloadString,
        //     generateAdvancedParamString(requestName, callerName, headerName)),
        //     "", undefined, undefined, returnType);
    };

    const handleOnSave = () => {
        // if (isEdited) {
        //     if (isEdit) {
        //         applyModifications([
        //             updateResourceSignature(functionName, path ? path : ".", generateParamString(queryParam,
        //                 payloadString, advancedString), "", false, false, returnType,
        //                 targetPosition)
        //         ]);
        //     } else {
        //         applyModifications([
        //             createResource(functionName, path ? path : ".", generateParamString(queryParam, payloadString,
        //                 advancedString), "", false, false, returnType, targetPosition)
        //         ]);
        //     }
        // }
        onCancel();
    }

    const handleParamChangeInProgress = (isInProgress: boolean) => {
        setIsParamInProgress(isInProgress);
    };

    const handleQueryChangeInProgress = (isInProgress: boolean) => {
        setIsQueryInProgress(isInProgress);
    };

    const handlePayloadChangeInProgress = (isInProgress: boolean) => {
        setIsPayloadInProgress(isInProgress);
    };

    const handleAdvancedChangeInProgress = (isInProgress: boolean) => {
        setIsAdvancedInProgress(isInProgress);
    };

    // useEffect(() => {
    //     if (model) {
    //         if (!isParamInProgress) {
    //             setPath(resources === "." ? "" : resources);
    //         }
    //         if (!isQueryInProgress) {
    //             setQueryParam(generateQueryParamFromST(model?.functionSignature?.parameters));
    //         }
    //         const defaultAdvancedParams = generatePayloadParamFromST(model?.functionSignature?.parameters);
    //         if (!isPayloadInProgress && !isAdvancedInProgress) {
    //             setAdvancedParams(defaultAdvancedParams);
    //         }
    //     } else {
    //         setPath("");
    //     }
    //     setReturnType(model ? model.functionSignature?.returnTypeDesc?.type?.source?.trim() : "");
    //     setFunctionName(model?.functionName?.value);
    // }, [model]);
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
                                    dataTestId="api-method"
                                    defaultValue={functionName ? functionName?.toUpperCase() : ""}
                                    customProps={{ values: SERVICE_METHODS, disableCreateNew: true }}
                                    onChange={handleMethodChange}
                                    label={httpMethodTitle}
                                    disabled={isParamInProgress || isQueryInProgress}
                                />
                            </div>
                            <div className={connectorClasses.resourcePathWrapper}>
                                <FieldTitle title='Resource Path' optional={true} />
                                <LiteExpressionEditor
                                    diagnostics={currentComponentName === "Path" && getResourcePathDiagnostics()}
                                    defaultValue={getResourcePath(model?.relativeResourcePath).trim()}
                                    onChange={debouncedPathChange}
                                    completions={completions}
                                    onFocus={onPathFocus}
                                    disabled={(isParamInProgress || (currentComponentSyntaxDiag &&
                                        currentComponentName !== "Path")) || isQueryInProgress || isPayloadInProgress
                                        || isAdvancedInProgress}
                                />
                            </div>
                            <div className={connectorClasses.advancedToggleWrapper}>
                                <div className={classes.plusIconWrapper}>
                                    <Button
                                        data-test-id="request-add-button"
                                        onClick={handlePathAddClick}
                                        startIcon={<AddIcon />}
                                        color="primary"
                                        disabled={(isParamInProgress || (currentComponentSyntaxDiag &&
                                            currentComponentName !== "Path")) || isQueryInProgress
                                            || isPayloadInProgress || isAdvancedInProgress}
                                    />
                                </div>
                            </div>
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
                                resourceParamString={queryParam}
                                readonly={false} // todo: implement the disable logic
                                syntaxDiag={currentComponentSyntaxDiag}
                                onChangeInProgress={handleQueryChangeInProgress}
                                nameSemDiag={paramDiagnostics?.queryNameSemDiagnostic}
                                typeSemDiag={paramDiagnostics?.queryTypeSemDiagnostic}
                                onChange={handleQueryParamEditorChange}
                                completions={[]}
                            />
                            <PayloadEditor
                                payload={advancedParams.payload}
                                onChange={handlePayloadChange}
                                typeSemDiag={paramDiagnostics?.payloadTypeSemDiagnostic}
                                nameSemDiag={paramDiagnostics?.payloadNameSemDiagnostic}
                                syntaxDiag={currentComponentSyntaxDiag ?
                                    currentComponentSyntaxDiag[0].message : ""}
                                readonly={isParamInProgress || isAdvancedInProgress || isQueryInProgress ||
                                    ((currentComponentSyntaxDiag?.length > 0) && currentComponentName !== "Payload")}
                                onChangeInProgress={handlePayloadChangeInProgress}
                            />
                            <AdvancedParamEditor
                                callerName={advancedParams?.callerParamName}
                                requestName={advancedParams?.requestParamName}
                                headersName={advancedParams?.headerParamName}
                                callerSemDiag={paramDiagnostics?.callerNameSemDiagnostics}
                                headersSemDiag={paramDiagnostics?.headersNameSemDiagnostics}
                                requestSemDiag={paramDiagnostics?.requestNameSemDiagnostics}
                                syntaxDiag={currentComponentSyntaxDiag ? currentComponentSyntaxDiag[0].message : ""}
                                onChange={handleAdvancedParamChange}
                                readonly={isParamInProgress || isPayloadInProgress || isQueryInProgress ||
                                    (currentComponentSyntaxDiag && currentComponentName !== "Advanced")}
                                onChangeInProgress={handleAdvancedChangeInProgress}
                            />
                        </ConfigPanelSection>
                        <Divider className={connectorClasses.sectionSeperatorHR} />
                        <FieldTitle title='Return Type' optional={true} />
                        <LiteExpressionEditor
                            diagnostics={(currentComponentName === "Return" && currentComponentSyntaxDiag) ||
                                model?.functionSignature?.returnTypeDesc?.type?.viewState?.diagnosticsInRange}
                            defaultValue={model?.functionSignature?.returnTypeDesc?.type?.source.trim()}
                            onChange={debouncedReturnTypeChange}
                            onFocus={onReturnFocus}
                            disabled={false}
                        />
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
                                    disabled={false}
                                // todo: fix disabled status
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FormControl>
    )
}
