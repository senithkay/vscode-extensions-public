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
import { CodeTextArea } from '../../../../Form/CodeTextArea';

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
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            scriptLanguage: sidePanelContext?.formValues?.scriptLanguage || "js",
            scriptType: sidePanelContext?.formValues?.scriptType || "INLINE",
            scriptBody: sidePanelContext?.formValues?.scriptBody || "",
            scriptKey: sidePanelContext?.formValues?.scriptKey || "",
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
        
        values["scriptKeys"] = getParamManagerValues(values.scriptKeys);
        const xml = getXML(MEDIATORS.SCRIPT, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Invokes scripting language functions with embedded or stored script files.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="scriptLanguage"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Script Language" name="scriptLanguage" items={["js", "rb", "groovy", "nashornJs"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.scriptLanguage && <Error>{errors.scriptLanguage.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="scriptType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Script Type" name="scriptType" items={["INLINE", "REGISTRY_REFERENCE"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.scriptType && <Error>{errors.scriptType.message.toString()}</Error>}
                </Field>

                {watch("scriptType") == "INLINE" &&
                <Field>
                    <Controller
                        name="scriptBody"
                        control={control}
                        render={({ field }) => (
                            <CodeTextArea {...field} label="Script Body" placeholder="" resize="vertical" growRange={{ start: 5, offset: 10 }} />
                        )}
                    />
                    {errors.scriptBody && <Error>{errors.scriptBody.message.toString()}</Error>}
                </Field>
                }

                {watch("scriptType") == "REGISTRY_REFERENCE" &&
                <Field>
                    <Controller
                        name="scriptKey"
                        control={control}
                        render={({ field }) => (
                            <Keylookup
                                value={field.value}
                                filterType='registry'
                                label="Script Key"
                                allowItemCreate={true}
                                onValueChange={field.onChange}
                            />
                        )}
                    />
                    {errors.scriptKey && <Error>{errors.scriptKey.message.toString()}</Error>}
                </Field>
                }

                {watch("scriptType") == "REGISTRY_REFERENCE" &&
                <Field>
                    <Controller
                        name="mediateFunction"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Mediate Function" size={50} placeholder="" />
                        )}
                    />
                    {errors.mediateFunction && <Error>{errors.mediateFunction.message.toString()}</Error>}
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

export default ScriptForm; 
