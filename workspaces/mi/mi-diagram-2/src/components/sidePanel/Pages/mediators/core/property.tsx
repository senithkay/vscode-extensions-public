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
import { AutoComplete, Button, ExpressionField, ExpressionFieldValue, FormGroup, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
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

const PropertyForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            propertyName: sidePanelContext?.formValues?.propertyName || "",
            propertyDataType: sidePanelContext?.formValues?.propertyDataType || "STRING",
            propertyAction: sidePanelContext?.formValues?.propertyAction || "set",
            value: sidePanelContext?.formValues?.value || {"isExpression":true,"value":""},
            OMValue: sidePanelContext?.formValues?.OMValue || "",
            propertyScope: sidePanelContext?.formValues?.propertyScope || "DEFAULT",
            valueStringPattern: sidePanelContext?.formValues?.valueStringPattern || "",
            valueStringCapturingGroup: sidePanelContext?.formValues?.valueStringCapturingGroup || "0",
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        const xml = getXML(MEDIATORS.PROPERTY, values);
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
                    name="propertyName"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Property Name" size={50} placeholder="New Property Name" />
                    )}
                />
                {errors.propertyName && <Error>{errors.propertyName.message.toString()}</Error>}
            </Field>

            <Field>
                <Controller
                    name="propertyDataType"
                    control={control}
                    render={({ field }) => (
                        <AutoComplete label="Property Data Type" items={["STRING", "INTEGER", "BOOLEAN", "DOUBLE", "FLOAT", "LONG", "SHORT", "OM", "JSON"]} value={field.value} onValueChange={(e: any) => {
                            field.onChange(e);
                        }} />
                    )}
                />
                {errors.propertyDataType && <Error>{errors.propertyDataType.message.toString()}</Error>}
            </Field>

            <Field>
                <Controller
                    name="propertyAction"
                    control={control}
                    render={({ field }) => (
                        <AutoComplete label="Property Action" items={["set", "remove"]} value={field.value} onValueChange={(e: any) => {
                            field.onChange(e);
                        }} />
                    )}
                />
                {errors.propertyAction && <Error>{errors.propertyAction.message.toString()}</Error>}
            </Field>

            {watch("propertyDataType") && watch("propertyDataType").toLowerCase() == "om"  &&
                <Field>
                    <Controller
                        name="value"
                        control={control}
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="Property Value"
                                placeholder="Value"
                                canChange={true}
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
                    {errors.value && <Error>{errors.value.message.toString()}</Error>}
                </Field>
            }

            {watch("propertyDataType") && watch("propertyDataType").toLowerCase() == "om" &&
                <Field>
                    <Controller
                        name="OMValue"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="OM" size={50} placeholder="Value" />
                        )}
                    />
                    {errors.OMValue && <Error>{errors.OMValue.message.toString()}</Error>}
                </Field>
            }

            <Field>
                <Controller
                    name="propertyScope"
                    control={control}
                    render={({ field }) => (
                        <AutoComplete label="Property Scope" items={["DEFAULT", "TRANSPORT", "AXIS2", "AXIS2_CLIENT", "OPERATION", "REGISTRY", "SYSTEM", "ANALYTICS"]} value={field.value} onValueChange={(e: any) => {
                            field.onChange(e);
                        }} />
                    )}
                />
                {errors.propertyScope && <Error>{errors.propertyScope.message.toString()}</Error>}
            </Field>

            <FormGroup title="Advanced">
                {watch("propertyDataType") && watch("propertyDataType").toLowerCase() == "string" &&
                    <Field>
                        <Controller
                            name="valueStringPattern"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Value String Pattern" size={50} placeholder="Value String Pattern" />
                            )}
                        />
                        {errors.valueStringPattern && <Error>{errors.valueStringPattern.message.toString()}</Error>}
                    </Field>
                }

                {watch("propertyDataType") && watch("propertyDataType").toLowerCase() == "string" &&
                    <Field>
                        <Controller
                            name="valueStringCapturingGroup"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Value String Capturing Group" size={50} placeholder="Value String Capturing Group" />
                            )}
                        />
                        {errors.valueStringCapturingGroup && <Error>{errors.valueStringCapturingGroup.message.toString()}</Error>}
                    </Field>
                }

            </FormGroup>

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
    );
};

export default PropertyForm; 
