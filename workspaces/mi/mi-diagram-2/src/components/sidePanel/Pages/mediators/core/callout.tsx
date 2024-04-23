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

const CalloutForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            endpointType: sidePanelContext?.formValues?.endpointType || "",
            soapAction: sidePanelContext?.formValues?.soapAction || "",
            pathToAxis2Repository: sidePanelContext?.formValues?.pathToAxis2Repository || "",
            pathToAxis2xml: sidePanelContext?.formValues?.pathToAxis2xml || "",
            initAxis2ClientOptions: sidePanelContext?.formValues?.initAxis2ClientOptions || "",
            serviceURL: sidePanelContext?.formValues?.serviceURL || "",
            addressEndpoint: sidePanelContext?.formValues?.addressEndpoint || "",
            payloadType: sidePanelContext?.formValues?.payloadType || "XPATH",
            payloadMessageXPath: sidePanelContext?.formValues?.payloadMessageXPath || {"isExpression":true,"value":""},
            payloadProperty: sidePanelContext?.formValues?.payloadProperty || "",
            resultType: sidePanelContext?.formValues?.resultType || "XPATH",
            resultMessageXPath: sidePanelContext?.formValues?.resultMessageXPath || {"isExpression":true,"value":""},
            resultContextProperty: sidePanelContext?.formValues?.resultContextProperty || "",
            securityType: sidePanelContext?.formValues?.securityType || "TRUE",
            policies: sidePanelContext?.formValues?.policies || "TRUE",
            policyKey: sidePanelContext?.formValues?.policyKey || "",
            outboundPolicyKey: sidePanelContext?.formValues?.outboundPolicyKey || "",
            inboundPolicyKey: sidePanelContext?.formValues?.inboundPolicyKey || "",
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        const xml = getXML(MEDIATORS.CALLOUT, values, dirtyFields, sidePanelContext.formValues);
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
                <Typography variant="h3">Service</Typography>

                <Field>
                    <Controller
                        name="endpointType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Endpoint Type" name="endpointType" items={["URL", "AddressEndpoint"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.endpointType && <Error>{errors.endpointType.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="soapAction"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="SOAP Action" size={50} placeholder="" />
                        )}
                    />
                    {errors.soapAction && <Error>{errors.soapAction.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="pathToAxis2Repository"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Path To Axis2 Repository" size={50} placeholder="" />
                        )}
                    />
                    {errors.pathToAxis2Repository && <Error>{errors.pathToAxis2Repository.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="pathToAxis2xml"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Path To Axis2xml" size={50} placeholder="" />
                        )}
                    />
                    {errors.pathToAxis2xml && <Error>{errors.pathToAxis2xml.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="initAxis2ClientOptions"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox type="checkbox" checked={field.value} onChange={(e: any) => {
                                field.onChange(e);
                            }}>Init Axis2 Client Options</VSCodeCheckbox>
                        )}
                    />
                    {errors.initAxis2ClientOptions && <Error>{errors.initAxis2ClientOptions.message.toString()}</Error>}
                </Field>

                {watch("endpointType") && watch("endpointType").toLowerCase() == "url" &&
                    <Field>
                        <Controller
                            name="serviceURL"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Service URL" size={50} placeholder="" />
                            )}
                        />
                        {errors.serviceURL && <Error>{errors.serviceURL.message.toString()}</Error>}
                    </Field>
                }

                {watch("endpointType") && watch("endpointType").toLowerCase() == "addressendpoint" &&
                    <Field>
                        <Controller
                            name="addressEndpoint"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Address Endpoint" size={50} placeholder="" />
                            )}
                        />
                        {errors.addressEndpoint && <Error>{errors.addressEndpoint.message.toString()}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">Source</Typography>

                <Field>
                    <Controller
                        name="payloadType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Payload Type" name="payloadType" items={["XPATH", "PROPERTY", "ENVELOPE"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.payloadType && <Error>{errors.payloadType.message.toString()}</Error>}
                </Field>

                {watch("payloadType") && watch("payloadType").toLowerCase() == "xpath" &&
                    <Field>
                        <Controller
                            name="payloadMessageXPath"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Payload Message XPath"
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
                        {errors.payloadMessageXPath && <Error>{errors.payloadMessageXPath.message.toString()}</Error>}
                    </Field>
                }

                {watch("payloadType") && watch("payloadType").toLowerCase() == "property" &&
                    <Field>
                        <Controller
                            name="payloadProperty"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Payload Property" size={50} placeholder="" />
                            )}
                        />
                        {errors.payloadProperty && <Error>{errors.payloadProperty.message.toString()}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">Target</Typography>

                <Field>
                    <Controller
                        name="resultType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Result Type" name="resultType" items={["XPATH", "PROPERTY"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.resultType && <Error>{errors.resultType.message.toString()}</Error>}
                </Field>

                {watch("resultType") && watch("resultType").toLowerCase() == "xpath" &&
                    <Field>
                        <Controller
                            name="resultMessageXPath"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Result Message XPath"
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
                        {errors.resultMessageXPath && <Error>{errors.resultMessageXPath.message.toString()}</Error>}
                    </Field>
                }

                {watch("resultType") && watch("resultType").toLowerCase() == "property" &&
                    <Field>
                        <Controller
                            name="resultContextProperty"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Result Context Property" size={50} placeholder="" />
                            )}
                        />
                        {errors.resultContextProperty && <Error>{errors.resultContextProperty.message.toString()}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">WS</Typography>

                <Field>
                    <Controller
                        name="securityType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Security Type" name="securityType" items={["TRUE", "FALSE"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.securityType && <Error>{errors.securityType.message.toString()}</Error>}
                </Field>

                {watch("securityType") && watch("securityType").toLowerCase() == "true" &&
                    <Field>
                        <Controller
                            name="policies"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Policies" name="policies" items={["TRUE", "FALSE"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.policies && <Error>{errors.policies.message.toString()}</Error>}
                    </Field>
                }

                {watch("securityType") && watch("securityType").toLowerCase() == "true" &&watch("policies") && watch("policies").toLowerCase() == "false"  &&
                    <Field>
                        <Controller
                            name="policyKey"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Policy Key" size={50} placeholder="" />
                            )}
                        />
                        {errors.policyKey && <Error>{errors.policyKey.message.toString()}</Error>}
                    </Field>
                }

                {watch("securityType") && watch("securityType").toLowerCase() == "true" &&watch("policies") && watch("policies").toLowerCase() == "true"  &&
                    <Field>
                        <Controller
                            name="outboundPolicyKey"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Outbound Policy Key" size={50} placeholder="" />
                            )}
                        />
                        {errors.outboundPolicyKey && <Error>{errors.outboundPolicyKey.message.toString()}</Error>}
                    </Field>
                }

                {watch("securityType") && watch("securityType").toLowerCase() == "true" &&watch("policies") && watch("policies").toLowerCase() == "true"  &&
                    <Field>
                        <Controller
                            name="inboundPolicyKey"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Inbound Policy Key" size={50} placeholder="" />
                            )}
                        />
                        {errors.inboundPolicyKey && <Error>{errors.inboundPolicyKey.message.toString()}</Error>}
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
    );
};

export default CalloutForm; 
