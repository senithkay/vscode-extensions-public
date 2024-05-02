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
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ExpressionField, ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
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

const ValidateForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            source: sidePanelContext?.formValues?.source || {"isExpression":true,"value":""},
            enableSchemaCaching: sidePanelContext?.formValues?.enableSchemaCaching || "",
            schemas: {
                paramValues: sidePanelContext?.formValues?.schemas && sidePanelContext?.formValues?.schemas.map((property: string|ExpressionFieldValue[], index: string) => (
                    {
                        id: index,
                        key: index,
                        value:  (property[0] as ExpressionFieldValue).value,
                        icon: 'query',
                        paramValues: [
                            { value: property[0] },
                        ]
                    }
                )) || [] as string[][],
                paramFields: [
                    {
                        "label": "Validate Schema Key",
                        "defaultValue": "",
                        "isRequired": false
                    },
                ]
            },
            features: {
                paramValues: sidePanelContext?.formValues?.features && sidePanelContext?.formValues?.features.map((property: string|ExpressionFieldValue[], index: string) => (
                    {
                        id: index,
                        key: property[0],
                        value:  property[1],
                        icon: 'query',
                        paramValues: [
                            { value: property[0] },
                            { value: property[1] },
                        ]
                    }
                )) || [] as string[][],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Feature Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "Checkbox",
                        "label": "Feature Enabled",
                        "defaultValue": false,
                        "isRequired": false
                    },
                ]
            },
            resources: {
                paramValues: sidePanelContext?.formValues?.resources && sidePanelContext?.formValues?.resources.map((property: string|ExpressionFieldValue[], index: string) => (
                    {
                        id: index,
                        key: property[0],
                        value:  property[1],
                        icon: 'query',
                        paramValues: [
                            { value: property[0] },
                            { value: property[1] },
                        ]
                    }
                )) || [] as string[][],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Location",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "label": "Location Key",
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
        
        values["schemas"] = values.schemas.paramValues.map((param: any) => param.paramValues.map((p: any) => p.value));
        values["features"] = values.features.paramValues.map((param: any) => param.paramValues.map((p: any) => p.value));
        values["resources"] = values.resources.paramValues.map((param: any) => param.paramValues.map((p: any) => p.value));
        const xml = getXML(MEDIATORS.VALIDATE, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Validates an XML/JSON message against XML/JSON schema.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="source"
                        control={control}
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="Source"
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
                    {errors.source && <Error>{errors.source.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="enableSchemaCaching"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Enable Schema Caching</VSCodeCheckbox>
                        )}
                    />
                    {errors.enableSchemaCaching && <Error>{errors.enableSchemaCaching.message.toString()}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Schemas</Typography>
                    <Typography variant="body3">Editing of the properties of an object ValidateSchema</Typography>

                    <Controller
                        name="schemas"
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

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Features</Typography>
                    <Typography variant="body3">Editing of the properties of an object Validate Feature</Typography>

                    <Controller
                        name="features"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <ParamManager
                                paramConfigs={value}
                                readonly={false}
                                onChange= {(values) => {
                                    values.paramValues = values.paramValues.map((param: any, index: number) => {
                                        const property: ParamValue[] = param.paramValues;
                                        param.key = property[0].value;
                                        param.value = property[1].value;
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
                    <Typography variant="h3">Resources</Typography>
                    <Typography variant="body3">Editing of the properties of an object Validate Resource</Typography>

                    <Controller
                        name="resources"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <ParamManager
                                paramConfigs={value}
                                readonly={false}
                                onChange= {(values) => {
                                    values.paramValues = values.paramValues.map((param: any, index: number) => {
                                        const property: ParamValue[] = param.paramValues;
                                        param.key = property[0].value;
                                        param.value = property[1].value;
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

export default ValidateForm; 
