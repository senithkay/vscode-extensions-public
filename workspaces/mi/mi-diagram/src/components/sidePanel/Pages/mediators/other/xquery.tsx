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
import { ExpressionField, ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
import { ParamManager, ParamValue } from '../../../../Form/ParamManager/ParamManager';
import { sidepanelAddPage, sidepanelGoBack } from '../../..';
import ExpressionEditor from '../../../expressionEditor/ExpressionEditor';

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

const XQueryForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            scriptKeyType: sidePanelContext?.formValues?.scriptKeyType || "Static",
            staticScriptKey: sidePanelContext?.formValues?.staticScriptKey || "",
            dynamicScriptKey: sidePanelContext?.formValues?.dynamicScriptKey || {"isExpression":true,"value":""},
            targetXPath: sidePanelContext?.formValues?.targetXPath || {"isExpression":true,"value":""},
            variables: {
                paramValues: sidePanelContext?.formValues?.variables ? getParamManagerFromValues(sidePanelContext?.formValues?.variables) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Variable Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "Dropdown",
                        "label": "Variable Type",
                        "defaultValue": "STRING",
                        "isRequired": false,
                        "values": [
                            "DOCUMENT",
                            "DOCUMENT_ELEMENT",
                            "ELEMENT",
                            "INT",
                            "INTEGER",
                            "BOOLEAN",
                            "BYTE",
                            "DOUBLE",
                            "SHORT",
                            "LONG",
                            "FLOAT",
                            "STRING"
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "Variable Option",
                        "defaultValue": "LITERAL",
                        "isRequired": false,
                        "values": [
                            "LITERAL",
                            "EXPRESSION"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Variable Literal",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            {
                                "2": "LITERAL"
                            }
                        ]
                    },
                    {
                        "type": "ExprField",
                        "label": "Variable Expression",
                        "defaultValue": {
                            "isExpression": true,
                            "value": ""
                        },
                        "isRequired": false,
                        "canChange": false,
                        "enableCondition": [
                            {
                                "2": "EXPRESSION"
                            }
                        ], 
                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => {
                            const content = <ExpressionEditor
                                value={value}
                                handleOnSave={(value) => {
                                    setValue(value);
                                    handleOnCancelExprEditorRef.current();
                                }}
                                handleOnCancel={() => {
                                    handleOnCancelExprEditorRef.current();
                                }}
                            />;
                            sidepanelAddPage(sidePanelContext, content, "Expression Editor");
                        }},
                    {
                        "type": "TextField",
                        "label": "Variable Key",
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
        
        values["variables"] = getParamManagerValues(values.variables);
        const xml = getXML(MEDIATORS.XQUERY, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Performs XQuery transformation on messages.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Properties</Typography>

                    <Field>
                        <Controller
                            name="scriptKeyType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Script Key Type" name="scriptKeyType" items={["Static", "Dynamic"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.scriptKeyType && <Error>{errors.scriptKeyType.message.toString()}</Error>}
                    </Field>

                    {watch("scriptKeyType") == "Static" &&
                    <Field>
                        <Controller
                            name="staticScriptKey"
                            control={control}
                            render={({ field }) => (
                                <Keylookup
                                    value={field.value}
                                    filterType='registry'
                                    label="Static Script Key"
                                    allowItemCreate={false}
                                    onValueChange={field.onChange}
                                />
                            )}
                        />
                        {errors.staticScriptKey && <Error>{errors.staticScriptKey.message.toString()}</Error>}
                    </Field>
                    }

                    {watch("scriptKeyType") == "Dynamic" &&
                    <Field>
                        <Controller
                            name="dynamicScriptKey"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Dynamic Script Key"
                                    placeholder=""
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => {
                                        const content = <ExpressionEditor
                                            value={value}
                                            handleOnSave={(value) => {
                                                setValue(value);
                                                handleOnCancelExprEditorRef.current();
                                            }}
                                            handleOnCancel={() => {
                                                handleOnCancelExprEditorRef.current();
                                            }}
                                        />;
                                        sidepanelAddPage(sidePanelContext, content, "Expression Editor");
                                    }}
                                />
                            )}
                        />
                        {errors.dynamicScriptKey && <Error>{errors.dynamicScriptKey.message.toString()}</Error>}
                    </Field>
                    }

                    <Field>
                        <Controller
                            name="targetXPath"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Target XPath"
                                    placeholder=""
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => {
                                        const content = <ExpressionEditor
                                            value={value}
                                            handleOnSave={(value) => {
                                                setValue(value);
                                                handleOnCancelExprEditorRef.current();
                                            }}
                                            handleOnCancel={() => {
                                                handleOnCancelExprEditorRef.current();
                                            }}
                                        />;
                                        sidepanelAddPage(sidePanelContext, content, "Expression Editor");
                                    }}
                                />
                            )}
                        />
                        {errors.targetXPath && <Error>{errors.targetXPath.message.toString()}</Error>}
                    </Field>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Variables</Typography>

                        <ComponentCard sx={cardStyle} disbaleHoverEffect>
                            <Typography variant="h3">Variables</Typography>
                            <Typography variant="body3">Editing of the properties of an object XQuery Variable</Typography>

                            <Controller
                                name="variables"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <ParamManager
                                        paramConfigs={value}
                                        readonly={false}
                                        onChange= {(values) => {
                                            values.paramValues = values.paramValues.map((param: any, index: number) => {
                                                const property: ParamValue[] = param.paramValues;
                                                param.key = property[0].value;
                                                param.value = property[3].value;
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

export default XQueryForm; 
