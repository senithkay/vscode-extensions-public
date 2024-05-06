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
import { AutoComplete, Button, ComponentCard, ProgressIndicator, TextField, TextArea, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, getParamManagerValues, getParamManagerFromValues } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
import { ParamManager, ParamValue } from '../../../../Form/ParamManager/ParamManager';

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

const PayloadForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            payloadFormat: sidePanelContext?.formValues?.payloadFormat || "",
            mediaType: sidePanelContext?.formValues?.mediaType || "json",
            templateType: sidePanelContext?.formValues?.templateType || "Default",
            payloadKey: sidePanelContext?.formValues?.payloadKey || "",
            payload: sidePanelContext?.formValues?.payload || "{\"Sample\":\"Payload\"}",
            args: {
                paramValues: sidePanelContext?.formValues?.args ? getParamManagerFromValues(sidePanelContext?.formValues?.args) : [],
                paramFields: [
                    {
                        "type": "ExprField",
                        "label": "Argument Value",
                        "defaultValue": {
                            "isExpression": false,
                            "value": ""
                        },
                        "isRequired": false,
                        "canChange": true, 
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
                        "label": "Evaluator",
                        "defaultValue": "xml",
                        "isRequired": false,
                        "values": [
                            "xml",
                            "json"
                        ],
                        "enableCondition": [
                            "isExpression",
                            "argumentValue"
                        ]
                    },
                    {
                        "type": "Checkbox",
                        "label": "Literal",
                        "defaultValue": false,
                        "isRequired": false
                    },
                ]
            },
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        values["args"] = getParamManagerValues(values.args);
        const xml = getXML(MEDIATORS.PAYLOAD, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Replaces message payload with a new SOAP/JSON payload.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="payloadFormat"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Payload Format" name="payloadFormat" items={["Inline", "Registry Reference"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.payloadFormat && <Error>{errors.payloadFormat.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="mediaType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Media Type" name="mediaType" items={["xml", "json", "text"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.mediaType && <Error>{errors.mediaType.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="templateType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Template Type" name="templateType" items={["Default", "Freemarker"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.templateType && <Error>{errors.templateType.message.toString()}</Error>}
                </Field>

                {watch("payloadFormat") == "Registry Reference" &&
                <Field>
                    <Controller
                        name="payloadKey"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Payload Key" size={50} placeholder="" />
                        )}
                    />
                    {errors.payloadKey && <Error>{errors.payloadKey.message.toString()}</Error>}
                </Field>
                }

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Payload</Typography>

                    {watch("payloadFormat") == "Inline" &&
                    <Field>
                        <Controller
                            name="payload"
                            control={control}
                            render={({ field }) => (
                                <TextArea {...field} label="Payload" placeholder="" />
                            )}
                        />
                        {errors.payload && <Error>{errors.payload.message.toString()}</Error>}
                    </Field>
                    }

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Args</Typography>
                        <Typography variant="body3">Editing of the properties of an object Payload Factory Argument</Typography>

                        <Controller
                            name="args"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <ParamManager
                                    paramConfigs={value}
                                    readonly={false}
                                    onChange= {(values) => {
                                        values.paramValues = values.paramValues.map((param: any, index: number) => {
                                            const property: ParamValue[] = param.paramValues;
                                            param.key = index;
                                            param.value = (property[0].value as ExpressionFieldValue).value;
                                            param.icon = 'query';
                                            return param;
                                        });
                                        onChange(values);
                                    }}
                                />
                            )}
                        />
                    </ComponentCard>

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

export default PayloadForm; 
