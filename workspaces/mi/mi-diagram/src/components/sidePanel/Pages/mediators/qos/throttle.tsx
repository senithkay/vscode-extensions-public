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
import { AddMediatorProps, getParamManagerValues, getParamManagerFromValues } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { Keylookup } from '../../../../Form';
import { ParamManager, ParamValue } from '../../../../Form/ParamManager/ParamManager';
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

const ThrottleForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            groupId: sidePanelContext?.formValues?.groupId || "",
            onAcceptBranchsequenceType: sidePanelContext?.formValues?.onAcceptBranchsequenceType || "ANONYMOUS",
            onAcceptBranchsequenceKey: sidePanelContext?.formValues?.onAcceptBranchsequenceKey || "",
            onRejectBranchsequenceType: sidePanelContext?.formValues?.onRejectBranchsequenceType || "ANONYMOUS",
            onRejectBranchsequenceKey: sidePanelContext?.formValues?.onRejectBranchsequenceKey || "",
            policyType: sidePanelContext?.formValues?.policyType || "INLINE",
            maximumConcurrentAccess: sidePanelContext?.formValues?.maximumConcurrentAccess || "0",
            policyEntries: {
                paramValues: sidePanelContext?.formValues?.policyEntries ? getParamManagerFromValues(sidePanelContext?.formValues?.policyEntries, 0, 2) : [],
                paramFields: [
                    {
                        "type": "Dropdown",
                        "label": "Throttle Type",
                        "defaultValue": "IP",
                        "isRequired": false,
                        "values": [
                            "IP",
                            "DOMAIN"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Throttle Range",
                        "defaultValue": "other",
                        "isRequired": false
                    },
                    {
                        "type": "Dropdown",
                        "label": "Access Type",
                        "defaultValue": "Allow",
                        "isRequired": false,
                        "values": [
                            "Allow",
                            "Deny",
                            "Control"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Max Request Count",
                        "defaultValue": "0",
                        "isRequired": false
                    },
                    {
                        "type": "TextField",
                        "label": "Unit Time",
                        "defaultValue": "0",
                        "isRequired": false
                    },
                    {
                        "type": "TextField",
                        "label": "Prohibit Period",
                        "defaultValue": "0",
                        "isRequired": false
                    },
                ]
            },
            policyKey: sidePanelContext?.formValues?.policyKey || "",
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
        
        values["policyEntries"] = getParamManagerValues(values.policyEntries);
        const xml = getXML(MEDIATORS.THROTTLE, values, dirtyFields, sidePanelContext.formValues);
        const trailingSpaces = props.trailingSpace;
        if (Array.isArray(xml)) {
            for (let i = 0; i < xml.length; i++) {
                await rpcClient.getMiDiagramRpcClient().applyEdit({
                    documentUri: props.documentUri, range: xml[i].range, text: `${xml[i]}${trailingSpaces}`
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Restricts access to services.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">General</Typography>

                    <Field>
                        <Controller
                            name="groupId"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Group ID" size={50} placeholder="" />
                            )}
                        />
                        {errors.groupId && <Error>{errors.groupId.message.toString()}</Error>}
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">OnAccept</Typography>

                    <Field>
                        <Controller
                            name="onAcceptBranchsequenceType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="On Accept Branch Sequence Type" name="onAcceptBranchSequenceType" items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.onAcceptBranchsequenceType && <Error>{errors.onAcceptBranchsequenceType.message.toString()}</Error>}
                    </Field>

                    {watch("onAcceptBranchsequenceType") == "REGISTRY_REFERENCE" &&
                    <Field>
                        <Controller
                            name="onAcceptBranchsequenceKey"
                            control={control}
                            render={({ field }) => (
                                <Keylookup
                                    value={field.value}
                                    filterType='sequence'
                                    label="On Accept Branch Sequence Key"
                                    allowItemCreate={false}
                                    onValueChange={field.onChange}
                                />
                            )}
                        />
                        {errors.onAcceptBranchsequenceKey && <Error>{errors.onAcceptBranchsequenceKey.message.toString()}</Error>}
                    </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">OnReject</Typography>

                    <Field>
                        <Controller
                            name="onRejectBranchsequenceType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="On Reject Branch Sequence Type" name="onRejectBranchSequenceType" items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.onRejectBranchsequenceType && <Error>{errors.onRejectBranchsequenceType.message.toString()}</Error>}
                    </Field>

                    {watch("onRejectBranchsequenceType") == "REGISTRY_REFERENCE" &&
                    <Field>
                        <Controller
                            name="onRejectBranchsequenceKey"
                            control={control}
                            render={({ field }) => (
                                <Keylookup
                                    value={field.value}
                                    filterType='sequence'
                                    label="On Reject Branch Sequence Key"
                                    allowItemCreate={false}
                                    onValueChange={field.onChange}
                                />
                            )}
                        />
                        {errors.onRejectBranchsequenceKey && <Error>{errors.onRejectBranchsequenceKey.message.toString()}</Error>}
                    </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">ThrottlePolicy</Typography>

                    <Field>
                        <Controller
                            name="policyType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Policy Type" name="policyType" items={["INLINE", "REGISTRY_REFERENCE"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.policyType && <Error>{errors.policyType.message.toString()}</Error>}
                    </Field>

                    {watch("policyType") == "INLINE" &&
                    <Field>
                        <Controller
                            name="maximumConcurrentAccess"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Maxmium Concurrent Access" size={50} placeholder="" />
                            )}
                        />
                        {errors.maximumConcurrentAccess && <Error>{errors.maximumConcurrentAccess.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("policyType") == "INLINE" &&
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Policy Entries</Typography>
                        <Typography variant="body3">Editing of the properties of an object ThrottlePolicyEntry</Typography>

                        <Controller
                            name="policyEntries"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <ParamManager
                                    paramConfigs={value}
                                    readonly={false}
                                    onChange= {(values) => {
                                        values.paramValues = values.paramValues.map((param: any, index: number) => {
                                            const property: ParamValue[] = param.paramValues;
                                            param.key = property[0].value;
                                            param.value = property[2].value;
                                            param.icon = 'query';
                                            return param;
                                        });
                                        onChange(values);
                                    }}
                                />
                            )}
                        />
                    </ComponentCard>
                    }

                    {watch("policyType") == "REGISTRY_REFERENCE" &&
                    <Field>
                        <Controller
                            name="policyKey"
                            control={control}
                            render={({ field }) => (
                                <Keylookup
                                    value={field.value}
                                    filterType='ws_policy'
                                    label="Policy Key"
                                    allowItemCreate={false}
                                    onValueChange={field.onChange}
                                />
                            )}
                        />
                        {errors.policyKey && <Error>{errors.policyKey.message.toString()}</Error>}
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

export default ThrottleForm; 
