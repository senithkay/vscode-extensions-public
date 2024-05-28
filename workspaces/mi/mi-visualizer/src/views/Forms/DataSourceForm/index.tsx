/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { Dropdown, Button, TextField, Typography, FormCheckBox, TextArea, FormView, FormActions, FormGroup } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { driverMap, engineOptions, propertyParamConfigs } from "./types";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { dataSourceParams } from "./ParamTemplate";
import ParamField from "./ParamField";
import { ParamManager } from "@wso2-enterprise/mi-diagram";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

export interface DataSourceFormProps {
    path: string;
}

interface CommonObject {
    [key: string]: any;
}

type InputsFields = {
    name?: string;
    description?: string;
    type?: string;
    dataSourceProvider?: string;
    dbEngine?: string;
    username?: string;
    password?: string;
    driverClassName?: string;
    url?: string;
    customDSType?: string;
    customDSConfiguration?: string;
    externalDSClassName?: string;
    dataSourceConfigParameters?: {},
    jndiName?: string;
    useDatasourceFactory?: boolean;
};

const newDataSource: InputsFields = {
    name: "",
    description: "",
    type: "RDBMS",
    dataSourceProvider: "default",
    dbEngine: "MySQL",
    username: "",
    password: "",
    driverClassName: "com.mysql.jdbc.Driver",
    url: "jdbc:mysql://[machine-name/ip]:[port]/[database-name]",
    customDSType: "",
    customDSConfiguration: "",
    externalDSClassName: "",
    dataSourceConfigParameters: {},
    jndiName: "",
    useDatasourceFactory: false
};

export function DataSourceWizard(props: DataSourceFormProps) {
    const { rpcClient } = useVisualizerContext();
    const [dsConfigParams,] = useState<any>(dataSourceParams);
    const [jndiProperties, setJndiProperties] = useState(propertyParamConfigs);
    const [dsProperties, setDsProperties] = useState(propertyParamConfigs);
    const [isUpdate, setIsUpdate] = useState(false);
    const [schemaParams, setSchemaParams] = useState({});

    const schema = yup.object({
        name: yup.string().required("Datasource name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in datasource name"),
        description: yup.string().notRequired(),
        type: yup.string().required("Datasource type is required"),
        dataSourceProvider: yup.string().when('type', {
            is: 'RDBMS',
            then: (schema) => schema.required("Datasource provider is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        dbEngine: yup.string().when(['type', 'dataSourceProvider'], {
            is: (type: string, dataSourceProvider: string) => type === 'RDBMS' && dataSourceProvider === 'default',
            then: (schema) => schema.required("Database engine is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        username: yup.string().when(['type', 'dataSourceProvider'], {
            is: (type: string, dataSourceProvider: string) => type === 'RDBMS' && dataSourceProvider === 'default',
            then: (schema) => schema.required("Username is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        password: yup.string().when(['type', 'dataSourceProvider'], {
            is: (type: string, dataSourceProvider: string) => type === 'RDBMS' && dataSourceProvider === 'default',
            then: (schema) => schema.required("Password is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        driverClassName: yup.string().when(['type', 'dataSourceProvider'], {
            is: (type: string, dataSourceProvider: string) => type === 'RDBMS' && dataSourceProvider === 'default',
            then: (schema) => schema.required("Driver Class is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        url: yup.string().when(['type', 'dataSourceProvider'], {
            is: (type: string, dataSourceProvider: string) => type === 'RDBMS' && dataSourceProvider === 'default',
            then: (schema) => schema.required("URL is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        customDSType: yup.string().when('type', {
            is: 'Custom',
            then: (schema) => schema.required("Custom DS type is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        customDSConfiguration: yup.string().when('type', {
            is: 'Custom',
            then: (schema) => schema.required("Custom DS configuration is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        externalDSClassName: yup.string().when('dataSourceProvider', {
            is: 'External Datasource',
            then: (schema) => schema.required("External DS class name is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        dataSourceConfigParameters: yup.object({
            ...schemaParams
        }),
        jndiName: yup.string().notRequired(),
        useDatasourceFactory: yup.boolean().notRequired(),
    });

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
        setError,
        clearErrors
    } = formMethods;

    useEffect(() => {
        const schemaItems: { [key: string]: any } = {};
        Object.keys(dsConfigParams).forEach((key: string) => {
            const param = dsConfigParams[key];
            if (param.validate) {
                let schemaItem;
                if (param.validate?.type === 'string' && param.validate?.required) {
                    schemaItem = yup.string().required("This is a required field");
                } else if (param.type === 'checkbox') {
                    schemaItem = yup.boolean().notRequired();
                } else if (param.validate?.type === 'number') {
                    schemaItem = yup.number()
                        .transform((value, originalValue) => {
                            return originalValue === '' ? undefined : value;
                        }).nullable().notRequired()
                        .typeError("Please enter a numeric value");
                } else {
                    schemaItem = yup.string().notRequired();
                }
                schemaItems[key] = schemaItem;
            }
            else {
                schemaItems[key] = yup.string().notRequired()
            }
        });
        setSchemaParams(schemaItems);
    }, [dsConfigParams]);

    useEffect(() => {
        if (props.path.endsWith(".xml")) {
            setIsUpdate(true);
            if (props.path.includes('dataSources')) {
                props.path = props.path.replace('dataSources', 'data-sources');
            }
            (async () => {
                const response = await rpcClient.getMiDiagramRpcClient().getDataSource({ path: props.path });
                reset(response);
                if (response.type === "RDBMS") {
                    if (response.jndiConfig) {
                        setValue("jndiName", response.jndiConfig.JNDIConfigName);
                        setValue("useDatasourceFactory", response.jndiConfig.useDataSourceFactory.toString() === 'true');
                        if (response.jndiConfig.properties) {
                            let i = 0;
                            setJndiProperties((prevState: any) => ({
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
                    if (response.externalDSClassName) {
                        setValue("dataSourceProvider", "External Datasource");
                        if (response.dataSourceProperties) {
                            let i = 0;
                            setDsProperties((prevState: any) => ({
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
                    }
                }
            })();
        } else {
            setIsUpdate(false);
            reset(newDataSource);
        }
    }, [props.path]);

    useEffect(() => {
        const driverUrl = driverMap.get(watch("dbEngine"));
        if (driverUrl) {
            setValue("driverClassName", driverUrl.driver);
            setValue("url", driverUrl.url);
            setError("url", {type: "manual", message: "Update the URL by removing placeholders and adding the actual values"});
        }
    }, [watch("dbEngine")]);

    useEffect(() => {
        if (watch("url") !== driverMap.get(watch("dbEngine"))?.url) {
            clearErrors("url");
        }
    }, [watch("url")]);

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleSave = async (values: any) => {
        const request = {
            projectDirectory: props.path,
            ...values,
            jndiConfig: undefined as any,
            dataSourceConfigParameters: undefined as any,
            dataSourceProperties: undefined as any
        }
        if (values.jndiName != '') {
            request.jndiConfig = {
                JNDIConfigName: values.jndiName,
                useDataSourceFactory: values.useDatasourceFactory,
                properties: undefined as any
            }
            if (jndiProperties.paramValues.length > 0) {
                const jndiPropertiesMap = jndiProperties.paramValues.reduce((map: any, entry: any) => {
                    const key = entry.paramValues[0].value.toString();
                    const value = entry.paramValues[1].value.toString();
                    map[key] = value;
                    return map;
                }, {} as { [key: string]: string });
                request.jndiConfig.properties = jndiPropertiesMap;
            }
        }

        const dsConfigParams = values.dataSourceConfigParameters;
        const updatedDsConfigParams: CommonObject = {};
        for (const key in dsConfigParams) {
            if (dsConfigParams.hasOwnProperty(key)) {
                if (dsConfigParams[key] !== '') {
                    updatedDsConfigParams[key] = dsConfigParams[key];
                }
            }
        }
        request.dataSourceConfigParameters = updatedDsConfigParams;

        if (values.externalDSClassName != '') {
            const dsPropertiesMap = dsProperties.paramValues.reduce((map: any, entry: any) => {
                const key = entry.paramValues[0].value.toString();
                const value = entry.paramValues[1].value.toString();
                map[key] = value;
                return map;
            }, {} as { [key: string]: string });
            request.dataSourceProperties = dsPropertiesMap;
        }

        await rpcClient.getMiDiagramRpcClient().createDataSource(request);
        handleCancel();
    }

    const generateDisplayValue = (paramValues: any) => {
        const result: string = paramValues.paramValues[0].value + " : " + paramValues.paramValues[1].value;
        return result.trim();
    };

    const onChangeJNDIProperties = (params: any) => {
        var i: number = 1;
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: "Property " + i++,
                    value: generateDisplayValue(param)
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
                    value: generateDisplayValue(param)
                }
            })
        };
        setDsProperties(modifiedParams);
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: { view: MACHINE_VIEW.Overview }
        });
    };

    const renderProps = (fieldName: keyof InputsFields) => {
        return {
            id: fieldName,
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

    return (
        <FormView title='Datasource Artifact' onClose={openOverview}>
            <FormProvider {...formMethods}>
            <FormGroup title="New Datasource" isCollapsed={false}>
                <TextField
                    label="Datasource name"
                    autoFocus
                    required
                    {...renderProps("name")}
                />
                <TextField
                    label="Description"
                    {...renderProps("description")}
                />
                <Typography variant="caption">Datasource Type</Typography>
                <Dropdown items={[{ id: "rdbms", value: "RDBMS" }, { id: "custom", value: "Custom" }]} {...renderProps("type")} />
                {watch("type") === "RDBMS" && <>
                    <Typography variant="caption">Data source provider</Typography>
                    <Dropdown items={[{ id: "default", value: "default" }, { id: "external", value: "External Datasource" }]} {...renderProps("dataSourceProvider")} />
                    {watch("dataSourceProvider") === "default" && <>
                        <Typography variant="caption">Database Engine</Typography>
                        <Dropdown items={engineOptions} {...renderProps("dbEngine")} />
                        <TextField
                            label="Driver"
                            required
                            {...renderProps("driverClassName")}
                        />
                        <TextField
                            label="URL"
                            required
                            {...renderProps("url")}
                        />
                        <TextField
                            label="Username"
                            required
                            {...renderProps("username")}
                        />
                        <TextField
                            label="Password"
                            required
                            {...renderProps("password")}
                        />
                    </>} {watch("dataSourceProvider") === "External Datasource" && <>
                        <TextField
                            label="Datasource Class Name"
                            required
                            {...renderProps("externalDSClassName")}
                        />
                        <ParamManager
                            paramConfigs={dsProperties}
                            readonly={false}
                            onChange={onChangeDSProperties} />
                    </>}
                </>} {watch("type") === "Custom" && <>
                    <TextField
                        label="Custom Datasource Type"
                        required
                        {...renderProps("customDSType")}
                    />
                    <TextArea
                        label="Custom Configuration"
                        required
                        {...renderProps("customDSConfiguration")}
                    />
                </>
                }
            </FormGroup>
            {watch("type") === "RDBMS" && <>
                <FormGroup title="Datasource Configuration Parameters" isCollapsed={true}>
                    {dsConfigParams && Object.keys(dsConfigParams).map((key: string) => (
                        <ParamField
                            key={key}
                            id={key}
                            field={dsConfigParams[key]}
                        />
                    ))}
                </FormGroup>
                <FormGroup title="Expose as a JNDI Datasource" isCollapsed={true}>
                    <TextField
                        label="JNDI Configuration Name"
                        {...renderProps("jndiName")}
                    />
                    <FormCheckBox
                        label="Use Datasource Factory"
                        {...register("useDatasourceFactory")}
                        control={control}
                    />
                    <ParamManager
                        paramConfigs={jndiProperties}
                        readonly={false}
                        onChange={onChangeJNDIProperties} />
                </FormGroup>
            </>}
            <br />
            <FormActions>
                <Button appearance="secondary" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button disabled={!isDirty} onClick={handleSubmit(handleSave)}>
                    {isUpdate ? 'Update' : 'Create'}
                </Button>
            </FormActions>
            </FormProvider>
        </FormView>
    );
}
