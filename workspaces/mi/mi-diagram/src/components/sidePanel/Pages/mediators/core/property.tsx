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
import { AutoComplete, Button, FormGroup, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../../../../Form/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
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

const PropertyForm = (props: AddMediatorProps) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            propertyName: sidePanelContext?.formValues?.propertyName || {"isExpression":false,"value":""},
            propertyAction: sidePanelContext?.formValues?.propertyAction || "set",
            propertyDataType: sidePanelContext?.formValues?.propertyDataType || "STRING",
            value: sidePanelContext?.formValues?.value || {"isExpression":false,"value":""},
            OMValue: sidePanelContext?.formValues?.OMValue || {"isExpression":false,"value":""},
            propertyScope: sidePanelContext?.formValues?.propertyScope || "DEFAULT",
            valueStringPattern: sidePanelContext?.formValues?.valueStringPattern || "",
            valueStringCapturingGroup: sidePanelContext?.formValues?.valueStringCapturingGroup || "0",
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
        
        const xml = getXML(MEDIATORS.PROPERTY, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Manipulates message properties by setting and/or removing property values, supporting both constant and dynamically generated values through XPath expressions.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="propertyName"
                        control={control}
                        rules={
                            {
                                validate: (value) => {
                                    if (!value?.value || value.value === "") {
                                        return "This field is required";
                                    }
                                    return true;
                                },
                            }
                        }
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="Property Name"
                                placeholder="New Property Name"
                                required={true}
                                errorMsg={errors?.propertyName?.message?.toString()}
                                canChange={true}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                            />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="propertyAction"
                        control={control}
                        rules={
                            {
                                required: "This field is required",
                            }
                        }
                        render={({ field }) => (
                            <AutoComplete
                                label="Property Action"
                                name="propertyAction"
                                items={["set", "remove"]}
                                value={field.value}
                                required={true}
                                errorMsg={errors?.propertyAction?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>

                {!((watch("propertyAction") == "remove") ) &&
                <Field>
                    <Controller
                        name="propertyDataType"
                        control={control}
                        rules={
                            {
                                required: "This field is required",
                            }
                        }
                        render={({ field }) => (
                            <AutoComplete
                                label="Property Data Type"
                                name="propertyDataType"
                                items={["STRING", "INTEGER", "BOOLEAN", "DOUBLE", "FLOAT", "LONG", "SHORT", "OM", "JSON"]}
                                value={field.value}
                                required={true}
                                errorMsg={errors?.propertyDataType?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>
                }

                {!(((watch("propertyDataType") == "OM") ||(watch("propertyAction") == "remove") )) &&
                <Field>
                    <Controller
                        name="value"
                        control={control}
                        rules={
                            {
                                validate: (value) => {
                                    if (!value?.value || value.value === "") {
                                        return "This field is required";
                                    }
                                    return true;
                                },
                            }
                        }
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="Property Value"
                                placeholder="Value"
                                required={true}
                                errorMsg={errors?.value?.message?.toString()}
                                canChange={true}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                            />
                        )}
                    />
                </Field>
                }

                {watch("propertyDataType") == "OM" &&
                <Field>
                    <Controller
                        name="OMValue"
                        control={control}
                        rules={
                            {
                                validate: (value) => {
                                    if (!value?.value || value.value === "") {
                                        return "This field is required";
                                    }
                                    return true;
                                },
                            }
                        }
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="OM"
                                placeholder="Value"
                                required={true}
                                errorMsg={errors?.OMValue?.message?.toString()}
                                canChange={true}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                            />
                        )}
                    />
                </Field>
                }

                <Field>
                    <Controller
                        name="propertyScope"
                        control={control}
                        rules={
                            {
                                required: "This field is required",
                            }
                        }
                        render={({ field }) => (
                            <AutoComplete
                                label="Property Scope"
                                name="propertyScope"
                                items={["DEFAULT", "TRANSPORT", "AXIS2", "AXIS2-CLIENT", "OPERATION", "REGISTRY", "SYSTEM", "ANALYTICS"]}
                                value={field.value}
                                required={true}
                                errorMsg={errors?.propertyScope?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>

                <FormGroup title="Advanced">
                    {((watch("propertyDataType") == "STRING") &&(watch("propertyAction") == "set") ) &&
                    <Field>
                        <Controller
                            name="valueStringPattern"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Value String Pattern" size={50} placeholder="Value String Pattern" required={false} errorMsg={errors?.valueStringPattern?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {((watch("propertyDataType") == "STRING") &&(watch("propertyAction") == "set") ) &&
                    <Field>
                        <Controller
                            name="valueStringCapturingGroup"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Value String Capturing Group" size={50} placeholder="Value String Capturing Group" required={false} errorMsg={errors?.valueStringCapturingGroup?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                </FormGroup>

                <Field>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Description" size={50} placeholder="Description" required={false} errorMsg={errors?.description?.message?.toString()} />
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

export default PropertyForm; 
