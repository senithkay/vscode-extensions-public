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
import { AutoComplete, Button, ComponentCard, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
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

const DataMapperForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            description: sidePanelContext?.formValues?.description || "",
            configurationLocalPath: sidePanelContext?.formValues?.configurationLocalPath || "",
            inputType: sidePanelContext?.formValues?.inputType || "XML",
            inputSchemaLocalPath: sidePanelContext?.formValues?.inputSchemaLocalPath || "",
            outputType: sidePanelContext?.formValues?.outputType || "XML",
            outputSchemaLocalPath: sidePanelContext?.formValues?.outputSchemaLocalPath || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    const onClick = async (values: any) => {
        
        const xml = getXML(MEDIATORS.DATAMAPPER, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Transforms data format/structure in the message.</Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Properties</Typography>

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

                    <Field>
                        <Controller
                            name="configurationLocalPath"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Configuration Local Path" size={50} placeholder="" />
                            )}
                        />
                        {errors.configurationLocalPath && <Error>{errors.configurationLocalPath.message.toString()}</Error>}
                    </Field>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">InputType</Typography>

                        <Field>
                            <Controller
                                name="inputType"
                                control={control}
                                render={({ field }) => (
                                    <AutoComplete label="Input Type" name="inputType" items={["XML", "CSV", "JSON"]} value={field.value} onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }} />
                                )}
                            />
                            {errors.inputType && <Error>{errors.inputType.message.toString()}</Error>}
                        </Field>

                        <Field>
                            <Controller
                                name="inputSchemaLocalPath"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="InputSchema Local Path" size={50} placeholder="" />
                                )}
                            />
                            {errors.inputSchemaLocalPath && <Error>{errors.inputSchemaLocalPath.message.toString()}</Error>}
                        </Field>

                    </ComponentCard>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">OutputType</Typography>

                        <Field>
                            <Controller
                                name="outputType"
                                control={control}
                                render={({ field }) => (
                                    <AutoComplete label="Output Type" name="outputType" items={["XML", "CSV", "JSON"]} value={field.value} onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }} />
                                )}
                            />
                            {errors.outputType && <Error>{errors.outputType.message.toString()}</Error>}
                        </Field>

                        <Field>
                            <Controller
                                name="outputSchemaLocalPath"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="OutputSchema Local Path" size={50} placeholder="" />
                                )}
                            />
                            {errors.outputSchemaLocalPath && <Error>{errors.outputSchemaLocalPath.message.toString()}</Error>}
                        </Field>

                    </ComponentCard>

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

export default DataMapperForm; 
