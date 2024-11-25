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
import { AddMediatorProps, getParamManagerValues, getParamManagerFromValues } from '../../../../Form/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { FormKeylookup } from '../../../../Form';
import { ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
import { ParamManager, ParamValue } from '../../../../Form/ParamManager/ParamManager';
import { handleOpenExprEditor, sidepanelGoBack } from '../../..';
import { CodeTextArea } from '../../../../Form';

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

const ScriptForm = (props: AddMediatorProps) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            scriptLanguage: sidePanelContext?.formValues?.scriptLanguage || "js",
            scriptType: sidePanelContext?.formValues?.scriptType || "INLINE",
            scriptBody: sidePanelContext?.formValues?.scriptBody || "",
            scriptKey: sidePanelContext?.formValues?.scriptKey || {"isExpression":false,"value":""},
            mediateFunction: sidePanelContext?.formValues?.mediateFunction || "",
            scriptKeys: {
                paramValues: sidePanelContext?.formValues?.scriptKeys ? getParamManagerFromValues(sidePanelContext?.formValues?.scriptKeys, 0, 1) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Key Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "TextField",
                        "label": "Key Value",
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
        setDiagramLoading(true);
        
        values["scriptKeys"] = getParamManagerValues(values.scriptKeys);
        const xml = getXML(MEDIATORS.SCRIPT, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Invokes scripting language functions with embedded or stored script files.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="scriptLanguage"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                label="Script Language"
                                name="scriptLanguage"
                                items={["js", "rb", "groovy", "nashornJs", "rhinoJs"]}
                                value={field.value}
                                required={false}
                                errorMsg={errors?.scriptLanguage?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="scriptType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                label="Script Type"
                                name="scriptType"
                                items={["INLINE", "REGISTRY_REFERENCE"]}
                                value={field.value}
                                required={false}
                                errorMsg={errors?.scriptType?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>

                {watch("scriptType") == "INLINE" &&
                <Field>
                    <Controller
                        name="scriptBody"
                        control={control}
                        render={({ field }) => (
                            <CodeTextArea {...field} label="Script Body" placeholder="" required={false} resize="vertical" growRange={{ start: 5, offset: 10 }} errorMsg={errors?.scriptBody?.message?.toString()} />
                        )}
                    />
                </Field>
                }

                {watch("scriptType") == "REGISTRY_REFERENCE" &&
                <Field>
                    <Controller
                        name="scriptKey"
                        control={control}
                        render={({ field }) => (
                            <FormKeylookup
                                control={control}
                                name='scriptKey'
                                label="Script Key"
                                filterType='registry'
                                allowItemCreate={false}
                                required={false}
                                errorMsg={errors?.scriptKey?.message?.toString()}
                                canChangeEx={true}
                                exprToggleEnabled={true}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                            />
                        )}
                    />
                </Field>
                }

                {watch("scriptType") == "REGISTRY_REFERENCE" &&
                <Field>
                    <Controller
                        name="mediateFunction"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Mediate Function" size={50} placeholder="" required={false} errorMsg={errors?.mediateFunction?.message?.toString()} />
                        )}
                    />
                </Field>
                }

                {watch("scriptType") == "REGISTRY_REFERENCE" &&
                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Script Keys</Typography>
                    <Typography variant="body3">Editing of the properties of an object Registry Key Property</Typography>

                    <Controller
                        name="scriptKeys"
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

export default ScriptForm; 
