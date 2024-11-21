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
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, openPopup } from '../../../../Form/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { Keylookup } from '../../../../Form';
import { ExpressionField, ExpressionFieldValue } from '../../../../Form/ExpressionField/ExpressionInput';
import { handleOpenExprEditor, sidepanelGoBack } from '../../..';
import { CodeTextArea } from '../../../../Form/CodeTextArea';
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

const SendForm = (props: AddMediatorProps) => {
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
            endpoint: sidePanelContext?.formValues?.endpoint || "",
            inlineEndpoint: sidePanelContext?.formValues?.inlineEndpoint || "",
            buildMessageBeforeSending: sidePanelContext?.formValues?.buildMessageBeforeSending || false,
            receivingSequenceType: sidePanelContext?.formValues?.receivingSequenceType || "Default",
            staticReceivingSequence: sidePanelContext?.formValues?.staticReceivingSequence || "",
            dynamicReceivingSequence: sidePanelContext?.formValues?.dynamicReceivingSequence || {"isExpression":true,"value":""},
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
        
        const xml = getXML(MEDIATORS.SEND, values, dirtyFields, sidePanelContext.formValues);
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
        const xml = getXML(MEDIATORS.SEND, values, dirtyFields, sidePanelContext.formValues);
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
        
        const xml = getXML(MEDIATORS.SEND, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Invokes external service in non-blocking mode.</Typography>
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

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Properties</Typography>

                    <Field>
                        <Controller
                            name="endpoint"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <Keylookup
                                    value={field.value}
                                    filterType='endpoint'
                                    label="Select Endpoint"
                                    allowItemCreate={false}
                                    onCreateButtonClick={(fetchItems: any, handleValueChange: any) => {
                                        openPopup(rpcClient, 'endpoint', fetchItems, handleValueChange);
                                    }}
                                    onValueChange={field.onChange}
                                    required={true}
                                    errorMsg={errors?.endpoint?.message?.toString()}
                                    additionalItems={["NONE"]}
                                />
                            )}
                        />
                    </Field>

                    {watch("endpoint") == "INLINE" &&
                    <Field>
                        <Controller
                            name="inlineEndpoint"
                            control={control}
                            render={({ field }) => (
                                <CodeTextArea {...field} label="Inline Endpoint" placeholder="Define your endpoint as an XML" required={false} resize="vertical" growRange={{ start: 5, offset: 10 }} errorMsg={errors?.inlineEndpoint?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    <Field>
                        <Controller
                            name="buildMessageBeforeSending"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Build Message Before Sending</VSCodeCheckbox>
                            )}
                        />
                    </Field>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Receiving Sequence</Typography>

                        <Field>
                            <Controller
                                name="receivingSequenceType"
                                control={control}
                                render={({ field }) => (
                                    <AutoComplete
                                        label="Receiving Sequence Type"
                                        name="receivingSequenceType"
                                        items={["Default", "Static", "Dynamic"]}
                                        value={field.value}
                                        required={false}
                                        errorMsg={errors?.receivingSequenceType?.message?.toString()}
                                        onValueChange={(e: any) => {
                                            field.onChange(e);
                                        }}
                                    />
                                )}
                            />
                        </Field>

                        {watch("receivingSequenceType") == "Static" &&
                        <Field>
                            <Controller
                                name="staticReceivingSequence"
                                control={control}
                                render={({ field }) => (
                                    <Keylookup
                                        value={field.value}
                                        filterType='sequence'
                                        label="Static Receiving Sequence"
                                        allowItemCreate={false}
                                        onValueChange={field.onChange}
                                        required={false}
                                        errorMsg={errors?.staticReceivingSequence?.message?.toString()}
                                    />
                                )}
                            />
                        </Field>
                        }

                        {watch("receivingSequenceType") == "Dynamic" &&
                        <Field>
                            <Controller
                                name="dynamicReceivingSequence"
                                control={control}
                                render={({ field }) => (
                                    <ExpressionField
                                        {...field} label="Dynamic Receiving Sequence"
                                        placeholder=""
                                        required={false}
                                        errorMsg={errors?.dynamicReceivingSequence?.message?.toString()}
                                        canChange={false}
                                        openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                    />
                                )}
                            />
                        </Field>
                        }

                    </ComponentCard>

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

export default SendForm; 
