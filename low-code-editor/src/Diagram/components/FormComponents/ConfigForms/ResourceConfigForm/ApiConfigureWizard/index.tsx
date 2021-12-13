/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { Box, FormControl, Grid, Link, Typography } from "@material-ui/core";
import { ConfigOverlayFormStatus, FormActionButtons, FormHeaderSection, PrimaryButton, SecondaryButton, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, NodePosition, ObjectMethodDefinition, RequiredParam, ResourceAccessorDefinition } from "@wso2-enterprise/syntax-tree";

import { ResourceIcon } from "../../../../../../assets/icons";
import { Section } from "../../../../../../components/ConfigPanel";
import { Context } from "../../../../../../Contexts/Diagram";
import { ServiceMethodType, SERVICE_METHODS, TriggerType } from "../../../../../models";
import { createResource, updateResourceSignature } from "../../../../../utils/modification-util";
import { DiagramOverlayPosition } from "../../../../Portals/Overlay";
import { useStyles as useFormStyles } from "../../../DynamicConnectorForm/style";
import { SelectDropdownWithButton } from "../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { SwitchToggle } from "../../../FormFieldComponents/SwitchToggle";
import { FormTextInput } from "../../../FormFieldComponents/TextField/FormTextInput";
import { VariableNameInput, VariableNameInputProps } from "../../Components/VariableNameInput";
import { VariableTypeInput } from "../../Components/VariableTypeInput";
import { useStyles } from "../styles";

import { AdvancedEditor } from "./components/advanced";
import { PayloadEditor } from "./components/extractPayload";
import { PathEditor } from "./components/pathEditor";
import { QueryParamEditor } from "./components/queryParamEditor";
import { ReturnTypeEditor } from "./components/ReturnTypeEditor";
import {
    Advanced,
    Payload,
    QueryParamCollection,
    Resource
} from "./types";
import {
    convertPayloadStringToPayload,
    convertQueryParamStringToSegments,
    extractPathData,
    extractPayloadFromST,
    generateQueryParamFromQueryCollection,
    generateQueryParamFromST,
    genrateBallerinaQueryParams,
    getBallerinaPayloadType,
    getPathDiagnostics,
    getReturnType,
    getReturnTypePosition,
    getReturnTypeTemplate,
    isCallerParamAvailable,
    isRequestParamAvailable,
} from "./util";

interface ApiConfigureWizardProps {
    position: DiagramOverlayPosition;
    method?: ServiceMethodType,
    path?: string,
    triggerType?: TriggerType
    model?: ResourceAccessorDefinition | FunctionDefinition | ObjectMethodDefinition,
    targetPosition?: NodePosition,
    configOverlayFormStatus?: ConfigOverlayFormStatus;
    scopeSymbols?: string[];
    onCancel: () => void;
    onSave: () => void;
    formType: string;
}

export interface ConnectorEvents {
    [key: string]: any;
}

export const getPathOfResources = (resources: any[] = []) => resources?.map((path: any) => path?.value || path?.source).join('');

export function ApiConfigureWizard(props: ApiConfigureWizardProps) {
    const {
        api: {
            insights: {
                onEvent,
            },
            code: {
                modifyDiagram
            }
        },
        props: {
            isMutationProgress: isFileSaving,
            isLoadingSuccess: isFileSaved,
        }
    } = useContext(Context);

    const { model, targetPosition, onSave, onCancel, formType } = props;

    const classes = useStyles();
    const formClasses = useFormStyles();
    const intl = useIntl();
    const defaultConfig: Resource = {
        id: 0,
        method: "GET",
        path: ".",
        returnType: 'error?'
    };

    const segmentTargetPosition = model ? {
        ...model.position,
        endLine: 0,
        endColumn: 0,
    } : targetPosition;

    const [resource, setResource] = useState<Resource>(defaultConfig);
    const [toggleMainAdvancedMenu, setToggleMainAdvancedMenu] = useState(false);
    const [togglePayload, setTogglePayload] = useState(false);
    const [isValidPath, setIsValidPath] = useState(false);
    const [validateToggle, setValidateToggle] = useState(false);
    const [isValidReturnExpr, setIsValidReturnExpr] = useState(true);
    const [isValidPayload, setIsValidPayload] = useState(true);

    // To only load return type expr editor after initial load,
    // in order to prevent expr editor on change event getting fired before model change useEffect is fired
    const [initialLoaded, setInitialLoaded] = useState(false);

    const funcSignature = (model as ResourceAccessorDefinition)?.functionSignature;

    useEffect(() => {
        if (model) {
            const { functionName, relativeResourcePath, functionSignature } = model as ResourceAccessorDefinition;
            const queryParam: string = generateQueryParamFromST(functionSignature?.parameters);
            const payload: string = extractPayloadFromST(functionSignature?.parameters);
            const callerParam: boolean = isCallerParamAvailable(functionSignature?.parameters);
            const requestParam: boolean = isRequestParamAvailable(functionSignature?.parameters);
            const returnTypeDesc: string = getReturnType(functionSignature?.returnTypeDesc);
            const stMethod: string = functionName?.value;
            const stPath: string = getPathOfResources(relativeResourcePath) || "";
            const pathDiagnostics = getPathDiagnostics(relativeResourcePath);

            let resourceMember: Resource;

            if (stMethod && stPath) {
                resourceMember = {
                    id: 0,
                    method: stMethod.toUpperCase(),
                    path: (stPath),
                    queryParams: queryParam,
                    payload,
                    isCaller: callerParam,
                    isRequest: requestParam,
                    returnType: returnTypeDesc,
                    initialPathDiagnostics: pathDiagnostics,
                };
                setResource(resourceMember);
                if (payload && payload !== "") {
                    setTogglePayload(true);
                }
            } else {
                setResource(defaultConfig);
            }
        }
        setInitialLoaded(true);
    }, [model]);

    const onPathUIToggleSelect = () => {
        if (!toggleMainAdvancedMenu && resource.path === '.') {
            setResource({
                ...resource,
                path: '',
            })
        } else if (toggleMainAdvancedMenu && resource.path === '') {
            setResource({
                ...resource,
                path: '.',
            })
        }

        setToggleMainAdvancedMenu(!toggleMainAdvancedMenu);
    }

    const onPayloadToggleSelect = (checked: boolean) => {
        setTogglePayload(!togglePayload);
        const updatedResources = { ...resource };
        if (!checked && (!updatedResources.payload || updatedResources.payload !== "")) {
            const segment: Payload = {
                name: "payload",
                type: "json"
            };
            updatedResources.payload = getBallerinaPayloadType(segment);
            setResource(updatedResources);
        } else {
            updatedResources.payload = undefined;
            setResource(updatedResources);
        }
    }

    function handleOnSelect(methodType: string) {
        // Update selected method
        setResource({
            ...resource,
            method: methodType.toLowerCase()
        });
    }

    function handleOnChangePath(text: string) {
        setValidateToggle(!validateToggle);
        if (text === 'hello') {
            // todo: handle dispatch
            // dispatchGoToNextTourStep("CONFIG_HTTP_PATH");
        }

        const formattedPath: Resource = extractPathData(text);
        // Update path
        const updatedResource = { ...resource };
        updatedResource.path = formattedPath.path;
        setResource(updatedResource);
    }

    function handleOnChangeReturnType(text: string) {
        setResource(oldResource => ({
            ...oldResource,
            returnType: text
        }));
    }

    function handleOnChangePathFromUI(text: string) {
        const resClone = { ...resource };
        resClone.path = text;
        setResource(resClone);
        setValidateToggle(!validateToggle);
        setResource(resClone);
        if (text === 'hello') {
            // todo: handle dispatch
            // dispatchGoToNextTourStep("CONFIG_HTTP_PATH");
        }

        // Update path
        const updatedResource = { ...resource };
        updatedResource.path = text;
        setResource(updatedResource);
    }

    function handleOnChangeReturnTypeFormUI(text: string) {
        const updatedResource = { ...resource };
        updatedResource.returnType = text;
        setResource(updatedResource);
    }

    function handleOnChangeQueryParamFromUI(text: string) {
        if (text === 'hello') {
            // todo: handle dispatch
            // dispatchGoToNextTourStep("CONFIG_HTTP_PATH");
        }

        const queryParams: QueryParamCollection = convertQueryParamStringToSegments(text);

        // Update path
        const updatedResource = { ...resource };
        updatedResource.queryParams = generateQueryParamFromQueryCollection(queryParams);
        setResource(updatedResource);
    }

    function handleOnPayloadErrorFromUI(isError: boolean) {
        // Update path
        const updatedResource = { ...resource };
        updatedResource.payloadError = isError;
        setResource(updatedResource);
    }

    function handleOnChangePayloadFromUI(segment: Payload) {
        // Update path
        const updatedResource = { ...resource };
        updatedResource.payload = getBallerinaPayloadType(segment);
        setResource(updatedResource);
    }

    function handleOnChangeAdvancedUI(advanced: Advanced) {
        // Update path
        setResource({
            ...resource,
            isCaller: advanced.isCaller,
            isRequest: advanced.isRequest
        });
    }

    const validateResources = () => {
        if (!resource) return false;

        let isValidated = true;
        const resourceSignatures: string[] = [];

        // Validate method signature
        const signature: string = `${resource.method.toLowerCase()}_${resource.path}`;
        if (resourceSignatures.includes(signature)) {
            isValidated = false;
            return;
        } else {
            resourceSignatures.push(signature);
        }

        // Validate paths
        if (!isValidPath) {
            return;
        }

        // validate payload name
        if (resource.payloadError) {
            isValidated = false;
            return;
        }

        return isValidated;
    }



    const handleUserConfirm = () => {
        handleUpdateResources();
        onSave();
    };

    const handleUpdateResources = () => {
        const mutations: STModification[] = [];
        if (!model) {
            const payload: Payload = convertPayloadStringToPayload(resource.payload);
            const queryParams: QueryParamCollection = convertQueryParamStringToSegments(resource.queryParams);
            const generatedBallerinaQueryParam: string = genrateBallerinaQueryParams(queryParams, (resource.isCaller || resource.isRequest || (resource.payload && resource.payload !== "")));
            const generatedBallerinaPayload: string = resource.payload ? getBallerinaPayloadType(payload, (resource.isCaller || resource.isRequest)) : "";
            const path: string = (resource.path === "" ? "." : resource.path.charAt(0) === "/" ? resource.path.substr(1, resource.path.length) : resource.path);

            const resourceModification: STModification = createResource(resource.method.toLowerCase(), path, generatedBallerinaQueryParam,
                generatedBallerinaPayload, resource.isCaller, resource.isRequest,
                resource.returnType, targetPosition);

            mutations.push(resourceModification)
        } else {
            const updatePosition: NodePosition = {
                startLine: model.functionName.position.startLine,
                startColumn: model.functionName.position.startColumn,
                endLine: model.functionSignature.position.endLine,
                endColumn: model.functionSignature.position.endColumn
            }
            const selectedResource = resource;
            if (selectedResource.queryParams) {
                const queryParams: QueryParamCollection = convertQueryParamStringToSegments(selectedResource.queryParams);
                selectedResource.queryParams = genrateBallerinaQueryParams(queryParams, (selectedResource.isCaller || selectedResource.isRequest || (selectedResource.payload && selectedResource.payload !== "")));
            }

            if (selectedResource.payload && selectedResource.payload !== "") {
                const payload: Payload = convertPayloadStringToPayload(selectedResource.payload);
                selectedResource.payload = getBallerinaPayloadType(payload, (selectedResource.isCaller || selectedResource.isRequest));
            }


            mutations.push(updateResourceSignature(selectedResource.method.toLocaleLowerCase(),
                (selectedResource.path === "" ? "." : selectedResource.path.charAt(0) === "/" ?
                    selectedResource.path.substr(1, selectedResource.path.length) : selectedResource.path),
                selectedResource.queryParams, (togglePayload ? selectedResource.payload : ""), selectedResource.isCaller,
                selectedResource.isRequest, resource.returnType, updatePosition));
        }

        if (mutations.length > 0) {
            modifyDiagram(mutations);
        }
    };


    const validateReturnTypeExpression = (_name: string, isInvalid: boolean) => setIsValidReturnExpr(!isInvalid);

    const updateResourcePathValidation = (_name: string, isInValid: boolean) => setIsValidPath(!isInValid);

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

    const pathSegmentTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.path.segment.title",
        defaultMessage: "Path Segments"
    });


    const pathDuplicateErrorMessage = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.path.duplicate.errorMessage",
        defaultMessage: "Path already exists for the selected method"
    });

    const pathPlaceholder = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.path.placeholder",
        defaultMessage: "Relative path from host"
    });


    const queryParamTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.query.param.title",
        defaultMessage: "Query Parameters"
    });

    const extractPayloadTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.extract.payload.title",
        defaultMessage: "Extract Request Payload"
    });

    const advancedTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.advanced.title",
        defaultMessage: "Advanced"
    });

    const returnTypeTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.return.type.title",
        defaultMessage: "Return Type"
    });

    const saveButtonText = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.saveButton.text",
        defaultMessage: "Save"
    });

    const pathExample = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.path.tooltip.example",
        defaultMessage: "users \nusers/[string name] \nusers/[int userId]/groups"
    });

    const queryParamExample = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.queryparam.tooltip.example",
        defaultMessage: "string id, string name"
    });

    const payloadExample = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.payloadExample.tooltip.example",
        defaultMessage: "@http:Payload json payload"
    });

    const returnTypeExample = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.return.type.tooltip.example",
        defaultMessage: "string,int,boolean,etc."
    });

    const advancedExample = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.advanced.tooltip.example",
        defaultMessage: "http:Request request \nhttp:Caller caller"
    });

    const deleteResourceTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.delete.resource.title",
        defaultMessage: "Delete Resource"
    });

    const showLessText = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.show.less.text",
        defaultMessage: "Show Less"
    });

    const advancedText = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.advanced.text",
        defaultMessage: "Advanced"
    });

    const title = (
        <div>
            <p>
                <FormattedMessage id="lowcode.develop.apiConfigWizard.path.instructions.tooltip" defaultMessage="A valid path should" />
            </p>
            <ul>
                <li>
                    <FormattedMessage id="lowcode.develop.apiConfigWizard.path.instructions.tooltip.bulletPoint1" defaultMessage="<b>NOT</b> include spaces outside the square brackets" values={{ b: (chunks: string) => <b>{chunks}</b> }} />
                </li>
                <li>
                    <FormattedMessage id="lowcode.develop.apiConfigWizard.path.instructions.tooltip.bulletPoint2" defaultMessage="<b>NOT</b> start with a numerical character" values={{ b: (chunks: string) => <b>{chunks}</b> }} />
                </li>
                <li>
                    <FormattedMessage id="lowcode.develop.apiConfigWizard.path.instructions.tooltip.bulletPoint3" defaultMessage="<b>NOT</b> include keywords such as <code>Return</code>, <code>Foreach</code>, <code>Resource</code>, <code>Object</code>, etc." values={{ b: (chunks: string) => <b>{chunks}</b>, code: (chunks: string) => <code>{chunks}</code> }} />
                </li>
            </ul>
        </div>
    );

    const queryParamContenttitle = (
        <div>
            <p>
                <FormattedMessage id="lowcode.develop.apiConfigWizard.queryparam.instructions.tooltip" defaultMessage="A valid query parameter should" />
            </p>
            <ul>
                <li>
                    <FormattedMessage id="lowcode.develop.apiConfigWizard.queryparam.instructions.tooltip.bulletPoint1" defaultMessage="<b>NOT</b> include spaces on the left and right ends" values={{ b: (chunks: string) => <b>{chunks}</b> }} />
                </li>
                <li>
                    <FormattedMessage id="lowcode.develop.apiConfigWizard.queryparam.instructions.tooltip.bulletPoint2" defaultMessage="<b>NOT</b> start with a numerical character" values={{ b: (chunks: string) => <b>{chunks}</b> }} />
                </li>
                <li>
                    <FormattedMessage id="lowcode.develop.apiConfigWizard.queryparam.instructions.tooltip.bulletPoint3" defaultMessage="<b>NOT</b> include keywords such as <code>Return</code>, <code>Foreach</code>, <code>Resource</code>, <code>Object</code>, etc." values={{ b: (chunks: string) => <b>{chunks}</b>, code: (chunks: string) => <code>{chunks}</code> }} />
                </li>
            </ul>
        </div>
    );

    const payloadContenttitle = (
        <div>
            <p>
                <FormattedMessage id="lowcode.develop.apiConfigWizard.payload.instructions.tooltip" defaultMessage="A valid payload should" />
            </p>
            <ul>
                <li>
                    <FormattedMessage id="lowcode.develop.apiConfigWizard.payload.instructions.tooltip.bulletPoint1" defaultMessage="<b>NOT</b> include spaces on the left and right ends" values={{ b: (chunks: string) => <b>{chunks}</b> }} />
                </li>
                <li>
                    <FormattedMessage id="lowcode.develop.apiConfigWizard.payload.instructions.tooltip.bulletPoint2" defaultMessage="<b>NOT</b> start with a numerical character" values={{ b: (chunks: string) => <b>{chunks}</b> }} />
                </li>
                <li>
                    <FormattedMessage id="lowcode.develop.apiConfigWizard.payload.instructions.tooltip.bulletPoint3" defaultMessage="<b>NOT</b> include keywords such as <code>Return</code>, <code>Foreach</code>, <code>Resource</code>, <code>Object</code>, etc." values={{ b: (chunks: string) => <b>{chunks}</b>, code: (chunks: string) => <code>{chunks}</code> }} />
                </li>
            </ul>
        </div>
    );

    const advancedTooltip = (
        <div>
            <p>
                <FormattedMessage id="lowcode.develop.apiConfigWizard.advanced.instructions.tooltip" defaultMessage="Request represents the message that is used to invoke this service. Caller represents the client who invokes this resource" />
            </p>
        </div>
    );

    const returnTitle = (
        <div>
            <p>
                <FormattedMessage id="lowcode.develop.apiConfigWizard.return.type.instructions.tooltip" defaultMessage="A valid ballerina type can be used" />
            </p>
        </div>
    );

    const lastRelativePath = model?.relativeResourcePath ? model?.relativeResourcePath[model?.relativeResourcePath?.length - 1] : {};
    const variableNameConfig: VariableNameInputProps = {
        displayName: 'Resource path',
        value: resource.path === '.' ? '' : resource.path,
        onValueChange: (value) => setResource({ ...resource, path: value }),
        validateExpression: updateResourcePathValidation,
        position: model ? {
            startLine: model?.functionName?.position?.startLine,
            startColumn: model?.functionName?.position?.startColumn,
            endLine: lastRelativePath ? lastRelativePath.position?.endLine : model?.functionName?.position?.startLine,
            endColumn: lastRelativePath ? lastRelativePath.position?.endColumn : model?.functionName?.position?.startColumn,
        } : {
            ...targetPosition,
            endColumn: targetPosition.startColumn,
            endLine: targetPosition.startLine,
        },
        overrideTemplate: {
            defaultCodeSnippet: `resource function ${resource.method.toLowerCase()} (){}`,
            targetColumn: 20 + resource.method.length,
        },
        overrideEditTemplate: {
            defaultCodeSnippet: `${resource.method.toLowerCase()} `,
            targetColumn: 2 + resource.method.length,
        },
        isEdit: !!model,
        hideLabel: true,
        initialDiagnostics: resource.initialPathDiagnostics,
        diagnosticsFilterExtraColumns: {
            start: 1 + resource.method.length,
        }
    }

    const pathUI = (
        <Section
            title={pathTitle}
            tooltipWithExample={{ title, content: pathExample }}
        >
            {initialLoaded && <VariableNameInput {...variableNameConfig} key={resource.method} />}
        </Section>
    );

    const advanceSwitch = (
        <Link data-testid="advanced-path-config" component="button" variant="body2" onClick={onPathUIToggleSelect}>
            {toggleMainAdvancedMenu ? showLessText : advancedText}
        </Link>
    );

    const advanceUI = (
        <div>
            <div className={classes.sectionSeparator}>
                <Section
                    title={pathSegmentTitle}
                    tooltipWithExample={{ title, content: pathExample }}
                >
                    <PathEditor
                        pathString={resource.path}
                        defaultValue={resource.path}
                        onChange={handleOnChangePathFromUI}
                        targetPosition={segmentTargetPosition}
                    />
                </Section>
            </div>
            <div className={classes.sectionSeparator}>
                <Section
                    title={queryParamTitle}
                    tooltipWithExample={{ title: queryParamContenttitle, content: queryParamExample }}
                >
                    <QueryParamEditor
                        queryParams={resource.queryParams}
                        onChange={handleOnChangeQueryParamFromUI}
                        targetPosition={segmentTargetPosition}
                    />
                </Section>
            </div>
            <div className={classes.sectionSeparator}>
                <Section
                    title={extractPayloadTitle}
                    tooltipWithExample={{ title: payloadContenttitle, content: payloadExample }}
                    button={<SwitchToggle initSwitch={togglePayload} onChange={onPayloadToggleSelect} />}
                >
                    <PayloadEditor
                        model={model}
                        targetPosition={targetPosition}
                        disabled={!togglePayload}
                        payload={resource.payload}
                        onChange={handleOnChangePayloadFromUI}
                        onError={handleOnPayloadErrorFromUI}
                        setIsValid={setIsValidPayload}
                    />
                </Section>
            </div>
            <div className={classes.sectionSeparator}>
                <Section
                    title={advancedTitle}
                    tooltipWithExample={{ title: advancedTooltip, content: advancedExample }}
                >
                    <AdvancedEditor
                        isCaller={resource.isCaller}
                        isRequest={resource.isRequest}
                        onChange={handleOnChangeAdvancedUI}
                    />
                </Section>
            </div>
        </div>
    );

    const returnUIWithExpressionEditor = (
        <div className={classes.returnTextBoxWrapper}>
            <VariableTypeInput
                hideLabel={true}
                displayName={"Return Type"}
                value={resource.returnType}
                onValueChange={handleOnChangeReturnType}
                validateExpression={validateReturnTypeExpression}
                position={getReturnTypePosition(funcSignature, targetPosition)}
                overrideTemplate={getReturnTypeTemplate(funcSignature, resource)}
                initialDiagnostics={funcSignature?.returnTypeDesc?.typeData?.diagnostics}
                changed={resource.isCaller}
            />
        </div>
    );

    const buttonLayer = (
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
                    onClick={handleUserConfirm}
                    disabled={isFileSaving || !isValidReturnExpr || (!isValidPath && !toggleMainAdvancedMenu) || (togglePayload && !isValidPayload)}
                />
            </div>
        </div>
    );

    const resourceUI = (
        <div
            key={resource.id}
            className={classes.resourceWrapper}
        >
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={resourceConfigTitle}
                defaultMessage={'Configure Resource'}
                formType={formType}
            />
            <div className={formClasses.formWrapper}>
                <div className={formClasses.formFeilds}>
                    <div className={formClasses.resourceMethodPathWrapper}>
                        <div className={formClasses.methodTypeContainer}>
                            <div className={formClasses.resourceMethodTitle}>{httpMethodTitle}</div>
                            <SelectDropdownWithButton
                                dataTestId="api-return-type"
                                defaultValue={resource.method.toUpperCase()}
                                customProps={{ values: SERVICE_METHODS, disableCreateNew: true }}
                                onChange={handleOnSelect}
                            />
                        </div>
                        <div className={formClasses.resourcePathWrapper}>
                            {!toggleMainAdvancedMenu && pathUI}
                        </div>
                    </div>
                    <div className={formClasses.advancedSwitchText}>
                        {advanceSwitch}
                    </div>
                    <div>
                        {toggleMainAdvancedMenu && advanceUI}
                    </div>
                    <Section
                        title={returnTypeTitle}
                        tooltipWithExample={{ title: returnTitle, content: returnTypeExample }}
                    >
                        {initialLoaded && returnUIWithExpressionEditor}
                    </Section>
                </div>
                <div>
                    {buttonLayer}
                </div>
            </div>
        </div>
    );

    return (
        <FormControl data-testid="resource-form" className={formClasses.wizardFormControlExtended}>
            {resource && resourceUI}
        </FormControl>
    );
}
