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
import { AddMediatorProps } from '../../../../Form/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ExpressionField, ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
import { handleOpenExprEditor, sidepanelGoBack } from '../../..';
import TryOutView from '../tryout';

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
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });
    const [isTryout, setTryout] = React.useState(false);
    const [isSchemaView, setIsSchemaView] = React.useState(false);
    const [schema, setSchema] = React.useState<any>({});

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


    const onTryOut = async (values: any) => {
        // setTryout(true);
        
        const xml = getXML(MEDIATORS.FAULT, values, dirtyFields, sidePanelContext.formValues);
        let edits;
        if(Array.isArray(xml)){
            edits = xml;
        } else {
            edits = [{range: props.nodePosition, text: xml}];
        }
        const res = await rpcClient.getMiDiagramRpcClient().tryOutMediator({file: props.documentUri, line:props.nodePosition.start.line,column:props.nodePosition.start.character+1, edits});
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            isTryoutOpen: true,
            inputOutput: res,
        });
    }

    const onClickConfigure = async (values:any) => {
        setIsSchemaView(false);
    }

    const onClickSchema = async (values:any) => {
        
        setIsSchemaView(true);
        const xml = getXML(MEDIATORS.FAULT, values, dirtyFields, sidePanelContext.formValues);
        let edits;
        if(Array.isArray(xml)){
            edits = xml;
        } else {
            edits = [{range: props.nodePosition, text: xml}];
        }
        const res = await rpcClient.getMiDiagramRpcClient().getMediatorInputOutputSchema({file: props.documentUri, line:props.nodePosition.start.line,column:props.nodePosition.start.character+1, edits: edits});
        setSchema(res);
    }

    const onClick = async (values: any) => {
        setDiagramLoading(true);
        
        const xml = getXML(MEDIATORS.FAULT, values, dirtyFields, sidePanelContext.formValues);
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
            isTryoutOpen: false,
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
            <br />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                <Button
                    onClick={handleSubmit(onClickConfigure)}
                >
                   Configuration
                </Button>
                <Button
                    onClick={handleSubmit(onClickSchema)}
                >
                   Input/Output
                </Button>
            </div>
            {!isSchemaView && <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="soapVersion"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                label="SOAP Version"
                                name="soapVersion"
                                items={["soap11", "soap12", "POX"]}
                                value={field.value}
                                required={false}
                                errorMsg={errors?.soapVersion?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>

                {watch("soapVersion") == "soap11" &&
                <Field>
                    <Controller
                        name="soap11"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                label="SOAP11"
                                name="soap11"
                                items={["VersionMismatch", "MustUnderstand", "Client", "Server"]}
                                value={field.value}
                                required={false}
                                errorMsg={errors?.soap11?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>
                }

                {watch("soapVersion") == "soap12" &&
                <Field>
                    <Controller
                        name="code"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                label="Code"
                                name="code"
                                items={["VersionMismatch", "MustUnderstand", "DataEncordingUnknown", "Sender", "Reciever"]}
                                value={field.value}
                                required={false}
                                errorMsg={errors?.code?.message?.toString()}
                                onValueChange={(e: any) => {
                                    field.onChange(e);
                                }}
                            />
                        )}
                    />
                </Field>
                }

                {watch("soapVersion") == "soap12" &&
                <Field>
                    <Controller
                        name="Role"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Role" size={50} placeholder="" required={false} errorMsg={errors?.Role?.message?.toString()} />
                        )}
                    />
                </Field>
                }

                {watch("soapVersion") == "soap12" &&
                <Field>
                    <Controller
                        name="node"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Node" size={50} placeholder="" required={false} errorMsg={errors?.node?.message?.toString()} />
                        )}
                    />
                </Field>
                }

                {watch("soapVersion") == "soap11" &&
                <Field>
                    <Controller
                        name="actor"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Actor" size={50} placeholder="" required={false} errorMsg={errors?.actor?.message?.toString()} />
                        )}
                    />
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
                                required={false}
                                errorMsg={errors?.detail?.message?.toString()}
                                canChange={true}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                            />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="reason"
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
                                {...field} label="Reason"
                                placeholder=""
                                required={true}
                                errorMsg={errors?.reason?.message?.toString()}
                                canChange={true}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                            />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Description" size={50} placeholder="" required={false} errorMsg={errors?.description?.message?.toString()} />
                        )}
                    />
                </Field>


                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                    <Button
                        onClick={handleSubmit(onTryOut)}
                        sx={{ marginRight: '10px' }}
                    >
                        Try Out
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleSubmit(onClick)}
                    >
                        Submit
                    </Button>
                </div>

            </div>}
            {isSchemaView &&
            <TryOutView data={schema} isSchemaView={true} />
            }
        </>
    );
};

export default FaultForm; 
