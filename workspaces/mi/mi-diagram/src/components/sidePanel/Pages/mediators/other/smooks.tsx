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

const SmooksForm = (props: AddMediatorProps) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            inputType: sidePanelContext?.formValues?.inputType || "xml",
            inputExpression: sidePanelContext?.formValues?.inputExpression || {"isExpression":true,"value":""},
            configurationKey: sidePanelContext?.formValues?.configurationKey || "",
            outputType: sidePanelContext?.formValues?.outputType || "xml",
            outputMethod: sidePanelContext?.formValues?.outputMethod || "Default",
            outputProperty: sidePanelContext?.formValues?.outputProperty || "",
            outputAction: sidePanelContext?.formValues?.outputAction || "Add",
            outputExpression: sidePanelContext?.formValues?.outputExpression || "",
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
        
        const xml = getXML(MEDIATORS.SMOOKS, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Applies lightweight message transformations (XML, non-XML).</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Input</Typography>

                    <Field>
                        <Controller
                            name="inputType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Input Type"
                                    name="inputType"
                                    items={["xml", "text"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.inputType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="inputExpression"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Input Expression"
                                    placeholder=""
                                    required={false}
                                    errorMsg={errors?.inputExpression?.message?.toString()}
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Key</Typography>

                    <Field>
                        <Controller
                            name="configurationKey"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Configuration Key" size={50} placeholder="" required={false} errorMsg={errors?.configurationKey?.message?.toString()} />
                            )}
                        />
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Output</Typography>

                    <Field>
                        <Controller
                            name="outputType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Output Type"
                                    name="outputType"
                                    items={["xml", "text", "java"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.outputType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="outputMethod"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Output Method"
                                    name="outputMethod"
                                    items={["Default", "Property", "Expression"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.outputMethod?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    {watch("outputMethod") == "Property" &&
                    <Field>
                        <Controller
                            name="outputProperty"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Output Property" size={50} placeholder="" required={false} errorMsg={errors?.outputProperty?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {watch("outputMethod") == "Expression" &&
                    <Field>
                        <Controller
                            name="outputAction"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Output Action"
                                    name="outputAction"
                                    items={["Add", "Replace", "Sibiling"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.outputAction?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>
                    }

                    {watch("outputMethod") == "Expression" &&
                    <Field>
                        <Controller
                            name="outputExpression"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Output Expression" size={50} placeholder="" required={false} errorMsg={errors?.outputExpression?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Misc</Typography>

                    <Field>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Description" size={50} placeholder="" required={false} errorMsg={errors?.description?.message?.toString()} />
                            )}
                        />
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

export default SmooksForm; 
