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

const IterateForm = (props: AddMediatorProps) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

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

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    const onClick = async (values: any) => {
        setDiagramLoading(true);
        
        const xml = getXML(MEDIATORS.ITERATE, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Splits message into several for parallel processing (XPath/JSONPath).
            </Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="iterateID"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Iterate ID" size={50} placeholder="" required={false} errorMsg={errors?.iterateID?.message?.toString()} />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="iterateExpression"
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
                                {...field} label="Iterate Expression"
                                placeholder=""
                                required={true}
                                errorMsg={errors?.iterateExpression?.message?.toString()}
                                canChange={false}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                            />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="sequentialMediation"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Sequential Mediation</VSCodeCheckbox>
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="continueParent"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Continue Parent</VSCodeCheckbox>
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="preservePayload"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Preserve Payload</VSCodeCheckbox>
                        )}
                    />
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
                                required={false}
                                errorMsg={errors?.attachPath?.message?.toString()}
                                canChange={false}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                            />
                        )}
                    />
                </Field>
                }

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Sequence</Typography>

                    <Field>
                        <Controller
                            name="sequenceType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Sequence Type"
                                    name="sequenceType"
                                    items={["Anonymous", "Key"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.sequenceType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
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
                                    required={false}
                                    errorMsg={errors?.sequenceKey?.message?.toString()}
                                />
                            )}
                        />
                    </Field>
                    }

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

export default IterateForm; 
