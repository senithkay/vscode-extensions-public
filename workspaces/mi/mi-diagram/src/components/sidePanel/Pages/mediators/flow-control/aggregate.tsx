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

const AggregateForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            completionTimeout: sidePanelContext?.formValues?.completionTimeout || "0",
            completionMinMessages: sidePanelContext?.formValues?.completionMinMessages || {"isExpression":true,"value":"-1"},
            completionMaxMessages: sidePanelContext?.formValues?.completionMaxMessages || {"isExpression":true,"value":"-1"},
            aggregateID: sidePanelContext?.formValues?.aggregateID || "",
            enclosingElementProperty: sidePanelContext?.formValues?.enclosingElementProperty || "",
            correlationExpression: sidePanelContext?.formValues?.correlationExpression || {"isExpression":true,"value":""},
            aggregateElementType: sidePanelContext?.formValues?.aggregateElementType || "ROOT",
            aggregationExpression: sidePanelContext?.formValues?.aggregationExpression || {"isExpression":true,"value":""},
            sequenceType: sidePanelContext?.formValues?.sequenceType || "ANONYMOUS",
            sequenceKey: sidePanelContext?.formValues?.sequenceKey || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    const onClick = async (values: any) => {
        
        const xml = getXML(MEDIATORS.AGGREGATE, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Combines message responses that were split by Clone/Iterate mediator.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Complete Condition</Typography>

                    <Field>
                        <Controller
                            name="completionTimeout"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Completion Timeout" size={50} placeholder="" />
                            )}
                        />
                        {errors.completionTimeout && <Error>{errors.completionTimeout.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="completionMinMessages"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Completion Min Messages"
                                    placeholder=""
                                    canChange={true}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                        {errors.completionMinMessages && <Error>{errors.completionMinMessages.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="completionMaxMessages"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Completion Max Messages"
                                    placeholder=""
                                    canChange={true}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                        {errors.completionMaxMessages && <Error>{errors.completionMaxMessages.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="aggregateID"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Aggregate ID" size={50} placeholder="" />
                            )}
                        />
                        {errors.aggregateID && <Error>{errors.aggregateID.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="enclosingElementProperty"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Enclosing Element Property" size={50} placeholder="" />
                            )}
                        />
                        {errors.enclosingElementProperty && <Error>{errors.enclosingElementProperty.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="correlationExpression"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Correlation Expression"
                                    placeholder=""
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                        {errors.correlationExpression && <Error>{errors.correlationExpression.message.toString()}</Error>}
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">OnComplete</Typography>

                    <Field>
                        <Controller
                            name="aggregateElementType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Aggregate Element Type" name="aggregateElementType" items={["ROOT", "CHILD"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.aggregateElementType && <Error>{errors.aggregateElementType.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="aggregationExpression"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Aggregation Expression"
                                    placeholder=""
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                        {errors.aggregationExpression && <Error>{errors.aggregationExpression.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="sequenceType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Sequence Type" name="sequenceType" items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.sequenceType && <Error>{errors.sequenceType.message.toString()}</Error>}
                    </Field>

                    {watch("sequenceType") == "REGISTRY_REFERENCE" &&
                    <Field>
                        <Controller
                            name="sequenceKey"
                            control={control}
                            render={({ field }) => (
                                <Keylookup
                                    value={field.value}
                                    filterType='sequence'
                                    label="Sequence Key"
                                    allowItemCreate={false}
                                    onValueChange={field.onChange}
                                />
                            )}
                        />
                        {errors.sequenceKey && <Error>{errors.sequenceKey.message.toString()}</Error>}
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
        </>
    );
};

export default AggregateForm; 
