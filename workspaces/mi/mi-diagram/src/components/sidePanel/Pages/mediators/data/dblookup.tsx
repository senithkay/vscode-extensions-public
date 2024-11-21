/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/
// AUTO-GENERATED FILE. DO NOT MODIFY.

import React, { useEffect, useRef } from 'react';
import { AutoComplete, Button, ComponentCard, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, openPopup, getParamManagerValues, getParamManagerFromValues } from '../../../../Form/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ExpressionFieldValue, FlexLabelContainer, Label, Link } from '../../../../Form/ExpressionField/ExpressionInput';
import { ParamManager, ParamConfig, ParamValue } from '../../../../Form/ParamManager/ParamManager';
import { handleOpenExprEditor, sidepanelGoBack } from '../../..';
import TryOutView from '../tryout';

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
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });
    const [isTryout, setTryout] = React.useState(false);
    const [isSchemaView, setIsSchemaView] = React.useState(false);
    const [schema, setSchema] = React.useState<any>({});

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            connectionType: sidePanelContext?.formValues?.connectionType || "DB_CONNECTION",
            connectionDBType: sidePanelContext?.formValues?.connectionDBType || "OTHER",
            isRegistryBasedDriverConfig: sidePanelContext?.formValues?.isRegistryBasedDriverConfig || "",
            connectionDBDriver: sidePanelContext?.formValues?.connectionDBDriver || "",
            registryBasedConnectionDBDriver: sidePanelContext?.formValues?.registryBasedConnectionDBDriver || "",
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
                paramValues: sidePanelContext?.formValues?.sqlStatements ? getParamManagerFromValues(sidePanelContext?.formValues?.sqlStatements, -1, 0) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Query String",
                        "defaultValue": "",
                        "isRequired": true
                    },
                    {
                        "type": "ParamManager",
                        "label": "Parameters",
                        "defaultValue": "",
                        "isRequired": false, 
                        "paramManager": {
                            paramConfigs: {
                                paramValues: sidePanelContext?.formValues?.parameters ? getParamManagerFromValues(sidePanelContext?.formValues?.parameters, -1, -1) : [],
                                paramFields: [
                                    {
                                        "type": "Dropdown",
                                        "label": "Data Type",
                                        "defaultValue": "CHAR",
                                        "placeholder": "Select the data type",
                                        "isRequired": true,
                                        "values": [
                                            "CHAR",
                                            "VARCHAR",
                                            "LONGVARCHAR",
                                            "NUMERIC",
                                            "DECIMAL",
                                            "BIT",
                                            "TINYINT",
                                            "SMALLINT",
                                            "INTEGER",
                                            "BIGINT",
                                            "REAL",
                                            "FLOAT",
                                            "DOUBLE",
                                            "DATE",
                                            "TIME",
                                            "TIMESTAMP"
                                        ]
                                    },
                                    {
                                        "type": "Dropdown",
                                        "label": "Value Type",
                                        "defaultValue": "LITERAL",
                                        "placeholder": "Select the value type",
                                        "isRequired": true,
                                        "values": [
                                            "LITERAL",
                                            "EXPRESSION"
                                        ]
                                    },
                                    {
                                        "type": "TextField",
                                        "label": "Value Literal",
                                        "defaultValue": "",
                                        "placeholder": "Enter the value literal",
                                        "isRequired": true,
                                        "enableCondition": [
                                            {
                                                "1": "LITERAL"
                                            }
                                        ]
                                    },
                                    {
                                        "type": "ExprField",
                                        "label": "Value Expression",
                                        "defaultValue": {
                                            "isExpression": true,
                                            "value": ""
                                        },
                                        "placeholder": "Enter the value expression",
                                        "isRequired": true,
                                        "canChange": false,
                                        "enableCondition": [
                                            {
                                                "1": "EXPRESSION"
                                            }
                                        ], 
                                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)},
                                ]
                            },
                            openInDrawer: true,
                            addParamText: "New Parameters"
                        },
                    },
                    {
                        "type": "ParamManager",
                        "label": "Results",
                        "defaultValue": "",
                        "isRequired": false, 
                        "paramManager": {
                            paramConfigs: {
                                paramValues: sidePanelContext?.formValues?.results ? getParamManagerFromValues(sidePanelContext?.formValues?.results, -1, -1) : [],
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

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);


    const onTryOut = async (values: any) => {
        // setTryout(true);
        
        values["sqlStatements"] = getParamManagerValues(values.sqlStatements);
        const xml = getXML(MEDIATORS.DBLOOKUP, values, dirtyFields, sidePanelContext.formValues);
        let edits;
        if(Array.isArray(xml)){
            edits = xml;
        } else {
            edits = [{range: props.nodePosition, text: xml}];
        }
        const res = await rpcClient.getMiDiagramRpcClient().tryOutMediator({file: props.documentUri, line:props.nodePosition.start.line,column:props.nodePosition.start.character+1, edits});
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            isTryoutOpen: true,
            inputOutput: res,
        });
    }

    const onClickConfigure = async (values:any) => {
        setIsSchemaView(false);
    }

    const onClickSchema = async (values:any) => {
        
        values["sqlStatements"] = getParamManagerValues(values.sqlStatements);
        setIsSchemaView(true);
        const xml = getXML(MEDIATORS.DBLOOKUP, values, dirtyFields, sidePanelContext.formValues);
        let edits;
        if(Array.isArray(xml)){
            edits = xml;
        } else {
            edits = [{range: props.nodePosition, text: xml}];
        }
        const res = await rpcClient.getMiDiagramRpcClient().getMediatorInputOutputSchema({file: props.documentUri, line:props.nodePosition.start.line,column:props.nodePosition.start.character+1, edits: edits});
        setSchema(res);
    }

    const onClick = async (values: any) => {
        setDiagramLoading(true);
        
        values["sqlStatements"] = getParamManagerValues(values.sqlStatements);
        const xml = getXML(MEDIATORS.DBLOOKUP, values, dirtyFields, sidePanelContext.formValues);
        const trailingSpaces = props.trailingSpace;
        if (Array.isArray(xml)) {
            for (let i = 0; i < xml.length; i++) {
                await rpcClient.getMiDiagramRpcClient().applyEdit({
                    documentUri: props.documentUri, range: xml[i].range, text: `${xml[i].text}${trailingSpaces}`
                });
            }
        } else {
            rpcClient.getMiDiagramRpcClient().applyEdit({
                documentUri: props.documentUri, range: props.nodePosition, text: `${xml}${trailingSpaces}`
            });
        }
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            isOpen: false,
            isTryoutOpen: false,
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Executes SQL SELECT statements, and sets resulting values to message context as local properties.</Typography>
            <br />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                <Button
                    onClick={handleSubmit(onClickConfigure)}
                >
                   Configuration
                </Button>
                <Button
                    onClick={handleSubmit(onClickSchema)}
                >
                   Input/Output
                </Button>
            </div>
            {!isSchemaView && <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Connection</Typography>

                    <Field>
                        <Controller
                            name="connectionType"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <AutoComplete
                                    label="Connection Type"
                                    name="connectionType"
                                    items={["DB_CONNECTION", "DATA_SOURCE"]}
                                    value={field.value}
                                    required={true}
                                    errorMsg={errors?.connectionType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    {watch("connectionType") == "DB_CONNECTION" &&
                    <Field>
                        <Controller
                            name="connectionDBType"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <>
                                    <FlexLabelContainer>
                                        <Label>Connection DB Type</Label>
                                        <Link onClick={() => {
                                            openPopup(rpcClient, "addDriver", undefined, undefined, props.documentUri, { identifier: watch("connectionDBType") });

                                        }}>
                                            <Typography variant="body3" sx={{
                                                color: "var(--vscode-textLink-activeForeground)",
                                            }}>Manage Drivers</Typography>
                                        </Link>
                                    </FlexLabelContainer>
                                    <AutoComplete
                                        name="connectionDbType"
                                        items={["OTHER", "MYSQL", "ORACLE", "MSSQL", "POSTGRESQL"]}
                                        value={field.value}
                                        errorMsg={errors?.connectionDBType?.message?.toString()}
                                        onValueChange={(e: any) => {
                                            field.onChange(e);
                                        }}
                                    />
                                </>
                            )}
                        />
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
                    </Field>
                    }

                    {((watch("connectionType") == "DB_CONNECTION") &&(watch("isRegistryBasedDriverConfig") == false) ) &&
                    <Field>
                        <Controller
                            name="connectionDBDriver"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Connection DB Driver" size={50} placeholder="Enter the database driver" required={true} errorMsg={errors?.connectionDBDriver?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {((watch("connectionType") == "DB_CONNECTION") &&(watch("isRegistryBasedDriverConfig") == true) ) &&
                    <Field>
                        <Controller
                            name="registryBasedConnectionDBDriver"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Registry Based Connection DB Driver" size={50} placeholder="Enter the database driver" required={true} errorMsg={errors?.registryBasedConnectionDBDriver?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {watch("connectionType") == "DATA_SOURCE" &&
                    <Field>
                        <Controller
                            name="connectionDSType"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <AutoComplete
                                    label="Connection DS Type"
                                    name="connectionDsType"
                                    items={["EXTERNAL", "CARBON"]}
                                    value={field.value}
                                    required={true}
                                    errorMsg={errors?.connectionDSType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>
                    }

                    {watch("connectionType") == "DATA_SOURCE" &&
                    <Field>
                        <Controller
                            name="connectionDSInitialContext"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Connection DS Initial Context" size={50} placeholder="Provide the DS initial context" required={true} errorMsg={errors?.connectionDSInitialContext?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {watch("connectionType") == "DATA_SOURCE" &&
                    <Field>
                        <Controller
                            name="connectionDSName"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Connection DS Name" size={50} placeholder="Enter the DS name" required={true} errorMsg={errors?.connectionDSName?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDSType") == "EXTERNAL") )) &&
                    <Field>
                        <Controller
                            name="isRegistryBasedURLConfig"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Is Registry Based URL Config</VSCodeCheckbox>
                            )}
                        />
                    </Field>
                    }

                    {((watch("isRegistryBasedURLConfig") == false) &&((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDSType") == "EXTERNAL") ))) &&
                    <Field>
                        <Controller
                            name="connectionURL"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Connection URL" size={50} placeholder="Enter the connection URL" required={true} errorMsg={errors?.connectionURL?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {((watch("isRegistryBasedURLConfig") == true) &&((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDSType") == "EXTERNAL") ))) &&
                    <Field>
                        <Controller
                            name="registryBasedURLConfigKey"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Registry Based URL Config Key" size={50} placeholder="Enter the registry based URL config key" required={true} errorMsg={errors?.registryBasedURLConfigKey?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDSType") == "EXTERNAL") )) &&
                    <Field>
                        <Controller
                            name="isRegistryBasedUserConfig"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Is Registry Based User Config</VSCodeCheckbox>
                            )}
                        />
                    </Field>
                    }

                    {((watch("isRegistryBasedUserConfig") == false) &&((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDSType") == "EXTERNAL") ))) &&
                    <Field>
                        <Controller
                            name="connectionUsername"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Connection Username" size={50} placeholder="Enter the connection username" required={true} errorMsg={errors?.connectionUsername?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {((watch("isRegistryBasedUserConfig") == true) &&((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDSType") == "EXTERNAL") ))) &&
                    <Field>
                        <Controller
                            name="registryBasedUserConfigKey"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Registry Based User Config Key" size={50} placeholder="Enter the registry based user config key" required={true} errorMsg={errors?.registryBasedUserConfigKey?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDSType") == "EXTERNAL") )) &&
                    <Field>
                        <Controller
                            name="isRegistryBasedPassConfig"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Is Registry Based Pass Config</VSCodeCheckbox>
                            )}
                        />
                    </Field>
                    }

                    {((watch("isRegistryBasedPassConfig") == false) &&((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDSType") == "EXTERNAL") ))) &&
                    <Field>
                        <Controller
                            name="connectionPassword"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Connection Password" size={50} placeholder="Enter the connection password" required={true} errorMsg={errors?.connectionPassword?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {((watch("isRegistryBasedPassConfig") == true) &&((watch("connectionType") == "DB_CONNECTION") ||((watch("connectionType") == "DATA_SOURCE") &&(watch("connectionDSType") == "EXTERNAL") ))) &&
                    <Field>
                        <Controller
                            name="registryBasedPassConfigKey"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Registry Based Pass Config Key" size={50} placeholder="Enter the registry based password config key" required={true} errorMsg={errors?.registryBasedPassConfigKey?.message?.toString()} />
                            )}
                        />
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
                            rules={{
                                validate: (value) => {
                                    if (!value.paramValues || value.paramValues.length === 0) {
                                        return "This table is required";
                                    }
                                    return true;
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <ParamManager
                                    paramConfigs={value}
                                    readonly={false}
                                    errorMessage={errors?.sqlStatements?.message?.toString()}
                                    onChange= {(values) => {
                                        values.paramValues = values.paramValues.map((param: any, index: number) => {
                                            const property: ParamValue[] = param.paramValues;
                                            param.key = index + 1;
                                            param.value = property[0].value;
                                            param.icon = 'query';

                                            (property[1].value as ParamConfig).paramValues = (property[1].value as ParamConfig).paramValues.map((param: any, index: number) => {
                                                const property: ParamValue[] = param.paramValues;
                                                param.key = property[0].value;
                                                param.value = property[2].value;
                                                param.icon = 'query';
                                                return param;
                                            });
            

                                            (property[2].value as ParamConfig).paramValues = (property[2].value as ParamConfig).paramValues.map((param: any, index: number) => {
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
                                <AutoComplete
                                    label="Property Autocommit"
                                    name="propertyAutocommit"
                                    items={["DEFAULT", "true", "false"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.propertyAutocommit?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="propertyIsolation"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Property Isolation"
                                    name="propertyIsolation"
                                    items={["DEFAULT", "Connection.TRANSACTION_NONE", "Connection.TRANSACTION_READ_COMMITTED", "Connection.TRANSACTION_UNCOMMITTED", "Connection.TRANSACTION_REPEATABLE_READ", "Connection.TRANSACTION.SERIALIZABLE"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.propertyIsolation?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="propertyMaxActive"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Max Active" size={50} placeholder="Enter the max active property" required={false} errorMsg={errors?.propertyMaxActive?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="propertyMaxIdle"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Max Idle" size={50} placeholder="Enter the max idle property" required={false} errorMsg={errors?.propertyMaxIdle?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="propertyMaxOpenStatements"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Max Open Statements" size={50} placeholder="Enter the max open statements property" required={false} errorMsg={errors?.propertyMaxOpenStatements?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="propertyMaxWait"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Max Wait" size={50} placeholder="Enter the max wait property" required={false} errorMsg={errors?.propertyMaxWait?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="propertyMinIdle"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Min Idle" size={50} placeholder="Enter the min idle property" required={false} errorMsg={errors?.propertyMinIdle?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="propertyPoolStatements"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Property Pool Statements"
                                    name="propertyPoolStatements"
                                    items={["DEFAULT", "true", "false"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.propertyPoolStatements?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="propertyTestOnBorrow"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Property Test On Borrow"
                                    name="propertyTestOnBorrow"
                                    items={["DEFAULT", "true", "false"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.propertyTestOnBorrow?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="propertyTestWhileIdle"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Property Test While Idle"
                                    name="propertyTestWhileIdle"
                                    items={["DEFAULT", "true", "false"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.propertyTestWhileIdle?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="propertyValidationQuery"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Validation Query" size={50} placeholder="Enter the validation query property" required={false} errorMsg={errors?.propertyValidationQuery?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="propertyInitialSize"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Property Initial Size" size={50} placeholder="Enter the initial size property" required={false} errorMsg={errors?.propertyInitialSize?.message?.toString()} />
                            )}
                        />
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Misc</Typography>

                    <Field>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Description" size={50} placeholder="Enter a description" required={false} errorMsg={errors?.description?.message?.toString()} />
                            )}
                        />
                    </Field>

                </ComponentCard>


                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                    <Button
                        onClick={handleSubmit(onTryOut)}
                        sx={{ marginRight: '10px' }}
                    >
                        Try Out
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleSubmit(onClick)}
                    >
                        Submit
                    </Button>
                </div>

            </div>}
            {isSchemaView &&
            <TryOutView data={schema} isSchemaView={true} />
            }
        </>
    );
};

export default DBLookupForm; 
