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
import { AutoComplete, Button, ComponentCard, ExpressionField, ExpressionFieldValue, ProgressIndicator, TextField, TextArea, Typography } from '@wso2-enterprise/ui-toolkit';
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

const CallForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            endopint: sidePanelContext?.formValues?.endopint || "",
            inlineEndpoint: sidePanelContext?.formValues?.inlineEndpoint || "<inline/>",
            endpointRegistryKey: sidePanelContext?.formValues?.endpointRegistryKey || "",
            endpointXpath: sidePanelContext?.formValues?.endpointXpath || {"isExpression":true,"value":""},
            enableBlockingCalls: sidePanelContext?.formValues?.enableBlockingCalls || "",
            initAxis2ClientOptions: sidePanelContext?.formValues?.initAxis2ClientOptions || "",
            sourceType: sidePanelContext?.formValues?.sourceType || "none",
            sourceProperty: sidePanelContext?.formValues?.sourceProperty || "",
            contentType: sidePanelContext?.formValues?.contentType || "",
            sourcePayload: sidePanelContext?.formValues?.sourcePayload || "<inline xmlns=\"\"/>",
            sourceXPath: sidePanelContext?.formValues?.sourceXPath || {"isExpression":true,"value":""},
            targetType: sidePanelContext?.formValues?.targetType || "body",
            targetProperty: sidePanelContext?.formValues?.targetProperty || "",
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        const xml = getXML(MEDIATORS.CALL, values);
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
                    name="endopint"
                    control={control}
                    render={({ field }) => (
                        <AutoComplete label="Select Endpoint" items={["{workspace.endopints}", "{registry.endpoints}", "{line.break}", "{create.new}", "INLINE", "NONE", "REGISTRYKEY", "XPATH"]} value={field.value} onValueChange={(e: any) => {
                            field.onChange(e);
                        }} />
                    )}
                />
                {errors.endopint && <Error>{errors.endopint.message.toString()}</Error>}
            </Field>

            {watch("endopint") && watch("endopint").toLowerCase() == "inline" &&
                <Field>
                    <Controller
                        name="inlineEndpoint"
                        control={control}
                        render={({ field }) => (
                            <TextArea {...field} label="Inline Endpoint" placeholder="Define your endpoint as an XML" />
                        )}
                    />
                    {errors.inlineEndpoint && <Error>{errors.inlineEndpoint.message.toString()}</Error>}
                </Field>
            }

            {watch("endpointType") && watch("endpointType").toLowerCase() == "registrykey" &&
                <Field>
                    <Controller
                        name="endpointRegistryKey"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Endpoint Registry Key" size={50} placeholder="Endpoint Registry Key" />
                        )}
                    />
                    {errors.endpointRegistryKey && <Error>{errors.endpointRegistryKey.message.toString()}</Error>}
                </Field>
            }

            {watch("endpointType") && watch("endpointType").toLowerCase() == "xpath" &&
                <Field>
                    <Controller
                        name="endpointXpath"
                        control={control}
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="Endpoint Xpath"
                                placeholder="Endpoint Xpath"
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
                    {errors.endpointXpath && <Error>{errors.endpointXpath.message.toString()}</Error>}
                </Field>
            }

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">Advanced</Typography>

                <Field>
                    <Controller
                        name="enableBlockingCalls"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox type="checkbox" checked={field.value} onChange={(e: any) => {
                                field.onChange(e);
                            }}>Enable Blocking Calls</VSCodeCheckbox>
                        )}
                    />
                    {errors.enableBlockingCalls && <Error>{errors.enableBlockingCalls.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="initAxis2ClientOptions"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox type="checkbox" checked={field.value} onChange={(e: any) => {
                                field.onChange(e);
                            }}>Initialize Axis2 Client Options</VSCodeCheckbox>
                        )}
                    />
                    {errors.initAxis2ClientOptions && <Error>{errors.initAxis2ClientOptions.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="sourceType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Source Type" items={["none", "body", "property", "inline", "custom"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.sourceType && <Error>{errors.sourceType.message.toString()}</Error>}
                </Field>

                {watch("sourceType") && watch("sourceType").toLowerCase() == "property" &&
                    <Field>
                        <Controller
                            name="sourceProperty"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Source Property" size={50} placeholder="Source Property" />
                            )}
                        />
                        {errors.sourceProperty && <Error>{errors.sourceProperty.message.toString()}</Error>}
                    </Field>
                }

                {watch("sourceType") && watch("sourceType").toLowerCase() == "property" ||watch("sourceType") && watch("sourceType").toLowerCase() == "inline" ||watch("sourceType") && watch("sourceType").toLowerCase() == "custom"  &&
                    <Field>
                        <Controller
                            name="contentType"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Content Type" size={50} placeholder="Content Type" />
                            )}
                        />
                        {errors.contentType && <Error>{errors.contentType.message.toString()}</Error>}
                    </Field>
                }

                {watch("sourceType") && watch("sourceType").toLowerCase() == "inline" &&
                    <Field>
                        <Controller
                            name="sourcePayload"
                            control={control}
                            render={({ field }) => (
                                <TextArea {...field} label="Source Payload" placeholder="" />
                            )}
                        />
                        {errors.sourcePayload && <Error>{errors.sourcePayload.message.toString()}</Error>}
                    </Field>
                }

                {watch("sourceType") && watch("sourceType").toLowerCase() == "custom" &&
                    <Field>
                        <Controller
                            name="sourceXPath"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Source XPath"
                                    placeholder="Source XPath"
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
                        {errors.sourceXPath && <Error>{errors.sourceXPath.message.toString()}</Error>}
                    </Field>
                }

                <Field>
                    <Controller
                        name="targetType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Target Type" items={["body", "property"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.targetType && <Error>{errors.targetType.message.toString()}</Error>}
                </Field>

                {watch("targetType") && watch("targetType").toLowerCase() == "property" &&
                    <Field>
                        <Controller
                            name="targetProperty"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Target Property" size={50} placeholder="Target Property" />
                            )}
                        />
                        {errors.targetProperty && <Error>{errors.targetProperty.message.toString()}</Error>}
                    </Field>
                }

            </ComponentCard>

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

export default CallForm; 
