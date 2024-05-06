/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/
// AUTO-GENERATED FILE. DO NOT MODIFY.

import React, { useEffect } from 'react';
import { AutoComplete, Button, ComponentCard, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, getParamManagerValues, getParamManagerFromValues } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ParamManager, ParamConfig, ParamValue } from '../../../../Form/ParamManager/ParamManager';

const cardStyle = { 
    display: "block",
    margin: "15px 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
};

const Error = styled.span`
   color: var(--vscode-errorForeground);
   font-size: 12px;
`;

const Field = styled.div`
   margin-bottom: 12px;
`;

const DBLookupForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            connectionType: sidePanelContext?.formValues?.connectionType || "DB_CONNECTION",
            databaseConfiguration: sidePanelContext?.formValues?.databaseConfiguration || "",
            connectionDBType: sidePanelContext?.formValues?.connectionDBType || "OTHER",
            isRegistryBasedDriverConfig: sidePanelContext?.formValues?.isRegistryBasedDriverConfig || "",
            connectionDBDriver: sidePanelContext?.formValues?.connectionDBDriver || "",
            registryBasedonnectionDBDriver: sidePanelContext?.formValues?.registryBasedonnectionDBDriver || "",
            connectionDSType: sidePanelContext?.formValues?.connectionDSType || "EXTERNAL",
            connectionDSInitialContext: sidePanelContext?.formValues?.connectionDSInitialContext || "",
            connectionDSName: sidePanelContext?.formValues?.connectionDSName || "",
            isRegistryBasedURLConfig: sidePanelContext?.formValues?.isRegistryBasedURLConfig || "",
            connectionURL: sidePanelContext?.formValues?.connectionURL || "",
            registryBasedURLConfigKey: sidePanelContext?.formValues?.registryBasedURLConfigKey || "",
            isRegistryBasedUserConfig: sidePanelContext?.formValues?.isRegistryBasedUserConfig || "",
            connectionUsername: sidePanelContext?.formValues?.connectionUsername || "",
            registryBasedUserConfigKey: sidePanelContext?.formValues?.registryBasedUserConfigKey || "",
            isRegistryBasedPassConfig: sidePanelContext?.formValues?.isRegistryBasedPassConfig || "",
            connectionPassword: sidePanelContext?.formValues?.connectionPassword || "",
            registryBasedPassConfigKey: sidePanelContext?.formValues?.registryBasedPassConfigKey || "",
            sqlStatements: {
                paramValues: getParamManagerFromValues(sidePanelContext?.formValues?.sqlStatements),
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Query String",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "ParamManager",
                        "label": "Parameters",
                        "defaultValue": "",
                        "isRequired": false, 
                        "paramManager": {
                            paramConfigs: {
                                paramValues: getParamManagerFromValues(sidePanelContext?.formValues?.parameters),
                                paramFields: [
                                    {
                                        "defaultValue": "",
                                        "isRequired": false
                                    },
                                ]
                            },
                            openInDrawer: true,
                            addParamText: "New Parameters"
                        },
                    },
                    {
                        "type": "Checkbox",
                        "label": "Results Enabled",
                        "defaultValue": false,
                        "isRequired": false
                    },
                    {
                        "type": "ParamManager",
                        "label": "Results",
                        "defaultValue": "",
                        "isRequired": false, 
                        "paramManager": {
                            paramConfigs: {
                                paramValues: getParamManagerFromValues(sidePanelContext?.formValues?.results),
                                paramFields: [
                                    {
                                        "type": "TextField",
                                        "label": "Property Name",
                                        "defaultValue": "",
                                        "isRequired": false
                                    },
                                    {
                                        "type": "TextField",
                                        "label": "Column ID",
                                        "defaultValue": "",
                                        "isRequired": false
                                    },
                                ]
                            },
                            openInDrawer: true,
                            addParamText: "New Results"
                        },
                    },
                ]
            },
            propertyAutocommit: sidePanelContext?.formValues?.propertyAutocommit || "DEFAULT",
            propertyIsolation: sidePanelContext?.formValues?.propertyIsolation || "DEFAULT",
            propertyMaxActive: sidePanelContext?.formValues?.propertyMaxActive || "-1",
            propertyMaxIdle: sidePanelContext?.formValues?.propertyMaxIdle || "-1",
            propertyMaxOpenStatements: sidePanelContext?.formValues?.propertyMaxOpenStatements || "-1",
            propertyMaxWait: sidePanelContext?.formValues?.propertyMaxWait || "-1",
            propertyMinIdle: sidePanelContext?.formValues?.propertyMinIdle || "-1",
            propertyPoolStatements: sidePanelContext?.formValues?.propertyPoolStatements || "DEFAULT",
            propertyTestOnBorrow: sidePanelContext?.formValues?.propertyTestOnBorrow || "DEFAULT",
            propertyTestWhileIdle: sidePanelContext?.formValues?.propertyTestWhileIdle || "DEFAULT",
            propertyValidationQuery: sidePanelContext?.formValues?.propertyValidationQuery || "",
            propertyInitialSize: sidePanelContext?.formValues?.propertyInitialSize || "-1",
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        values["sqlStatements"] = getParamManagerValues(values.sqlStatements);
        const xml = getXML(MEDIATORS.DBLOOKUP, values, dirtyFields, sidePanelContext.formValues);
        if (Array.isArray(xml)) {
            for (let i = 0; i < xml.length; i++) {
                await rpcClient.getMiDiagramRpcClient().applyEdit({
                    documentUri: props.documentUri, range: xml[i].range, text: xml[i].text
                });
            }
        } else {
            rpcClient.getMiDiagramRpcClient().applyEdit({
                documentUri: props.documentUri, range: props.nodePosition, text: xml
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

    if (isLoading) {
        return <ProgressIndicator/>;
    }
    return (
        <>
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Executes SQL SELECT statements, and sets resulting values to message context as local properties.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Connection</Typography>

                    <Field>
                        <Controller
                            name="connectionType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Connection Type" name="connectionType" items={["DB_CONNECTION", "DATA_SOURCE"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.connectionType && <Error>{errors.connectionType.message.toString()}</Error>}
                    </Field>

                    {watch("connectionType") == "DB_CONNECTION" &&
                    <Field>
                        <Controller
                            name="databaseConfiguration"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Database Configuration" size={50} placeholder="Customize the database configuration" />
                            )}
                        />
                        {errors.databaseConfiguration && <Error>{errors.databaseConfiguration.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("connectionType") == "DB_CONNECTION" &&
                    <Field>
                        <Controller
                            name="connectionDBType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Connection DB Type" name="connectionDbType" items={["OTHER", "MYSQL", "ORACLE", "MSSQL", "POSTGRESQL"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.connectionDBType && <Error>{errors.connectionDBType.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("connectionType") == "DB_CONNECTION" &&
                    <Field>
                        <Controller
                            name="isRegistryBasedDriverConfig"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Is Registry Based Driver Config</VSCodeCheckbox>
                            )}
                        />
                        {errors.isRegistryBasedDriverConfig && <Error>{errors.isRegistryBasedDriverConfig.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("connectionType") == "DB_CONNECTION") &&(watch("isRegistryBasedDriverConfig") == false) ) &&
                    <Field>
                        <Controller
                            name="connectionDBDriver"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Connection DB Driver" size={50} placeholder="Enter the database driver" />
                            )}
                        />
                        {errors.connectionDBDriver && <Error>{errors.connectionDBDriver.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("connectionType") == "DB_CONNECTION") &&(watch("isRegistryBasedDriverConfig") == true) ) &&
                    <Field>
                        <Controller
                            name="registryBasedonnectionDBDriver"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Registry Based Connection DB Driver" size={50} placeholder="Enter the database driver" />
                            )}
                        />
                        {errors.registryBasedonnectionDBDriver && <Error>{errors.registryBasedonnectionDBDriver.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("connectionType") == "DATA_SOURCE" &&
                    <Field>
                        <Controller
                            name="connectionDSType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Connection DS Type" name="connectionDsType" items={["EXTERNAL", "CARBON"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.connectionDSType && <Error>{errors.connectionDSType.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("connectionType") == "DATA_SOURCE" &&
                    <Field>
                        <Controller
                            name="connectionDSInitialContext"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Connection DS Initial Context" size={50} placeholder="Provide the DS initial context" />
                            )}
                        />
                        {errors.connectionDSInitialContext && <Error>{errors.connectionDSInitialContext.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("connectionType") == "DATA_SOURCE" &&
                    <Field>
                        <Controller
                            name="connectionDSName"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Connection DS Name" size={50} placeholder="Enter the DS name" />
                            )}
                        />
                        {errors.connectionDSName && <Error>{errors.connectionDSName.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDsType") == "EXTERNAL") )) &&
                    <Field>
                        <Controller
                            name="isRegistryBasedURLConfig"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Is Registry Based URL Config</VSCodeCheckbox>
                            )}
                        />
                        {errors.isRegistryBasedURLConfig && <Error>{errors.isRegistryBasedURLConfig.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("isRegistryBasedUrlConfig") == false) &&((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDsType") == "EXTERNAL") ))) &&
                    <Field>
                        <Controller
                            name="connectionURL"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Connection URL" size={50} placeholder="Enter the connection URL" />
                            )}
                        />
                        {errors.connectionURL && <Error>{errors.connectionURL.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("isRegistryBasedUrlConfig") == true) &&((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDsType") == "EXTERNAL") ))) &&
                    <Field>
                        <Controller
                            name="registryBasedURLConfigKey"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Registry Based URL Config Key" size={50} placeholder="Enter the registry based URL config key" />
                            )}
                        />
                        {errors.registryBasedURLConfigKey && <Error>{errors.registryBasedURLConfigKey.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDsType") == "EXTERNAL") )) &&
                    <Field>
                        <Controller
                            name="isRegistryBasedUserConfig"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Is Registry Based User Config</VSCodeCheckbox>
                            )}
                        />
                        {errors.isRegistryBasedUserConfig && <Error>{errors.isRegistryBasedUserConfig.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("isRegistryBasedUserConfig") == false) &&((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDsType") == "EXTERNAL") ))) &&
                    <Field>
                        <Controller
                            name="connectionUsername"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Connection Username" size={50} placeholder="Enter the connection username" />
                            )}
                        />
                        {errors.connectionUsername && <Error>{errors.connectionUsername.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("isRegistryBasedUserConfig") == true) &&((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDsType") == "EXTERNAL") ))) &&
                    <Field>
                        <Controller
                            name="registryBasedUserConfigKey"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Registry Based User Config Key" size={50} placeholder="Enter the registry based user config key" />
                            )}
                        />
                        {errors.registryBasedUserConfigKey && <Error>{errors.registryBasedUserConfigKey.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDsType") == "EXTERNAL") )) &&
                    <Field>
                        <Controller
                            name="isRegistryBasedPassConfig"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Is Registry Based Pass Config</VSCodeCheckbox>
                            )}
                        />
                        {errors.isRegistryBasedPassConfig && <Error>{errors.isRegistryBasedPassConfig.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("isRegistryBasedPassConfig") == false) &&((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDsType") == "EXTERNAL") ))) &&
                    <Field>
                        <Controller
                            name="connectionPassword"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Connection Password" size={50} placeholder="Enter the connection password" />
                            )}
                        />
                        {errors.connectionPassword && <Error>{errors.connectionPassword.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("isRegistryBasedPassConfig") == true) &&((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDsType") == "EXTERNAL") ))) &&
                    <Field>
                        <Controller
                            name="registryBasedPassConfigKey"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Registry Based Pass Config Key" size={50} placeholder="Enter the registry based password config key" />
                            )}
                        />
                        {errors.registryBasedPassConfigKey && <Error>{errors.registryBasedPassConfigKey.message.toString()}</Error>}
                    </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Statements</Typography>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">SQL Statements</Typography>
                        <Typography variant="body3">Editing of the properties of an object SQL Statement</Typography>

                        <Controller
                            name="sqlStatements"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <ParamManager
                                    paramConfigs={value}
                                    readonly={false}
                                    onChange= {(values) => {
                                        values.paramValues = values.paramValues.map((param: any, index: number) => {
                                            const property: ParamValue[] = param.paramValues;
                                            param.key = index;
                                            param.value = property[0].value;
                                            param.icon = 'query';

                                            (property[1].value as ParamConfig).paramValues = (property[1].value as ParamConfig).paramValues.map((param: any, index: number) => {
                                                const property: ParamValue[] = param.paramValues;
                                                param.key = index;
                                                param.value = index;
                                                param.icon = 'query';
                                                return param;
                                            });
            

                                            (property[3].value as ParamConfig).paramValues = (property[3].value as ParamConfig).paramValues.map((param: any, index: number) => {
                                                const property: ParamValue[] = param.paramValues;
                                                param.key = property[0].value;
                                                param.value = property[1].value;
                                                param.icon = 'query';
                                                return param;
                                            });
            
                                            return param;
                                        });
                                        onChange(values);
                                    }}
                                />
                            )}
                        />
                    </ComponentCard>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Properties</Typography>

                    <Field>
                        <Controller
                            name="propertyAutocommit"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Property Autocommit" name="propertyAutocommit" items={["DEFAULT", "true", "false"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.propertyAutocommit && <Error>{errors.propertyAutocommit.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="propertyIsolation"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Property Isolation" name="propertyIsolation" items={["DEFAULT", "Connection.TRANSACTION_NONE", "Connection.TRANSACTION_READ_COMMITTED", "Connection.TRANSACTION_UNCOMMITTED", "Connection.TRANSACTION_REPEATABLE_READ", "Connection.TRANSACTION.SERIALIZABLE"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.propertyIsolation && <Error>{errors.propertyIsolation.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="propertyMaxActive"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Max Active" size={50} placeholder="Enter the max active property" />
                            )}
                        />
                        {errors.propertyMaxActive && <Error>{errors.propertyMaxActive.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="propertyMaxIdle"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Max Idle" size={50} placeholder="Enter the max idle property" />
                            )}
                        />
                        {errors.propertyMaxIdle && <Error>{errors.propertyMaxIdle.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="propertyMaxOpenStatements"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Max Open Statements" size={50} placeholder="Enter the max open statements property" />
                            )}
                        />
                        {errors.propertyMaxOpenStatements && <Error>{errors.propertyMaxOpenStatements.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="propertyMaxWait"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Max Wait" size={50} placeholder="Enter the max wait property" />
                            )}
                        />
                        {errors.propertyMaxWait && <Error>{errors.propertyMaxWait.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="propertyMinIdle"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Min Idle" size={50} placeholder="Enter the min idle property" />
                            )}
                        />
                        {errors.propertyMinIdle && <Error>{errors.propertyMinIdle.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="propertyPoolStatements"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Property Pool Statements" name="propertyPoolStatements" items={["DEFAULT", "true", "false"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.propertyPoolStatements && <Error>{errors.propertyPoolStatements.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="propertyTestOnBorrow"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Property Test On Borrow" name="propertyTestOnBorrow" items={["DEFAULT", "true", "false"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.propertyTestOnBorrow && <Error>{errors.propertyTestOnBorrow.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="propertyTestWhileIdle"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Property Test While Idle" name="propertyTestWhileIdle" items={["DEFAULT", "true", "false"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.propertyTestWhileIdle && <Error>{errors.propertyTestWhileIdle.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="propertyValidationQuery"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Validation Query" size={50} placeholder="Enter the validation query property" />
                            )}
                        />
                        {errors.propertyValidationQuery && <Error>{errors.propertyValidationQuery.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="propertyInitialSize"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Initial Size" size={50} placeholder="Enter the initial size property" />
                            )}
                        />
                        {errors.propertyInitialSize && <Error>{errors.propertyInitialSize.message.toString()}</Error>}
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Misc</Typography>

                    <Field>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Description" size={50} placeholder="Enter a description" />
                            )}
                        />
                        {errors.description && <Error>{errors.description.message.toString()}</Error>}
                    </Field>

                </ComponentCard>


                <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
                    <Button
                        appearance="primary"
                        onClick={handleSubmit(onClick)}
                    >
                    Submit
                    </Button>
                </div>

            </div>
        </>
    );
};

export default DBLookupForm; 
