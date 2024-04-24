/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { Dropdown, Button, TextField, Typography, Accordion, CheckBox, ParamManager, TextArea } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { driverMap, engineOptions, propertyParamConfigs } from "./types";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { dataSourceParams } from "./ParamTemplate";
import ParamField from "../Commons/ParamField";

const WizardContainer = styled.div`
    width: 95%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    overflow-y: auto;
`;

const ActionContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 20px;
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
    height: 50px;
    align-items: center;
    justify-content: flex-start;
`;

export interface DataSourceFormProps {
    path: string;
}

export function DataSourceWizard(props: DataSourceFormProps) {
    const { rpcClient } = useVisualizerContext();
    const [dataSourceName, setDataSourceName] = useState("");
    const [description, setDescription] = useState("");
    const [dataSourceType, setDataSourceType] = useState("RDBMS");
    const [dataSourceProvider, setDataSourceProvider] = useState("default");
    const [driver, setDriver] = useState("com.mysql.jdbc.Driver");
    const [url, setUrl] = useState("jdbc:mysql://[machine-name/ip]:[port]/[database-name]");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [engine, setEngine] = useState("MySQL");
    const [customDSType, setCustomDSType] = useState("");
    const [jndiName, setJndiName] = useState("");
    const [useDatasourceFactory, setUseDatasourceFactory] = useState(false);
    const [existingFilePath,] = useState(props.path);
    const [dsConfigParams,] = useState<any>(dataSourceParams);
    const [jndiProperties, setJndiProperties] = useState(propertyParamConfigs);
    const [dsProperties, setDsProperties] = useState(propertyParamConfigs);
    const [dsClassName, setDSClassName] = useState("");
    const [paramState, setParamState] = useState<{ [key: string]: string | boolean | number }>({});
    const [customConfiguration, setCunstomConfiguration] = useState("");
    const [isUpdate, setIsUpdate] = useState(false);

    useEffect(() => {
        const newParamState: { [key: string]: any } = {};
        Object.keys(dsConfigParams).forEach((key: string) => {
            newParamState[key] = dsConfigParams[key].defaultValue;
        });
        setParamState(newParamState);
    }, [dsConfigParams]);

    useEffect(() => {
        if (existingFilePath.endsWith(".xml")) {
            setIsUpdate(true);
            (async () => {
                const response = await rpcClient.getMiDiagramRpcClient().getDataSource({ path: props.path });
                setDataSourceName(response.name);
                setDescription(response.description);
                if (response.type === "RDBMS") {
                    setUsername(response.username);
                    setPassword(response.password);
                    setDriver(response.driverClassName);
                    setUrl(response.url);
                    setParamState((prev: any) => ({ ...prev, ...response.dataSourceConfigParameters }));
                    if (response.jndiConfig) {
                        setJndiName(response.jndiConfig.JNDIConfigName);
                        setUseDatasourceFactory(response.jndiConfig.useDataSourceFactory);
                        if (response.jndiConfig.properties) {
                            let i = 0;
                            setJndiProperties((prevState) => ({
                                ...prevState,
                                paramValues: Object.entries(response.jndiConfig.properties).map(([key, value]) => {
                                    return {
                                        id: i++,
                                        key: "Property " + i,
                                        value: key + " : " + value,
                                        paramValues: [
                                            { value: key.toString() },
                                            { value: value.toString() }
                                        ]
                                    };
                                }),
                            }));
                        }
                    }
                    setDataSourceType(response.type);
                    if (response.externalDSClassName) {
                        setDataSourceProvider("External Datasource");
                        setDSClassName(response.externalDSClassName);
                        if (response.dataSourceProperties) {
                            let i = 0;
                            setDsProperties((prevState) => ({
                                ...prevState,
                                paramValues: Object.entries(response.dataSourceProperties).map(([key, value]) => {
                                    return {
                                        id: i++,
                                        key: "Property " + i,
                                        value: key + " : " + value,
                                        paramValues: [
                                            { value: key.toString() },
                                            { value: value.toString() }
                                        ]
                                    };
                                }),
                            }));
                        }
                        console.log(dsProperties);
                    }
                } else {
                    setCustomDSType(response.customDSType);
                    setCunstomConfiguration(response.customDSConfiguration);
                }
            })();
        }
    }, [props.path]);

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleSave = async () => {
        const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({ path: props.path })).path;
        const request = {
            projectDirectory: projectDir,
            name: dataSourceName,
            description: description,
            type: dataSourceType,
            username: username,
            password: password,
            driverClassName: driver,
            url: url,
            customDSType: customDSType,
            customDSConfiguration: customConfiguration,
            externalDSClassName: dsClassName,
            jndiConfig: undefined as any,
            dataSourceConfigParameters: undefined as any,
            dataSourceProperties: undefined as any
        }
        if (jndiName) {
            request.jndiConfig = {
                JNDIConfigName: jndiName,
                useDataSourceFactory: useDatasourceFactory,
                properties: undefined as any
            }
        }
        const filteredParamState: { [key: string]: string | boolean | number } = Object.entries(paramState).reduce((accumulator, [key, value]) => {
            if (value !== undefined) {
                accumulator[key as string] = value;
            }
            return accumulator;
        }, {} as { [key: string]: string | boolean | number });
        if (Object.keys(filteredParamState).length > 0) {
            request.dataSourceConfigParameters = filteredParamState;
        }
        if (dsClassName) {
            const dsPropertiesMap = dsProperties.paramValues.reduce((map, entry) => {
                const key = entry.paramValues[0].value.toString();
                const value = entry.paramValues[1].value.toString();
                map[key] = value;
                return map;
            }, {} as { [key: string]: string });
            request.dataSourceProperties = dsPropertiesMap;
        }
        if (jndiProperties.paramValues.length > 0) {
            const jndiPropertiesMap = jndiProperties.paramValues.reduce((map, entry) => {
                const key = entry.paramValues[0].value.toString();
                const value = entry.paramValues[1].value.toString();
                map[key] = value;
                return map;
            }, {} as { [key: string]: string });
            request.jndiConfig.properties = jndiPropertiesMap;
        }

        const regfilePath = await rpcClient.getMiDiagramRpcClient().createDataSource(request);
        rpcClient.getMiDiagramRpcClient().openFile(regfilePath);
        rpcClient.getMiDiagramRpcClient().closeWebView();
    }

    const handleFormatChange = (value: string) => {
        setDataSourceProvider(value);
    }

    const handleEngineChange = (value: string) => {
        setEngine(value);
        const driverUrl = driverMap.get(value);
        if (driverUrl) {
            setDriver(driverUrl.driver);
            setUrl(driverUrl.url);
        }
    }

    const handleParamChange = (field: string, value: any) => {
        setParamState((prev: any) => {
            return { ...prev, [field]: value };
        });
    }

    const handleParamOnError = (field: string) => {
        const param = dsConfigParams[field];
        if (param.validation) {
            if (param.validation.isNumber && isNaN(Number(paramState[field]))) {
                return "Please enter a valid number";
            }
        }
        return "";
    }

    const validateURL = (name: string) => {
        if (name === driverMap.get(engine)?.url) {
            return "Update the URL by removing placeholders and adding the actual values";
        }
        return "";
    }

    const generateDisplayValue = (paramValues: any) => {
        const result: string = paramValues.parameters[0].value + " : " + paramValues.parameters[1].value;
        return result.trim();
    };

    const onChangeJNDIProperties = (params: any) => {
        var i: number = 1;
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: "Property " + i++,
                    value: generateDisplayValue(param),
                    icon: "query"
                }
            })
        };
        setJndiProperties(modifiedParams);
    };

    const onChangeDSProperties = (params: any) => {
        var i: number = 1;
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: "Property " + i++,
                    value: generateDisplayValue(param),
                    icon: "query"
                }
            })
        };
        setDsProperties(modifiedParams);
    };

    return (
        <WizardContainer>
            <Accordion header="New Datasource" isExpanded={true}>
                <TextField
                    value={dataSourceName}
                    id='ds-name-input'
                    label="Data source name"
                    placeholder="DataSource1"
                    onTextChange={(text: string) => setDataSourceName(text)}
                    size={40}
                    autoFocus
                    required
                />
                <TextField
                    value={description}
                    id='ds-description-input'
                    label="Description"
                    onTextChange={(text: string) => setDescription(text)}
                    size={40}
                />
                <Typography variant="caption">Datasource Type</Typography>
                <Dropdown items={[{ id: "rdbms", value: "RDBMS" }, { id: "custom", value: "Custom" }]} value={dataSourceType} onValueChange={(text: string) => setDataSourceType(text)} id="datasource-type" />
                {dataSourceType === "RDBMS" && <>
                    <Typography variant="caption">Data source provider</Typography>
                    <Dropdown items={[{ id: "default", value: "default" }, { id: "external", value: "External Datasource" }]} value={dataSourceProvider} onValueChange={handleFormatChange} id="provider" />
                    {dataSourceProvider === "default" && <>
                        <Typography variant="caption">Database Engine</Typography>
                        <Dropdown items={engineOptions} onValueChange={handleEngineChange} id="format" value={engine} />
                        <TextField
                            value={driver}
                            id='ds-driver'
                            label="Driver"
                            onTextChange={(text: string) => setDriver(text)}
                            size={150}
                            required
                        />
                        <TextField
                            value={url}
                            id='ds-url'
                            label="URL"
                            onTextChange={(text: string) => setUrl(text)}
                            size={150}
                            errorMsg={validateURL(url)}
                            required
                        />
                        <TextField
                            value={username}
                            id='ds-username'
                            label="User Name"
                            onTextChange={(text: string) => setUsername(text)}
                            size={50}
                            required
                        />
                        <TextField
                            value={password}
                            id='ds-password'
                            label="Password"
                            onTextChange={(text: string) => setPassword(text)}
                            size={50}
                            required
                        />
                    </>} {dataSourceProvider === "External Datasource" && <>
                        <TextField
                            value={dsClassName}
                            id='ds-class-name'
                            label="Datasource Class Name"
                            onTextChange={(text: string) => setDSClassName(text)}
                            size={50}
                            required
                        />
                        <ParamManager
                            paramConfigs={dsProperties}
                            readonly={false}
                            onChange={onChangeDSProperties} />
                    </>}
                </>} {dataSourceType === "Custom" && <>
                    <TextField
                        value={customDSType}
                        id='ds-custom-type'
                        label="Custom Datasource Type"
                        onTextChange={(text: string) => setCustomDSType(text)}
                        size={50}
                        required
                    />
                    <TextArea
                        value={customConfiguration}
                        id='ds-custom-config'
                        label="Custom Configuration"
                        onTextChange={(text: string) => setCunstomConfiguration(text)}
                        required
                    />
                </>
                }
            </Accordion>
            {dataSourceType === "RDBMS" && <>
                <Accordion header="Datasource Configuration Parameters" isExpanded={false}>
                    {dsConfigParams && Object.keys(dsConfigParams).map((key: string) => (
                        <ParamField
                            key={key}
                            id={key}
                            field={dsConfigParams[key]}
                            stateValue={paramState[key]}
                            handleOnChange={handleParamChange}
                            handleOnError={handleParamOnError}
                        />
                    ))}
                </Accordion>
                <Accordion header="Expose as a JNDI Datasource" isExpanded={true}>
                    <TextField
                        value={jndiName}
                        id='ds-jndi-name'
                        label="JNDI Configuration Name"
                        onTextChange={(text: string) => setJndiName(text)}
                        size={50}
                        required
                    />
                    <CheckBox
                        value="useDatasourceFactory"
                        label="Use Datasource Factory"
                        checked={useDatasourceFactory}
                        onChange={(checked: boolean) => setUseDatasourceFactory(checked)}
                    />
                    <ParamManager
                        paramConfigs={jndiProperties}
                        readonly={false}
                        onChange={onChangeJNDIProperties} />
                </Accordion>
            </>}
            <br />
            <ActionContainer>
                <Button appearance="secondary" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button disabled={dataSourceName === ''} onClick={handleSave}>
                    {isUpdate ? 'Update' : 'Create'}
                </Button>
            </ActionContainer>
        </WizardContainer >
    );
}
