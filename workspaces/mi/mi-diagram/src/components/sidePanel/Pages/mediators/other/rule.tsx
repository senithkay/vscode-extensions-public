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
import { ExpressionField, ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
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

const RuleForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            sourceValue: sidePanelContext?.formValues?.sourceValue || "",
            sourceXPath: sidePanelContext?.formValues?.sourceXPath || {"isExpression":true,"value":""},
            targetValue: sidePanelContext?.formValues?.targetValue || "",
            targetAction: sidePanelContext?.formValues?.targetAction || "Replace",
            targetNamespaces: {
                paramValues: sidePanelContext?.formValues?.targetNamespaces ? getParamManagerFromValues(sidePanelContext?.formValues?.targetNamespaces) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Prefix",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "TextField",
                        "label": "Namespace URI",
                        "defaultValue": "",
                        "isRequired": false
                    },
                ]
            },
            targetXPath: sidePanelContext?.formValues?.targetXPath || {"isExpression":true,"value":""},
            targetResultXPath: sidePanelContext?.formValues?.targetResultXPath || {"isExpression":true,"value":""},
            ruleSetType: sidePanelContext?.formValues?.ruleSetType || "Regular",
            ruleSetSourceType: sidePanelContext?.formValues?.ruleSetSourceType || "INLINE",
            ruleSetSourceCode: sidePanelContext?.formValues?.ruleSetSourceCode || "<code/>",
            inlineRegistryKey: sidePanelContext?.formValues?.inlineRegistryKey || "",
            ruleSetURL: sidePanelContext?.formValues?.ruleSetURL || "",
            inputWrapperName: sidePanelContext?.formValues?.inputWrapperName || "",
            inputNamespace: sidePanelContext?.formValues?.inputNamespace || "",
            factsConfiguration: {
                paramValues: sidePanelContext?.formValues?.factsConfiguration ? getParamManagerFromValues(sidePanelContext?.formValues?.factsConfiguration) : [],
                paramFields: [
                    {
                        "type": "Dropdown",
                        "label": "Fact Type",
                        "defaultValue": "CUSTOM",
                        "isRequired": false,
                        "values": [
                            "CUSTOM",
                            "dom",
                            "message",
                            "context",
                            "omelement",
                            "mediator"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Fact Custom Type",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            {
                                "0": "CUSTOM"
                            }
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Fact Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "ExprField",
                        "label": "Property Expression",
                        "defaultValue": {
                            "isExpression": true,
                            "value": ""
                        },
                        "isRequired": false,
                        "canChange": false, 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)},
                ]
            },
            outputWrapperName: sidePanelContext?.formValues?.outputWrapperName || "",
            outputNamespace: sidePanelContext?.formValues?.outputNamespace || "",
            resultsConfiguration: {
                paramValues: sidePanelContext?.formValues?.resultsConfiguration ? getParamManagerFromValues(sidePanelContext?.formValues?.resultsConfiguration) : [],
                paramFields: [
                    {
                        "type": "Dropdown",
                        "label": "Result Type",
                        "defaultValue": "CUSTOM",
                        "isRequired": false,
                        "values": [
                            "CUSTOM",
                            "dom",
                            "message",
                            "context",
                            "omelement",
                            "mediator"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Result Custom Type",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            {
                                "0": "CUSTOM"
                            }
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Result Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                ]
            },
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
        
        values["targetNamespaces"] = getParamManagerValues(values.targetNamespaces);
        values["factsConfiguration"] = getParamManagerValues(values.factsConfiguration);
        values["resultsConfiguration"] = getParamManagerValues(values.resultsConfiguration);
        const xml = getXML(MEDIATORS.RULE, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Processes XML message by applying a set of rules.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Source</Typography>

                    <Field>
                        <Controller
                            name="sourceValue"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Source Value" size={50} placeholder="" />
                            )}
                        />
                        {errors.sourceValue && <Error>{errors.sourceValue.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="sourceXPath"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Source XPath"
                                    placeholder=""
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                        {errors.sourceXPath && <Error>{errors.sourceXPath.message.toString()}</Error>}
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Target</Typography>

                    <Field>
                        <Controller
                            name="targetValue"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Target Value" size={50} placeholder="" />
                            )}
                        />
                        {errors.targetValue && <Error>{errors.targetValue.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="targetAction"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Target Action" name="targetAction" items={["Replace", "Child", "Sibiling"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.targetAction && <Error>{errors.targetAction.message.toString()}</Error>}
                    </Field>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Target Namespaces</Typography>
                        <Typography variant="body3">Editing of the namespaces of target element</Typography>

                        <Controller
                            name="targetNamespaces"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <ParamManager
                                    paramConfigs={value}
                                    readonly={false}
                                    onChange= {(values) => {
                                        values.paramValues = values.paramValues.map((param: any, index: number) => {
                                            const property: ParamValue[] = param.paramValues;
                                            param.key = property[0].value;
                                            param.value = property[1].value;
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
                            name="targetXPath"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Target XPath"
                                    placeholder=""
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                        {errors.targetXPath && <Error>{errors.targetXPath.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="targetResultXPath"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Target Result XPath"
                                    placeholder=""
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                        {errors.targetResultXPath && <Error>{errors.targetResultXPath.message.toString()}</Error>}
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Rule Set</Typography>

                    <Field>
                        <Controller
                            name="ruleSetType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Rule Set Type" name="ruleSetType" items={["Regular", "Decision Table"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.ruleSetType && <Error>{errors.ruleSetType.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="ruleSetSourceType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Rule Set Source Type" name="ruleSetSourceType" items={["INLINE", "REGISTRY_REFERENCE", "URL"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.ruleSetSourceType && <Error>{errors.ruleSetSourceType.message.toString()}</Error>}
                    </Field>

                    {watch("ruleSetSourceType") == "INLINE" &&
                    <Field>
                        <Controller
                            name="ruleSetSourceCode"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Rule Set Source Code" size={50} placeholder="" />
                            )}
                        />
                        {errors.ruleSetSourceCode && <Error>{errors.ruleSetSourceCode.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("ruleSetSourceType") == "REGISTRY_REFERENCE" &&
                    <Field>
                        <Controller
                            name="inlineRegistryKey"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Inline Registry Key" size={50} placeholder="" />
                            )}
                        />
                        {errors.inlineRegistryKey && <Error>{errors.inlineRegistryKey.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("ruleSetSourceType") == "URL" &&
                    <Field>
                        <Controller
                            name="ruleSetURL"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Rule Set URL" size={50} placeholder="" />
                            )}
                        />
                        {errors.ruleSetURL && <Error>{errors.ruleSetURL.message.toString()}</Error>}
                    </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Input Facts</Typography>

                    <Field>
                        <Controller
                            name="inputWrapperName"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Input Wrapper Name" size={50} placeholder="" />
                            )}
                        />
                        {errors.inputWrapperName && <Error>{errors.inputWrapperName.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="inputNamespace"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Input Namespace" size={50} placeholder="" />
                            )}
                        />
                        {errors.inputNamespace && <Error>{errors.inputNamespace.message.toString()}</Error>}
                    </Field>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Facts Configuration</Typography>
                        <Typography variant="body3">Editing of the properties of an object Facts Configuration</Typography>

                        <Controller
                            name="factsConfiguration"
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

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Output Facts</Typography>

                    <Field>
                        <Controller
                            name="outputWrapperName"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Output Wrapper Name" size={50} placeholder="" />
                            )}
                        />
                        {errors.outputWrapperName && <Error>{errors.outputWrapperName.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="outputNamespace"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Output Namespace" size={50} placeholder="" />
                            )}
                        />
                        {errors.outputNamespace && <Error>{errors.outputNamespace.message.toString()}</Error>}
                    </Field>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Results Configuration</Typography>
                        <Typography variant="body3">Editing of the properties of an object Rule Results Configuration</Typography>

                        <Controller
                            name="resultsConfiguration"
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
        </>
    );
};

export default RuleForm; 
