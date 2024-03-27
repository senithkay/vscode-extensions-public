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
import { AutoComplete, Button, TextField, Codicon , Typography } from "@wso2-enterprise/ui-toolkit";
import { SectionWrapper } from "../Commons";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import  SampleTable  from "./Table";
import {messageStoreTypes,preConfiguredProfiles,rdbmsTypes} from './types';
import { rabbitMQInitialValues, jmsInitialValues, jdbcInitialValues, wso2MbInitialValues, resequenceInitialValues, poolInitialValues,carbonDatasourceInitialValues, sslInitialValues } from './typeValues';
import { CreateMessageStoreRequest } from "@wso2-enterprise/mi-core";
import path from "path";

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

export type CustomParameter={
    name: string,
    value: string,
    selected: boolean
}
export interface MessageStoreWizardProps{
    path:string
}

export function MessageStoreWizard(props: MessageStoreWizardProps) {
    const { rpcClient } = useVisualizerContext();
    const [messageStore, setMessageStore] = useState({
        name: "",
        type: "JMS Message Store",
        initialContextFactory: "",
        providerURL: "",
        connectionFactory: "",
        jndiQueueName: "",
        userName: "",
        password: "",
        cacheConnection: "false",
        jmsAPIVersion: "1.1",
        rabbitMQServerHostName: "",
        rabbitMQServerPort: "",
        sslEnabled: "",
        trustStoreLocation: "",
        trustStoreType: "",
        trustStorePassword: "",
        keyStoreLocation: "",
        keyStoreType: "",
        keyStorePassword: "",
        sslVersion: "",
        rabbitMQQueueName: "",
        rabbitMQExchangeName: "",
        routineKey: "",
        virtualHost: "",
        dataBaseTable: "",
        driver: "",
        url: "",
        user: "",
        dataSourceName: "",
        queueConnectionFactory: "",
        pollingCount: "",
        xPath: "",
        enableProducerGuaranteedDelivery: "",
        providerClass: "",
        customParameters: [] ,
        failOverMessageStore: ""
    });
    const [projectDir, setProjectDir] = useState("");
    const [rows, setRows] = useState<CustomParameter[]>([]);
    const [existingFilePath, setExistingFilePath] = useState(props.path);
    const isNewTask = !existingFilePath.endsWith(".xml");
    const [preConfiguredProfile, setPreConfiguredProfile] = useState("Other");
    const [connectionInformationType, setConnectionInformationType] = useState("Pool");
    const [rdbmsType, setRdbmsType] = useState("Other");
    const [message, setMessage] = useState({
        isError: false,
        text: ""
    });
    const [fallOverMessageStores, setFallOverMessageStores] = useState([]);
    
    useEffect(() => {
        const INVALID_CHARS_REGEX = /[@\\^+;:!%&,=*#[\]$?'"<>{}() /]/;
        const VALID_URI_REGEX = /^(https?:\/\/)?www\.[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
        const VALID_ONLY_NUMBERS_REGEX = /^[0-9]*$/;
        const VALID_JDBC_URL_REGEX = /^(jdbc:)?[a-zA-Z0-9]+:\/\//;
        if(!isValid){
            handleMessage("Please fill all the required fields", true);
        } else if (INVALID_CHARS_REGEX.test(messageStore.name)) {
            handleMessage("Message Store name cannot contain special characters", true);
        } else if (!VALID_URI_REGEX.test(messageStore.providerURL) && messageStore.type === "JMS Message Store") {
            handleMessage("Provide URL should be a valid url", true);
        } else if (!VALID_ONLY_NUMBERS_REGEX.test(messageStore.pollingCount) && messageStore.type === "Resequence Message Store") {
            handleMessage("Polling count should be a number", true);
        } else if (!VALID_JDBC_URL_REGEX.test(messageStore.url) && (messageStore.type === "JDBC Message Store" || messageStore.type === "Resequence Message Store") && connectionInformationType === "Pool") {
            handleMessage("URL should be a valid url", true);
        } else {
            handleMessage("", false);
        }
    }, [messageStore]);

    useEffect(() => {
        if(isNewTask){
            switch(rdbmsType){
                case "MySQL":
                    setMessageStore((prev: any) => {
                        return{
                            ...prev,
                            driver: "com.mysql.jdbc.Driver",
                            url: "jdbc:mysql://localhost:3306/test",
                            user: "root"
                        }
                    });
                    break;
                case "Oracle":
                    setMessageStore((prev: any) => {
                        return{
                            ...prev,
                            driver: "oracle.jdbc.driver.OracleDriver",
                            url: "jdbc:oracle:thin:@localhost:1521:xe",
                            user: "root"
                        }
                    });
                    break;
                case "MS SQL":
                    setMessageStore((prev: any) => {
                        return{
                            ...prev,
                            driver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
                            url: "jdbc:sqlserver://localhost:1433;databaseName=test",
                            user: "root"
                        }
                    });
                    break;
                case "PostgreSQL":
                    setMessageStore((prev: any) => {
                        return{
                            ...prev,
                            driver: "org.postgresql.Driver",
                            url: "jdbc:postgresql://localhost:5432/test",
                            user: "root"
                        }
                    });
                    break;
                case "Other":
                    setMessageStore((prev: any) => {
                        return{
                            ...prev,
                            driver: "",
                            url: "",
                            user: ""
                        }
                    });
                    break;            
            }
        }    
    }, [rdbmsType]);
    
    useEffect(() => {
        if(isNewTask){
            if(connectionInformationType === "Pool"){
                setMessageStore((prev: any) => ({ ...prev, ...poolInitialValues()}));
            }
            if(connectionInformationType === "Carbon Datasource"){
                setMessageStore((prev: any) => ({ ...prev, ...carbonDatasourceInitialValues() }));
            }
        }
    }, [connectionInformationType]);
   
    useEffect(() => {
        (async () => {
            const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({path: props.path})).path;
            const messageStoreDir = path.join(projectDir, "src", "main", "wso2mi", "artifacts", "message-stores");
            const xmlFileNames = await rpcClient.getMiDiagramRpcClient().getXmlFileList({ path: messageStoreDir });
            setFallOverMessageStores(xmlFileNames.files);
            setProjectDir(messageStoreDir);
            if (!isNewTask) {
                if (existingFilePath.includes('/messageStore')) {
                    setExistingFilePath(existingFilePath.replace('/messageStores', '/message-stores'));
                }
                const existingMessageStore = await rpcClient.getMiDiagramRpcClient().getMessageStore({ path: existingFilePath });
                if(existingMessageStore.xPath){
                    setConnectionInformationType("Carbon Datasource");
                }
                setMessageStore(existingMessageStore);
                if(existingMessageStore.type === "Custom Message Store"){
                    existingMessageStore.customParameters.map((param: any) => {
                        setRows((prev: any) => [...prev, { name:param.name,value:param.value, selected: false }]);
                    });   
                };                
            }
        })();
    }, []);
  
    useEffect(() => {
        if(isNewTask){
            if (preConfiguredProfile === "WSO2 MB") {
                setMessageStore((prev: any) => {
                    return {
                        ...prev,
                        initialContextFactory: "org.wso2.andes.jndi.PropertiesFileInitialContextFactory",
                        providerURL: "conf/jndi.properties",
                        connectionFactory: "QueueConnectionFactory",
                    }
                })
               
            }
            if (preConfiguredProfile === "ActiveMQ") {
                return setMessageStore((prev: any) => {
                    return {
                        ...prev,
                        initialContextFactory: "org.apache.activemq.jndi.ActiveMQInitialContextFactory",
                        providerURL: "tcp://localhost:61616",
                        connectionFactory: "QueueConnectionFactory",
                    }
                });
            }
            if (preConfiguredProfile === "Other") {
                return setMessageStore((prev: any) => {
                    return {
                        ...prev,
                        initialContextFactory: "",
                        providerURL: "",
                        connectionFactory: "",
                    }
                })
            }
        }
 }  , [preConfiguredProfile]);
  
    useEffect( () => {
        if(isNewTask){
            if (messageStore.type === "JMS Message Store") {
                setMessageStore((prev: any) => ({ ...prev, ...jmsInitialValues() }));
                }
            else if (messageStore.type === "RabbitMQ Message Store") {
                setMessageStore((prev: any) => ({ ...prev, ...rabbitMQInitialValues() }));
            }   
            else if (messageStore.type === "JDBC Message Store") {
                setMessageStore((prev: any) => ({ ...prev, ...jdbcInitialValues() }));
                handleConnectionInformationTypeChange("Pool");
            }
            else if(messageStore.type === "WSO2 MB Message Store"){
                setMessageStore((prev: any) => ({ ...prev, ...wso2MbInitialValues() }));
            }
            else if(messageStore.type === "Resquence Message Store"){
                setMessageStore((prev: any) => ({ ...prev, ...resequenceInitialValues() }));
                handleConnectionInformationTypeChange("Pool");
            }
            else if(messageStore.type === "Custom Message Store"){
                setMessageStore((prev: any) => ({ ...prev, providerClass: "" }));
                setRows([]);
            }
            setMessageStore((prev: any) => ({ ...prev, enableProducerGuaranteedDelivery: "false"}));
        }
    }, [messageStore.type]);
  
    useEffect(() => {
        if (messageStore.sslEnabled === "true") {
            setMessageStore((prev: any) => ({ ...prev, ...sslInitialValues() }));
        }  
        else{
        }        
    }, [messageStore.sslEnabled]);

    const handleOnChangeMessageStore = (name:string,value:string) => {
        setMessageStore((prev: any) => {
            return {
                ...prev,
                [name]: value,
            };
        })
        }

    const handleConnectionInformationTypeChange = (type: string) => {
        setConnectionInformationType(type);
    }

    const handlePreConfiguredProfileChange = (profile: string) => {
        setPreConfiguredProfile(profile);
    }

    const handleRdbmsTypeChange = (type: string) => {
        setRdbmsType(type);
    }

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage({ isError, text });
    }

    const handleCreateMessageStore = async () => {
        if(messageStore.type === "Custom Message Store"){
            messageStore.customParameters = [];
            rows.map((row: any) => {
                messageStore.customParameters.push({ name: row.name, value: row.value });
            });
        }  
        const createMessageStoreParams: CreateMessageStoreRequest = {
            directory: projectDir,
            ...messageStore
        };
        console.log(createMessageStoreParams);
        const file= await rpcClient.getMiDiagramRpcClient().createMessageStore(createMessageStoreParams);
        rpcClient.getMiDiagramRpcClient().openFile(file);
        rpcClient.getMiDiagramRpcClient().closeWebView();
    };
  
    const handleCancel = () => {
      rpcClient.getMiDiagramRpcClient().closeWebView();
    };

    const handleBackButtonClick = () => {
      rpcClient.getMiVisualizerRpcClient().goBack();
    }  

    const handleUrlValidation = (url: string) => {
      return url.length > 0 && url.includes("http") 
    }
    
    const isValid: boolean = 
        messageStore.name?.length > 0  &&
        messageStore.type?.length > 0 &&
        (messageStore.type==="JMS Message Store" ? messageStore?.initialContextFactory?.length > 0 && messageStore?.providerURL?.length > 0  : true) &&
        (messageStore.type==="RabbitMQ Message Store" ? messageStore?.rabbitMQServerHostName?.length > 0 && messageStore?.rabbitMQServerPort?.length > 0 && messageStore?.rabbitMQQueueName?.length > 0 && messageStore?.rabbitMQExchangeName?.length > 0 && messageStore?.routineKey?.length > 0 && messageStore?.userName?.length > 0 && messageStore?.virtualHost?.length > 0 : true) &&
        (messageStore.type==="JDBC Message Store" ? messageStore?.dataBaseTable?.length > 0 && (connectionInformationType === "Pool" ? messageStore?.driver?.length > 0 && messageStore?.url?.length > 0 && messageStore?.user?.length > 0 && messageStore?.password?.length > 0 : messageStore?.dataSourceName?.length > 0) : true) &&
        (messageStore.type==="WSO2 MB Message Store" ? messageStore?.initialContextFactory?.length > 0 && messageStore?.queueConnectionFactory?.length > 0 && messageStore?.jndiQueueName?.length > 0 : true) &&
        (messageStore.type==="Resequence Message Store" ? messageStore?.dataBaseTable?.length > 0 && (connectionInformationType === "Pool" ? messageStore?.driver?.length > 0 && messageStore?.url?.length > 0 && messageStore?.user?.length > 0 && messageStore?.password?.length > 0 : messageStore?.dataSourceName?.length > 0 && messageStore?.pollingCount?.length > 0 && messageStore?.xPath?.length > 0) : true)&&
        (messageStore.type==="Custom Message Store" ? messageStore.providerClass.length > 0 : true) 
    ;

    return (
    <WizardContainer>
        <SectionWrapper>
            <Container>
                <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                <div style={{ marginLeft: 30 }}>
                    <Typography variant="h3">{isNewTask?'Create Message Store Artifact':`${messageStore.name}:Message Store`}</Typography>
                </div>
            </Container>
            <TextField
                value={messageStore.name}
                id="name-input"
                label="Message Store Name"
                placeholder="Name"
                validationMessage="Message Store name is required"
                onTextChange={(e: string) => handleOnChangeMessageStore("name",e)}
                autoFocus
                required
            />
            <AutoComplete
                label="Message Store Type"
                items={messageStoreTypes}
                selectedItem={messageStore.type}
                onChange={(e: string) => handleOnChangeMessageStore("type", e)}
                sx={{ width: "100%" }}
            />

            {messageStore.type === "JMS Message Store" && (
                <>
                    {isNewTask && (
                        <AutoComplete
                        label="Pre Configured Profiles"
                        items={preConfiguredProfiles}
                        selectedItem={preConfiguredProfile}
                        onChange={handlePreConfiguredProfileChange}
                        sx={{ width: "100%" }}
                    />
                    )}
                    <TextField
                        placeholder="Initial Context Factory"
                        label="Initial Context Factory"
                        onTextChange={(e: string) => handleOnChangeMessageStore("initialContextFactory", e)}
                        value={messageStore.initialContextFactory}
                        id="initial-context-factory-input"
                        size={100}
                        required
                    />
                    <TextField
                        placeholder="Provider URL"
                        label="Provider URL"
                        onTextChange={(e: string) => handleOnChangeMessageStore("providerURL", e)}
                        value={messageStore.providerURL}
                        id="provider-url-input"
                        size={100}
                        required
                    />
                    <TextField
                        placeholder="JNDI Queue Name"
                        label="JNDI Queue Name"
                        onTextChange={(e: string) => handleOnChangeMessageStore("jndiQueueName", e)}
                        value={messageStore.jndiQueueName}
                        id="jndi-queue-name-input"
                        size={100}
                    />
                    <TextField
                        placeholder="Connection Factory"
                        label="Connection Factory"
                        onTextChange={(e: string) => handleOnChangeMessageStore("connectionFactory", e)}
                        value={messageStore.connectionFactory}
                        id="connection-factory-input"
                        size={100}
                    />
                    <TextField
                        placeholder="User Name"
                        label="User Name"
                        onTextChange={(e: string) => handleOnChangeMessageStore("userName", e)}
                        value={messageStore.userName}
                        id="user-name-input"
                        size={100}
                    />
                    <TextField
                        placeholder="Password"
                        label="Password"
                        onTextChange={(e: string) => handleOnChangeMessageStore("password", e)}
                        value={messageStore.password}
                        id="password-input"
                        size={100}
                    />
                    <AutoComplete
                        label="Cache Connection"
                        items={["true", "false"]}
                        selectedItem={messageStore.cacheConnection}
                        onChange={(e: string) => handleOnChangeMessageStore("cacheConnection", e)}
                        sx={{ width: "100%" }}
                    />
                    <AutoComplete
                        label="JMS API Version"
                        items={["1.0", "1.1"]}
                        selectedItem={messageStore.jmsAPIVersion}
                        onChange={(e: string) => handleOnChangeMessageStore("jmsAPIVersion", e)}
                        sx={{ width: "100%" }}
                    />
                </>
            )}
    
            {messageStore.type === "Custom Message Store" && (
                <>
                    <TextField
                    placeholder="ProviderClass"
                    label="Provide Class"
                    onTextChange={(e: string) => handleOnChangeMessageStore("providerClass", e)}
                    required
                    value={messageStore.providerClass}
                    id="provider-class-input"
                    /> 
                    <span>Parameters</span>
                    <SampleTable rows={rows} setRows={setRows} />
                </>
            )}
    
            {messageStore.type === "RabbitMQ Message Store" && (
                <>
                    <TextField
                        placeholder="RabbitMQ Server Host Name"
                        label="RabbitMQ Server Host Name"
                        onTextChange={(e: string) => handleOnChangeMessageStore("rabbitMQServerHostName", e)}
                        value={messageStore.rabbitMQServerHostName}
                        id="rabbitMQ-server-host-name-input"
                        size={100}
                        required/>
                    <TextField
                        placeholder="RabbitMQ Server Port"
                        label="RabbitMQ Server Port"
                        onTextChange={(e: string) => handleOnChangeMessageStore("rabbitMQServerPort", e)}
                        value={messageStore.rabbitMQServerPort}
                        id="rabbitMQ-server-port-input"
                        size={100}
                        required/>
                    <AutoComplete
                        label="SSL Enabled"
                        items={["true", "false"]}
                        selectedItem={messageStore.sslEnabled}
                        onChange={(e: string) => handleOnChangeMessageStore("sslEnabled", e)}
                        sx={{ width: "100%" }}/>
                    {messageStore.sslEnabled === "true" && (
                        <>
                            <TextField
                                placeholder="Key Store Location"
                                label="Key Store Location"
                                onTextChange={(e: string) => handleOnChangeMessageStore("keyStoreLocation", e)}
                                value={messageStore.keyStoreLocation}
                                id="key-store-location-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="Key Store Type"
                                label="Key Store Type"
                                onTextChange={(e: string) => handleOnChangeMessageStore("keyStoreType", e)}
                                value={messageStore.keyStoreType}
                                id="key-store-type-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="Key Store Password"
                                label="Key Store Password"
                                onTextChange={(e: string) => handleOnChangeMessageStore("keyStorePassword", e)}
                                value={messageStore.keyStorePassword}
                                id="key-store-password-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="Trust Store Location"
                                label="Trust Store Location"
                                onTextChange={(e: string) => handleOnChangeMessageStore("trustStoreLocation", e)}
                                value={messageStore.trustStoreLocation}
                                id="trust-store-location-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="Trust Store Type"
                                label="Trust Store Type"
                                onTextChange={(e: string) => handleOnChangeMessageStore("trustStoreType", e)}
                                value={messageStore.trustStoreType}
                                id="trust-store-type-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="Trust Store Password"
                                label="Trust Store Password"
                                onTextChange={(e: string) => handleOnChangeMessageStore("trustStorePassword", e)}
                                value={messageStore.trustStorePassword}
                                id="trust-store-password-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="SSL Version"
                                label="SSL Version"
                                onTextChange={(e: string) => handleOnChangeMessageStore("sslVersion", e)}
                                value={messageStore.sslVersion}
                                id="ssl-version-input"
                                size={100}
                                required/>
                        </>
                    )}    
                    <TextField
                        placeholder="RabbitMQ Queue Name"
                        label="RabbitMQ Queue Name"
                        onTextChange={(e: string) => handleOnChangeMessageStore("rabbitMQQueueName", e)}
                        value={messageStore.rabbitMQQueueName}
                        id="rabbitMQ-queue-name-input"
                        size={100}
                        required/>
                    <TextField
                        placeholder="RabbitMQ Exchange Name"
                        label="RabbitMQ Exchange Name"
                        onTextChange={(e: string) => handleOnChangeMessageStore("rabbitMQExchangeName", e)}
                        value={messageStore.rabbitMQExchangeName}
                        id="rabbitMQ-exchange-name-input"
                        size={100}
                        required/>
                    <TextField
                        placeholder="Routine Key"
                        label="Routine Key"
                        onTextChange={(e: string) => handleOnChangeMessageStore("routineKey", e)}
                        value={messageStore.routineKey}
                        id="routine-key-input"
                        size={100}
                        required/>
                    <TextField
                        placeholder="User Name"
                        label="User Name"
                        onTextChange={(e: string) => handleOnChangeMessageStore("userName", e)}
                        value={messageStore.userName}
                        id="user-name-input"
                        size={100}
                        required/>
                    <TextField
                        placeholder="Password"
                        label="Password"
                        onTextChange={(e: string) => handleOnChangeMessageStore("password", e)}
                        value={messageStore.password}
                        id="user-name-input"
                        size={100}
                        required/>    
                    <TextField
                        placeholder="Virtual Host"
                        label="Virtual Host"
                        onTextChange={(e: string) => handleOnChangeMessageStore("virtualHost", e)}
                        value={messageStore.virtualHost}
                        id="virtual-host-input"
                        size={100}
                        required/>
                </>
            )}

            {messageStore.type === "JDBC Message Store" && (
                <>
                    <TextField
                        placeholder="Data Base Table"
                        label="Data Base Table"
                        onTextChange={(e: string) => handleOnChangeMessageStore("dataBaseTable", e)}
                        value={messageStore.dataBaseTable}
                        id="data-base-table-input"
                        size={100}
                        required/>
                    <AutoComplete
                        label="Connection Information Type"
                        items={["Pool", "Carbon Datasource"]}
                        selectedItem={connectionInformationType}
                        onChange={handleConnectionInformationTypeChange}
                        sx={{ width: "100%" }}/>
                    {connectionInformationType === "Pool" && (
                        <>
                            {isNewTask && (
                                <AutoComplete
                                label="RDBMS Type"
                                items={rdbmsTypes}
                                selectedItem={rdbmsType}
                                onChange={handleRdbmsTypeChange}
                                sx={{ width: "100%" }}/>
                            )}
                            <TextField
                                placeholder="Driver"
                                label="Driver"
                                onTextChange={(e: string) => handleOnChangeMessageStore("driver", e)}
                                value={messageStore.driver}
                                id="driver-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="URL"
                                label="URL"
                                onTextChange={(e: string) => handleOnChangeMessageStore("url", e)}
                                value={messageStore.url}
                                id="url-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="User"
                                label="User"
                                onTextChange={(e: string) => handleOnChangeMessageStore("user", e)}
                                value={messageStore.user}
                                id="user-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="Password"
                                label="Password"
                                onTextChange={(e: string) => handleOnChangeMessageStore("password", e)}
                                value={messageStore.password}
                                id="password-input"
                                size={100}
                                required/>
                        </>
                    )}
                    {connectionInformationType === "Carbon Datasource" && (
                        <>
                            <TextField
                                placeholder="Data Source Name"
                                label="Data Source Name"
                                onTextChange={(e: string) => handleOnChangeMessageStore("dataSourceName", e)}
                                value={messageStore.dataSourceName}
                                id="data-source-name-input"
                                size={100}
                                required/>
                        </>
                    )}    
                </>
            )}

            {messageStore.type === "WSO2 MB Message Store" && (
                <>
                    <TextField
                        placeholder="Initial Context Factory"
                        label="Initial Context Factory"
                        onTextChange={(e: string) => handleOnChangeMessageStore("initialContextFactory", e)}
                        value={messageStore.initialContextFactory}
                        id="initial-context-factory-input"
                        size={100}
                        required/>
                    <TextField
                        placeholder="Queue Connectionfactory"
                        label="Queue Connectionfactory"
                        onTextChange={(e:string) => handleOnChangeMessageStore("queueConnectionfactory", e)}
                        value={messageStore.queueConnectionFactory}
                        id="queue-connectionfactory-input"
                        size={100}
                        required/>
                    <TextField
                        placeholder="JNDI Queue Name"
                        label="JNDI Queue Name"
                        onTextChange={(e: string) => handleOnChangeMessageStore("jndiQueueName", e)}
                        value={messageStore.jndiQueueName}
                        id="jndi-queue-name-input"
                        size={100}
                        required/>
                    <AutoComplete
                        label="JMS API Version"
                        items={["1.0", "1.1"]}
                        selectedItem={messageStore.jmsAPIVersion}
                        onChange={(e: string) => handleOnChangeMessageStore("jmsAPIVersion", e)}
                        sx={{ width: "100%" }}/>
                    <AutoComplete
                        label="Cache Connection"
                        items={["true", "false"]}
                        selectedItem={messageStore.cacheConnection}
                        onChange={(e: string) => handleOnChangeMessageStore("cacheConnection", e)}
                        sx={{ width: "100%" }}/>
                </>
            )}

            {messageStore.type === "Resequence Message Store" && (
                <>
                    <TextField
                        placeholder="Data Base Table"
                        label="Data Base Table"
                        onTextChange={(e: string) => handleOnChangeMessageStore("dataBaseTable", e)}
                        value={messageStore.dataBaseTable}
                        id="data-base-table-input"
                        size={100}
                        required/>
                    <AutoComplete
                        label="Connection Information Type"
                        items={["Pool", "Carbon Datasource"]}
                        selectedItem={connectionInformationType}
                        onChange={handleConnectionInformationTypeChange}
                        sx={{ width: "100%" }}/>
                    {connectionInformationType === "Pool" && (
                        <>
                            {isNewTask && (
                                <AutoComplete
                                label="RDBMS Type"
                                items={rdbmsTypes}
                                selectedItem={rdbmsType}
                                onChange={handleRdbmsTypeChange}
                                sx={{ width: "100%" }}/>
                            )}
                            <TextField
                                placeholder="Driver"
                                label="Driver"
                                onTextChange={(e: string) => handleOnChangeMessageStore("driver", e)}
                                value={messageStore.driver}
                                id="driver-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="URL"
                                label="URL"
                                onTextChange={(e: string) => handleOnChangeMessageStore("url", e)}
                                value={messageStore.url}
                                id="url-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="User"
                                label="User"
                                onTextChange={(e: string) => handleOnChangeMessageStore("user", e)}
                                value={messageStore.user}
                                id="user-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="Password"
                                label="Password"
                                onTextChange={(e: string) => handleOnChangeMessageStore("password", e)}
                                value={messageStore.password}
                                id="password-input"
                                size={100}
                                required/>
                        </> 
                    )}
                    {connectionInformationType=== "Carbon Datasource" && (
                        <>
                            <TextField
                                placeholder="Data Source Name"
                                label="Data Source Name"
                                onTextChange={(e: string) => handleOnChangeMessageStore("dataSourceName", e)}
                                value={messageStore.dataSourceName}
                                id="data-source-name-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="Polling Count"
                                label="Polling Count"
                                onTextChange={(e: string) => handleOnChangeMessageStore("pollingCount", e)}
                                value={messageStore.pollingCount}
                                id="polling-count-input"
                                size={100}
                                required/>
                            <TextField
                                placeholder="XPath"
                                label="XPath"
                                onTextChange={(e: string) => handleOnChangeMessageStore("xPath", e)}
                                value={messageStore.xPath}
                                id="xPath-input"
                                size={100}
                                required/>
                        </>
                    )}  
                </>
            )}

            {messageStore.type !== "Custom Message Store"&& messageStore.type!=="In Memory Message Store" && (
                <>
                    <AutoComplete
                        label="Enable Producer Guaranteed Delivery"
                        items={["true", "false"]}
                        selectedItem={messageStore.enableProducerGuaranteedDelivery}
                        onChange={(e: string) => handleOnChangeMessageStore("enableProducerGuaranteedDelivery", e)}
                        sx={{ width: "100%" }}/>
                    <AutoComplete
                        label="Fail Over Message Store"
                        items={fallOverMessageStores}
                        selectedItem={messageStore.failOverMessageStore}
                        onChange={(e: string) => handleOnChangeMessageStore("failOverMessageStore", e)}
                        sx={{ width: "100%" }}/>    
                </>    
                    
            )}

            <div style={{ display: "flex", alignItems: "center" }}>
                <span> Save Location: </span>
                <TextField
                    placeholder="projectDir"
                    onTextChange={(text: string) => setProjectDir(text)}
                    value={projectDir}
                    id="dir-input"
                    size={100}
                    readonly={true}
                />
            </div>
        </SectionWrapper>
        <ActionContainer>
            {message && <span style={{ color: message.isError ? "#f48771" : "" }}>{message.text}</span>}
            <Button 
                appearance="secondary"
                onClick={handleCancel}
            >
                Cancel
            </Button>
            <Button
                appearance="primary"
                onClick={handleCreateMessageStore}
                disabled={message.isError}
            >
                {isNewTask ? "Create" : "Update"}
            </Button>
        </ActionContainer>
    </WizardContainer>
  );
}
