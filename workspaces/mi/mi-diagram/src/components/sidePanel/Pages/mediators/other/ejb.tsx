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
import { AutoComplete, Button, ComponentCard, ExpressionField, ExpressionFieldValue, ParamManager, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';

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

const EJBForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            beanstalk: sidePanelContext?.formValues?.beanstalk || "",
            class: sidePanelContext?.formValues?.class || "",
            method: sidePanelContext?.formValues?.method || "",
            remove: sidePanelContext?.formValues?.remove || "",
            target: sidePanelContext?.formValues?.target || "",
            jndiName: sidePanelContext?.formValues?.jndiName || "",
            methodArguments: {
                paramValues: sidePanelContext?.formValues?.methodArguments && sidePanelContext?.formValues?.methodArguments.map((property: string|ExpressionFieldValue[], index: string) => (
                    {
                        id: index,
                        key: typeof property[0] === 'object' ? property[0].value : property[0],
                        value: typeof property[2] === 'object' ? property[2].value : property[2],
                        icon: 'query',
                        paramValues: [
                            { value: property[0] },
                            { value: property[1] },
                            { value: property[2] },
                            { value: property[3] },
                        ]
                    }
                )) || [] as string[][],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Property Name",
                        "defaultValue": "",
                        "isRequired": false, 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }},
                    {
                        "type": "Dropdown",
                        "label": "Property Value Type",
                        "defaultValue": "LITERAL",
                        "isRequired": false,
                        "values": [
                            "LITERAL",
                            "EXPRESSION"
                        ], 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }},
                    {
                        "type": "TextField",
                        "label": "Property Value",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            {
                                "1": "LITERAL"
                            }
                        ], 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }},
                    {
                        "type": "TextField",
                        "label": "Property Expression",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            {
                                "1": "EXPRESSION"
                            }
                        ], 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }},
                ]
            },
            sessionIdType: sidePanelContext?.formValues?.sessionIdType || "LITERAL",
            sessionIdLiteral: sidePanelContext?.formValues?.sessionIdLiteral || "",
            sessionIdExpression: sidePanelContext?.formValues?.sessionIdExpression || {"isExpression":true,"value":""},
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        values["methodArguments"] = values.methodArguments.paramValues.map((param: any) => param.paramValues.map((p: any) => p.value));
        const xml = getXML(MEDIATORS.EJB, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Calls EJB (Stateless/Stateful) and stores result in message payload/property.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="beanstalk"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Beanstalk" size={50} placeholder="" />
                        )}
                    />
                    {errors.beanstalk && <Error>{errors.beanstalk.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="class"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Class" size={50} placeholder="" />
                        )}
                    />
                    {errors.class && <Error>{errors.class.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="method"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Method" size={50} placeholder="" />
                        )}
                    />
                    {errors.method && <Error>{errors.method.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="remove"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Remove</VSCodeCheckbox>
                        )}
                    />
                    {errors.remove && <Error>{errors.remove.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="target"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Target" size={50} placeholder="" />
                        )}
                    />
                    {errors.target && <Error>{errors.target.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="jndiName"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="JNDI Name" size={50} placeholder="" />
                        )}
                    />
                    {errors.jndiName && <Error>{errors.jndiName.message.toString()}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Method Arguments</Typography>
                    <Typography variant="body3">Editing of the properties of an object Method Argument</Typography>

                    <Controller
                        name="methodArguments"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <ParamManager
                                paramConfigs={value}
                                readonly={false}
                                onChange= {(values) => {
                                    values.paramValues = values.paramValues.map((param: any, index: number) => {
                                        const paramValues = param.paramValues;
                                        param.key = paramValues[0].value;
                                        param.value = paramValues[2].value;
                                        if (paramValues[1]?.value?.isExpression) {
                                            param.namespaces = paramValues[1].value.namespaces;
                                        }
                                        param.icon = 'query';
                                        return param;
                                    });
                                    onChange(values);
                                }}
                            />
                        )}
                    />
                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Session</Typography>

                    <Field>
                        <Controller
                            name="sessionIdType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Session Id Type" name="sessionIdType" items={["LITERAL", "EXPRESSION"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.sessionIdType && <Error>{errors.sessionIdType.message.toString()}</Error>}
                    </Field>

                    {watch("sessionIdType") == "LITERAL" &&
                    <Field>
                        <Controller
                            name="sessionIdLiteral"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Session Id Literal" size={50} placeholder="" />
                            )}
                        />
                        {errors.sessionIdLiteral && <Error>{errors.sessionIdLiteral.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("sessionIdType") == "EXPRESSION" &&
                    <Field>
                        <Controller
                            name="sessionIdExpression"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Session Id Expression"
                                    placeholder=""
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => {
                                        sidePanelContext.setSidePanelState({
                                            ...sidePanelContext,
                                            expressionEditor: {
                                                isOpen: true,
                                                value,
                                                setValue
                                            }
                                        });
                                    }}
                                />
                            )}
                        />
                        {errors.sessionIdExpression && <Error>{errors.sessionIdExpression.message.toString()}</Error>}
                    </Field>
                    }

                </ComponentCard>

                <Field>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Description" size={50} placeholder="" />
                        )}
                    />
                    {errors.description && <Error>{errors.description.message.toString()}</Error>}
                </Field>


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

export default EJBForm; 
