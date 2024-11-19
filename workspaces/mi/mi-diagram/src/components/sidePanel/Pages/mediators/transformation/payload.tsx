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
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, getParamManagerValues, getParamManagerFromValues } from '../../../../Form/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
import { ParamManager, ParamValue } from '../../../../Form/ParamManager/ParamManager';
import { handleOpenExprEditor, sidepanelGoBack } from '../../..';
import { CodeTextArea } from '../../../../Form/CodeTextArea';

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
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();
    const payloadPlaceholders:{[key:string]:string} = {
        "xml": "<inline/>",
        "json": "{\"Inline\":\"json\"}",
        "text": "Inline text"
    };

    useEffect(() => {
        reset({
            payloadFormat: sidePanelContext?.formValues?.payloadFormat || "Inline",
            mediaType: sidePanelContext?.formValues?.mediaType || "json",
            templateType: sidePanelContext?.formValues?.templateType || "Default",
            payloadKey: sidePanelContext?.formValues?.payloadKey || "",
            payload: sidePanelContext?.formValues?.payload || "",
            args: {
                paramValues: sidePanelContext?.formValues?.args ? getParamManagerFromValues(sidePanelContext?.formValues?.args, -1, 0) : [],
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
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)},
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
                            {
                                "0": {
                                    "isExpression": true
                                }
                            }
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

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    const onClick = async (values: any) => {
        setDiagramLoading(true);
        
        values["args"] = getParamManagerValues(values.args);
        const xml = getXML(MEDIATORS.PAYLOAD, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Replaces message payload with a new SOAP/JSON payload.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="payloadFormat"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                label="Payload Format"
                                name="payloadFormat"
                                items={["Inline", "Registry Reference"]}
                                value={field.value}
                                required={false}
                                errorMsg={errors?.payloadFormat?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="mediaType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                label="Media Type"
                                name="mediaType"
                                items={["xml", "json", "text"]}
                                value={field.value}
                                required={false}
                                errorMsg={errors?.mediaType?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="templateType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                label="Template Type"
                                name="templateType"
                                items={["Default", "Freemarker"]}
                                value={field.value}
                                required={false}
                                errorMsg={errors?.templateType?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>

                {watch("payloadFormat") == "Registry Reference" &&
                <Field>
                    <Controller
                        name="payloadKey"
                        control={control}
                        rules={
                            {
                                required: "This field is required",
                            }
                        }
                        render={({ field }) => (
                            <TextField {...field} label="Payload Key" size={50} placeholder="" required={true} errorMsg={errors?.payloadKey?.message?.toString()} />
                        )}
                    />
                </Field>
                }

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Payload</Typography>

                    {watch("payloadFormat") == "Inline" &&
                    <Field>
                        <Controller
                            name="payload"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <CodeTextArea {...field} label="Payload" placeholder={payloadPlaceholders[watch("mediaType")]} required={true} resize="vertical" growRange={{ start: 5, offset: 10 }} errorMsg={errors?.payload?.message?.toString()} />
                            )}
                        />
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
                                            param.key = index + 1;
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

export default PayloadForm; 
