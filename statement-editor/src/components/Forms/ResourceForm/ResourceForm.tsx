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

import { Divider, FormControl } from "@material-ui/core";
import {
    createResource,
    getSource,
    SettingsIcon,
    SettingsIconSelected,
    updateResourceSignature
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    CheckBoxGroup,
    ConfigPanelSection,
    dynamicConnectorStyles as connectorStyles,
    FormHeaderSection,
    FormTextInput, PrimaryButton, SecondaryButton,
    SelectDropdownWithButton
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    ResourceAccessorDefinition,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";
import debounce from "lodash.debounce";

import { StmtDiagnostic } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModuleMembers } from "../../../utils/ls-utils";

import { AdvancedParamEditor } from "./AdvancedParamEditor";
import { PathEditor } from "./PathEditor";
import { PayloadEditor } from "./PayloadEditor";
import { ResourceParamEditor } from "./ResourceParamEditor";
import { useStyles } from "./styles";
import { AdvancedParams, Payload } from "./types";
import {
    generateAdvancedParamString,
    generateParamString,
    generatePayloadParamFromST,
    generateQueryParamFromST, getParamDiagnostics,
    getPathOfResources,
    getPayloadString,
    SERVICE_METHODS
} from "./util";

export interface FunctionProps {
    model: ResourceAccessorDefinition;
}

export function ResourceForm(props: FunctionProps) {
    const { model } = props;

    const { targetPosition, isEdit, onChange, applyModifications, onCancel, getLangClient } =
        useContext(FormEditorContext);

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
    const [isAdvanceView, setIsAdvanceView] = useState<boolean>(false);
    const [advancedParams, setAdvancedParams] = useState<AdvancedParams>(genAdvancedParams);

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StmtDiagnostic[]>(undefined);

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
    let paramDiagnostics;
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

    const payloadString = getPayloadString(advancedParams.payload);
    const advancedString = generateAdvancedParamString(advancedParams.requestParamName,
        advancedParams.callerParamName, advancedParams.headerParamName);

    const handleResourceParamChange = async (resMethod: string, pathStr: string, queryParamStr: string,
                                             payloadStr: string, caller: boolean, request: boolean,
                                             returnStr: string, diagColumnOffset: number = -4) => {
        const pathString = pathStr ? pathStr : ".";
        const paramString = generateParamString(queryParamStr, payloadStr, "");
        const codeSnippet = getSource(updateResourceSignature(resMethod, pathString, paramString, "",
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
            {codeSnippet: updatedContent.trim()}, getLangClient, true
        );
        if (!partialST.syntaxDiagnostics.length) {
            setCurrentComponentSyntaxDiag(undefined);
            onChange(updatedContent, partialST, undefined, undefined, undefined, undefined, 0,
                {startLine: -1, startColumn: diagColumnOffset});
        } else {
            setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
        }
    };

    const handleSettingsToggle = () => {
        setIsAdvanceView(!isAdvanceView);
    };

    const handleMethodChange = async (value: string) => {
        setFunctionName(value);
        await handleResourceParamChange(value.toLowerCase(), path, generateParamString(queryParam, payloadString,
                advancedString), "", false, false,
            returnType);
    };

    const handlePathChange = async (value: string, avoidValueCommit?: boolean) => {
        if (!avoidValueCommit) {
            setPath(value);
        }
        setCurrentComponentName("Path");
        await handleResourceParamChange(functionName, value, generateParamString(queryParam, payloadString,
                advancedString), "", false, false, returnType);
    };
    const debouncedPathChange = debounce(handlePathChange, 800);

    const handlePathParamEditorChange = async (value: string, avoidValueCommit?: boolean) => {
        if (!avoidValueCommit) {
            setPath(value);
        }
        setCurrentComponentName("PathParam");
        await handleResourceParamChange(functionName, value, generateParamString(queryParam, payloadString,
                advancedString), "", false, false, returnType);
    };

    const handleQueryParamEditorChange = async (value: string, avoidValueCommit?: boolean) => {
        if (!avoidValueCommit) {
            setQueryParam(value);
        }
        setCurrentComponentName("QueryParam");
        await handleResourceParamChange(functionName, path, generateParamString(value, payloadString,
                advancedString), "", false, false, returnType, -3);
    };

    // Return type related functions
    const onReturnTypeChange = async (value: string) => {
        setCurrentComponentName("Return");
        setReturnType(value);
        await handleResourceParamChange(functionName, path, generateParamString(queryParam, payloadString,
                advancedString), "", false, false, value, -3);
    }
    const debouncedReturnTypeChange = debounce(onReturnTypeChange, 800);

    // Payload related functions
    const handlePayloadSelect = async (text: string[]) => {
        if (text) {
            if (text.length > 0) {
                await handleResourceParamChange(functionName, path, queryParam, getPayloadString({
                        name: "payload", type: "json"
                }), false, false, returnType);
            } else {
                await handleResourceParamChange(functionName, path, queryParam, "", false,
                    false, returnType)
            }
        }
    };
    const handlePayloadChange = async (text: string) => {
        setCurrentComponentName("Payload");
        await handleResourceParamChange(functionName, path, generateParamString(queryParam, text, advancedString),
            "", undefined, undefined, returnType);
    };

    const handleAdvancedParamChange = async (requestName: string, headerName: string, callerName: string) => {
        setCurrentComponentName("Advanced");
        setAdvancedParams({requestParamName: requestName, headerParamName: headerName,
                           callerParamName: callerName, payload: advancedParams.payload});
        await handleResourceParamChange(functionName, path, generateParamString(queryParam, payloadString,
                generateAdvancedParamString(requestName, callerName, headerName)),
            "", undefined, undefined, returnType);
    };

    const handleOnSave = () => {
        if (isEdit) {
            applyModifications([
                updateResourceSignature(functionName, path ? path : ".", queryParam,
                    "", false, false, returnType, targetPosition)
            ]);
        } else {
            applyModifications([
                createResource(functionName, path ? path : ".", queryParam, "",
                    false, false, returnType, targetPosition)
            ]);
        }
        onCancel();
    }

    const handleParamChangeInProgress = (isInProgress: boolean) => {
        setIsParamInProgress(isInProgress);
    };

    const handleQueryChangeInProgress = (isInProgress: boolean) => {
        setIsQueryInProgress(isInProgress);
    };

    useEffect(() => {
        if (model) {
            if (!isParamInProgress) {
                setPath(resources === "." ? "" : resources);
            }
            if (!isQueryInProgress) {
                setQueryParam(generateQueryParamFromST(model?.functionSignature?.parameters));
            }
        } else {
            setPath("");
        }
        setReturnType(model ? model.functionSignature?.returnTypeDesc?.type?.source?.trim() : "");
        setFunctionName(model?.functionName?.value);
        const defaultAdvancedParams = generatePayloadParamFromST(model?.functionSignature?.parameters);
        setAdvancedParams(defaultAdvancedParams);
    }, [model]);

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
                                <FormTextInput
                                    dataTestId="resource-path"
                                    label={pathTitle}
                                    defaultValue={path}
                                    onChange={debouncedPathChange}
                                    customProps={{
                                        isErrored: ((currentComponentSyntaxDiag !== undefined &&
                                                currentComponentName === "Path") || pathNameSemDiagnostics !== "" ||
                                            pathTypeSemDiagnostics !== "")
                                    }}
                                    errorMessage={(currentComponentSyntaxDiag && currentComponentName === "Path"
                                            && currentComponentSyntaxDiag[0].message) || pathNameSemDiagnostics ||
                                        pathTypeSemDiagnostics}
                                    onBlur={null}
                                    placeholder={"Enter Path"}
                                    size="small"
                                    disabled={(isParamInProgress || (currentComponentSyntaxDiag &&
                                        currentComponentName !== "Path")) || isQueryInProgress}
                                />
                            </div>
                            {!((isParamInProgress || (currentComponentSyntaxDiag && currentComponentName !== "Path"))
                                || isQueryInProgress) && (
                                <div className={connectorClasses.advancedToggleWrapper}>
                                    <div className={classes.contentIconWrapper}>
                                        {isAdvanceView ? (
                                            <SettingsIcon onClick={handleSettingsToggle}/>
                                        ) : (
                                            <SettingsIconSelected onClick={handleSettingsToggle}/>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={connectorClasses.resourceParamWrapper}>
                        {isAdvanceView && (
                            <PathEditor
                                relativeResourcePath={path}
                                syntaxDiag={currentComponentSyntaxDiag}
                                readonly={(!isParamInProgress && (currentComponentSyntaxDiag?.length > 0 ||
                                    (pathTypeSemDiagnostics !== "" || pathNameSemDiagnostics !== "")) || isQueryInProgress)}
                                pathNameSemDiag={pathNameSemDiagnostics}
                                pathTypeSemDiag={pathTypeSemDiagnostics}
                                onChange={handlePathParamEditorChange}
                                onChangeInProgress={handleParamChangeInProgress}
                            />
                        )}
                        <Divider className={connectorClasses.sectionSeperatorHR} />
                        <ConfigPanelSection title={"Parameters"}>
                            <ResourceParamEditor
                                resourceParamString={queryParam}
                                readonly={(currentComponentSyntaxDiag?.length > 0) || (isParamInProgress)}
                                syntaxDiag={currentComponentSyntaxDiag}
                                onChangeInProgress={handleQueryChangeInProgress}
                                nameSemDiag={paramDiagnostics?.queryNameSemDiagnostic}
                                typeSemDiag={paramDiagnostics?.queryTypeSemDiagnostic}
                                onChange={handleQueryParamEditorChange}
                            />
                            <CheckBoxGroup
                                values={["Add Payload"]}
                                defaultValues={!payloadString ? [] : ['Add Payload']}
                                onChange={handlePayloadSelect}
                            />
                            {payloadString && (
                                <PayloadEditor
                                    payload={advancedParams.payload}
                                    onChange={handlePayloadChange}
                                    typeSemDiag={paramDiagnostics?.payloadTypeSemDiagnostic}
                                    nameSemDiag={paramDiagnostics?.payloadNameSemDiagnostic}
                                    syntaxDiag={currentComponentSyntaxDiag ?
                                        currentComponentSyntaxDiag[0].message : ""}
                                    readonly={isParamInProgress || isQueryInProgress || (currentComponentSyntaxDiag
                                        && currentComponentName !== "Payload")}
                                />
                            )}
                            <AdvancedParamEditor
                                callerName={advancedParams?.callerParamName}
                                requestName={advancedParams?.requestParamName}
                                headersName={advancedParams?.headerParamName}
                                callerSemDiag={paramDiagnostics?.callerNameSemDiagnostics}
                                headersSemDiag={paramDiagnostics?.headersNameSemDiagnostics}
                                requestSemDiag={paramDiagnostics?.requestNameSemDiagnostics}
                                syntaxDiag={currentComponentSyntaxDiag ? currentComponentSyntaxDiag[0].message : ""}
                                onChange={handleAdvancedParamChange}
                                readonly={isParamInProgress || isQueryInProgress || (currentComponentSyntaxDiag
                                    && currentComponentName !== "Advanced")}
                            />
                        </ConfigPanelSection>
                        <Divider className={connectorClasses.sectionSeperatorHR} />
                        <FormTextInput
                            label="Return Type"
                            dataTestId="return-type"
                            defaultValue={returnType}
                            customProps={{
                                optional: true,
                                isErrored: ((currentComponentSyntaxDiag !== undefined &&
                                    currentComponentName === "Return") || model?.functionSignature?.returnTypeDesc?.
                                    viewState?.diagnosticsInRange?.length > 0)
                            }}
                            errorMessage={((currentComponentSyntaxDiag &&
                                    currentComponentName === "Return" && currentComponentSyntaxDiag[0].message)
                                || model?.functionSignature?.returnTypeDesc?.viewState?.diagnosticsInRange[0]?.message)}
                            onChange={debouncedReturnTypeChange}
                            placeholder={"Enter Return Type"}
                            size="small"
                            disabled={isParamInProgress || isQueryInProgress || (currentComponentSyntaxDiag
                                && currentComponentName !== "Return")}
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
                                    disabled={(currentComponentSyntaxDiag !== undefined) ||
                                        (pathTypeSemDiagnostics !== "") || (pathNameSemDiagnostics !== "") ||
                                        (paramDiagnostics?.queryTypeSemDiagnostic !== "") ||
                                        (paramDiagnostics?.queryNameSemDiagnostic !== "") ||
                                        (paramDiagnostics?.payloadNameSemDiagnostic !== "") ||
                                        (paramDiagnostics?.payloadTypeSemDiagnostic !== "") ||
                                        (paramDiagnostics?.requestNameSemDiagnostics !== "") ||
                                        (paramDiagnostics?.callerNameSemDiagnostics !== "") ||
                                        (paramDiagnostics?.headersNameSemDiagnostics !== "") ||
                                        (model?.functionSignature?.viewState?.diagnosticsInRange?.length > 0)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FormControl>
    )
}
