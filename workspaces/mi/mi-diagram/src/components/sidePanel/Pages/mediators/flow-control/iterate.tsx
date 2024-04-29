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
import { AutoComplete, Button, ComponentCard, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { Keylookup } from '../../../../Form';
import { ExpressionField, ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';

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

const IterateForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            iterateID: sidePanelContext?.formValues?.iterateID || "",
            iterateExpression: sidePanelContext?.formValues?.iterateExpression || {"isExpression":true,"value":""},
            sequentialMediation: sidePanelContext?.formValues?.sequentialMediation || "",
            continueParent: sidePanelContext?.formValues?.continueParent || "",
            preservePayload: sidePanelContext?.formValues?.preservePayload || "",
            attachPath: sidePanelContext?.formValues?.attachPath || {"isExpression":true,"value":""},
            sequenceType: sidePanelContext?.formValues?.sequenceType || "Anonymous",
            sequenceKey: sidePanelContext?.formValues?.sequenceKey || "",
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        const xml = getXML(MEDIATORS.ITERATE, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Splits message into several for parallel processing (XPath/JSONPath).
            </Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="iterateID"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Iterate ID" size={50} placeholder="" />
                        )}
                    />
                    {errors.iterateID && <Error>{errors.iterateID.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="iterateExpression"
                        control={control}
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="Iterate Expression"
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
                    {errors.iterateExpression && <Error>{errors.iterateExpression.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="sequentialMediation"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Sequential Mediation</VSCodeCheckbox>
                        )}
                    />
                    {errors.sequentialMediation && <Error>{errors.sequentialMediation.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="continueParent"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Continue Parent</VSCodeCheckbox>
                        )}
                    />
                    {errors.continueParent && <Error>{errors.continueParent.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="preservePayload"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Preserve Payload</VSCodeCheckbox>
                        )}
                    />
                    {errors.preservePayload && <Error>{errors.preservePayload.message.toString()}</Error>}
                </Field>

                {watch("preservePayload") == true &&
                <Field>
                    <Controller
                        name="attachPath"
                        control={control}
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="Attach Path"
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
                    {errors.attachPath && <Error>{errors.attachPath.message.toString()}</Error>}
                </Field>
                }

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Sequence</Typography>

                    <Field>
                        <Controller
                            name="sequenceType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Sequence Type" name="sequenceType" items={["Anonymous", "Key"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.sequenceType && <Error>{errors.sequenceType.message.toString()}</Error>}
                    </Field>

                    {watch("sequenceType") == "Key" &&
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

export default IterateForm; 
