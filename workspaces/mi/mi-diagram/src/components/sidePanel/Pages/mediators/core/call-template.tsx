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
import { AddMediatorProps, openPopup, getParamManagerValues, getParamManagerFromValues } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { Keylookup } from '../../../../Form';
import { ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
import { ParamManager, ParamValue } from '../../../../Form/ParamManager/ParamManager';
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

const CallTemplateForm = (props: AddMediatorProps) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            targetTemplate: sidePanelContext?.formValues?.targetTemplate || "",
            parameterNameTable: {
                paramValues: sidePanelContext?.formValues?.parameterNameTable ? getParamManagerFromValues(sidePanelContext?.formValues?.parameterNameTable, 0, 1) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Parameter Name",
                        "defaultValue": "",
                        "isRequired": true
                    },
                    {
                        "type": "ExprField",
                        "label": "Parameter Value",
                        "defaultValue": {
                            "isExpression": false,
                            "value": ""
                        },
                        "isRequired": true,
                        "canChange": true, 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)},
                ]
            },
            onError: sidePanelContext?.formValues?.onError || "",
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
        
        values["parameterNameTable"] = getParamManagerValues(values.parameterNameTable);
        const xml = getXML(MEDIATORS.CALLTEMPLATE, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Invokes sequence template by populating pre-configured parameters with static values or XPath expressions.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="targetTemplate"
                        control={control}
                        rules={
                            {
                                required: "This field is required",
                            }
                        }
                        render={({ field }) => (
                            <Keylookup
                                value={field.value}
                                filterType='sequenceTemplate'
                                label="Target Template"
                                allowItemCreate={false}
                                onCreateButtonClick={(fetchItems: any, handleValueChange: any) => {
                                    openPopup(rpcClient, 'sequenceTemplate', fetchItems, handleValueChange);
                                }}
                                onValueChange={field.onChange}
                                required={true}
                                errorMsg={errors?.targetTemplate?.message?.toString()}
                            />
                        )}
                    />
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Call-Template Parameter</Typography>
                    <Typography variant="body3">Editing of the properties of an object CallTemplateParameter</Typography>

                    <Controller
                        name="parameterNameTable"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <ParamManager
                                paramConfigs={value}
                                readonly={false}
                                onChange= {(values) => {
                                    values.paramValues = values.paramValues.map((param: any, index: number) => {
                                        const property: ParamValue[] = param.paramValues;
                                        param.key = property[0].value;
                                        param.value = (property[1].value as ExpressionFieldValue).value;
                                        param.icon = 'query';
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
                        name="onError"
                        control={control}
                        render={({ field }) => (
                            <Keylookup
                                value={field.value}
                                filterType='sequence'
                                label="OnError"
                                allowItemCreate={false}
                                onValueChange={field.onChange}
                                required={false}
                                errorMsg={errors?.onError?.message?.toString()}
                            />
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

export default CallTemplateForm; 
