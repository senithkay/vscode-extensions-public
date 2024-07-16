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
import { Button, ComponentCard, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, getParamManagerValues, getParamManagerFromValues } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
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

const PublishEventForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            streamName: sidePanelContext?.formValues?.streamName || "",
            streamVersion: sidePanelContext?.formValues?.streamVersion || "",
            eventSink: sidePanelContext?.formValues?.eventSink || "",
            async: sidePanelContext?.formValues?.async || "",
            asyncTimeout: sidePanelContext?.formValues?.asyncTimeout || "",
            metaAttributes: {
                paramValues: sidePanelContext?.formValues?.metaAttributes ? getParamManagerFromValues(sidePanelContext?.formValues?.metaAttributes, 0, 3) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Attribute Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "Dropdown",
                        "label": "Attribute Value Type",
                        "defaultValue": "LITERAL",
                        "isRequired": false,
                        "values": [
                            "LITERAL",
                            "EXPRESSION"
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "Attribute Type",
                        "defaultValue": "STRING",
                        "isRequired": false,
                        "values": [
                            "STRING",
                            "INTEGER",
                            "BOOLEAN",
                            "DOUBLE",
                            "FLOAT",
                            "LONG"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Attribute Value",
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
                        "label": "Attribute Expression",
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
                    {
                        "type": "TextField",
                        "label": "Default Value",
                        "defaultValue": "",
                        "isRequired": false
                    },
                ]
            },
            correlationAttributes: {
                paramValues: sidePanelContext?.formValues?.correlationAttributes ? getParamManagerFromValues(sidePanelContext?.formValues?.correlationAttributes, 0, 3) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Attribute Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "Dropdown",
                        "label": "Attribute Value Type",
                        "defaultValue": "LITERAL",
                        "isRequired": false,
                        "values": [
                            "LITERAL",
                            "EXPRESSION"
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "Attribute Type",
                        "defaultValue": "STRING",
                        "isRequired": false,
                        "values": [
                            "STRING",
                            "INTEGER",
                            "BOOLEAN",
                            "DOUBLE",
                            "FLOAT",
                            "LONG"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Attribute Value",
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
                        "label": "Attribute Expression",
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
                    {
                        "type": "TextField",
                        "label": "Default Value",
                        "defaultValue": "",
                        "isRequired": false
                    },
                ]
            },
            payloadAttributes: {
                paramValues: sidePanelContext?.formValues?.payloadAttributes ? getParamManagerFromValues(sidePanelContext?.formValues?.payloadAttributes, 0, 3) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Attribute Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "Dropdown",
                        "label": "Attribute Value Type",
                        "defaultValue": "LITERAL",
                        "isRequired": false,
                        "values": [
                            "LITERAL",
                            "EXPRESSION"
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "Attribute Type",
                        "defaultValue": "STRING",
                        "isRequired": false,
                        "values": [
                            "STRING",
                            "INTEGER",
                            "BOOLEAN",
                            "DOUBLE",
                            "FLOAT",
                            "LONG"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Attribute Value",
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
                        "label": "Attribute Expression",
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
                    {
                        "type": "TextField",
                        "label": "Default Value",
                        "defaultValue": "",
                        "isRequired": false
                    },
                ]
            },
            arbitaryAttributes: {
                paramValues: sidePanelContext?.formValues?.arbitaryAttributes ? getParamManagerFromValues(sidePanelContext?.formValues?.arbitaryAttributes, 0, 3) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Attribute Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "Dropdown",
                        "label": "Attribute Value Type",
                        "defaultValue": "LITERAL",
                        "isRequired": false,
                        "values": [
                            "LITERAL",
                            "EXPRESSION"
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "Attribute Type",
                        "defaultValue": "STRING",
                        "isRequired": false,
                        "values": [
                            "STRING",
                            "INTEGER",
                            "BOOLEAN",
                            "DOUBLE",
                            "FLOAT",
                            "LONG"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Attribute Value",
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
                        "label": "Attribute Expression",
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
                    {
                        "type": "TextField",
                        "label": "Default Value",
                        "defaultValue": "",
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
        
        values["metaAttributes"] = getParamManagerValues(values.metaAttributes);
        values["correlationAttributes"] = getParamManagerValues(values.correlationAttributes);
        values["payloadAttributes"] = getParamManagerValues(values.payloadAttributes);
        values["arbitaryAttributes"] = getParamManagerValues(values.arbitaryAttributes);
        const xml = getXML(MEDIATORS.PUBLISHEVENT, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Constructs and publishes events to different systems such as WSO2 BAM/DAS/CEP/SP via event sinks.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="streamName"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Stream Name" size={50} placeholder="" />
                        )}
                    />
                    {errors.streamName && <Error>{errors.streamName.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="streamVersion"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Stream Version" size={50} placeholder="" />
                        )}
                    />
                    {errors.streamVersion && <Error>{errors.streamVersion.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="eventSink"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Event Sink" size={50} placeholder="" />
                        )}
                    />
                    {errors.eventSink && <Error>{errors.eventSink.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="async"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Async</VSCodeCheckbox>
                        )}
                    />
                    {errors.async && <Error>{errors.async.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="asyncTimeout"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Async Timeout" size={50} placeholder="" />
                        )}
                    />
                    {errors.asyncTimeout && <Error>{errors.asyncTimeout.message.toString()}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Meta Attributes</Typography>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Meta Attributes</Typography>
                        <Typography variant="body3">Editing of the properties of an object PublishEvent Mediator Attribute</Typography>

                        <Controller
                            name="metaAttributes"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <ParamManager
                                    paramConfigs={value}
                                    readonly={false}
                                    onChange= {(values) => {
                                        values.paramValues = values.paramValues.map((param: any, index: number) => {
                                            const property: ParamValue[] = param.paramValues;
                                            param.key = property[0].value;
                                            param.value = property[3].value;
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

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Correlation Attributes</Typography>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Correlation Attributes</Typography>
                        <Typography variant="body3">Editing of the properties of an object PublishEvent Mediator Attribute</Typography>

                        <Controller
                            name="correlationAttributes"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <ParamManager
                                    paramConfigs={value}
                                    readonly={false}
                                    onChange= {(values) => {
                                        values.paramValues = values.paramValues.map((param: any, index: number) => {
                                            const property: ParamValue[] = param.paramValues;
                                            param.key = property[0].value;
                                            param.value = property[3].value;
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

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Payload Attributes</Typography>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Payload Attributes</Typography>
                        <Typography variant="body3">Editing of the properties of an object PublishEvent Mediator Attribute</Typography>

                        <Controller
                            name="payloadAttributes"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <ParamManager
                                    paramConfigs={value}
                                    readonly={false}
                                    onChange= {(values) => {
                                        values.paramValues = values.paramValues.map((param: any, index: number) => {
                                            const property: ParamValue[] = param.paramValues;
                                            param.key = property[0].value;
                                            param.value = property[3].value;
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

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Arbitrary Attributes</Typography>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Arbitary Attributes</Typography>
                        <Typography variant="body3">Editing of the properties of an object PublishEvent Mediator Attribute</Typography>

                        <Controller
                            name="arbitaryAttributes"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <ParamManager
                                    paramConfigs={value}
                                    readonly={false}
                                    onChange= {(values) => {
                                        values.paramValues = values.paramValues.map((param: any, index: number) => {
                                            const property: ParamValue[] = param.paramValues;
                                            param.key = property[0].value;
                                            param.value = property[3].value;
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

export default PublishEventForm; 
