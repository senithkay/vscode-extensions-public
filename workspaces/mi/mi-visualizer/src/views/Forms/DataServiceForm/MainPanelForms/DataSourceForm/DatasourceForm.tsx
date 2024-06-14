/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Button, TextField, FormCheckBox, Dropdown, FormView, FormActions } from "@wso2-enterprise/ui-toolkit";
import {DataServicePropertyTable} from "../PropertyTable";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { DataSourceRDBMSForm } from "./DatasourceRDBMSForm";
import { DataSourceMongoDBForm } from "./DatasourceMongoDBForm";
import { DataSourceCSVForm } from "./DatasourceCSVForm";
import { DataSourceCassandraForm } from "./DatasourceCassandraForm";

export interface DataServiceDataSourceWizardProps {
    datasource?: any;
    setShowComponent?: Dispatch<SetStateAction<any>>;
    path?: string;
    datasources?: any;
    setValue?: any;
}

interface OptionProps {
    value: string;
}

interface Parameters {
    [key: string]: {
        message: string;
    };
}

export type RDBMSObject = {
    type?: string;
    databaseEngine?: string;
    driverClassName?: string;
    url?: string;
    username?: string;
    password?: string;
    [key: string]: any;
};

export type MongoDBObject = {
    type?: string;
    mongoDB_servers?: string;
    mongoDB_database?: string;
    username?: string;
    password?: string;
    mongoDB_auth_source?: string;
    mongoDB_authentication_type?: string;
    mongoDB_write_concern?: string;
    mongoDB_read_preference?: string;
    mongoDB_ssl_enabled?: string;
    mongoDB_connectTimeout?: string;
    mongoDB_maxWaitTime?: string;
    mongoDB_socketTimeout?: string;
    mongoDB_connectionsPerHost?: string;
    mongoDB_threadsAllowedToBlockForConnectionMultiplier?: string;
    [key: string]: any;
};

export type CassandraObject = {
    type?: string;
    cassandraServers?: string;
    keyspace?: string;
    port?: string;
    clusterName?: string;
    compression?: string;
    username?: string;
    password?: string;
    loadBalancingPolicy?: string;
    dataCenter?: string;
    allowRemoteDCsForLocalConsistencyLevel?: string;
    enableJMXReporting?: string;
    enableMetrics?: string;
    localCoreConnectionsPerHost?: string;
    remoteCoreConnectionsPerHost?: string;
    localMaxConnectionsPerHost?: string;
    remoteMaxConnectionsPerHost?: string;
    localNewConnectionThreshold?: string;
    remoteNewConnectionThreshold?: string;
    localMaxRequestsPerConnection?: string;
    remoteMaxRequestsPerConnection?: string;
    protocolVersion?: string;
    consistencyLevel?: string;
    fetchSize?: string;
    serialConsistencyLevel?: string;
    reconnectionPolicy?: string;
    constantReconnectionPolicyDelay?: string;
    exponentialReconnectionPolicyBaseDelay?: string;
    exponentialReconnectionPolicyMaxDelay?: string;
    retryPolicy?: string;
    connectionTimeoutMillis?: string;
    keepAlive?: string;
    readTimeoutMillis?: string;
    receiverBufferSize?: string;
    sendBufferSize?: string;
    reuseAddress?: string;
    soLinger?: string;
    tcpNoDelay?: string;
    enableSSL?: string;
    [key: string]: any;
}

export type CSVObject = {
    type?: string;
    csv_hasheader?: string;
    csv_datasource?: string;
    csv_columnseperator?: string;
    csv_startingrow?: string;
    csv_maxrowcount?: string;
    csv_headerrow?: string;
    [key: string]: any;
};

export type CarbonDatasourceObject = {
    type?: string;
    carbon_datasource_name?: string;
    [key: string]: any;
};

export type DataSourceFields = {
    dataSourceName?: string;
    dataSourceType?: string;
    enableOData?: boolean;
    dynamicUserAuthClass?: string;
    rdbms?: RDBMSObject;
    mongodb?: MongoDBObject;
    cassandra?: CassandraObject;
    csv?: CSVObject;
    carbonDatasource?: CarbonDatasourceObject;
    dsConfigurations?: any[];
};

export const newDataSource: DataSourceFields = {
    dataSourceName: "",
    dataSourceType: "RDBMS",
    enableOData: false,
    dynamicUserAuthClass: "",
    rdbms: {
        type: "",
        databaseEngine: "MySQL",
        driverClassName: "",
        url: "",
        username: "",
        password: ""
    },
    mongodb: {
        type: "",
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
        type: "",
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
        type: "",
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
    dsConfigurations: []
}

const schema = yup.object({
    dataSourceName: yup.string().required("Datasource name is required"),
    dataSourceType: yup.string().required("Datasource type is required"),
    enableOData: yup.boolean().notRequired(),
    dynamicUserAuthClass: yup.string().notRequired(),
    rdbms: yup.object().shape({
        type: yup.string().notRequired(),
        databaseEngine: yup.string().when('type', {
            is: 'RDBMS',
            then: (schema) => schema.required("Database engine is required"),
            otherwise: (schema) => schema.notRequired().default(""),
        }),
        driverClassName: yup.string().when('type', {
            is: 'RDBMS',
            then: (schema) => schema.required("Driver class name is required"),
            otherwise: (schema) => schema.notRequired().default(""),
        }),
        url: yup.string().when('RDBMS', {
            is: 'RDBMS',
            then: (schema) => schema.required("URL is required"),
            otherwise: (schema) => schema.notRequired().default(""),
        }),
        username: yup.string().notRequired(),
        password: yup.string().notRequired()
    }),
    mongodb: yup.object().shape({
        type: yup.string().notRequired(),
        mongoDB_servers: yup.string().when('type', {
            is: 'MongoDB',
            then: (schema) => schema.required("MongoDB servers are required"),
            otherwise: (schema) => schema.notRequired().default(""),
        }),
        mongoDB_database: yup.string().when('type', {
            is: 'MongoDB',
            then: (schema) => schema.required("MongoDB database is required"),
            otherwise: (schema) => schema.notRequired().default(""),
        }),
        username: yup.string().notRequired(),
        password: yup.string().notRequired(),
        mongoDB_auth_source: yup.string().notRequired(),
        mongoDB_authentication_type: yup.string().notRequired(),
        mongoDB_write_concern: yup.string().notRequired(),
        mongoDB_read_preference: yup.string().notRequired(),
        mongoDB_ssl_enabled: yup.string().notRequired(),
        mongoDB_connectTimeout: yup.string().notRequired(),
        mongoDB_maxWaitTime: yup.string().notRequired(),
        mongoDB_socketTimeout: yup.string().notRequired(),
        mongoDB_connectionsPerHost: yup.string().notRequired(),
        mongoDB_threadsAllowedToBlockForConnectionMultiplier: yup.string().notRequired()
    }),
    cassandra: yup.object().shape({
        type: yup.string().notRequired(),
        cassandraServers: yup.string().when('type', {
            is: 'Cassandra',
            then: (schema) => schema.required("Cassandra servers are required"),
            otherwise: (schema) => schema.notRequired().default(""),
        }),
        keyspace: yup.string().notRequired(),
        port: yup.string().notRequired(),
        clusterName: yup.string().notRequired(),
        compression: yup.string().notRequired(),
        username: yup.string().notRequired(),
        password: yup.string().notRequired(),
        loadBalancingPolicy: yup.string().notRequired(),
        dataCenter: yup.string().notRequired(),
        allowRemoteDCsForLocalConsistencyLevel: yup.string().notRequired(),
        enableJMXReporting: yup.string().notRequired(),
        enableMetrics: yup.string().notRequired(),
        localCoreConnectionsPerHost: yup.string().notRequired(),
        remoteCoreConnectionsPerHost: yup.string().notRequired(),
        localMaxConnectionsPerHost: yup.string().notRequired(),
        remoteMaxConnectionsPerHost: yup.string().notRequired(),
        localNewConnectionThreshold: yup.string().notRequired(),
        remoteNewConnectionThreshold: yup.string().notRequired(),
        localMaxRequestsPerConnection: yup.string().notRequired(),
        remoteMaxRequestsPerConnection: yup.string().notRequired(),
        protocolVersion: yup.string().notRequired(),
        consistencyLevel: yup.string().notRequired(),
        fetchSize: yup.string().notRequired(),
        serialConsistencyLevel: yup.string().notRequired(),
        reconnectionPolicy: yup.string().notRequired(),
        constantReconnectionPolicyDelay: yup.string().notRequired(),
        exponentialReconnectionPolicyBaseDelay: yup.string().notRequired(),
        exponentialReconnectionPolicyMaxDelay: yup.string().notRequired(),
        retryPolicy: yup.string().notRequired(),
        connectionTimeoutMillis: yup.string().notRequired(),
        keepAlive: yup.string().notRequired(),
        readTimeoutMillis: yup.string().notRequired(),
        receiverBufferSize: yup.string().notRequired(),
        sendBufferSize: yup.string().notRequired(),
        reuseAddress: yup.string().notRequired(),
        soLinger: yup.string().notRequired(),
        tcpNoDelay: yup.string().notRequired(),
        enableSSL: yup.string().notRequired()
    }),
    csv: yup.object().shape({
        type: yup.string().notRequired(),
        csv_hasheader: yup.string().when('type', {
            is: 'CSV',
            then: (schema) => schema.required("This is a required field"),
            otherwise: (schema) => schema.notRequired().default(""),
        }),
        csv_datasource: yup.string().when('type', {
            is: 'CSV',
            then: (schema) => schema.required("CSV file location is required"),
            otherwise: (schema) => schema.notRequired().default(""),
        }),
        csv_columnseperator: yup.string().notRequired(),
        csv_startingrow: yup.string().notRequired(),
        csv_maxrowcount: yup.string().notRequired(),
        csv_headerrow: yup.string().notRequired()
    }),
    carbonDatasource: yup.object().shape({
        type: yup.string().notRequired(),
        carbon_datasource_name: yup.string().when('type', {
            is: 'Carbon Datasource',
            then: (schema) => schema.required("Carbon datasource name is required"),
            otherwise: (schema) => schema.notRequired().default(""),
        })
    }),
    dsConfigurations: yup.array().notRequired()
});

export function DataServiceDataSourceWizard(props: DataServiceDataSourceWizardProps) {

    const formMethods = useForm({
        defaultValues: newDataSource,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const {
        reset,
        register,
        control,
        formState: { errors, isDirty },
        handleSubmit,
        watch,
        setValue,
    } = formMethods;

    const [ datasourceConfigurations, setDatasourceConfigurations ] = useState(props.datasource ? props.datasource.dsConfigurations : []);
    const [ isEditDatasource, setIsEditDatasource ] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const datasourceTypes: OptionProps[] = [
        { value: "RDBMS"},
        { value: "MongoDB"},
        { value: "Cassandra"},
        { value: "CSV"},
        { value: "Carbon Datasource"}
    ];

    useEffect(() => {
        if (props.datasource !== undefined) {
            reset(props.datasource);
            setDatasourceConfigurations(props.datasource.dsConfigurations);
            setIsEditDatasource(true);
        }
    }, [props.datasource]);

    useEffect(() => {
        if (isInitialLoading) {
            setIsInitialLoading(false);
        } else {
            setValue('dsConfigurations', datasourceConfigurations, { shouldDirty: true });
        }
    }, [datasourceConfigurations]);

    useEffect(() => {
        setValue('rdbms.type', watch('dataSourceType'));
        setValue('mongodb.type', watch('dataSourceType'));
        setValue('csv.type', watch('dataSourceType'));
        setValue('carbonDatasource.type', watch('dataSourceType'));
        setValue('cassandra.type', watch('dataSourceType'));
    }, [watch('dataSourceType')]);

    const handleDatasourceSubmit = async (values: any) => {

        values.dsConfigurations = datasourceConfigurations;
        const currentDatasource = values;
        const datasourceIndex = props.datasources.findIndex(
            (datasource: any) => datasource.dataSourceName === currentDatasource.dataSourceName
        );

        if (datasourceIndex !== -1) {
            props.datasources[datasourceIndex] = currentDatasource;
        } else {
            props.datasources.push(currentDatasource);
        }
        props.setShowComponent(false);
        props.setValue('ds', props.datasources, { shouldDirty: true });
    };

    const renderProps = (fieldName: keyof DataSourceFields) => {
        return {
            id: fieldName,
            errorMsg: errors[fieldName] && errors[fieldName].message.toString(),
            ...register(fieldName)
        }
    };

    const renderPropsForObject = (fieldName: string) => {
        const parentField = fieldName.split('.')[0] as keyof DataSourceFields;
        const childField = fieldName.split('.')[1];
        return {
            id: fieldName,
            errorMsg: errors[parentField] && ((errors[parentField] as Parameters)[childField]?.message?.toString()),
            ...register(fieldName as keyof DataSourceFields)
        }
    };

    const handleCancel = () => {
        props.setShowComponent(false)
    };

    return (
        <FormView title='Create Datasource' onClose={handleCancel}>
            <FormProvider {...formMethods}>
            <TextField
                label="Datasource Identifier"
                required
                size={100}
                {...renderProps('dataSourceName')}
            />
            <Dropdown label="Datasource Type" required items={datasourceTypes} {...renderProps('dataSourceType')} />
            { watch('dataSourceType') === 'RDBMS' && (
                <DataSourceRDBMSForm renderProps={renderPropsForObject} watch={watch} setValue={setValue} />
            )}
            { watch('dataSourceType') === 'MongoDB' && (
                <DataSourceMongoDBForm renderProps={renderPropsForObject} />
            )}
            { watch('dataSourceType') === 'Cassandra' && (
                <DataSourceCassandraForm renderProps={renderPropsForObject} />
            )}
            { watch('dataSourceType') === 'CSV' && (
                <DataSourceCSVForm renderProps={renderPropsForObject} />
            )}
            { watch('dataSourceType') === 'Carbon Datasource' && (
                <TextField
                    label="Datasource Name"
                    required
                    size={100}
                    {...renderPropsForObject('carbonDatasource.carbon_datasource_name')}
                />
            )}
            <FormCheckBox
                label="Enable OData"
                control={control}
                {...renderProps('enableOData')}
            />
            <TextField
                label="Dynamic User Authentication Class"
                size={100}
                {...renderProps('dynamicUserAuthClass')}
            />
            <DataServicePropertyTable setProperties={setDatasourceConfigurations} properties={datasourceConfigurations} type={'datasource'} />
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(handleDatasourceSubmit)}
                    disabled={!isDirty}
                >
                    {isEditDatasource ? "Update" : "Add"}
                </Button>
                <Button
                    appearance="secondary"
                    onClick={handleCancel}>
                    Cancel
                </Button>
            </FormActions>
                </FormProvider>
        </FormView>
    );
}
