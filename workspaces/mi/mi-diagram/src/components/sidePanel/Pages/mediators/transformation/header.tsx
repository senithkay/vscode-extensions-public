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
import { AddMediatorProps } from '../../../../Form/common';
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

const HeaderForm = (props: AddMediatorProps) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            headerName: sidePanelContext?.formValues?.headerName || {"isExpression":true,"value":"To"},
            headerAction: sidePanelContext?.formValues?.headerAction || "set",
            scope: sidePanelContext?.formValues?.scope || "default",
            valueType: sidePanelContext?.formValues?.valueType || "LITERAL",
            valueLiteral: sidePanelContext?.formValues?.valueLiteral || "",
            valueExpression: sidePanelContext?.formValues?.valueExpression || {"isExpression":true,"value":""},
            valueInline: sidePanelContext?.formValues?.valueInline || "",
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
        
        const xml = getXML(MEDIATORS.HEADER, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Sets/removes message header (SOAP/transport scope).</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="headerName"
                        control={control}
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="Header Name"
                                placeholder=""
                                required={false}
                                errorMsg={errors?.headerName?.message?.toString()}
                                canChange={false}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                            />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="headerAction"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                label="Header Action"
                                name="headerAction"
                                items={["set", "remove"]}
                                value={field.value}
                                required={false}
                                errorMsg={errors?.headerAction?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="scope"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                label="Scope"
                                name="scope"
                                items={["default", "transport"]}
                                value={field.value}
                                required={false}
                                errorMsg={errors?.scope?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>

                {watch("headerAction") == "set" &&
                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">HeaderValue</Typography>

                    <Field>
                        <Controller
                            name="valueType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Value Type"
                                    name="valueType"
                                    items={["LITERAL", "EXPRESSION", "INLINE"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.valueType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    {watch("valueType") == "LITERAL" &&
                        <Field>
                            <Controller
                                name="valueLiteral"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Value Literal" size={50} placeholder="" required={false} errorMsg={errors?.valueLiteral?.message?.toString()} />
                                )}
                            />
                        </Field>
                    }

                    {watch("valueType") == "EXPRESSION" &&
                        <Field>
                            <Controller
                                name="valueExpression"
                                control={control}
                                render={({ field }) => (
                                    <ExpressionField
                                        {...field} label="Value Expression"
                                        placeholder=""
                                        required={false}
                                        errorMsg={errors?.valueExpression?.message?.toString()}
                                        canChange={false}
                                        openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                    />
                                )}
                            />
                        </Field>
                    }

                    {watch("valueType") == "INLINE" &&
                        <Field>
                            <Controller
                                name="valueInline"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Value Inline" size={50} placeholder="" required={false} errorMsg={errors?.valueInline?.message?.toString()} />
                                )}
                            />
                        </Field>
                    }

                </ComponentCard>
                }

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

export default HeaderForm; 
