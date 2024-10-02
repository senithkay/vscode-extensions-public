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
import { sidepanelGoBack } from '../../..';

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
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            cacheMediatorImplementation: sidePanelContext?.formValues?.cacheMediatorImplementation || "Default",
            cacheType: sidePanelContext?.formValues?.cacheType || "FINDER",
            id: sidePanelContext?.formValues?.id || "",
            cacheTimeout: sidePanelContext?.formValues?.cacheTimeout || "120",
            maxMessageSize: sidePanelContext?.formValues?.maxMessageSize || "2000",
            scope: sidePanelContext?.formValues?.scope || "per-host",
            hashGeneratorAttribute: sidePanelContext?.formValues?.hashGeneratorAttribute || "org.wso2.carbon.mediator.cache.digest.DOMHASHGenerator",
            maxEntryCount: sidePanelContext?.formValues?.maxEntryCount || "1000",
            implementationType: sidePanelContext?.formValues?.implementationType || "memory",
            sequenceType: sidePanelContext?.formValues?.sequenceType || "ANONYMOUS",
            sequenceKey: sidePanelContext?.formValues?.sequenceKey || "",
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

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    const onClick = async (values: any) => {
        setDiagramLoading(true);
        
        const xml = getXML(MEDIATORS.CACHE, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Utilizes cached response if a similar message has been stored previously.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Type</Typography>

                    <Field>
                        <Controller
                            name="cacheMediatorImplementation"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Cache Mediator Implementation"
                                    name="cacheMediatorImplementation"
                                    items={["Default", "611 Compatible"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.cacheMediatorImplementation?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Properties</Typography>

                    <Field>
                        <Controller
                            name="cacheType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Cache Type"
                                    name="cacheType"
                                    items={["FINDER", "COLLECTOR"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.cacheType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    {((watch("cacheMediatorImplementation") == "611 Compatible") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="id"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Id" size={50} placeholder="" required={false} errorMsg={errors?.id?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {watch("cacheType") == "FINDER" &&
                    <Field>
                        <Controller
                            name="cacheTimeout"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Cache Timeout(S)" size={50} placeholder="" required={false} errorMsg={errors?.cacheTimeout?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {watch("cacheType") == "FINDER" &&
                    <Field>
                        <Controller
                            name="maxMessageSize"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Max Message Size(bytes)" size={50} placeholder="" required={false} errorMsg={errors?.maxMessageSize?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {watch("cacheMediatorImplementation") == "611 Compatible" &&
                    <Field>
                        <Controller
                            name="scope"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Scope"
                                    name="scope"
                                    items={["per-host", "per-mediator"]}
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
                    }

                    {((watch("cacheMediatorImplementation") == "611 Compatible") &&(watch("cacheType") == "FINDER") ) &&
                    <Field>
                        <Controller
                            name="hashGeneratorAttribute"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="HashGenerator Attribute" size={50} placeholder="" required={false} errorMsg={errors?.hashGeneratorAttribute?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                </ComponentCard>

                {watch("cacheType") == "FINDER" &&
                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Implementation</Typography>

                    <Field>
                        <Controller
                            name="maxEntryCount"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Max Entry Count" size={50} placeholder="" required={true} errorMsg={errors?.maxEntryCount?.message?.toString()} />
                            )}
                        />
                    </Field>

                    {((watch("cacheMediatorImplementation") == "611 Compatible") ) &&
                        <Field>
                            <Controller
                                name="implementationType"
                                control={control}
                                render={({ field }) => (
                                    <AutoComplete
                                        label="Implementation Type"
                                        name="implementationType"
                                        items={["memory", "disk"]}
                                        value={field.value}
                                        required={false}
                                        errorMsg={errors?.implementationType?.message?.toString()}
                                        onValueChange={(e: any) => {
                                            field.onChange(e);
                                        }}
                                    />
                                )}
                            />
                        </Field>
                    }

                </ComponentCard>
                }

                {watch("cacheType") == "FINDER" &&
                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">On Cache Hit</Typography>

                    <Field>
                        <Controller
                            name="sequenceType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Sequence Type"
                                    name="sequenceType"
                                    items={["ANONYMOUS", "REGISTRY_REFERENCE"]}
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
                                        required={false}
                                        errorMsg={errors?.sequenceKey?.message?.toString()}
                                    />
                                )}
                            />
                        </Field>
                    }

                </ComponentCard>
                }

                {((watch("cacheMediatorImplementation") == "Default") &&(watch("cacheType") == "FINDER") ) &&
                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Protocol</Typography>

                    <Field>
                        <Controller
                            name="cacheProtocolType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Cache Protocol Type"
                                    name="cacheProtocolType"
                                    items={["HTTP"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.cacheProtocolType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="cacheProtocolMethods"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Cache Protocol Methods" size={50} placeholder="" required={false} errorMsg={errors?.cacheProtocolMethods?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="headersToExcludeInHash"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Headers To Exclude In Hash" size={50} placeholder="" required={false} errorMsg={errors?.headersToExcludeInHash?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="headersToIncludeInHash"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Headers To Include In Hash" size={50} placeholder="" required={false} errorMsg={errors?.headersToIncludeInHash?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="responseCodes"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Response Codes" size={50} placeholder="" required={false} errorMsg={errors?.responseCodes?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="enableCacheControl"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Enable Cache Control</VSCodeCheckbox>
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="includeAgeHeader"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Include Age Header</VSCodeCheckbox>
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="hashGenerator"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Hash Generator" size={50} placeholder="" required={false} errorMsg={errors?.hashGenerator?.message?.toString()} />
                            )}
                        />
                    </Field>

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

export default CacheForm; 
