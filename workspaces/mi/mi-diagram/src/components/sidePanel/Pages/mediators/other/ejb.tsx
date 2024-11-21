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
import { AddMediatorProps, getParamManagerValues, getParamManagerFromValues } from '../../../../Form/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ExpressionField, ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
import { ParamManager, ParamValue } from '../../../../Form/ParamManager/ParamManager';
import { handleOpenExprEditor, sidepanelGoBack } from '../../..';

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
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

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
                paramValues: sidePanelContext?.formValues?.methodArguments ? getParamManagerFromValues(sidePanelContext?.formValues?.methodArguments, 0, 2) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Property Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "Dropdown",
                        "label": "Property Value Type",
                        "defaultValue": "LITERAL",
                        "isRequired": false,
                        "values": [
                            "LITERAL",
                            "EXPRESSION"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Property Value",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            {
                                "1": "LITERAL"
                            }
                        ]
                    },
                    {
                        "type": "ExprField",
                        "label": "Property Expression",
                        "defaultValue": {
                            "isExpression": true,
                            "value": ""
                        },
                        "isRequired": false,
                        "canChange": false,
                        "enableCondition": [
                            {
                                "1": "EXPRESSION"
                            }
                        ], 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)},
                ]
            },
            sessionIdType: sidePanelContext?.formValues?.sessionIdType || "LITERAL",
            sessionIdLiteral: sidePanelContext?.formValues?.sessionIdLiteral || "",
            sessionIdExpression: sidePanelContext?.formValues?.sessionIdExpression || {"isExpression":true,"value":""},
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    const onClick = async (values: any) => {
        setDiagramLoading(true);
        
        values["methodArguments"] = getParamManagerValues(values.methodArguments);
        const xml = getXML(MEDIATORS.EJB, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Calls EJB (Stateless/Stateful) and stores result in message payload/property.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="beanstalk"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Beanstalk" size={50} placeholder="" required={false} errorMsg={errors?.beanstalk?.message?.toString()} />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="class"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Class" size={50} placeholder="" required={false} errorMsg={errors?.class?.message?.toString()} />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="method"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Method" size={50} placeholder="" required={false} errorMsg={errors?.method?.message?.toString()} />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="remove"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Remove</VSCodeCheckbox>
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="target"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Target" size={50} placeholder="" required={false} errorMsg={errors?.target?.message?.toString()} />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="jndiName"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="JNDI Name" size={50} placeholder="" required={false} errorMsg={errors?.jndiName?.message?.toString()} />
                        )}
                    />
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
                                        const property: ParamValue[] = param.paramValues;
                                        param.key = property[0].value;
                                        param.value = property[2].value;
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
                                <AutoComplete
                                    label="Session Id Type"
                                    name="sessionIdType"
                                    items={["LITERAL", "EXPRESSION"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.sessionIdType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    {watch("sessionIdType") == "LITERAL" &&
                    <Field>
                        <Controller
                            name="sessionIdLiteral"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Session Id Literal" size={50} placeholder="" required={false} errorMsg={errors?.sessionIdLiteral?.message?.toString()} />
                            )}
                        />
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
                                    required={false}
                                    errorMsg={errors?.sessionIdExpression?.message?.toString()}
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>
                    }

                </ComponentCard>

                <Field>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Description" size={50} placeholder="" required={false} errorMsg={errors?.description?.message?.toString()} />
                        )}
                    />
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
