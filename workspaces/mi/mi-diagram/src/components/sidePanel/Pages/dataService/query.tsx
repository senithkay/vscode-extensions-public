/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/

import React, { useEffect, useRef } from 'react';
import { AutoComplete, Button, ComponentCard, ProgressIndicator, TextField, TextArea, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../SidePanelContexProvider';
import { AddMediatorProps, openPopup } from '../mediators/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { Keylookup } from '../../../Form';
import { sidepanelGoBack } from '../..';

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

const QueryForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            queryId: sidePanelContext?.formValues?.queryId || "",
            datasource: sidePanelContext?.formValues?.datasource || "",
            sqlQuery: sidePanelContext?.formValues?.sqlQuery || "",
            timeout: sidePanelContext?.formValues?.timeout || "",
            fetchDirection: sidePanelContext?.formValues?.fetchDirection || "Forward",
            fetchSize: sidePanelContext?.formValues?.fetchSize || "",
            maxFieldSize: sidePanelContext?.formValues?.maxFieldSize || "",
            maxRows: sidePanelContext?.formValues?.maxRows || "",
            forceStoredProcedure: sidePanelContext?.formValues?.forceStoredProcedure || false,
            forceJdbcBatchRequests: sidePanelContext?.formValues?.forceJdbcBatchRequests || false,
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    const onClick = async (values: any) => {
        
        // const xml = getXML(MEDIATORS.QUERY, values, dirtyFields, sidePanelContext.formValues);
        // if (Array.isArray(xml)) {
        //     for (let i = 0; i < xml.length; i++) {
        //         await rpcClient.getMiDiagramRpcClient().applyEdit({
        //             documentUri: props.documentUri, range: xml[i].range, text: xml[i].text
        //         });
        //     }
        // } else {
        //     rpcClient.getMiDiagramRpcClient().applyEdit({
        //         documentUri: props.documentUri, range: props.nodePosition, text: xml
        //     });
        // }
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3"></Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="queryId"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Query ID" size={50} placeholder="" />
                        )}
                    />
                    {errors.queryId && <Error>{errors.queryId.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="datasource"
                        control={control}
                        render={({ field }) => (
                            <Keylookup
                                value={field.value}
                                filterType='dataSource'
                                label="Datasource"
                                allowItemCreate={false}
                                onCreateButtonClick={(fetchItems: any, handleValueChange: any) => {
                                    openPopup(rpcClient, "dataSource", fetchItems, handleValueChange);
                                }}
                                onValueChange={field.onChange}
                            />
                        )}
                    />
                    {errors.datasource && <Error>{errors.datasource.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="sqlQuery"
                        control={control}
                        render={({ field }) => (
                            <TextArea {...field} label="SQL Query" placeholder="" />
                        )}
                    />
                    {errors.sqlQuery && <Error>{errors.sqlQuery.message.toString()}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Advanced Properties</Typography>

                    <Field>
                        <Controller
                            name="timeout"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Timeout in seconds" size={50} placeholder="" />
                            )}
                        />
                        {errors.timeout && <Error>{errors.timeout.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="fetchDirection"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete label="Fetch Direction" name="fetchDirection" items={["Forward", "Reverse"]} value={field.value} onValueChange={(e: any) => {
                                    field.onChange(e);
                                }} />
                            )}
                        />
                        {errors.fetchDirection && <Error>{errors.fetchDirection.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="fetchSize"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Fetch Size" size={50} placeholder="" />
                            )}
                        />
                        {errors.fetchSize && <Error>{errors.fetchSize.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="maxFieldSize"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Max Field Size" size={50} placeholder="" />
                            )}
                        />
                        {errors.maxFieldSize && <Error>{errors.maxFieldSize.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="maxRows"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Max Rows" size={50} placeholder="" />
                            )}
                        />
                        {errors.maxRows && <Error>{errors.maxRows.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="forceStoredProcedure"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Force Stored Procedure</VSCodeCheckbox>
                            )}
                        />
                        {errors.forceStoredProcedure && <Error>{errors.forceStoredProcedure.message.toString()}</Error>}
                    </Field>

                    <Field>
                        <Controller
                            name="forceJdbcBatchRequests"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Force JDBC Batch Requests</VSCodeCheckbox>
                            )}
                        />
                        {errors.forceJdbcBatchRequests && <Error>{errors.forceJdbcBatchRequests.message.toString()}</Error>}
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

export default QueryForm; 
