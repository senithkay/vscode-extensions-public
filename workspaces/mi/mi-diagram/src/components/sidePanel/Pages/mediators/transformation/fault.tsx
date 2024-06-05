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
import { AutoComplete, Button, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
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

const FaultForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            soapVersion: sidePanelContext?.formValues?.soapVersion || "soap11",
            soap11: sidePanelContext?.formValues?.soap11 || "VersionMismatch",
            code: sidePanelContext?.formValues?.code || "Receiver",
            Role: sidePanelContext?.formValues?.Role || "",
            node: sidePanelContext?.formValues?.node || "",
            actor: sidePanelContext?.formValues?.actor || "",
            serializeResponse: sidePanelContext?.formValues?.serializeResponse || "",
            markAsResponse: sidePanelContext?.formValues?.markAsResponse || "",
            detail: sidePanelContext?.formValues?.detail || {"isExpression":false,"value":""},
            reason: sidePanelContext?.formValues?.reason || {"isExpression":false,"value":""},
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
        
        const xml = getXML(MEDIATORS.FAULT, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Transforms the current message into a fault message.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="soapVersion"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="SOAP Version" name="soapVersion" items={["soap11", "soap12", "POX"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.soapVersion && <Error>{errors.soapVersion.message.toString()}</Error>}
                </Field>

                {watch("soapVersion") == "soap11" &&
                <Field>
                    <Controller
                        name="soap11"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="SOAP11" name="soap11" items={["VersionMismatch", "MustUnderstand", "Client", "Server"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.soap11 && <Error>{errors.soap11.message.toString()}</Error>}
                </Field>
                }

                {watch("soapVersion") == "soap12" &&
                <Field>
                    <Controller
                        name="code"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Code" name="code" items={["VersionMismatch", "MustUnderstand", "DataEncordingUnknown", "Sender", "Reciever"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.code && <Error>{errors.code.message.toString()}</Error>}
                </Field>
                }

                {watch("soapVersion") == "soap12" &&
                <Field>
                    <Controller
                        name="Role"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Role" size={50} placeholder="" />
                        )}
                    />
                    {errors.Role && <Error>{errors.Role.message.toString()}</Error>}
                </Field>
                }

                {watch("soapVersion") == "soap12" &&
                <Field>
                    <Controller
                        name="node"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Node" size={50} placeholder="" />
                        )}
                    />
                    {errors.node && <Error>{errors.node.message.toString()}</Error>}
                </Field>
                }

                {watch("soapVersion") == "soap11" &&
                <Field>
                    <Controller
                        name="actor"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Actor" size={50} placeholder="" />
                        )}
                    />
                    {errors.actor && <Error>{errors.actor.message.toString()}</Error>}
                </Field>
                }

                <Field>
                    <Controller
                        name="serializeResponse"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Serialize Response</VSCodeCheckbox>
                        )}
                    />
                    {errors.serializeResponse && <Error>{errors.serializeResponse.message.toString()}</Error>}
                </Field>

                {watch("serializeResponse") == true &&
                <Field>
                    <Controller
                        name="markAsResponse"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Mark As Response</VSCodeCheckbox>
                        )}
                    />
                    {errors.markAsResponse && <Error>{errors.markAsResponse.message.toString()}</Error>}
                </Field>
                }

                <Field>
                    <Controller
                        name="detail"
                        control={control}
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="Detail"
                                placeholder=""
                                canChange={true}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                            />
                        )}
                    />
                    {errors.detail && <Error>{errors.detail.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="reason"
                        control={control}
                        render={({ field }) => (
                            <ExpressionField
                                {...field} label="Reason"
                                placeholder=""
                                canChange={true}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                            />
                        )}
                    />
                    {errors.reason && <Error>{errors.reason.message.toString()}</Error>}
                </Field>

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

export default FaultForm; 
