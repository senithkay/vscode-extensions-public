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
import { Button, ComponentCard, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
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

const NTLMForm = (props: AddMediatorProps) => {
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
            username: sidePanelContext?.formValues?.username || {"isExpression":false,"value":""},
            password: sidePanelContext?.formValues?.password || {"isExpression":false,"value":""},
            host: sidePanelContext?.formValues?.host || {"isExpression":false,"value":""},
            domain: sidePanelContext?.formValues?.domain || {"isExpression":false,"value":""},
            ntlmVersion: sidePanelContext?.formValues?.ntlmVersion || {"isExpression":false,"value":""},
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
        
        const xml = getXML(MEDIATORS.NTLM, values, dirtyFields, sidePanelContext.formValues);
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
        const xml = getXML(MEDIATORS.NTLM, values, dirtyFields, sidePanelContext.formValues);
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
        
        const xml = getXML(MEDIATORS.NTLM, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Enables access to NTLM-protected services.</Typography>
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
                            name="username"
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
                                    {...field} label="Username"
                                    placeholder=""
                                    required={true}
                                    errorMsg={errors?.username?.message?.toString()}
                                    canChange={true}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="password"
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
                                    {...field} label="Password"
                                    placeholder=""
                                    required={true}
                                    errorMsg={errors?.password?.message?.toString()}
                                    canChange={true}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="host"
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
                                    {...field} label="Host"
                                    placeholder=""
                                    required={true}
                                    errorMsg={errors?.host?.message?.toString()}
                                    canChange={true}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="domain"
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
                                    {...field} label="Domain"
                                    placeholder=""
                                    required={true}
                                    errorMsg={errors?.domain?.message?.toString()}
                                    canChange={true}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>

                    <Field>
                        <Controller
                            name="ntlmVersion"
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
                                    {...field} label="NTLM Version"
                                    placeholder=""
                                    required={true}
                                    errorMsg={errors?.ntlmVersion?.message?.toString()}
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

export default NTLMForm; 
