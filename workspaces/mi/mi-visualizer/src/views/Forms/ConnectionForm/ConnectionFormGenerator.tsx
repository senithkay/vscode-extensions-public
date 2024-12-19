/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from 'react';
import { AutoComplete, Button, FormActions, FormView, TextField, Codicon } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { create } from 'xmlbuilder2';
import { useForm, Controller } from 'react-hook-form';
import { EVENT_TYPE, MACHINE_VIEW, POPUP_EVENT_TYPE } from '@wso2-enterprise/mi-core';
import { TypeChip } from '../Commons';
import { ParamConfig, ParamManager, FormGenerator } from '@wso2-enterprise/mi-diagram';
import { formatForConfigurable, isConfigurable, removeConfigurableFormat } from '../Commons/utils';

const ParamManagerContainer = styled.div`
    width: 100%;
`;

export interface AddConnectionProps {
    path: string;
    connectionType?: string;
    connector?: any;
    connectionName?: string;
    changeConnectionType?: () => void;
    fromSidePanel?: boolean;
    isPopup?: boolean;
    handlePopupClose?: () => void;
}

const expressionFieldTypes = ['stringOrExpression', 'integerOrExpression', 'textAreaOrExpression', 'textOrExpression', 'stringOrExpresion'];

export function AddConnection(props: AddConnectionProps) {
    const { handlePopupClose } = props;
    const { rpcClient } = useVisualizerContext();

    const [formData, setFormData] = useState(undefined);
    const [connections, setConnections] = useState([]);
    const [connectionSuccess, setConnectionSuccess] = useState(null);
    const [isTesting, setIsTesting] = useState(false);
    const { control, handleSubmit, setValue, getValues, watch, reset, formState: { errors } } = useForm<any>({
        defaultValues: {
            name: props.connectionName ?? ""
        }
    });
    const [connectionType, setConnectionType] = useState(props.connectionType ?? "");

    useEffect(() => {
        const fetchConnections = async () => {
            const connectionData: any = await rpcClient.getMiDiagramRpcClient().getConnectorConnections({
                documentUri: props.path,
                connectorName: null
            });

            let connectionNames: any[] = [];
            Object.keys(connectionData).forEach(key => {
                const connections = connectionData[key].connections.map((connection: any) => connection.name);
                connectionNames = connectionNames.concat(connections);
            });

            setConnections(connectionNames);
        }

        const fetchFormData = async () => {
            // Fetch form on creation

            const connectionSchema = await rpcClient.getMiDiagramRpcClient().getConnectionSchema({
                connectorName: props.connector.name,
                connectionType: connectionType });

            setFormData(connectionSchema);
            reset({
                name: watch('name'),
                connectionType: connectionType
            });
        };

        (async () => {
            // Fetch connections and form data for connection creation
            if (!props.connectionName) {
                await fetchConnections();
                await fetchFormData();
            }
        })();
    }, [connectionType]);

    useEffect(() => {
        const fetchFormData = async () => {
            // If connectionName is provided, it is an update operation
            if (props.connectionName) {
                const connectionData: any = await rpcClient.getMiDiagramRpcClient().getConnectorConnections({
                    documentUri: props.path,
                    connectorName: null
                });

                const connectionFound = Object.values(connectionData).flatMap((key: any) => key.connections).find((connection: any) => connection.name === props.connectionName);

                if (!connectionFound) {
                    return
                }
                const connector = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({
                    documentUri: props.path, connectorName: connectionFound.connectorName
                });
                props.connector.name = connector.name;

                const connectionSchema = await rpcClient.getMiDiagramRpcClient().getConnectionSchema({
                    documentUri: props.path  });
                setConnectionType(connectionFound.connectionType);
                setFormData(connectionSchema);
                reset({
                    name: props.connectionName,
                    connectionType: connectionType
                });

                const parameters = connectionFound.parameters

                // Populate form with existing values
                if (connectionSchema === undefined) {
                    // Handle connections without uischema
                    // Remove connection name from param manager fields
                    const filteredParameters = parameters.filter((param: { name: string; }) => param.name !== 'name');

                    const modifiedParams = {
                        ...params, paramValues: generateParams(filteredParameters)
                    };
                    setParams(modifiedParams);
                }
            }
        }
        (async () => {
            await fetchFormData();
        })();
    }, [props.connectionName]);

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

    const handleOnChange = (params: any) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: param.paramValues[0].value,
                    value: param.paramValues[1].value,
                    icon: "query"
                }
            })
        };
        setParams(modifiedParams);
    };

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

    const onAddConnection = async (values: any) => {

        const template = create();
        const localEntryTag = template.ele('localEntry', { key: getValues("name"), xmlns: 'http://ws.apache.org/ns/synapse' });
        const connectorTag = localEntryTag.ele(`${formData.connectorName ?? props.connector.name}.init`);
        connectorTag.ele('connectionType').txt(connectionType);

        if (errors && Object.keys(errors).length > 0) {
            console.error("Errors in saving connection form", errors);
        }

        // Fill the values
        Object.keys(values).forEach((key: string) => {
            if ((key !== 'configRef' && key !== 'connectionType' && key !== 'connectionName') && values[key]) {
                if (typeof values[key] === 'object' && values[key] !== null) {
                    // Handle expression input type
                    const namespaces = values[key].namespaces;
                    const value = values[key].value;
                    const isExpression = values[key].isExpression;

                    if (value) {
                        if (isExpression) {
                            if (namespaces && namespaces.length > 0) {
                                // Generate XML with namespaces
                                const element = connectorTag.ele(key);
                                namespaces.forEach((namespace: any) => {
                                    element.att(`xmlns:${namespace.prefix}`, namespace.uri);
                                });
                                element.txt(`{${value}}`);
                            } else {
                                connectorTag.ele(key).txt(`{${value}}`);
                            }
                        } else {
                            connectorTag.ele(key).txt(value);
                        }
                    }
                } else {
                    const value = values[key];
                    if (typeof value === 'string' && value.includes('<![CDATA[')) {
                        // Handle CDATA
                        const cdataContent = value.replace('<![CDATA[', '').replace(']]>', '');
                        connectorTag.ele(key).dat(cdataContent);
                    } else {
                        connectorTag.ele(key).txt(value);
                    }
                }
            }
        });

        const modifiedXml = template.end({ prettyPrint: true, headless: true });

        const visualizerState = await rpcClient.getVisualizerState();
        const projectUri = visualizerState.projectUri;
        const sep = visualizerState.pathSeparator;
        const localEntryPath = [projectUri, 'src', 'main', 'wso2mi', 'artifacts', 'local-entries'].join(sep);

        await rpcClient.getMiDiagramRpcClient().createConnection({
            connectionName: getValues("name"),
            keyValuesXML: modifiedXml,
            directory: localEntryPath,
            filePath: props.connectionName ? props.path : ""
        });

        if (props.isPopup) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: POPUP_EVENT_TYPE.CLOSE_VIEW,
                location: { view: null, recentIdentifier: getValues("name") },
                isPopup: true
            });
        } else {
            // Open Overview
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
        }
    };

    const onAddInitConnection = async () => {

        const name = getValues("name") ?? 'CONNECTION_1';
        const template = create();

        const localEntryTag = template.ele('localEntry', { key: getValues("name"), xmlns: 'http://ws.apache.org/ns/synapse' });
        const connectorTag = localEntryTag.ele(`${props.connector.name}.init`);
        connectorTag.ele('name', getValues("name"));

        params.paramValues.forEach(param => {
            connectorTag.ele(param.key).txt(param.value);
        })

        const modifiedXml = template.end({ prettyPrint: true, headless: true });

        const visualizerState = await rpcClient.getVisualizerState();
        const projectUri = visualizerState.projectUri;
        const sep = visualizerState.pathSeparator;
        const localEntryPath = [projectUri, 'src', 'main', 'wso2mi', 'artifacts', 'local-entries'].join(sep);

        await rpcClient.getMiDiagramRpcClient().createConnection({
            connectionName: name,
            keyValuesXML: modifiedXml,
            directory: localEntryPath,
            filePath: props.connectionName ? props.path : ""
        });

        if (props.isPopup) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: POPUP_EVENT_TYPE.CLOSE_VIEW,
                location: { view: null, recentIdentifier: name },
                isPopup: true
            });
        } else {
            // Open Overview
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
        }
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

    const handleOnClose = () => {
        if (props.fromSidePanel) {
            handlePopupClose();
        } else if (props.changeConnectionType) {
            props.changeConnectionType();
        } else {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
        }
    }

    const testConnection = async (values: any) => {
        setIsTesting(true);
        try {
            const testResponse = await rpcClient.getMiDiagramRpcClient().testConnectorConnection({
                connectorName: props.connector.name,
                connectionType: connectionType,
                parameters: getValues()
            });
            setConnectionSuccess(testResponse.isConnectionValid);
            if (testResponse.errorMessage) {
                if (!testResponse.isConnectionTested) {
                    console.error("Test connection failed", testResponse.errorMessage);
                } else if (!testResponse.isConnectionValid) {
                    console.error("Connection parameters are incorrect", testResponse.errorMessage);
                }
            }
        } catch (error) {
            console.error("Error in testing connection", error);
            setConnectionSuccess(false);
        } finally {
            setIsTesting(false);
        }
    }

    const ConnectionName = <Controller
        name="name"
        control={control}
        rules={{
            required: "Connection name is required",
            validate: (value) => {
                if (connections.includes(value)) {
                    return "Connection name already exists";
                }
                return true;
            }
        }}
        render={({ field }) => (
            <TextField
                {...field}
                label="Connection Name"
                size={50}
                placeholder="The name for the file connection"
                required={true}
                errorMsg={errors.name && errors.name.message.toString()} />
        )} />;
    return (
        <FormView title={`Add New Connection`} onClose={handlePopupClose ?? handleOnClose}>
            {!props.fromSidePanel && <TypeChip
                type={connectionType}
                onClick={props.changeConnectionType}
                showButton={!props.connectionName}
                id='Connection:'
            />}
            {formData ? (
                <>
                    {ConnectionName}
                    <>
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
                        <FormActions>
                            {formData.testConnectionEnabled && <div style={{ display: 'flex', alignItems: 'center', marginRight: 'auto' }}>
                                <Button
                                    appearance='primary'
                                    onClick={testConnection}
                                    sx={{ marginRight: '10px' }}
                                >
                                    Test Connection
                                </Button>
                                {isTesting ? (
                                    <Codicon name="loading" iconSx={{ color: 'blue' }} sx={{ marginRight: '10px' }} />
                                ) : connectionSuccess !== null ? (
                                    connectionSuccess ? (
                                        <Codicon name="pass" iconSx={{ color: 'green' }} sx={{ marginRight: 'auto' }} />
                                    ) : (
                                        <Codicon name="error" iconSx={{ color: 'red' }} sx={{ marginRight: 'auto' }} />
                                    )
                                ) : null}
                            </div>}
                            <Button
                                appearance="primary"
                                onClick={handleSubmit(onAddConnection)}
                            >
                                {props.connectionName ? "Update" : "Add"}
                            </Button>
                            <Button
                                appearance="secondary"
                                onClick={handleOnClose}
                            >
                                Cancel
                            </Button>
                        </FormActions>
                    </>
                </>
            ) : (
                // If no uiSchema is available, show param manager
                <>
                    {ConnectionName}
                    <ParamManagerContainer>
                        <ParamManager
                            paramConfigs={params}
                            readonly={false}
                            onChange={handleOnChange} />
                    </ParamManagerContainer>
                    <FormActions>
                        <Button
                            appearance="primary"
                            onClick={onAddInitConnection}
                        >
                            {props.connectionName ? "Update" : "Add"}
                        </Button>
                        <Button
                            appearance="secondary"
                            onClick={handleOnClose}
                        >
                            Cancel
                        </Button>
                    </FormActions>
                </>
            )}
        </FormView>
    );
};

export default AddConnection;
