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
import { AutoComplete, Button, ComponentCard, ExpressionField, ExpressionFieldValue, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
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

const SendForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            skipSerialization: sidePanelContext?.formValues?.skipSerialization || "",
            buildMessageBeforeSending: sidePanelContext?.formValues?.buildMessageBeforeSending || "",
            receivingSequenceType: sidePanelContext?.formValues?.receivingSequenceType || "Default",
            staticReceivingSequence: sidePanelContext?.formValues?.staticReceivingSequence || {"isExpression":true,"value":""},
            dynamicReceivingSequence: sidePanelContext?.formValues?.dynamicReceivingSequence || {"isExpression":true,"value":""},
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        const xml = getXML(MEDIATORS.SEND, values, dirtyFields, sidePanelContext.formValues);
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
        <div style={{ padding: "10px" }}>
            <Typography variant="body3"></Typography>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">Properties</Typography>

                <Field>
                    <Controller
                        name="skipSerialization"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox type="checkbox" checked={field.value} onChange={(e: any) => {
                                field.onChange(e);
                            }}>Skip Serialization</VSCodeCheckbox>
                        )}
                    />
                    {errors.skipSerialization && <Error>{errors.skipSerialization.message.toString()}</Error>}
                </Field>

                {watch("skipSerialization") == false &&
                    <Field>
                        <Controller
                            name="buildMessageBeforeSending"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox type="checkbox" checked={field.value} onChange={(e: any) => {
                                    field.onChange(e);
                                }}>Build Message Before Sending</VSCodeCheckbox>
                            )}
                        />
                        {errors.buildMessageBeforeSending && <Error>{errors.buildMessageBeforeSending.message.toString()}</Error>}
                    </Field>
                }

                {watch("skipSerialization") == true &&
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Receiving Sequence</Typography>

                        <Field>
                            <Controller
                                name="receivingSequenceType"
                                control={control}
                                render={({ field }) => (
                                    <AutoComplete label="Receiving Sequence Type" name="receivingSequenceType" items={["Default", "Static", "Dynamic"]} value={field.value} onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }} />
                                )}
                            />
                            {errors.receivingSequenceType && <Error>{errors.receivingSequenceType.message.toString()}</Error>}
                        </Field>

                        {watch("receivingSequenceType") && watch("receivingSequenceType").toLowerCase() == "static" &&
                            <Field>
                                <Controller
                                    name="staticReceivingSequence"
                                    control={control}
                                    render={({ field }) => (
                                        <ExpressionField
                                            {...field} label="Static Receiving Sequence"
                                            placeholder=""
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
                                {errors.staticReceivingSequence && <Error>{errors.staticReceivingSequence.message.toString()}</Error>}
                            </Field>
                        }

                        {watch("receivingSequenceType") && watch("receivingSequenceType").toLowerCase() == "dynamic" &&
                            <Field>
                                <Controller
                                    name="dynamicReceivingSequence"
                                    control={control}
                                    render={({ field }) => (
                                        <ExpressionField
                                            {...field} label="Dynamic Receiving Sequence"
                                            placeholder=""
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
                                {errors.dynamicReceivingSequence && <Error>{errors.dynamicReceivingSequence.message.toString()}</Error>}
                            </Field>
                        }

                    </ComponentCard>
                }

                {watch("receivingSequenceType") && watch("receivingSequenceType").toLowerCase() == "default" &&
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
                }

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
    );
};

export default SendForm; 
