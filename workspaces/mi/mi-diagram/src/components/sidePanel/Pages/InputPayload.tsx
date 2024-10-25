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
import styled from '@emotion/styled';
import SidePanelContext from '../SidePanelContexProvider';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Controller, useForm } from 'react-hook-form';
import { sidepanelGoBack } from '../';
import ReactJson from 'react-json-view';
import { CodeTextArea } from '../../Form/CodeTextArea';
import { Label } from '../../Form';

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

const InputPayloadForm = (props: any) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const [payload,setPayload] = React.useState();
    const [isEditing,setIsEditing] = React.useState(true);
    const { control, formState: { errors, dirtyFields }, handleSubmit,getValues, watch, reset } = useForm();

    useEffect(() => {
        const payload = rpcClient.getMiDiagramRpcClient().getInputPayload({}).then((res) => {
            reset({
                payload: JSON.stringify(res.payload)
            });
            setIsLoading(false);
        });
    }, [sidePanelContext.formValues]);


    const savePayload = async ()=>{
        // setPayload(event)
        await rpcClient.getMiDiagramRpcClient().saveInputPayload({payload:getValues('payload')});
        const res = await rpcClient.getMiDiagramRpcClient().getInputPayload({});
        if(res.hasPayload){
            reset({payload:res.payload});
        }
        setIsEditing(false);
    }

    const editPayload = async ()=>{

        const res = await rpcClient.getMiDiagramRpcClient().getInputPayload({});
        if(res.hasPayload){
            reset({payload:JSON.stringify(res.payload)})
        } else {
            // setPayload({});
        }
        setIsEditing(true);
    }

    const onClick = async (values: any) => {
        setDiagramLoading(true);
        
        // const xml = getXML(MEDIATORS.DROP, values, dirtyFields, sidePanelContext.formValues);
        const trailingSpaces = props.trailingSpace;
        // if (Array.isArray(xml)) {
        //     for (let i = 0; i < xml.length; i++) {
        //         await rpcClient.getMiDiagramRpcClient().applyEdit({
        //             documentUri: props.documentUri, range: xml[i].range, text: `${xml[i].text}${trailingSpaces}`
        //         });
        //     }
        // } else {
        //     rpcClient.getMiDiagramRpcClient().applyEdit({
        //         documentUri: props.documentUri, range: props.nodePosition, text: `${xml}${trailingSpaces}`
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
            <div>
                <div>
                    <AutoComplete name='contentType' label='Content Type' value='application/json' items={["application/json"]} />
                </div>
                <br />
                <div>
                    {!isEditing &&
                        <div>
                            <Field>
                                <Controller 
                                name="payload"
                                control={control}
                                render={({field})=>(
                                    <ReactJson src={field.value} theme="monokai" />
                                )}
                                />
                            </Field>
                            {/* <Label>Payload:</Label> <br />  <ReactJson src={payload} theme="monokai" /> */}
                            <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
                            <Button onClick={editPayload}>Edit</Button>
                            </div>
                        </div>
                    }
                    {isEditing && <div>
                        <Field>
                                <Controller 
                                    name="payload"
                                    control={control}
                                    render={({field})=>(
                                        <CodeTextArea {...field} growRange={{ start: 10, offset: 5 }} label='Payload:' />
                                    )}
                                />
                            </Field>
                        <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
                        <Button onClick={handleSubmit(savePayload)}>Save</Button>
                        </div>
                    </div>
                    }
                </div>
            </div>
        </>
    );
};

export default InputPayloadForm; 
