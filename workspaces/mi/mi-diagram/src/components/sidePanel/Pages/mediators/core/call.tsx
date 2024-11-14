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
import { AutoComplete, Button, ComponentCard, ProgressIndicator, TextField, TextArea, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, openPopup } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { FormKeylookup } from '../../../../Form';
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

const CallForm = (props: AddMediatorProps) => {
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
            endpoint: sidePanelContext?.formValues?.endpoint || {"isExpression":false,"value":""},
            inlineEndpoint: sidePanelContext?.formValues?.inlineEndpoint || "",
            enableBlockingCalls: sidePanelContext?.formValues?.enableBlockingCalls || false,
            initAxis2ClientOptions: sidePanelContext?.formValues?.initAxis2ClientOptions || false,
            sourceType: sidePanelContext?.formValues?.sourceType || "none",
            sourceProperty: sidePanelContext?.formValues?.sourceProperty || "",
            contentType: sidePanelContext?.formValues?.contentType || "",
            sourcePayload: sidePanelContext?.formValues?.sourcePayload || "<inline xmlns=\"\"/>",
            sourceXPath: sidePanelContext?.formValues?.sourceXPath || {"isExpression":true,"value":""},
            targetType: sidePanelContext?.formValues?.targetType || "none",
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


    const onTryOut = async (values: any) => {
        // setTryout(true);
        
        const xml = getXML(MEDIATORS.CALL, values, dirtyFields, sidePanelContext.formValues);
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
        const xml = getXML(MEDIATORS.CALL, values, dirtyFields, sidePanelContext.formValues);
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
        
        const xml = getXML(MEDIATORS.CALL, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Invokes external services in blocking/non-blocking mode.</Typography>
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
                        name="endpoint"
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
                            <FormKeylookup
                                control={control}
                                name='endpoint'
                                label="Endpoint"
                                filterType='endpoint'
                                allowItemCreate={false}
                                required={true}
                                errorMsg={errors?.endpoint?.message?.toString()}
                                canChangeEx={true}
                                onCreateButtonClick={(fetchItems: any, handleValueChange: any) => {
                                    openPopup(rpcClient, 'endpoint', fetchItems, handleValueChange);
                                }}
                                exprToggleEnabled={true}
                                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                additionalItems={["NONE"]}
                            />
                        )}
                    />
                </Field>

                {((watch("endpoint").value == "INLINE") &&(watch("endpoint").isExpression == false) ) &&
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

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Advanced</Typography>

                    <Field>
                        <Controller
                            name="enableBlockingCalls"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Enable Blocking Calls</VSCodeCheckbox>
                            )}
                        />
                    </Field>

                    {watch("enableBlockingCalls") == true &&
                    <Field>
                        <Controller
                            name="initAxis2ClientOptions"
                            control={control}
                            render={({ field }) => (
                                <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Initialize Axis2 Client Options</VSCodeCheckbox>
                            )}
                        />
                    </Field>
                    }

                    <Field>
                        <Controller
                            name="sourceType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Source Type"
                                    name="sourceType"
                                    items={["none", "body", "property", "inline", "custom"]}
                                    value={field.value}
                                    required={false}
                                    errorMsg={errors?.sourceType?.message?.toString()}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Field>

                    {watch("sourceType") == "property" &&
                    <Field>
                        <Controller
                            name="sourceProperty"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Source Property" size={50} placeholder="Source Property" required={false} errorMsg={errors?.sourceProperty?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {((watch("sourceType") == "property") ||(watch("sourceType") == "inline") ||(watch("sourceType") == "custom") ) &&
                    <Field>
                        <Controller
                            name="contentType"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Content Type" size={50} placeholder="Content Type" required={false} errorMsg={errors?.contentType?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {watch("sourceType") == "inline" &&
                    <Field>
                        <Controller
                            name="sourcePayload"
                            control={control}
                            render={({ field }) => (
                                <TextArea {...field} label="Source Payload" placeholder="" required={false} errorMsg={errors?.sourcePayload?.message?.toString()} />
                            )}
                        />
                    </Field>
                    }

                    {watch("sourceType") == "custom" &&
                    <Field>
                        <Controller
                            name="sourceXPath"
                            control={control}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label="Source XPath"
                                    placeholder="Source XPath"
                                    required={false}
                                    errorMsg={errors?.sourceXPath?.message?.toString()}
                                    canChange={false}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>
                    }

                    <Field>
                        <Controller
                            name="targetType"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                    label="Target Type"
                                    name="targetType"
                                    items={["none", "body", "property"]}
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

                    {watch("targetType") == "property" &&
                    <Field>
                        <Controller
                            name="targetProperty"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Target Property" size={50} placeholder="Target Property" required={false} errorMsg={errors?.targetProperty?.message?.toString()} />
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
                            <TextField {...field} label="Description" size={50} placeholder="Description" required={false} errorMsg={errors?.description?.message?.toString()} />
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

export default CallForm; 
