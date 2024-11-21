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
import { Button, ComponentCard, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, getParamManagerValues, getParamManagerFromValues } from '../../../../Form/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
import { ParamManager, ParamConfig, ParamValue } from '../../../../Form/ParamManager/ParamManager';
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

const RewriteForm = (props: AddMediatorProps) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            urlRewriteRules: {
                paramValues: sidePanelContext?.formValues?.urlRewriteRules ? getParamManagerFromValues(sidePanelContext?.formValues?.urlRewriteRules, -1, 1) : [],
                paramFields: [
                    {
                        "type": "ParamManager",
                        "label": "Rewrite Rule Action",
                        "defaultValue": "",
                        "isRequired": false, 
                        "paramManager": {
                            paramConfigs: {
                                paramValues: sidePanelContext?.formValues?.rewriteRuleAction ? getParamManagerFromValues(sidePanelContext?.formValues?.rewriteRuleAction, 0, -1) : [],
                                paramFields: [
                                    {
                                        "type": "Dropdown",
                                        "label": "Rule Action",
                                        "defaultValue": "Replace",
                                        "isRequired": false,
                                        "values": [
                                            "Replace",
                                            "Remove",
                                            "Append",
                                            "Prepend",
                                            "Set"
                                        ]
                                    },
                                    {
                                        "type": "Dropdown",
                                        "label": "Rule Fragment",
                                        "defaultValue": "protocol",
                                        "isRequired": false,
                                        "values": [
                                            "protocol",
                                            "host",
                                            "port",
                                            "path",
                                            "query",
                                            "ref",
                                            "user",
                                            "full"
                                        ]
                                    },
                                    {
                                        "type": "Dropdown",
                                        "label": "Rule Option",
                                        "defaultValue": "Value",
                                        "isRequired": false,
                                        "values": [
                                            "Value",
                                            "Expression"
                                        ]
                                    },
                                    {
                                        "type": "TextField",
                                        "label": "Action Value",
                                        "defaultValue": "",
                                        "isRequired": false,
                                        "enableCondition": [
                                            {
                                                "2": "Value"
                                            }
                                        ]
                                    },
                                    {
                                        "type": "ExprField",
                                        "label": "Action Expression",
                                        "defaultValue": {
                                            "isExpression": true,
                                            "value": ""
                                        },
                                        "isRequired": false,
                                        "canChange": false,
                                        "enableCondition": [
                                            {
                                                "2": "Expression"
                                            }
                                        ], 
                                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)},
                                    {
                                        "type": "TextField",
                                        "label": "Action Regex",
                                        "defaultValue": "",
                                        "isRequired": false
                                    },
                                ]
                            },
                            openInDrawer: true,
                            addParamText: "New Rewrite Rule Action"
                        },
                    },
                    {
                        "type": "TextField",
                        "label": "URLRewriteRuleCondition",
                        "defaultValue": "",
                        "isRequired": false
                    },
                ]
            },
            inProperty: sidePanelContext?.formValues?.inProperty || "",
            outProperty: sidePanelContext?.formValues?.outProperty || "",
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
        
        values["urlRewriteRules"] = getParamManagerValues(values.urlRewriteRules);
        const xml = getXML(MEDIATORS.REWRITE, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Modifies and transforms URL values in the message.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">URL Rewrite Rules</Typography>
                    <Typography variant="body3">Editing of the properties of an object URL Rewrite Rule</Typography>

                    <Controller
                        name="urlRewriteRules"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <ParamManager
                                paramConfigs={value}
                                readonly={false}
                                onChange= {(values) => {
                                    values.paramValues = values.paramValues.map((param: any, index: number) => {
                                        const property: ParamValue[] = param.paramValues;
                                        param.key = index + 1;
                                        param.value = property[1].value;
                                        param.icon = 'query';

                                        (property[0].value as ParamConfig).paramValues = (property[0].value as ParamConfig).paramValues.map((param: any, index: number) => {
                                            const property: ParamValue[] = param.paramValues;
                                            param.key = property[0].value;
                                            param.value = property[1].value;
                                            param.icon = 'query';
                                            return param;
                                        });
            
                                        return param;
                                    });
                                    onChange(values);
                                }}
                            />
                        )}
                    />
                </ComponentCard>

                <Field>
                    <Controller
                        name="inProperty"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="In Property" size={50} placeholder="" required={false} errorMsg={errors?.inProperty?.message?.toString()} />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="outProperty"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Out Property" size={50} placeholder="" required={false} errorMsg={errors?.outProperty?.message?.toString()} />
                        )}
                    />
                </Field>

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

export default RewriteForm; 
