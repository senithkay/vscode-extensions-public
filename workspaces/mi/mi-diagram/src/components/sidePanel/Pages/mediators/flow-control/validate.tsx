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

const ValidateForm = (props: AddMediatorProps) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            source: sidePanelContext?.formValues?.source || {"isExpression":true,"value":""},
            enableSchemaCaching: sidePanelContext?.formValues?.enableSchemaCaching || "true",
            schemas: {
                paramValues: sidePanelContext?.formValues?.schemas ? getParamManagerFromValues(sidePanelContext?.formValues?.schemas, -1, 0) : [],
                paramFields: [
                    {
                        "type": "KeyLookup",
                        "label": "Validate Schema Key",
                        "defaultValue": "",
                        "isRequired": true,
                        "filterType": [
                            "schema",
                            "localEntry"
                        ]
                    },
                ]
            },
            features: {
                paramValues: sidePanelContext?.formValues?.features ? getParamManagerFromValues(sidePanelContext?.formValues?.features, 0, 1) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Feature Name",
                        "defaultValue": "",
                        "isRequired": true
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
                paramValues: sidePanelContext?.formValues?.resources ? getParamManagerFromValues(sidePanelContext?.formValues?.resources, 0, 1) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Location",
                        "defaultValue": "",
                        "isRequired": true
                    },
                    {
                        "type": "KeyLookup",
                        "label": "Location Key",
                        "defaultValue": "",
                        "isRequired": true,
                        "filterType": "registry"
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
        
        values["schemas"] = getParamManagerValues(values.schemas);
        values["features"] = getParamManagerValues(values.features);
        values["resources"] = getParamManagerValues(values.resources);
        const xml = getXML(MEDIATORS.VALIDATE, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Validates an XML/JSON message against XML/JSON schema.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="source"
                        control={control}
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="Source"
                                placeholder=""
                                required={false}
                                errorMsg={errors?.source?.message?.toString()}
                                canChange={false}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                            />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="enableSchemaCaching"
                        control={control}
                        rules={
                            {
                                required: "This field is required",
                            }
                        }
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Enable Schema Caching</VSCodeCheckbox>
                        )}
                    />
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
                                        param.key = index + 1;
                                        param.value = property[0].value;
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

export default ValidateForm; 
