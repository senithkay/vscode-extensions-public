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
import { AutoComplete, Button, ComponentCard, ProgressIndicator, TextField, TextArea, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { Keylookup } from '../../../../Form';
import { ExpressionField, ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
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

const EnrichForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            cloneSource: sidePanelContext?.formValues?.cloneSource || true,
            sourceType: sidePanelContext?.formValues?.sourceType || "envelope",
            sourceXPath: sidePanelContext?.formValues?.sourceXPath || {"isExpression":true,"value":""},
            sourceProperty: sidePanelContext?.formValues?.sourceProperty || "",
            inlineType: sidePanelContext?.formValues?.inlineType || "Inline XML/JSON",
            sourceXML: sidePanelContext?.formValues?.sourceXML || "",
            inlineRegistryKey: sidePanelContext?.formValues?.inlineRegistryKey || "",
            targetAction: sidePanelContext?.formValues?.targetAction || "replace",
            targetType: sidePanelContext?.formValues?.targetType || "custom",
            targetXPathJsonPath: sidePanelContext?.formValues?.targetXPathJsonPath || {"isExpression":true,"value":""},
            targetProperty: sidePanelContext?.formValues?.targetProperty || "",
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
        
        const xml = getXML(MEDIATORS.ENRICH, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Enriches message content (envelope, body, etc.) based on specification.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Source</Typography>

                    <Field>
                        <Controller
                            name="cloneSource"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Clone Source</VSCodeCheckbox>
                            )}
                        />
                        {errors.cloneSource && <Error>{errors.cloneSource.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="sourceType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Source Type" name="sourceType" items={["custom", "envelope", "body", "property", "inline"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.sourceType && <Error>{errors.sourceType.message.toString()}</Error>}
                    </Field>

                    {watch("sourceType") == "custom" &&
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
                    }

                    {watch("sourceType") == "property" &&
                    <Field>
                        <Controller
                            name="sourceProperty"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Source Property" size={50} placeholder="" />
                            )}
                        />
                        {errors.sourceProperty && <Error>{errors.sourceProperty.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("sourceType") == "inline" &&
                    <Field>
                        <Controller
                            name="inlineType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Inline Type" name="inlineType" items={["Inline XML/JSON", "RegistryKey"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.inlineType && <Error>{errors.inlineType.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("sourceType") == "inline") &&(watch("inlineType") == "Inline XML/JSON") ) &&
                    <Field>
                        <Controller
                            name="sourceXML"
                            control={control}
                            render={({ field }) => (
                                <TextArea {...field} label="Source XML" placeholder="" />
                            )}
                        />
                        {errors.sourceXML && <Error>{errors.sourceXML.message.toString()}</Error>}
                    </Field>
                    }

                    {((watch("sourceType") == "inline") &&(watch("inlineType") == "RegistryKey") ) &&
                    <Field>
                        <Controller
                            name="inlineRegistryKey"
                            control={control}
                            render={({ field }) => (
                                <Keylookup
                                    value={field.value}
                                    filterType='registry'
                                    label="Inline Registry Key"
                                    allowItemCreate={false}
                                    onValueChange={field.onChange}
                                />
                            )}
                        />
                        {errors.inlineRegistryKey && <Error>{errors.inlineRegistryKey.message.toString()}</Error>}
                    </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Target</Typography>

                    <Field>
                        <Controller
                            name="targetAction"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Target Action" name="targetAction" items={["replace", "child", "sibling", "remove"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.targetAction && <Error>{errors.targetAction.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="targetType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Target Type" name="targetType" items={["custom", "body", "property", "envelope", "key"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.targetType && <Error>{errors.targetType.message.toString()}</Error>}
                    </Field>

                    {((watch("targetType") == "custom") ||(watch("targetType") == "key") ) &&
                    <Field>
                        <Controller
                            name="targetXPathJsonPath"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Target XPath / JSONPath"
                                    placeholder=""
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                        {errors.targetXPathJsonPath && <Error>{errors.targetXPathJsonPath.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("targetType") == "property" &&
                    <Field>
                        <Controller
                            name="targetProperty"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Target Property" size={50} placeholder="" />
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

export default EnrichForm; 
