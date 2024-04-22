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
import { AutoComplete, Button, ComponentCard, ExpressionFieldValue, ParamManager, ProgressIndicator, TextField, TextArea, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { Keylookup } from '../../../../Form';

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

const ScriptForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            scriptLanguage: sidePanelContext?.formValues?.scriptLanguage || "js",
            scriptType: sidePanelContext?.formValues?.scriptType || "INLINE",
            scriptBody: sidePanelContext?.formValues?.scriptBody || "",
            scriptKey: sidePanelContext?.formValues?.scriptKey || "",
            mediateFunction: sidePanelContext?.formValues?.mediateFunction || "",
            scriptKeys: {
                paramValues: sidePanelContext?.formValues?.scriptKeys && sidePanelContext?.formValues?.scriptKeys.map((property: string|ExpressionFieldValue[], index: string) => (
                    {
                        id: index,
                        key: typeof property[0] === 'object' ? property[0].value : property[0],
                        value: typeof property[1] === 'object' ? property[1].value : property[1],
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
                        "label": "Key Name",
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
                        "type": "TextField",
                        "label": "Key Value",
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
                ]
            },
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        values["scriptKeys"] = values.scriptKeys.paramValues.map((param: any) => param.paramValues.map((p: any) => p.value));
        const xml = getXML(MEDIATORS.SCRIPT, values);
        rpcClient.getMiDiagramRpcClient().applyEdit({
            documentUri: props.documentUri, range: props.nodePosition, text: xml
        });
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
        <div style={{ padding: "10px" }}>
            <Typography variant="body3"></Typography>

            <Field>
                <Controller
                    name="scriptLanguage"
                    control={control}
                    render={({ field }) => (
                        <AutoComplete label="Script Language" items={["js", "rb", "groovy", "nashornJs"]} value={field.value} onValueChange={(e: any) => {
                            field.onChange(e);
                        }} />
                    )}
                />
                {errors.scriptLanguage && <Error>{errors.scriptLanguage.message.toString()}</Error>}
            </Field>

            <Field>
                <Controller
                    name="scriptType"
                    control={control}
                    render={({ field }) => (
                        <AutoComplete label="Script Type" items={["INLINE", "REGISTRY_REFERENCE"]} value={field.value} onValueChange={(e: any) => {
                            field.onChange(e);
                        }} />
                    )}
                />
                {errors.scriptType && <Error>{errors.scriptType.message.toString()}</Error>}
            </Field>

            {watch("scriptType") && watch("scriptType").toLowerCase() == "inline" &&
                <Field>
                    <Controller
                        name="scriptBody"
                        control={control}
                        render={({ field }) => (
                            <TextArea {...field} label="Script Body" placeholder="" />
                        )}
                    />
                    {errors.scriptBody && <Error>{errors.scriptBody.message.toString()}</Error>}
                </Field>
            }

            {watch("scriptType") && watch("scriptType").toLowerCase() == "registry_reference" &&
                <Field>
                    <Controller
                        name="scriptKey"
                        control={control}
                        render={({ field }) => (
                            <Keylookup
                                {...field}
                                label="Script Key"
                                allowItemCreate={true}
                            />
                        )}
                    />
                    {errors.scriptKey && <Error>{errors.scriptKey.message.toString()}</Error>}
                </Field>
            }

            {watch("scriptType") && watch("scriptType").toLowerCase() == "registry_reference" &&
                <Field>
                    <Controller
                        name="mediateFunction"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Mediate Function" size={50} placeholder="" />
                        )}
                    />
                    {errors.mediateFunction && <Error>{errors.mediateFunction.message.toString()}</Error>}
                </Field>
            }

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">Script Keys</Typography>
                <Typography variant="body3">Editing of the properties of an object Registry Key Property</Typography>

                <Controller
                    name="scriptKeys"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <ParamManager
                            paramConfigs={value}
                            readonly={false}
                            onChange= {(values) => {
                                values.paramValues = values.paramValues.map((param: any, index: number) => {
                                    const paramValues = param.paramValues;
                                    param.key = paramValues[0].value;
                                    param.value = paramValues[1].value;
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
    );
};

export default ScriptForm; 
