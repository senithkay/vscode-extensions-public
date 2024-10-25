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
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { sidepanelGoBack } from '../../..';
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

const BamForm = (props: AddMediatorProps) => {
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
            serverProfileName: sidePanelContext?.formValues?.serverProfileName || "",
            streamName: sidePanelContext?.formValues?.streamName || "",
            streamVersion: sidePanelContext?.formValues?.streamVersion || "",
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
        
        const xml = getXML(MEDIATORS.BAM, values, dirtyFields, sidePanelContext.formValues);
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
        const xml = getXML(MEDIATORS.BAM, values, dirtyFields, sidePanelContext.formValues);
        let edits;
        if(Array.isArray(xml)){
            edits = xml;
        } else {
            edits = [{range: props.nodePosition, text: xml}];
        }
        const res = await rpcClient.getMiDiagramRpcClient().tryOutMediator({file: props.documentUri, line:props.nodePosition.start.line,column:props.nodePosition.start.character+1, edits: edits, isServerLess:true});
        setSchema(res);
    }

    const onClick = async (values: any) => {
        setDiagramLoading(true);
        
        const xml = getXML(MEDIATORS.BAM, values, dirtyFields, sidePanelContext.formValues);
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
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Deprecated. Use PublishEvent Mediator for similar functionality.</Typography>
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
                            name="serverProfileName"
                            control={control}
                            rules={
                                {
                                    required: "This field is required",
                                }
                            }
                            render={({ field }) => (
                                <TextField {...field} label="Server Profile Name" size={50} placeholder="" required={true} errorMsg={errors?.serverProfileName?.message?.toString()} />
                            )}
                        />
                    </Field>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <Typography variant="h3">Stream</Typography>

                        <Field>
                            <Controller
                                name="streamName"
                                control={control}
                                rules={
                                    {
                                        required: "This field is required",
                                    }
                                }
                                render={({ field }) => (
                                    <TextField {...field} label="Stream Name" size={50} placeholder="" required={true} errorMsg={errors?.streamName?.message?.toString()} />
                                )}
                            />
                        </Field>

                        <Field>
                            <Controller
                                name="streamVersion"
                                control={control}
                                rules={
                                    {
                                        required: "This field is required",
                                    }
                                }
                                render={({ field }) => (
                                    <TextField {...field} label="Stream Version" size={50} placeholder="" required={true} errorMsg={errors?.streamVersion?.message?.toString()} />
                                )}
                            />
                        </Field>

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

export default BamForm; 
