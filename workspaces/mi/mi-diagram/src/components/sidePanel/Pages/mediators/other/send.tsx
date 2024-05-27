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
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, openPopup } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { Keylookup } from '../../../../Form';
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

const SendForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            skipSerialization: sidePanelContext?.formValues?.skipSerialization || false,
            endpoint: sidePanelContext?.formValues?.endpoint || "",
            buildMessageBeforeSending: sidePanelContext?.formValues?.buildMessageBeforeSending || false,
            receivingSequenceType: sidePanelContext?.formValues?.receivingSequenceType || "Default",
            staticReceivingSequence: sidePanelContext?.formValues?.staticReceivingSequence || "",
            dynamicReceivingSequence: sidePanelContext?.formValues?.dynamicReceivingSequence || {"isExpression":true,"value":""},
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
        <>
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Invokes external service in non-blocking mode.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Properties</Typography>

                    <Field>
                        <Controller
                            name="skipSerialization"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Skip Serialization</VSCodeCheckbox>
                            )}
                        />
                        {errors.skipSerialization && <Error>{errors.skipSerialization.message.toString()}</Error>}
                    </Field>

                    {watch("skipSerialization") == false &&
                    <Field>
                        <Controller
                            name="endpoint"
                            control={control}
                            render={({ field }) => (
                                <Keylookup
                                    value={field.value}
                                    filterType='endpoint'
                                    label="Select Endpoint"
                                    allowItemCreate={false}
                                    onCreateButtonClick={(fetchItems: any, handleValueChange: any) => {
                                        openPopup(rpcClient, "endpoint", fetchItems, handleValueChange);
                                    }}
                                    onValueChange={field.onChange}
                                />
                            )}
                        />
                        {errors.endpoint && <Error>{errors.endpoint.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("skipSerialization") == false &&
                    <Field>
                        <Controller
                            name="buildMessageBeforeSending"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Build Message Before Sending</VSCodeCheckbox>
                            )}
                        />
                        {errors.buildMessageBeforeSending && <Error>{errors.buildMessageBeforeSending.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("skipSerialization") == false &&
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

                        {watch("receivingSequenceType") == "Static" &&
                            <Field>
                                <Controller
                                    name="staticReceivingSequence"
                                    control={control}
                                    render={({ field }) => (
                                        <Keylookup
                                            value={field.value}
                                            filterType='sequence'
                                            label="Static Receiving Sequence"
                                            allowItemCreate={false}
                                            onValueChange={field.onChange}
                                        />
                                    )}
                                />
                                {errors.staticReceivingSequence && <Error>{errors.staticReceivingSequence.message.toString()}</Error>}
                            </Field>
                        }

                        {watch("receivingSequenceType") == "Dynamic" &&
                            <Field>
                                <Controller
                                    name="dynamicReceivingSequence"
                                    control={control}
                                    render={({ field }) => (
                                        <ExpressionField
                                            {...field} label="Dynamic Receiving Sequence"
                                            placeholder=""
                                            canChange={false}
                                            openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                        />
                                    )}
                                />
                                {errors.dynamicReceivingSequence && <Error>{errors.dynamicReceivingSequence.message.toString()}</Error>}
                            </Field>
                        }

                    </ComponentCard>
                    }

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

export default SendForm; 
