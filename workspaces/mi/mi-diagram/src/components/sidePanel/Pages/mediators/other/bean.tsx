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
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ExpressionField, ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
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

const BeanForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            action: sidePanelContext?.formValues?.action || "CREATE",
            class: sidePanelContext?.formValues?.class || "",
            var: sidePanelContext?.formValues?.var || "",
            property: sidePanelContext?.formValues?.property || "",
            valueType: sidePanelContext?.formValues?.valueType || "LITERAL",
            valueLiteral: sidePanelContext?.formValues?.valueLiteral || "",
            valueExpression: sidePanelContext?.formValues?.valueExpression || {"isExpression":true,"value":""},
            targetType: sidePanelContext?.formValues?.targetType || "LITERAL",
            targetLiteral: sidePanelContext?.formValues?.targetLiteral || "",
            targetExpression: sidePanelContext?.formValues?.targetExpression || {"isExpression":true,"value":""},
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
        
        const xml = getXML(MEDIATORS.BEAN, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Manipulates JavaBean bound to message context as a property.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Properties</Typography>

                    <Field>
                        <Controller
                            name="action"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <AutoComplete label="Action" name="action" items={["CREATE", "REMOVE", "SET_PROPERTY", "GET_PROPERTY"]} value={field.value} required={true} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.action && <Error>{errors.action.message.toString()}</Error>}
                    </Field>

                    {watch("action") == "CREATE" &&
                    <Field>
                        <Controller
                            name="class"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Class" size={50} placeholder="" required={true} />
                            )}
                        />
                        {errors.class && <Error>{errors.class.message.toString()}</Error>}
                    </Field>
                    }

                    <Field>
                        <Controller
                            name="var"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Var" size={50} placeholder="" required={false} />
                            )}
                        />
                        {errors.var && <Error>{errors.var.message.toString()}</Error>}
                    </Field>

                    {((watch("action") == "SET_PROPERTY") ||(watch("action") == "GET_PROPERTY") ) &&
                    <Field>
                        <Controller
                            name="property"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Property" size={50} placeholder="" required={true} />
                            )}
                        />
                        {errors.property && <Error>{errors.property.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("action") == "SET_PROPERTY" &&
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Value</Typography>

                        <Field>
                            <Controller
                                name="valueType"
                                control={control}
                                rules={
                                    {
                                        required: "This field is required",
                                    }
                                }
                                render={({ field }) => (
                                    <AutoComplete label="Value Type" name="valueType" items={["LITERAL", "EXPRESSION"]} value={field.value} required={true} onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }} />
                                )}
                            />
                            {errors.valueType && <Error>{errors.valueType.message.toString()}</Error>}
                        </Field>

                        {watch("valueType") == "LITERAL" &&
                            <Field>
                                <Controller
                                    name="valueLiteral"
                                    control={control}
                                    rules={
                                        {
                                            required: "This field is required",
                                        }
                                    }
                                    render={({ field }) => (
                                        <TextField {...field} label="Value Literal" size={50} placeholder="" required={true} />
                                    )}
                                />
                                {errors.valueLiteral && <Error>{errors.valueLiteral.message.toString()}</Error>}
                            </Field>
                        }

                        {watch("valueType") == "EXPRESSION" &&
                            <Field>
                                <Controller
                                    name="valueExpression"
                                    control={control}
                                    rules={
                                        {
                                            validate: (value) => {
                                                if (!value?.value || value.value === "") {
                                                    return "This field is required";
                                                }
                                                return true;
                                            },
                                        }
                                    }
                                    render={({ field }) => (
                                        <ExpressionField
                                            {...field} label="Value Expression"
                                            placeholder=""
                                            required={true}
                                            canChange={false}
                                            openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                        />
                                    )}
                                />
                                {errors.valueExpression && <Error>{errors.valueExpression.message.toString()}</Error>}
                            </Field>
                        }

                    </ComponentCard>
                    }

                    {watch("action") == "GET_PROPERTY" &&
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Target</Typography>

                        <Field>
                            <Controller
                                name="targetType"
                                control={control}
                                rules={
                                    {
                                        required: "This field is required",
                                    }
                                }
                                render={({ field }) => (
                                    <AutoComplete label="Target Type" name="targetType" items={["LITERAL", "EXPRESSION"]} value={field.value} required={true} onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }} />
                                )}
                            />
                            {errors.targetType && <Error>{errors.targetType.message.toString()}</Error>}
                        </Field>

                        {watch("targetType") == "LITERAL" &&
                            <Field>
                                <Controller
                                    name="targetLiteral"
                                    control={control}
                                    rules={
                                        {
                                            required: "This field is required",
                                        }
                                    }
                                    render={({ field }) => (
                                        <TextField {...field} label="Target Literal" size={50} placeholder="" required={true} />
                                    )}
                                />
                                {errors.targetLiteral && <Error>{errors.targetLiteral.message.toString()}</Error>}
                            </Field>
                        }

                        {watch("targetType") == "EXPRESSION" &&
                            <Field>
                                <Controller
                                    name="targetExpression"
                                    control={control}
                                    rules={
                                        {
                                            validate: (value) => {
                                                if (!value?.value || value.value === "") {
                                                    return "This field is required";
                                                }
                                                return true;
                                            },
                                        }
                                    }
                                    render={({ field }) => (
                                        <ExpressionField
                                            {...field} label="Target Expression"
                                            placeholder=""
                                            required={true}
                                            canChange={false}
                                            openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                        />
                                    )}
                                />
                                {errors.targetExpression && <Error>{errors.targetExpression.message.toString()}</Error>}
                            </Field>
                        }

                    </ComponentCard>
                    }

                    <Field>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Description" size={50} placeholder="" required={false} />
                            )}
                        />
                        {errors.description && <Error>{errors.description.message.toString()}</Error>}
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

export default BeanForm; 
