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

const CommandForm = (props: AddMediatorProps) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            className: sidePanelContext?.formValues?.className || "",
            properties: {
                paramValues: sidePanelContext?.formValues?.properties ? getParamManagerFromValues(sidePanelContext?.formValues?.properties, 0, 2) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Property Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "Dropdown",
                        "label": "Value Type",
                        "defaultValue": "LITERAL",
                        "isRequired": false,
                        "values": [
                            "LITERAL",
                            "MESSAGE_ELEMENT",
                            "CONTEXT_PROPERTY"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Value Literal",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            {
                                "1": "LITERAL"
                            }
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "Message Action",
                        "defaultValue": "ReadMessage",
                        "isRequired": false,
                        "values": [
                            "ReadMessage",
                            "UpdateMessage",
                            "ReadAndUpdateMessage"
                        ],
                        "enableCondition": [
                            {
                                "1": "MESSAGE_ELEMENT"
                            }
                        ]
                    },
                    {
                        "type": "ExprField",
                        "label": "Value Message Element Xpath",
                        "defaultValue": {
                            "isExpression": true,
                            "value": ""
                        },
                        "isRequired": false,
                        "canChange": false,
                        "enableCondition": [
                            {
                                "1": "MESSAGE_ELEMENT"
                            }
                        ], 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)},
                    {
                        "type": "TextField",
                        "label": "Value Context Property Name",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            {
                                "1": "CONTEXT_PROPERTY"
                            }
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "Context Action",
                        "defaultValue": "ReadContext",
                        "isRequired": false,
                        "values": [
                            "ReadContext",
                            "UpdateContext",
                            "ReadAndUpdateContext"
                        ],
                        "enableCondition": [
                            {
                                "1": "CONTEXT_PROPERTY"
                            }
                        ]
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
        
        values["properties"] = getParamManagerValues(values.properties);
        const xml = getXML(MEDIATORS.COMMAND, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Creates an instance of a custom class to invoke an object encapsulating a method call.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Properties</Typography>

                    <Field>
                        <Controller
                            name="className"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Class Name" size={50} placeholder="" required={true} errorMsg={errors?.className?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Properties</Typography>
                        <Typography variant="body3">Editing of the properties of an object ClassProperty</Typography>

                        <Controller
                            name="properties"
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

                    <Field>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Description" size={50} placeholder="" required={false} errorMsg={errors?.description?.message?.toString()} />
                            )}
                        />
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

export default CommandForm; 
