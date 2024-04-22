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
import { AutoComplete, Button, ComponentCard, ExpressionField, ExpressionFieldValue, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';

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

const FastXSLTForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            fastXsltSchemaType: sidePanelContext?.formValues?.fastXsltSchemaType || "Static",
            fastXsltDynamicSchemaKey: sidePanelContext?.formValues?.fastXsltDynamicSchemaKey || {"isExpression":true,"value":""},
            fastXsltStaticSchemaKey: sidePanelContext?.formValues?.fastXsltStaticSchemaKey || {"isExpression":true,"value":""},
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        const xml = getXML(MEDIATORS.FASTXSLT, values);
        rpcClient.getMiDiagramRpcClient().applyEdit({
            documentUri: props.documentUri, range: props.nodePosition, text: xml
        });
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
        <div style={{ padding: "10px" }}>
            <Typography variant="body3"></Typography>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">SchemaKey</Typography>

                <Field>
                    <Controller
                        name="fastXsltSchemaType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Fast Xslt Schema Type" items={["Static", "Dynamic"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.fastXsltSchemaType && <Error>{errors.fastXsltSchemaType.message.toString()}</Error>}
                </Field>

                {watch("fastXsltSchemaType") && watch("fastXsltSchemaType").toLowerCase() == "dynamic" &&
                    <Field>
                        <Controller
                            name="fastXsltDynamicSchemaKey"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Fast Xslt Dynamic SchemaKey"
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
                        {errors.fastXsltDynamicSchemaKey && <Error>{errors.fastXsltDynamicSchemaKey.message.toString()}</Error>}
                    </Field>
                }

                {watch("fastXsltSchemaType") && watch("fastXsltSchemaType").toLowerCase() == "static" &&
                    <Field>
                        <Controller
                            name="fastXsltStaticSchemaKey"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Fast Xslt Static SchemaKey"
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
                        {errors.fastXsltStaticSchemaKey && <Error>{errors.fastXsltStaticSchemaKey.message.toString()}</Error>}
                    </Field>
                }

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
    );
};

export default FastXSLTForm; 
