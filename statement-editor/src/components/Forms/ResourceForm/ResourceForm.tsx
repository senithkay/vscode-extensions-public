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

import { FormControl } from "@material-ui/core";
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
import { useStyles } from "./styles";

export const HTTP_GET = "GET";
export const HTTP_POST = "POST";
export const HTTP_PUT = "PUT";
export const HTTP_DELETE = "DELETE";
export const HTTP_OPTIONS = "OPTIONS";
export const HTTP_HEAD = "HEAD";
export const HTTP_PATCH = "PATCH";

export const SERVICE_METHODS = [HTTP_GET, HTTP_PUT, HTTP_DELETE, HTTP_POST, HTTP_OPTIONS, HTTP_HEAD, HTTP_PATCH];

export const getPathOfResources = (resources: any[] = []) =>
    resources?.map((path: any) => path?.value || path?.source).join('');

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
    const [path, setPath] = useState<FormEditorField>({
        value: model ? getPathOfResources(model.relativeResourcePath) : "", isInteracted: false
    });
    const [isParamInProgress, setIsParamInProgress] = useState(false);

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

    const resourceParamChange = async (resMethod: string, pathStr: string, queryParamStr: string, payloadStr: string,
                                       caller: boolean, request: boolean, returnStr: string) => {
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

    const pathChange = async (value: string, avoidValueCommit?: boolean) => {
        if (!avoidValueCommit) {
            setPath({value, isInteracted: true});
        }
        setCurrentComponentName("pathParam");
        await resourceParamChange("get", value, "", "", false, false,
            "");
    };

    const handleParamChangeInProgress = (isInProgress: boolean) => {
        setIsParamInProgress(isInProgress);
    };

    useEffect(() => {
        if (model) {
            if (!isParamInProgress) {
                setPath({...path, value: getPathOfResources(model.relativeResourcePath)});
            }
        } else {
            setPath({...path, value: ""});
        }
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
                                    defaultValue={/*resource.method.toUpperCase()*/""}
                                    customProps={{ values: SERVICE_METHODS, disableCreateNew: true }}
                                    onChange={null}
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
                                        // defaultValue={(paramName?.isInteracted || isEdit) ? paramName.value : ""}
                                        defaultValue={(path?.isInteracted || isEdit) ? path.value : ""}
                                        onChange={pathChange}
                                        customProps={{
                                            // isErrored: ((currentComponentSyntaxDiag !== undefined && currentComponentName === "Name") ||
                                            //     model?.functionName?.viewState?.diagnosticsInRange[0]?.message)
                                        }}
                                        // errorMessage={(currentComponentSyntaxDiag && currentComponentName === "Name"
                                        //         && currentComponentSyntaxDiag[0].message) ||
                                        //     model?.functionName?.viewState?.diagnosticsInRange[0]?.message}
                                        onBlur={null}
                                        // onFocus={onNameFocus}
                                        placeholder={"name"}
                                        size="small"
                                        // disabled={addingNewParam || (currentComponentSyntaxDiag && currentComponentName !== "Name")}
                                        disabled={isParamInProgress}
                                    />
                                </ConfigPanelSection>
                            </div>
                        </div>
                        <PathEditor
                            relativeResourcePath={(path?.isInteracted || isEdit) ? path.value : ""}
                            syntaxDiag={currentComponentSyntaxDiag}
                            readonly={false}
                            pathNameSemDiag={pathNameSemDiagnostics}
                            pathTypeSemDiag={pathTypeSemDiagnostics}
                            onChange={pathChange}
                            onChangeInProgress={handleParamChangeInProgress}
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
