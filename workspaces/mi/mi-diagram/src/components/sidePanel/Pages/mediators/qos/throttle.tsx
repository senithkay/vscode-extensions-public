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
import { AutoComplete, Button, ComponentCard, ExpressionFieldValue, ParamManager, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
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

const ThrottleForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            groupId: sidePanelContext?.formValues?.groupId || "",
            onAcceptBranchsequenceType: sidePanelContext?.formValues?.onAcceptBranchsequenceType || "ANONYMOUS",
            onAcceptBranchsequenceKey: sidePanelContext?.formValues?.onAcceptBranchsequenceKey || "",
            onRejectBranchsequenceType: sidePanelContext?.formValues?.onRejectBranchsequenceType || "ANONYMOUS",
            onRejectBranchsequenceKey: sidePanelContext?.formValues?.onRejectBranchsequenceKey || "",
            policyType: sidePanelContext?.formValues?.policyType || "INLINE",
            policyEntries: {
                paramValues: sidePanelContext?.formValues?.policyEntries && sidePanelContext?.formValues?.policyEntries.map((property: string|ExpressionFieldValue[], index: string) => (
                    {
                        id: index,
                        key: typeof property[0] === 'object' ? property[0].value : property[0],
                        value: typeof property[2] === 'object' ? property[2].value : property[2],
                        icon: 'query',
                        paramValues: [
                            { value: property[0] },
                            { value: property[1] },
                            { value: property[2] },
                            { value: property[3] },
                            { value: property[4] },
                            { value: property[5] },
                        ]
                    }
                )) || [] as string[][],
                paramFields: [
                    {
                        "type": "Dropdown",
                        "label": "Throttle Type",
                        "defaultValue": "IP",
                        "isRequired": false,
                        "values": [
                            "IP",
                            "DOMAIN"
                        ], 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }},
                    {
                        "type": "TextField",
                        "label": "Throttle Range",
                        "defaultValue": "other",
                        "isRequired": false, 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }},
                    {
                        "type": "Dropdown",
                        "label": "Access Type",
                        "defaultValue": "Allow",
                        "isRequired": false,
                        "values": [
                            "Allow",
                            "Deny",
                            "Control"
                        ], 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }},
                    {
                        "type": "TextField",
                        "label": "Max Request Count",
                        "defaultValue": "0",
                        "isRequired": false, 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }},
                    {
                        "type": "TextField",
                        "label": "Unit Time",
                        "defaultValue": "0",
                        "isRequired": false, 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }},
                    {
                        "type": "TextField",
                        "label": "Prohibit Period",
                        "defaultValue": "0",
                        "isRequired": false, 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }},
                ]
            },
            policyKey: sidePanelContext?.formValues?.policyKey || "",
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        values["policyEntries"] = values.policyEntries.paramValues.map((param: any) => param.paramValues.map((p: any) => p.value));
        const xml = getXML(MEDIATORS.THROTTLE, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Restricts access to services.</Typography>
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
                                <AutoComplete label="On Accept Branchsequence Type" name="onAcceptBranchsequenceType" items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={field.value} onValueChange={(e: any) => {
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
                                <TextField {...field} label="On Accept Branchsequence Key" size={50} placeholder="" />
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
                                <AutoComplete label="On Reject Branchsequence Type" name="onRejectBranchsequenceType" items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={field.value} onValueChange={(e: any) => {
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
                                <TextField {...field} label="On Reject Branchsequence Key" size={50} placeholder="" />
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
                                            const paramValues = param.paramValues;
                                            param.key = paramValues[0].value;
                                            param.value = paramValues[2].value;
                                            if (paramValues[1]?.value?.isExpression) {
                                                param.namespaces = paramValues[1].value.namespaces;
                                            }
                                            param.icon = 'query';
                                            return param;
                                        });
                                        onChange(values);
                                    }}
                                />
                            )}
                        />
                    </ComponentCard>
                    {watch("policyType") == "REGISTRY_REFERENCE" &&
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
