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

const CacheForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            cacheMediatorImplementation: sidePanelContext?.formValues?.cacheMediatorImplementation || "Default",
            cacheType: sidePanelContext?.formValues?.cacheType || "FINDER",
            id: sidePanelContext?.formValues?.id || "",
            cacheTimeout: sidePanelContext?.formValues?.cacheTimeout || "120",
            maxMessageSize: sidePanelContext?.formValues?.maxMessageSize || "2000",
            scope: sidePanelContext?.formValues?.scope || "Per_Host",
            hashGeneratorAttribute: sidePanelContext?.formValues?.hashGeneratorAttribute || "",
            maxEntryCount: sidePanelContext?.formValues?.maxEntryCount || "1000",
            implementationType: sidePanelContext?.formValues?.implementationType || "memory",
            sequenceType: sidePanelContext?.formValues?.sequenceType || "ANONYMOUS",
            sequenceKey: sidePanelContext?.formValues?.sequenceKey || "registry",
            cacheProtocolType: sidePanelContext?.formValues?.cacheProtocolType || "HTTP",
            cacheProtocolMethods: sidePanelContext?.formValues?.cacheProtocolMethods || "*",
            headersToExcludeInHash: sidePanelContext?.formValues?.headersToExcludeInHash || "",
            headersToIncludeInHash: sidePanelContext?.formValues?.headersToIncludeInHash || "",
            responseCodes: sidePanelContext?.formValues?.responseCodes || ".*",
            enableCacheControl: sidePanelContext?.formValues?.enableCacheControl || false,
            includeAgeHeader: sidePanelContext?.formValues?.includeAgeHeader || false,
            hashGenerator: sidePanelContext?.formValues?.hashGenerator || "org.wso2.carbon.mediator.cache.digest.HttpRequestHashGenerator",
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        const xml = getXML(MEDIATORS.CACHE, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Utilizes cached response if a similar message has been stored previously.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Type</Typography>

                    <Field>
                        <Controller
                            name="cacheMediatorImplementation"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Cache Mediator Implementation" name="cacheMediatorImplementation" items={["Default", "611 Compatible"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.cacheMediatorImplementation && <Error>{errors.cacheMediatorImplementation.message.toString()}</Error>}
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Properties</Typography>

                    {watch("cacheMediatorImplementation") == "611 Compatible" &&
                    <Field>
                        <Controller
                            name="cacheType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Cache Type" name="cacheType" items={["FINDER", "COLLECTOR"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.cacheType && <Error>{errors.cacheType.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("cacheMediatorImplementation") == "611 Compatible") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="id"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Id" size={50} placeholder="" />
                            )}
                        />
                        {errors.id && <Error>{errors.id.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("cacheType") == "FINDER" &&
                    <Field>
                        <Controller
                            name="cacheTimeout"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Cache Timeout(S)" size={50} placeholder="" />
                            )}
                        />
                        {errors.cacheTimeout && <Error>{errors.cacheTimeout.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("cacheType") == "FINDER" &&
                    <Field>
                        <Controller
                            name="maxMessageSize"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Max Message Size(bytes)" size={50} placeholder="" />
                            )}
                        />
                        {errors.maxMessageSize && <Error>{errors.maxMessageSize.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("cacheMediatorImplementation") == "611 Compatible" &&
                    <Field>
                        <Controller
                            name="scope"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Scope" name="scope" items={["Per_Host", "Per_Mediator"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.scope && <Error>{errors.scope.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("cacheMediatorImplementation") == "611 Compatible") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="hashGeneratorAttribute"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="HashGenerator Attribute" size={50} placeholder="" />
                            )}
                        />
                        {errors.hashGeneratorAttribute && <Error>{errors.hashGeneratorAttribute.message.toString()}</Error>}
                    </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Implementation</Typography>

                    {watch("cacheType") == "FINDER" &&
                    <Field>
                        <Controller
                            name="maxEntryCount"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Max Entry Count" size={50} placeholder="" />
                            )}
                        />
                        {errors.maxEntryCount && <Error>{errors.maxEntryCount.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("cacheMediatorImplementation") == "611 Compatible") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="implementationType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Implementation Type" name="implementationType" items={["memory", "disk"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.implementationType && <Error>{errors.implementationType.message.toString()}</Error>}
                    </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">On Cache Hit</Typography>

                    {watch("cacheType") == "FINDER" &&
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
                    }

                    {((watch("sequenceType") == "REGISTRY_REFERENCE") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="sequenceKey"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Sequence Key" size={50} placeholder="" />
                            )}
                        />
                        {errors.sequenceKey && <Error>{errors.sequenceKey.message.toString()}</Error>}
                    </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Protocol</Typography>

                    {((watch("cacheMediatorImplementation") == "Default") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="cacheProtocolType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Cache Protocol Type" name="cacheProtocolType" items={["HTTP"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.cacheProtocolType && <Error>{errors.cacheProtocolType.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("cacheMediatorImplementation") == "Default") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="cacheProtocolMethods"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Cache Protocol Methods" size={50} placeholder="" />
                            )}
                        />
                        {errors.cacheProtocolMethods && <Error>{errors.cacheProtocolMethods.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("cacheMediatorImplementation") == "Default") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="headersToExcludeInHash"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Headers To Exclude In Hash" size={50} placeholder="" />
                            )}
                        />
                        {errors.headersToExcludeInHash && <Error>{errors.headersToExcludeInHash.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("cacheMediatorImplementation") == "Default") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="headersToIncludeInHash"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Headers To Include In Hash" size={50} placeholder="" />
                            )}
                        />
                        {errors.headersToIncludeInHash && <Error>{errors.headersToIncludeInHash.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("cacheMediatorImplementation") == "Default") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="responseCodes"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Response Codes" size={50} placeholder="" />
                            )}
                        />
                        {errors.responseCodes && <Error>{errors.responseCodes.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("cacheMediatorImplementation") == "Default") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="enableCacheControl"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Enable Cache Control</VSCodeCheckbox>
                            )}
                        />
                        {errors.enableCacheControl && <Error>{errors.enableCacheControl.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("cacheMediatorImplementation") == "Default") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="includeAgeHeader"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Include Age Header</VSCodeCheckbox>
                            )}
                        />
                        {errors.includeAgeHeader && <Error>{errors.includeAgeHeader.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("cacheMediatorImplementation") == "Default") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="hashGenerator"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Hash Generator" size={50} placeholder="" />
                            )}
                        />
                        {errors.hashGenerator && <Error>{errors.hashGenerator.message.toString()}</Error>}
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

export default CacheForm; 
