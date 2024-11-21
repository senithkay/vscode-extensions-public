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
import { AddMediatorProps } from '../../../../Form/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { Keylookup } from '../../../../Form';
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

const AggregateForm = (props: AddMediatorProps) => {
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
            completionTimeout: sidePanelContext?.formValues?.completionTimeout || "0",
            completionMinMessages: sidePanelContext?.formValues?.completionMinMessages || {"isExpression":false,"value":"-1"},
            completionMaxMessages: sidePanelContext?.formValues?.completionMaxMessages || {"isExpression":false,"value":"-1"},
            aggregateID: sidePanelContext?.formValues?.aggregateID || "",
            enclosingElementProperty: sidePanelContext?.formValues?.enclosingElementProperty || "",
            correlationExpression: sidePanelContext?.formValues?.correlationExpression || {"isExpression":true,"value":""},
            aggregateElementType: sidePanelContext?.formValues?.aggregateElementType || "ROOT",
            aggregationExpression: sidePanelContext?.formValues?.aggregationExpression || {"isExpression":true,"value":""},
            sequenceType: sidePanelContext?.formValues?.sequenceType || "ANONYMOUS",
            sequenceKey: sidePanelContext?.formValues?.sequenceKey || "",
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
        
        const xml = getXML(MEDIATORS.AGGREGATE, values, dirtyFields, sidePanelContext.formValues);
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
        const xml = getXML(MEDIATORS.AGGREGATE, values, dirtyFields, sidePanelContext.formValues);
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
        
        const xml = getXML(MEDIATORS.AGGREGATE, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Combines message responses that were split by Clone/Iterate mediator.</Typography>
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
                    <Typography variant="h3">Complete Condition</Typography>

                    <Field>
                        <Controller
                            name="completionTimeout"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Completion Timeout" size={50} placeholder="" required={false} errorMsg={errors?.completionTimeout?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="completionMinMessages"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Completion Min Messages"
                                    placeholder=""
                                    required={false}
                                    errorMsg={errors?.completionMinMessages?.message?.toString()}
                                    canChange={true}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="completionMaxMessages"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Completion Max Messages"
                                    placeholder=""
                                    required={false}
                                    errorMsg={errors?.completionMaxMessages?.message?.toString()}
                                    canChange={true}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="aggregateID"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Aggregate ID" size={50} placeholder="" required={false} errorMsg={errors?.aggregateID?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="enclosingElementProperty"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Enclosing Element Property" size={50} placeholder="" required={false} errorMsg={errors?.enclosingElementProperty?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="correlationExpression"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Correlation Expression"
                                    placeholder=""
                                    required={false}
                                    errorMsg={errors?.correlationExpression?.message?.toString()}
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">OnComplete</Typography>

                    <Field>
                        <Controller
                            name="aggregateElementType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Aggregate Element Type"
                                    name="aggregateElementType"
                                    items={["ROOT", "CHILD"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.aggregateElementType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="aggregationExpression"
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
                                    {...field} label="Aggregation Expression"
                                    placeholder=""
                                    required={true}
                                    errorMsg={errors?.aggregationExpression?.message?.toString()}
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="sequenceType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Sequence Type"
                                    name="sequenceType"
                                    items={["ANONYMOUS", "REGISTRY REFERENCE"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.sequenceType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    {watch("sequenceType") == "REGISTRY REFERENCE" &&
                    <Field>
                        <Controller
                            name="sequenceKey"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <Keylookup
                                    value={field.value}
                                    filterType='sequence'
                                    label="Sequence Key"
                                    allowItemCreate={false}
                                    onValueChange={field.onChange}
                                    required={true}
                                    errorMsg={errors?.sequenceKey?.message?.toString()}
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

export default AggregateForm; 
