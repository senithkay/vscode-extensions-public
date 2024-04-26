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
import { AutoComplete, Button, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ExpressionField, ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';

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

const FilterForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            conditionType: sidePanelContext?.formValues?.conditionType || "Source and Regular Expression",
            source: sidePanelContext?.formValues?.source || {"isExpression":true,"value":""},
            regularExpression: sidePanelContext?.formValues?.regularExpression || "",
            xPath: sidePanelContext?.formValues?.xPath || {"isExpression":true,"value":""},
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        const xml = getXML(MEDIATORS.FILTER, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Filters messages based on XPath/JSONPath/regex.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="conditionType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Condition Type" name="conditionType" items={["Source and Regular Expression", "XPath"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.conditionType && <Error>{errors.conditionType.message.toString()}</Error>}
                </Field>

                {watch("conditionType") && watch("conditionType").toLowerCase() == "source and regular expression" &&
                <Field>
                    <Controller
                        name="source"
                        control={control}
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="Source"
                                placeholder=""
                                canChange={false}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => {
                                    sidePanelContext.setSidePanelState({
                                        ...sidePanelContext,
                                        expressionEditor: {
                                            isOpen: true,
                                            value,
                                            setValue
                                        }
                                    });
                                }}
                            />
                        )}
                    />
                    {errors.source && <Error>{errors.source.message.toString()}</Error>}
                </Field>
                }

                {watch("conditionType") && watch("conditionType").toLowerCase() == "source and regular expression" &&
                <Field>
                    <Controller
                        name="regularExpression"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Regular Expression" size={50} placeholder="" />
                        )}
                    />
                    {errors.regularExpression && <Error>{errors.regularExpression.message.toString()}</Error>}
                </Field>
                }

                {watch("conditionType") && watch("conditionType").toLowerCase() == "xpath" &&
                <Field>
                    <Controller
                        name="xPath"
                        control={control}
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="XPath"
                                placeholder=""
                                canChange={false}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => {
                                    sidePanelContext.setSidePanelState({
                                        ...sidePanelContext,
                                        expressionEditor: {
                                            isOpen: true,
                                            value,
                                            setValue
                                        }
                                    });
                                }}
                            />
                        )}
                    />
                    {errors.xPath && <Error>{errors.xPath.message.toString()}</Error>}
                </Field>
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

export default FilterForm; 
