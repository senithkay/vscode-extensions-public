/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from "react";
import { Button, TextField, FormView, FormActions, FormGroup, LinkButton, Codicon } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW, CreateDataServiceRequest, Datasource, Property } from "@wso2-enterprise/mi-core";
import { DataServiceAdvancedWizard } from "./AdvancedForm";
import { DataServiceTransportWizard } from "./TransportForm";
import { DataServiceDisplayTable } from "./DisplayTable";
import { DataServiceDataSourceWizard, DataSourceFields } from "./DataSourceForm/DatasourceForm";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import styled from "@emotion/styled";

const AddButtonWrapper = styled.div`
	margin: 8px 0;
`;

export interface DataServiceWizardProps {
    path: string;
}

type DataServiceFields = {
    dataServiceName?: string;
    dataServiceNamespace?: string;
    serviceGroup?: string;
    selectedTransports?: string;
    publishSwagger?: string;
    jndiName?: string;
    enableBoxcarring?: boolean;
    enableBatchRequests?: boolean;
    serviceStatus?: boolean;
    disableLegacyBoxcarringMode?: boolean;
    enableStreaming?: boolean;
    description?: string;
    authProviderClass?: string;
    http?: boolean;
    https?: boolean;
    jms?: boolean;
    local?: boolean;
    authProps?: any[];
    ds?: any[];
};

const newDataService: DataServiceFields = {
    dataServiceName: "",
    dataServiceNamespace: "",
    serviceGroup: "",
    selectedTransports: "",
    publishSwagger: "",
    jndiName: "",
    enableBoxcarring: false,
    enableBatchRequests: false,
    serviceStatus: false,
    disableLegacyBoxcarringMode: false,
    enableStreaming: false,
    description: "",
    authProviderClass: "",
    http: true,
    https: true,
    jms: false,
    local: false,
    authProps: [],
    ds: []
}

const schema = yup.object({
    dataServiceName: yup.string().required("Data Service Name is required"),
    dataServiceNamespace: yup.string().notRequired(),
    serviceGroup: yup.string().notRequired(),
    selectedTransports: yup.string().notRequired(),
    publishSwagger: yup.string().notRequired(),
    jndiName: yup.string().notRequired(),
    enableBoxcarring: yup.boolean().notRequired(),
    enableBatchRequests: yup.boolean().notRequired(),
    serviceStatus: yup.boolean().notRequired(),
    disableLegacyBoxcarringMode: yup.boolean().notRequired(),
    enableStreaming: yup.boolean().notRequired(),
    description: yup.string().notRequired(),
    authProviderClass: yup.string().notRequired(),
    http: yup.boolean().notRequired(),
    https: yup.boolean().notRequired(),
    jms: yup.boolean().notRequired(),
    local: yup.boolean().notRequired(),
    authProps: yup.array().notRequired(),
    ds: yup.array().notRequired()
});

export function DataServiceWizard(props: DataServiceWizardProps) {

    const {
        control,
        handleSubmit,
        formState: { errors, isDirty },
        register,
        setValue,
        reset
    } = useForm({
        defaultValues: newDataService,
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    const { rpcClient } = useVisualizerContext();
    const [ showDatasourceComponent, setShowDatasourceComponent ] = useState(false);
    const [ datasource, setDatasource ] = useState(undefined);
    const [ datasources, setDatasources ] = useState([]);
    const [ authProperties, setAuthProperties ] = useState([]);
    const [ isNewDataService, setIsNewDataService ] = useState(!props.path.endsWith(".xml"));

    useEffect(() => {
        (async () => {
            if (props.path.endsWith(".xml")) {
                if (props.path.includes('/dataServices')) {
                    props.path = props.path.replace('/dataServices', '/data-services');
                }
                setIsNewDataService(false);
                const existingDataService = await rpcClient.getMiDiagramRpcClient().getDataService({ path: props.path });
                reset(existingDataService);
                const existingDatasources: any[] = [];
                setAuthProperties(existingDataService.authProperties);
                existingDataService.datasources.forEach((ds) => {
                    const currentDatasource: DataSourceFields = {
                        dataSourceName: ds.dataSourceName,
                        dataSourceType: "",
                        enableOData: ds.enableOData,
                        dynamicUserAuthClass: ds.dynamicUserAuthClass,
                        rdbms: {
                            databaseEngine: "MySQL",
                            driverClassName: "",
                            url: "",
                            username: "",
                            password: ""
                        },
                        mongodb: {
                            mongoDB_servers: "",
                            mongoDB_database: "",
                            username: "",
                            password: "",
                            mongoDB_auth_source: "",
                            mongoDB_authentication_type: "",
                            mongoDB_write_concern: "",
                            mongoDB_read_preference: "",
                            mongoDB_ssl_enabled: "",
                            mongoDB_connectTimeout: "",
                            mongoDB_maxWaitTime: "",
                            mongoDB_socketTimeout: "",
                            mongoDB_connectionsPerHost: "",
                            mongoDB_threadsAllowedToBlockForConnectionMultiplier: ""
                        },
                        cassandra: {
                            cassandraServers: "",
                            keyspace: "",
                            port: "",
                            clusterName: "",
                            compression: "",
                            username: "",
                            password: "",
                            loadBalancingPolicy: "",
                            dataCenter: "",
                            allowRemoteDCsForLocalConsistencyLevel: "",
                            enableJMXReporting: "",
                            enableMetrics: "",
                            localCoreConnectionsPerHost: "",
                            remoteCoreConnectionsPerHost: "",
                            localMaxConnectionsPerHost: "",
                            remoteMaxConnectionsPerHost: "",
                            localNewConnectionThreshold: "",
                            remoteNewConnectionThreshold: "",
                            localMaxRequestsPerConnection: "",
                            remoteMaxRequestsPerConnection: "",
                            protocolVersion: "",
                            consistencyLevel: "",
                            fetchSize: "",
                            serialConsistencyLevel: "",
                            reconnectionPolicy: "",
                            constantReconnectionPolicyDelay: "",
                            exponentialReconnectionPolicyBaseDelay: "",
                            exponentialReconnectionPolicyMaxDelay: "",
                            retryPolicy: "",
                            connectionTimeoutMillis: "",
                            keepAlive: "",
                            readTimeoutMillis: "",
                            receiverBufferSize: "",
                            sendBufferSize: "",
                            reuseAddress: "",
                            soLinger: "",
                            tcpNoDelay: "",
                            enableSSL: ""
                        },
                        csv: {
                            csv_hasheader: "",
                            csv_datasource: "",
                            csv_columnseperator: "",
                            csv_startingrow: "",
                            csv_maxrowcount: "",
                            csv_headerrow: ""
                        },
                        carbonDatasource: {
                            carbon_datasource_name: ""
                        },
                        dsConfigurations: ds.datasourceConfigurations
                    };
                    const propertyKeys: string[]  = [];
                    ds.datasourceProperties.forEach(attr => {
                        propertyKeys.push(attr.key);
                    });
                    if (propertyKeys.includes("driverClassName")) {
                        currentDatasource.dataSourceType = "RDBMS";
                        ds.datasourceProperties.forEach(attr => {
                            currentDatasource.rdbms[attr.key] = attr.value;
                        });
                        if (currentDatasource.rdbms.driverClassName.includes("mysql")) {
                            currentDatasource.rdbms.databaseEngine = "MySQL";
                        } else if (currentDatasource.rdbms.driverClassName.includes("derby")) {
                            currentDatasource.rdbms.databaseEngine = "Apache Derby";
                        } else if (currentDatasource.rdbms.driverClassName.includes("microsoft")) {
                            currentDatasource.rdbms.databaseEngine = "Microsoft SQL Server";
                        } else if (currentDatasource.rdbms.driverClassName.includes("oracle")) {
                            currentDatasource.rdbms.databaseEngine = "Oracle";
                        } else if (currentDatasource.rdbms.driverClassName.includes("ibm")) {
                            currentDatasource.rdbms.databaseEngine = "IBM DB2";
                        } else if (currentDatasource.rdbms.driverClassName.includes("hsql")) {
                            currentDatasource.rdbms.databaseEngine = "HSQLDB";
                        } else if (currentDatasource.rdbms.driverClassName.includes("informix")) {
                            currentDatasource.rdbms.databaseEngine = "Informix";
                        } else if (currentDatasource.rdbms.driverClassName.includes("postgre")) {
                            currentDatasource.rdbms.databaseEngine = "PostgreSQL";
                        } else if (currentDatasource.rdbms.driverClassName.includes("sybase")) {
                            currentDatasource.rdbms.databaseEngine = "Sybase ASE";
                        } else if (currentDatasource.rdbms.driverClassName.includes("h2")) {
                            currentDatasource.rdbms.databaseEngine = "H2";
                        } else {
                            currentDatasource.rdbms.databaseEngine = "Generic";
                        }
                    } else if (propertyKeys.includes("csv_datasource")) {
                        currentDatasource.dataSourceType = "CSV";
                        ds.datasourceProperties.forEach(attr => {
                            currentDatasource.csv[attr.key] = attr.value;
                        });
                    } else if (propertyKeys.includes("cassandraServers")) {
                        currentDatasource.dataSourceType = "Cassandra";
                        ds.datasourceProperties.forEach(attr => {
                            currentDatasource.cassandra[attr.key] = attr.value;
                        });
                    } else if (propertyKeys.includes("mongoDB_servers")) {
                        currentDatasource.dataSourceType = "MongoDB";
                        ds.datasourceProperties.forEach(attr => {
                            currentDatasource.mongodb[attr.key] = attr.value;
                        });
                    } else {
                        ds.datasourceProperties.forEach(attr => {
                            currentDatasource.dataSourceType = "Carbon Datasource";
                            currentDatasource.carbonDatasource[attr.key] = attr.value;
                        });
                    }
                    existingDatasources.push(currentDatasource);
                });
                setDatasources(existingDatasources);
            } else {
                setIsNewDataService(true);
                setShowDatasourceComponent(false);
                setDatasources([]);
                setDatasource(undefined);
                setAuthProperties([]);
                reset(newDataService);
            }
        })();
    }, [props.path]);

    const handleEditDatasource = (index: number) => {
        setDatasource(datasources[index]);
        setShowDatasourceComponent(true);
    };

    const handleDeleteDatasource = (index: number) => {
        const updatedDatasources = datasources.filter((_, i) => i !== index);
        setDatasources(updatedDatasources);
    };

    const addDatasource = () => {
        setDatasource(undefined);
        setShowDatasourceComponent(true);
    }

    const configToProperties = <T extends Record<string, any>>(config: T): Property[] => {
        return Object.keys(config)
            .filter(key => key !== "databaseEngine" && key !== "type" && config[key as keyof T] !== "")
            .map(key => ({
                key,
                value: String(config[key as keyof T])
            }));
    };

    const handleCreateDataService = async (values: any) => {

        const transports: string[] = [];
        if (values.http) transports.push("http");
        if (values.https) transports.push("https");
        if (values.jms) transports.push("jms");
        if (values.local) transports.push("local");

        const updatedDatasources: Datasource[] = [];

        datasources.forEach(currentDataSource => {
            const data: Datasource = {
                dataSourceName: currentDataSource.dataSourceName,
                enableOData: currentDataSource.enableOData,
                dynamicUserAuthClass: currentDataSource.dynamicUserAuthClass,
                datasourceConfigurations: currentDataSource.dsConfigurations,
                datasourceProperties: currentDataSource.dataSourceType === "RDBMS" ? configToProperties(currentDataSource.rdbms) :
                    currentDataSource.dataSourceType === "MongoDB" ? configToProperties(currentDataSource.mongodb) :
                        currentDataSource.dataSourceType === "Cassandra" ? configToProperties(currentDataSource.cassandra) :
                        currentDataSource.dataSourceType === "CSV" ? configToProperties(currentDataSource.csv) :
                            configToProperties(currentDataSource.carbonDatasource)
            };
            updatedDatasources.push(data);
        })

        const createDataServiceParams: CreateDataServiceRequest = {
            directory: props.path,
            dataServiceName: values.dataServiceName,
            dataServiceNamespace: values.dataServiceNamespace,
            serviceGroup: values.serviceGroup,
            selectedTransports: transports.join(" "),
            publishSwagger: values.publishSwagger,
            jndiName: values.jndiName,
            enableBoxcarring: values.enableBoxcarring,
            enableBatchRequests: values.enableBatchRequests,
            serviceStatus: values.serviceStatus,
            disableLegacyBoxcarringMode: values.disableLegacyBoxcarringMode,
            enableStreaming: values.enableStreaming,
            description: values.description,
            datasources: updatedDatasources,
            authProviderClass: values.authProviderClass,
            authProperties: authProperties,
            queries: [],
            operations: [],
            resources: []
        }

        await rpcClient.getMiDiagramRpcClient().createDataService(createDataServiceParams);

        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const renderProps = (fieldName: keyof DataServiceFields) => {
        return {
            id: fieldName,
            errorMsg: errors[fieldName] && errors[fieldName].message.toString(),
            ...register(fieldName)
        }
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    return (
        <>
            {showDatasourceComponent && <DataServiceDataSourceWizard datasource={datasource} setShowComponent={setShowDatasourceComponent} datasources={datasources} setValue={setValue}/> }
            {!showDatasourceComponent &&
                <>
                    <FormView title='Data Service Artifact' onClose={handleCancel}>
                             <FormGroup title="Data Service Properties" isCollapsed={false}>
                                 <TextField
                                    label="Data Service Name"
                                    autoFocus
                                    required
                                    size={100}
                                    {...renderProps('dataServiceName')}
                                />
                                <TextField
                                    label="Description"
                                    size={100}
                                    {...renderProps('description')}
                                />
                            </FormGroup>
                            <FormGroup title="Configure Datasources" isCollapsed={false}>
                                <DataServiceDisplayTable data={datasources} attributes={['dataSourceType', 'dataSourceName']} onEdit={handleEditDatasource} onDelete={handleDeleteDatasource} />
                                <AddButtonWrapper>
                                    <LinkButton onClick={addDatasource} >
                                        <Codicon name="add" /><>Add Datasource</>
                                    </LinkButton>
                                </AddButtonWrapper>
                            </FormGroup>
                            <FormGroup title="Transport Settings" isCollapsed={true}>
                                    <DataServiceTransportWizard authProperties={authProperties} setAuthProperties={setAuthProperties} renderProps={renderProps} control={control} setValue={setValue} />
                            </FormGroup>
                            <FormGroup title="Advanced Configurations" isCollapsed={true}>
                                    <DataServiceAdvancedWizard renderProps={renderProps} control={control} />
                            </FormGroup>
                            <FormActions>
                                <Button
                                    appearance="secondary"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    appearance="primary"
                                    onClick={handleSubmit(handleCreateDataService)}
                                    disabled={!isDirty}
                                >
                                    {isNewDataService ? "Create" : "Save Changes"}
                                </Button>
                            </FormActions>
                        </FormView>
                </>
            }
        </>
    );
}
