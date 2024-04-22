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
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { Keylookup } from '../../../../Form';

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

const EntitlementForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            entitlementServerURL: sidePanelContext?.formValues?.entitlementServerURL || "",
            username: sidePanelContext?.formValues?.username || "",
            password: sidePanelContext?.formValues?.password || "",
            callbackHandler: sidePanelContext?.formValues?.callbackHandler || "UT",
            callbackClassName: sidePanelContext?.formValues?.callbackClassName || "",
            entitlementClientType: sidePanelContext?.formValues?.entitlementClientType || "SOAP - Basic Auth (WSO2 IS 4.0.0 or later)",
            thriftHost: sidePanelContext?.formValues?.thriftHost || "",
            thriftPort: sidePanelContext?.formValues?.thriftPort || "",
            onAcceptSequenceType: sidePanelContext?.formValues?.onAcceptSequenceType || "ANONYMOUS",
            onAcceptSequenceKey: sidePanelContext?.formValues?.onAcceptSequenceKey || "",
            onRejectSequenceType: sidePanelContext?.formValues?.onRejectSequenceType || "ANONYMOUS",
            onRejectSequenceKey: sidePanelContext?.formValues?.onRejectSequenceKey || "",
            obligationsSequenceType: sidePanelContext?.formValues?.obligationsSequenceType || "ANONYMOUS",
            obligationsSequenceKey: sidePanelContext?.formValues?.obligationsSequenceKey || "",
            adviceSequenceType: sidePanelContext?.formValues?.adviceSequenceType || "ANONYMOUS",
            adviceSequenceKey: sidePanelContext?.formValues?.adviceSequenceKey || "",
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        const xml = getXML(MEDIATORS.ENTITLEMENT, values);
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
                    name="entitlementServerURL"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Entitlement Server URL" size={50} placeholder="" />
                    )}
                />
                {errors.entitlementServerURL && <Error>{errors.entitlementServerURL.message.toString()}</Error>}
            </Field>

            <Field>
                <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Username" size={50} placeholder="" />
                    )}
                />
                {errors.username && <Error>{errors.username.message.toString()}</Error>}
            </Field>

            <Field>
                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Password" size={50} placeholder="" />
                    )}
                />
                {errors.password && <Error>{errors.password.message.toString()}</Error>}
            </Field>

            <Field>
                <Controller
                    name="callbackHandler"
                    control={control}
                    render={({ field }) => (
                        <AutoComplete label="Callback Handler" items={["UT", "X509", "SAML", "Kerberos", "Custom"]} value={field.value} onValueChange={(e: any) => {
                            field.onChange(e);
                        }} />
                    )}
                />
                {errors.callbackHandler && <Error>{errors.callbackHandler.message.toString()}</Error>}
            </Field>

            {watch("callbackHandler") && watch("callbackHandler").toLowerCase() == "custom" &&
                <Field>
                    <Controller
                        name="callbackClassName"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Callback Class Name" size={50} placeholder="" />
                        )}
                    />
                    {errors.callbackClassName && <Error>{errors.callbackClassName.message.toString()}</Error>}
                </Field>
            }

            <Field>
                <Controller
                    name="entitlementClientType"
                    control={control}
                    render={({ field }) => (
                        <AutoComplete label="Entitlement Client Type" items={["SOAP - Basic Auth (WSO2 IS 4.0.0 or later)", "THRIFT", "SOAP - Authentication Admin (WSO2 IS 3.2.3 or earlier)", "WSXACML"]} value={field.value} onValueChange={(e: any) => {
                            field.onChange(e);
                        }} />
                    )}
                />
                {errors.entitlementClientType && <Error>{errors.entitlementClientType.message.toString()}</Error>}
            </Field>

            {watch("entitlementClientType") && watch("entitlementClientType").toLowerCase() == "thrift" &&
                <Field>
                    <Controller
                        name="thriftHost"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Thrift Host" size={50} placeholder="" />
                        )}
                    />
                    {errors.thriftHost && <Error>{errors.thriftHost.message.toString()}</Error>}
                </Field>
            }

            {watch("entitlementClientType") && watch("entitlementClientType").toLowerCase() == "thrift" &&
                <Field>
                    <Controller
                        name="thriftPort"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Thrift Port" size={50} placeholder="" />
                        )}
                    />
                    {errors.thriftPort && <Error>{errors.thriftPort.message.toString()}</Error>}
                </Field>
            }

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">On Acceptance</Typography>

                <Field>
                    <Controller
                        name="onAcceptSequenceType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="On Accept Sequence Type" items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.onAcceptSequenceType && <Error>{errors.onAcceptSequenceType.message.toString()}</Error>}
                </Field>

                {watch("onAcceptSequenceType") && watch("onAcceptSequenceType").toLowerCase() == "registry_reference" &&
                    <Field>
                        <Controller
                            name="onAcceptSequenceKey"
                            control={control}
                            render={({ field }) => (
                                <Keylookup
                                    {...field}filterType='sequence'
                                    label="On Accept SequenceKey"
                                    allowItemCreate={false}
                                />
                            )}
                        />
                        {errors.onAcceptSequenceKey && <Error>{errors.onAcceptSequenceKey.message.toString()}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">On Rejection</Typography>

                <Field>
                    <Controller
                        name="onRejectSequenceType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="On Reject Sequence Type" items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.onRejectSequenceType && <Error>{errors.onRejectSequenceType.message.toString()}</Error>}
                </Field>

                {watch("onRejectSequenceType") && watch("onRejectSequenceType").toLowerCase() == "registry_reference" &&
                    <Field>
                        <Controller
                            name="onRejectSequenceKey"
                            control={control}
                            render={({ field }) => (
                                <Keylookup
                                    {...field}filterType='sequence'
                                    label="On Reject SequenceKey"
                                    allowItemCreate={false}
                                />
                            )}
                        />
                        {errors.onRejectSequenceKey && <Error>{errors.onRejectSequenceKey.message.toString()}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">Obligation</Typography>

                <Field>
                    <Controller
                        name="obligationsSequenceType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Obligations Sequence Type" items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.obligationsSequenceType && <Error>{errors.obligationsSequenceType.message.toString()}</Error>}
                </Field>

                {watch("obligationsSequenceType") && watch("obligationsSequenceType").toLowerCase() == "registry_reference" &&
                    <Field>
                        <Controller
                            name="obligationsSequenceKey"
                            control={control}
                            render={({ field }) => (
                                <Keylookup
                                    {...field}filterType='sequence'
                                    label="Obligations SequenceKey"
                                    allowItemCreate={false}
                                />
                            )}
                        />
                        {errors.obligationsSequenceKey && <Error>{errors.obligationsSequenceKey.message.toString()}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">Advice</Typography>

                <Field>
                    <Controller
                        name="adviceSequenceType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Advice Sequence Type" items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.adviceSequenceType && <Error>{errors.adviceSequenceType.message.toString()}</Error>}
                </Field>

                {watch("adviceSequenceType") && watch("adviceSequenceType").toLowerCase() == "registry_reference" &&
                    <Field>
                        <Controller
                            name="adviceSequenceKey"
                            control={control}
                            render={({ field }) => (
                                <Keylookup
                                    {...field}filterType='sequence'
                                    label="Advice SequenceKey"
                                    allowItemCreate={false}
                                />
                            )}
                        />
                        {errors.adviceSequenceKey && <Error>{errors.adviceSequenceKey.message.toString()}</Error>}
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
    );
};

export default EntitlementForm; 
