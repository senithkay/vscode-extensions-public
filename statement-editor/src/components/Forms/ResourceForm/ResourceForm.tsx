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
import { useIntl } from "react-intl";

import { Divider, FormControl } from "@material-ui/core";
import {
    getSource,
    updateResourceSignature
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ConfigPanelSection,
    dynamicConnectorStyles as connectorStyles,
    FormActionButtons, FormHeaderSection,
    FormTextInput, ParamEditor,
    SelectDropdownWithButton,
    useStyles as useFormStyles
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    ResourceAccessorDefinition,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";

import { StmtDiagnostic } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModuleMembers } from "../../../utils/ls-utils";
import { FormEditorField } from "../Types";

import { PathEditor } from "./PathEditor";
import { QueryParamEditor } from "./QueryParamEditor";
import { useStyles } from "./styles";
import {
    getQueryParamCollection,
    generateQueryParamFromST, generateQueryStringFromQueryCollection,
    getPathOfResources,
    SERVICE_METHODS
} from "./util";

export interface FunctionProps {
    model: ResourceAccessorDefinition;
}

export function ResourceForm(props: FunctionProps) {
    const { model} = props;

    const { targetPosition, isEdit, onChange, applyModifications, onCancel, getLangClient } =
        useContext(FormEditorContext);

    const classes = useStyles();
    const formClasses = useFormStyles();
    const connectorClasses = connectorStyles();
    const intl = useIntl();

    // States related to component model
    const [functionName, setFunctionName] = useState<string>(model?.functionName?.value);
    const [path, setPath] = useState<FormEditorField>({
        value: model ? getPathOfResources(model.relativeResourcePath) : "", isInteracted: false
    });
    const [isParamInProgress, setIsParamInProgress] = useState(false);
    const [queryParam, setQueryParam] = useState<FormEditorField>({
        value: generateQueryParamFromST(model?.functionSignature?.parameters),
        isInteracted: false
    });
    const [isQueryInProgress, setIsQueryInProgress] = useState(false);

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

    let pathNameSemDiagnostics = "";
    let pathTypeSemDiagnostics = "";
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
    }

    const handleResourceParamChange = async (resMethod: string, pathStr: string, queryParamStr: string,
                                             payloadStr: string, caller: boolean, request: boolean,
                                             returnStr: string) => {
        const codeSnippet = getSource(updateResourceSignature(resMethod, pathStr, queryParamStr, payloadStr, caller,
            request, returnStr, targetPosition));
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
                {startLine: -1, startColumn: -4});
        } else {
            setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
        }
    };

    const handleMethodChange = async (value: string) => {
        setFunctionName(value);
        await handleResourceParamChange(value, path.value, queryParam.value, "", false, false,
            "");
    };

    const handlePathChange = async (value: string, avoidValueCommit?: boolean) => {
        if (!avoidValueCommit) {
            setPath({value, isInteracted: true});
        }
        setCurrentComponentName("Path");
        await handleResourceParamChange(functionName, value, queryParam.value, "",
            false, false, "");
    };

    const handlePathParamEditorChange = async (value: string, avoidValueCommit?: boolean) => {
        if (!avoidValueCommit) {
            setPath({value, isInteracted: true});
        }
        setCurrentComponentName("PathParam");
        await handleResourceParamChange(functionName, value, "", "", false,
            false, "");
    };

    const handleQueryParamEditorChange = async (value: string, avoidValueCommit?: boolean) => {
        if (!avoidValueCommit) {
            setQueryParam({value, isInteracted: true});
        }
        setCurrentComponentName("QueryParam");
        await handleResourceParamChange(functionName, path.value, value, "", false,
            false, "");
    };

    const handleParamChangeInProgress = (isInProgress: boolean) => {
        setIsParamInProgress(isInProgress);
    };

    const handleQueryChangeInProgress = (isInProgress: boolean) => {
        setIsQueryInProgress(isInProgress);
    };

    useEffect(() => {
        if (model) {
            if (!isParamInProgress) {
                setPath({...path, value: getPathOfResources(model.relativeResourcePath)});
            }
            if (!isQueryInProgress) {
                setQueryParam({
                    ...queryParam,
                    value: generateQueryParamFromST(model?.functionSignature?.parameters),
                });
            }
        } else {
            setPath({...path, value: ""});
        }
        setFunctionName(model?.functionName?.value);
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
                                <div className={connectorClasses.resourceMethodTitle}>{httpMethodTitle}</div>
                                <SelectDropdownWithButton
                                    dataTestId="api-return-type"
                                    defaultValue={functionName?.toUpperCase()}
                                    customProps={{ values: SERVICE_METHODS, disableCreateNew: true }}
                                    onChange={handleMethodChange}
                                    label="HTTP Method"
                                    hideLabel={true}
                                    disabled={isParamInProgress}
                                />
                            </div>
                            <div className={connectorClasses.resourcePathWrapper}>
                                <ConfigPanelSection
                                    title={pathTitle}
                                    // tooltipWithExample={{ title, content: pathExample }}
                                >
                                    <FormTextInput
                                        dataTestId="resource-path"
                                        defaultValue={(path?.isInteracted || isEdit) ? path.value : ""}
                                        onChange={handlePathChange}
                                        customProps={{
                                            isErrored: ((currentComponentSyntaxDiag !== undefined &&
                                                currentComponentName === "Path") || pathNameSemDiagnostics !== "" ||
                                                pathTypeSemDiagnostics !== "")
                                        }}
                                        errorMessage={(currentComponentSyntaxDiag && currentComponentName === "Path"
                                                && currentComponentSyntaxDiag[0].message) || pathNameSemDiagnostics ||
                                            pathTypeSemDiagnostics}
                                        onBlur={null}
                                        placeholder={"."}
                                        size="small"
                                        disabled={isParamInProgress || (currentComponentSyntaxDiag &&
                                            currentComponentName !== "Path")}
                                    />
                                </ConfigPanelSection>
                            </div>
                        </div>
                        <PathEditor
                            relativeResourcePath={(path?.isInteracted || isEdit) ? path.value : ""}
                            syntaxDiag={currentComponentSyntaxDiag}
                            readonly={!isParamInProgress && (currentComponentSyntaxDiag?.length > 0 ||
                                (pathTypeSemDiagnostics !== "" || pathNameSemDiagnostics !== ""))}
                            pathNameSemDiag={pathNameSemDiagnostics}
                            pathTypeSemDiag={pathTypeSemDiagnostics}
                            onChange={handlePathParamEditorChange}
                            onChangeInProgress={handleParamChangeInProgress}
                        />
                        <Divider className={connectorClasses.sectionSeperatorHR} />
                        <QueryParamEditor
                            queryParamString={queryParam.value}
                            readonly={false}
                            syntaxDiag={null}
                            onChangeInProgress={handleQueryChangeInProgress}
                            nameSemDiag={""}
                            typeSemDiag={""}
                            onChange={handleQueryParamEditorChange}
                        />
                        {/*    {advanceSwitch}*/}
                        {/*</div>*/}
                        {/*<div>*/}
                        {/*    {toggleMainAdvancedMenu && advanceUI}*/}
                        {/*</div>*/}
                        {/*<Section*/}
                        {/*    title={returnTypeTitle}*/}
                        {/*    tooltipWithExample={{ title: returnTitle, content: returnTypeExample }}*/}
                        {/*>*/}
                        {/*    {initialLoaded && returnUIWithExpressionEditor}*/}
                        {/*</Section>*/}
                    </div>
                    {/*<div>*/}
                    {/*    {buttonLayer}*/}
                    {/*</div>*/}
                </div>
            </div>
        </FormControl>
    )
}
