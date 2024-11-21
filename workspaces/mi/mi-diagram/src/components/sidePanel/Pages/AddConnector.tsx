/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from 'react';
import { AutoComplete, Button, ComponentCard, RequiredFormInput, TextField, LinkButton, ProgressIndicator, FormCheckBox, Codicon } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import SidePanelContext from '../SidePanelContexProvider';
import { create } from 'xmlbuilder2';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { ParamConfig, ParamManager } from '../../Form/ParamManager/ParamManager';
import { ExpressionField, ExpressionFieldValue } from '../../Form/ExpressionField/ExpressionInput';
import { handleOpenExprEditor, sidepanelGoBack } from '..';
import { useForm, Controller } from 'react-hook-form';
import { MACHINE_VIEW, POPUP_EVENT_TYPE, ParentPopupData } from '@wso2-enterprise/mi-core';
import { FormGenerator } from '../../..';

const cardStyle = {
    display: "block",
    margin: "5px 0",
    padding: "10px 15px 15px 15px",
    width: "auto",
    cursor: "auto",
};

const Error = styled.span`
    color: var(--vscode-errorForeground);
    font-size: 12px;
`;

const Field = styled.div`
   margin-bottom: 5px;
`;

interface AddConnectorProps {
    formData: any;
    nodePosition: Range;
    documentUri: string;
    connectorName?: string;
    operationName?: string;
    connectionName?: string;
    connectionType?: string;
    fromConnectorStore?: boolean;
    parameters?: string[];
}

interface Element {
    inputType: any;
    name: string | number;
    displayName: any;
    required: string;
    helpTip: any;
    comboValues?: any[];
    defaultValue?: any;
    allowedConnectionTypes?: string[];
    enableCondition?: any[];
}

const expressionFieldTypes = ['stringOrExpression', 'integerOrExpression', 'textAreaOrExpression', 'textOrExpression'];

const AddConnector = (props: AddConnectorProps) => {
    const { formData, nodePosition, documentUri } = props;
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();

    const sidePanelContext = React.useContext(SidePanelContext);
    const [isLoading, setIsLoading] = React.useState(true);
    const [connections, setConnections] = useState([] as any);
    const handleOnCancelExprEditorRef = useRef(() => { });
    const [parameters, setParameters] = useState<string[]>(props.parameters);
    const { control, handleSubmit, setValue, reset, formState: { errors }, getValues, watch } = useForm();

    const paramConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Key",
                defaultValue: "",
                isRequired: true
            },
            {
                id: 1,
                type: "TextField",
                label: "Value",
                defaultValue: "",
                isRequired: true
            }]
    };

    const [params, setParams] = useState(paramConfigs);

    const fetchConnections = async () => {
        if (props.formData && props.formData !== "") {
            const allowedTypes = findAllowedConnectionTypes(props.formData.elements);

            const connectorData = await rpcClient.getMiDiagramRpcClient().getConnectorConnections({
                documentUri: props.documentUri,
                connectorName: props.formData?.connectorName ?? props.connectorName.replace(/\s/g, '')
            });

            const filteredConnections = connectorData.connections.filter(
                connection => allowedTypes?.includes(connection.connectionType));
            const connectionNames = filteredConnections.map(connection => connection.name);

            setConnections(connectionNames);
        } else {
            // Fetch connections for old connectors (No ConnectionType)
            const connectionsData = await rpcClient.getMiDiagramRpcClient().getConnectorConnections({
                documentUri: props.documentUri,
                connectorName: props.connectorName.replace(/\s/g, '')
            });

            const connectionsNames = connectionsData.connections.map(connection => connection.name);
            setConnections(connectionsNames);
        }

        setIsLoading(false);
    };

    const fetchParameters = async (operation: string) => {
        const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({
            documentUri: props.documentUri,
            connectorName: props.connectorName.toLowerCase().replace(/\s/g, '')
        });

        const parameters = connectorData.actions.find(action => action.name === operation)?.parameters || null;

        setParameters(parameters);

    };

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    useEffect(() => {
        fetchConnections();
    }, [props.formData]);

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0 && sidePanelContext.formValues?.parameters) {
            if (sidePanelContext.formValues.form) {
                sidePanelContext.formValues?.parameters.forEach((param: any) => {
                    const inputType = getInputType(formData, param.name);
                    param.name = getNameForController(param.name);
                    if (expressionFieldTypes.includes(inputType)) {
                        if (param.isExpression) {
                            let namespacesArray: any[] = [];
                            if (param.namespaces) {
                                namespacesArray = Object.entries(param.namespaces).map(([prefix, uri]) => ({ prefix: prefix.split(':')[1], uri: uri }));
                            }
                            setValue(param.name, { isExpression: true, value: param.value.replace(/[{}]/g, ''), namespaces: namespacesArray });
                        } else {
                            param.namespaces = [];
                            setValue(param.name, param);
                        }
                    } else {
                        setValue(param.name, param.value);
                    }
                });
            } else {
                //Handle connectors without uischema
                fetchParameters(sidePanelContext.formValues.operationName);

                sidePanelContext.formValues?.parameters.forEach((param: any) => {
                    param.name = getNameForController(param.name);
                    if (param.isExpression) {
                        let namespacesArray: any[] = [];
                        if (param.namespaces) {
                            namespacesArray = Object.entries(param.namespaces).map(([prefix, uri]) => ({ prefix: prefix.split(':')[1], uri: uri }));
                        }
                        setValue(param.name, { isExpression: true, value: param.value.replace(/[{}]/g, ''), namespaces: namespacesArray });
                    } else {
                        param.namespaces = [];
                        setValue(param.name, param);
                    }
                });

                const modifiedParams = {
                    ...params, paramValues: generateParams(sidePanelContext.formValues.parameters)
                };
                setParams(modifiedParams);
            }

            if (sidePanelContext.formValues?.connectionName) {
                setValue('configKey', sidePanelContext.formValues?.connectionName);
            }
        }
    }, [sidePanelContext.formValues]);

    const findAllowedConnectionTypes = (elements: any): string[] | undefined => {
        for (let element of elements) {
            if (element.type === 'attribute' && element.value.inputType === 'connection') {
                return element.value.allowedConnectionTypes;
            }
            if (element.type === 'attributeGroup') {
                return findAllowedConnectionTypes(element.value.elements);
            }
        }
    };

    function getNameForController(name: string | number) {
        return String(name).replace('.', '__dot__');
    }

    function getOriginalName(name: string) {
        return name.replace('__dot__', '.');
    }

    function getInputType(formData: any, paramName: string): string {
        let inputType = null;

        function traverseElements(elements: any) {
            for (let element of elements) {
                if (element.type === 'attribute' && element.value.name === paramName) {
                    inputType = element.value.inputType;
                    return;
                }

                if (element.type === 'attributeGroup') {
                    traverseElements(element.value.elements);
                }
            }
        }

        traverseElements(formData.elements);

        return inputType;
    }

    const addNewConnection = async () => {

        // Get Connector Data from LS
        const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({
            documentUri: props.documentUri,
            connectorName: props.connectorName.toLowerCase().replace(/\s/g, '')
        });

        rpcClient.getMiVisualizerRpcClient().openView({
            type: POPUP_EVENT_TYPE.OPEN_VIEW,
            location: {
                documentUri: props.documentUri,
                view: MACHINE_VIEW.ConnectionForm,
                customProps: {
                    allowedConnectionTypes: findAllowedConnectionTypes(props.formData.elements ?? ""),
                    connector: connectorData,
                    fromSidePanel: true
                }
            },
            isPopup: true
        });

        rpcClient.onParentPopupSubmitted(async (data: ParentPopupData) => {
            if (data.recentIdentifier) {
                await fetchConnections();
                setValue('configKey', data.recentIdentifier);
            }
        });
    }

    const onClick = async (values: any) => {
        setDiagramLoading(true);

        params.paramValues.forEach(param => {
            setValue(param.key, { "value": param.value });
        });

        const template = create();

        const connectorName = props.formData?.connectorName ??
            props.connectorName?.toLowerCase().replace(/\s/g, '') ??
            sidePanelContext.formValues.connectorName;

        const operationName = props.formData?.operationName ?? props.operationName ??
            sidePanelContext.formValues.operationName;

        if (!sidePanelContext.formValues?.form && !sidePanelContext.formValues?.parameters) {
            // Get values set through param manager when no UISchema/template is present
            values = getValues();
        }

        const root = template.ele(`${connectorName}${operationName ? `.${operationName}` : ''}`);
        root.att('configKey', props.connectionName ?? values['configKey']);

        // Fill the values
        Object.keys(values).forEach((key: string) => {
            if (key !== 'configRef' && key !== 'configKey' && values[key]) {
                if (typeof values[key] === 'object' && values[key] !== null) {
                    // Handle expression input type
                    const namespaces = values[key].namespaces;
                    const value = values[key].value;
                    const isExpression = values[key].isExpression;
                    const name = getOriginalName(key);

                    if (value) {
                        if (isExpression) {
                            if (namespaces && namespaces.length > 0) {
                                // Generate XML with namespaces
                                const element = root.ele(name);
                                namespaces.forEach((namespace: any) => {
                                    element.att(`xmlns:${namespace.prefix}`, namespace.uri);
                                });
                                element.txt(`{${value}}`);
                            } else {
                                root.ele(name).txt(`{${value}}`);
                            }
                        } else {
                            root.ele(name).txt(value);
                        }
                    }
                } else {
                    const value = values[key];
                    if (typeof value === 'string' && value.includes('<![CDATA[')) {
                        // Handle CDATA
                        const cdataContent = value.replace('<![CDATA[', '').replace(']]>', '');
                        root.ele(getOriginalName(key)).dat(cdataContent);
                    } else {
                        root.ele(getOriginalName(key)).txt(value);
                    }
                }
            }
        });

        const modifiedXml = template.end({ prettyPrint: true, headless: true });

        rpcClient.getMiDiagramRpcClient().applyEdit({
            documentUri: documentUri, range: nodePosition, text: modifiedXml
        });

        if (connectorName === 'redis') {
            rpcClient.getMiDiagramRpcClient().updateDependencyInPom({
                groupId: "redis.clients",
                artifactId: "jedis",
                version: "3.6.0",
                file: props.documentUri
            });
        }

        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            isOpen: false,
            isEditing: false,
            formValues: undefined,
            nodeRange: undefined,
            operationName: undefined
        });

    };

    function generateParams(parameters: any[]) {
        return parameters.map((param: any, id) => {
            return {
                id: id,
                key: param.name,
                value: param.value,
                icon: "query",
                paramValues: [
                    {
                        value: param.name,
                    },
                    {
                        value: param.value,
                    },
                ]
            }
        });
    }


    if (isLoading) {
        return <ProgressIndicator />;
    }

    return (
        <div style={{ padding: "20px" }}>
            {isLoading ?
                <ProgressIndicator /> :
                !formData ? (
                    // When no UISchema present
                    ((parameters && parameters.length > 0) ? (
                        // Render parameters when template is present for operation
                        <>
                            <Field>
                                <Controller
                                    name="configKey"
                                    control={control}
                                    defaultValue={connections[0]}
                                    render={({ field }) => (
                                        <>
                                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: '100%', gap: '10px' }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: '10px' }}>
                                                    <label>{"Connection"}</label>
                                                </div>
                                                <LinkButton onClick={() => addNewConnection()}>
                                                    <Codicon name="plus" />Add new connection
                                                </LinkButton>
                                            </div>
                                            <AutoComplete
                                                name="configKey"
                                                items={connections}
                                                value={field.value}
                                                onValueChange={(e: any) => {
                                                    field.onChange(e);
                                                }}
                                            />
                                        </>
                                    )}
                                />
                            </Field>
                            {parameters.map((element) => (
                                <Field>
                                    <Controller
                                        name={element}
                                        control={control}
                                        defaultValue={{ "isExpression": false, "value": "", "namespaces": [] }}
                                        render={({ field }) => (
                                            <ExpressionField
                                                {...field} label={element}
                                                placeholder={element}
                                                canChange={true}
                                                required={false}
                                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                            />
                                        )}
                                    />
                                </Field>
                            ))}
                            <div style={{ display: "flex", textAlign: "right", justifyContent: "flex-end", marginTop: "10px" }}>
                                <Button
                                    appearance="primary"
                                    onClick={handleSubmit(onClick)}
                                >
                                    Submit
                                </Button>
                            </div>
                        </>
                    ) : (
                        // Render connection selection field when no template is present
                        <>
                            <Field>
                                <Controller
                                    name="configKey"
                                    control={control}
                                    defaultValue={connections[0]}
                                    render={({ field }) => (
                                        <>
                                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: '100%', gap: '10px' }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: '10px' }}>
                                                    <label>{"Connection"}</label>
                                                </div>
                                                <LinkButton onClick={() => addNewConnection()}>
                                                    <Codicon name="plus" />Add new connection
                                                </LinkButton>
                                            </div>
                                            <AutoComplete
                                                name="configKey"
                                                items={connections}
                                                value={field.value}
                                                onValueChange={(e: any) => {
                                                    field.onChange(e);
                                                }}
                                            />
                                        </>
                                    )}
                                />
                            </Field>
                            <div style={{ display: "flex", textAlign: "right", justifyContent: "flex-end", marginTop: "10px" }}>
                                <Button
                                    appearance="primary"
                                    onClick={handleSubmit(onClick)}
                                >
                                    Submit
                                </Button>
                            </div>
                        </>
                    ))
                ) :
                    <>
                        {/* {renderForm(props.formData.elements)} */}
                        <FormGenerator
                            formData={formData}
                            control={control}
                            errors={errors}
                            setValue={setValue}
                            reset={reset}
                            watch={watch}
                            getValues={getValues}
                            skipGeneralHeading={true}
                            ignoreFields={["connectionName"]} />
                        <div style={{ display: "flex", textAlign: "right", justifyContent: "flex-end", marginTop: "10px" }}>
                            <Button
                                appearance="primary"
                                onClick={handleSubmit(onClick)}
                            >
                                Submit
                            </Button>
                        </div>
                    </>
            }
        </div>
    );
};

export default AddConnector;
