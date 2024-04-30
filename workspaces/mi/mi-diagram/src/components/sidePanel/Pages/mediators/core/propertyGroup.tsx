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
import { Button, ComponentCard, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
import { ParamManager } from '../../../../Form/ParamManager/ParamManager';

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

const PropertyGroupForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            properties: {
                paramValues: sidePanelContext?.formValues?.properties && sidePanelContext?.formValues?.properties.map((property: string|ExpressionFieldValue[], index: string) => (
                    {
                        id: index,
                        key: typeof property[0] === 'object' ? property[0].value : property[0],
                        value: typeof property[3] === 'object' ? property[3].value : property[3],
                        icon: 'query',
                        paramValues: [
                            { value: property[0] },
                            { value: property[1] },
                            { value: property[2] },
                            { value: property[3] },
                            { value: property[4] },
                            { value: property[5] },
                            { value: property[6] },
                            { value: property[7] },
                            { value: property[8] },
                        ]
                    }
                )) || [] as string[][],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Property Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "Dropdown",
                        "label": "Property Data Type",
                        "defaultValue": "STRING",
                        "isRequired": false,
                        "values": [
                            "STRING",
                            "INTEGER",
                            "BOOLEAN",
                            "DOUBLE",
                            "FLOAT",
                            "LONG",
                            "SHORT",
                            "OM",
                            "JSON"
                        ],
                        "enableCondition": [
                            "NOT",
                            {
                                "-1": "remove"
                            }
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "Property Action",
                        "defaultValue": "set",
                        "isRequired": false,
                        "values": [
                            "set",
                            "remove"
                        ]
                    },
                    {
                        "type": "ExprField",
                        "label": "Property Value",
                        "defaultValue": {
                            "isExpression": false,
                            "value": ""
                        },
                        "isRequired": false,
                        "canChange": true,
                        "enableCondition": [
                            "AND",
                            [
                                "NOT",
                                {
                                    "1": "OM"
                                }
                            ],
                            {
                                "2": "set"
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
                        "label": "OM",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            {
                                "1": "OM"
                            }
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "Property Scope",
                        "defaultValue": "DEFAULT",
                        "isRequired": false,
                        "values": [
                            "DEFAULT",
                            "TRANSPORT",
                            "AXIS2",
                            "AXIS2_CLIENT",
                            "OPERATION",
                            "REGISTRY",
                            "SYSTEM",
                            "ANALYTICS"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Value String Pattern",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            "AND",
                            {
                                "1": "STRING"
                            },
                            {
                                "2": "set"
                            }
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Value String Capturing Group",
                        "defaultValue": "0",
                        "isRequired": false,
                        "enableCondition": [
                            "AND",
                            {
                                "1": "STRING"
                            },
                            {
                                "2": "set"
                            }
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Description",
                        "defaultValue": "",
                        "isRequired": false
                    },
                ]
            },
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        values["properties"] = values.properties.paramValues.map((param: any) => param.paramValues.map((p: any) => p.value));
        const xml = getXML(MEDIATORS.PROPERTYGROUP, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Sets/removes multiple properties on message context efficiently.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Properties</Typography>
                    <Typography variant="body3">Editing of the properties of an object PropertyMediator</Typography>

                    <Controller
                        name="properties"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <ParamManager
                                paramConfigs={value}
                                readonly={false}
                                onChange= {(values) => {
                                    values.paramValues = values.paramValues.map((param: any, index: number) => {
                                        const paramValues = param.paramValues;
                                        param.key = paramValues[0].value;
                                        param.value = paramValues[3].value.value;
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

                <Field>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Description" size={50} placeholder="Description" />
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

export default PropertyGroupForm; 
