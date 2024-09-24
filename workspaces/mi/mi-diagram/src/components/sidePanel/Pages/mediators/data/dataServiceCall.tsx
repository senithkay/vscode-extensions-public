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
import { ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
import { ParamManager, ParamConfig, ParamValue } from '../../../../Form/ParamManager/ParamManager';
import { generateSpaceSeperatedStringFromParamValues } from '../../../../../utils/commons';
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

const DataServiceCallForm = (props: AddMediatorProps) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            serviceName: sidePanelContext?.formValues?.serviceName || "",
            sourceType: sidePanelContext?.formValues?.sourceType || "INLINE",
            operationType: sidePanelContext?.formValues?.operationType || "SINGLE",
            operations: {
                paramValues: sidePanelContext?.formValues?.operations ? getParamManagerFromValues(sidePanelContext?.formValues?.operations, 0, 1) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "OperationName",
                        "defaultValue": "",
                        "isRequired": true
                    },
                    {
                        "type": "ParamManager",
                        "label": "DSS Properties",
                        "defaultValue": "",
                        "isRequired": false, 
                        "paramManager": {
                            paramConfigs: {
                                paramValues: sidePanelContext?.formValues?.DSSProperties ? getParamManagerFromValues(sidePanelContext?.formValues?.DSSProperties, -1, -1) : [],
                                paramFields: [
                                    {
                                        "type": "TextField",
                                        "label": "Property Name",
                                        "defaultValue": "",
                                        "isRequired": true
                                    },
                                    {
                                        "type": "Dropdown",
                                        "label": "Property Value Type",
                                        "defaultValue": "LITERAL",
                                        "isRequired": false,
                                        "values": [
                                            "LITERAL",
                                            "EXPRESSION"
                                        ]
                                    },
                                    {
                                        "type": "TextField",
                                        "label": "Property Value",
                                        "defaultValue": "",
                                        "isRequired": false,
                                        "enableCondition": [
                                            {
                                                "1": "LITERAL"
                                            }
                                        ]
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
                                        "enableCondition": [
                                            {
                                                "1": "EXPRESSION"
                                            }
                                        ], 
                                        openExpressionEditor: (value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)},
                                ]
                            },
                            openInDrawer: true,
                            addParamText: "New DSS Properties"
                        },
                    },
                ]
            },
            targetType: sidePanelContext?.formValues?.targetType || "BODY",
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
        setDiagramLoading(true);
        
        values["operations"] = getParamManagerValues(values.operations);
        const xml = getXML(MEDIATORS.DATASERVICECALL, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Invokes data service operations.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Properties</Typography>

                    <Field>
                        <Controller
                            name="serviceName"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <Keylookup
                                    value={field.value}
                                    filterType='dataService'
                                    label="Data Service Name"
                                    allowItemCreate={false}
                                    onValueChange={field.onChange}
                                    required={true}
                                    errorMsg={errors?.serviceName?.message?.toString()}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="sourceType"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <AutoComplete
                                    label="Source Type"
                                    name="sourceType"
                                    items={["INLINE", "BODY"]}
                                    value={field.value}
                                    required={true}
                                    errorMsg={errors?.sourceType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="operationType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Operation Type"
                                    name="operationType"
                                    items={["SINGLE", "BATCH", "REQUESTBOX"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.operationType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    {watch("sourceType") == "INLINE" &&
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Operations</Typography>
                        <Typography variant="body3">Editing of the properties of an object AbstractDSSOperation</Typography>

                        <Controller
                            name="operations"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <ParamManager
                                    paramConfigs={value}
                                    readonly={false}
                                    onChange= {(values) => {
                                        values.paramValues = values.paramValues.map((param: any, index: number) => {
                                            const property: ParamValue[] = param.paramValues;
                                            param.key = property[0].value;
                                            param.value = generateSpaceSeperatedStringFromParamValues(property[1].value as ParamConfig);
                                            param.icon = 'query';

                                            (property[1].value as ParamConfig).paramValues = (property[1].value as ParamConfig).paramValues.map((param: any, index: number) => {
                                                const property: ParamValue[] = param.paramValues;
                                                param.key = property[0].value;
                                                param.value = property[2].value;
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
                    }

                    <Field>
                        <Controller
                            name="targetType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Target Type"
                                    name="targetType"
                                    items={["BODY", "PROPERTY"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.targetType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    {watch("targetType") == "PROPERTY" &&
                    <Field>
                        <Controller
                            name="targetProperty"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Target Property" size={50} placeholder="" required={false} errorMsg={errors?.targetProperty?.message?.toString()} />
                            )}
                        />
                    </Field>
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

export default DataServiceCallForm; 
