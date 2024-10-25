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
import SidePanelContext from '../../SidePanelContexProvider';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Controller, useForm } from 'react-hook-form';
// import { handleOpenExprEditor, sidepanelGoBack } from '../../..';
import { CodeTextArea } from '../../../Form/CodeTextArea';
import ReactJson from 'react-json-view';

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

const TryOutView = (props: any) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });
    const [isTryout, setTryout] = React.useState(false);
    const [mediatorInput, setMediatorInput] = React.useState<any>({});
    const [mediatorOutput, setMediatorOutput] = React.useState<any>({});
    const [isJsonInputPayload, setIsJsonInputPayload] = React.useState(false);
    const [isJsonOutputPayload, setIsJsonOutputPayload] = React.useState(false);

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    // useEffect(() => {
    //     handleOnCancelExprEditorRef.current = () => {
    //         sidepanelGoBack(sidePanelContext);
    //     };
    // }, [sidePanelContext.pageStack]);

    useEffect(()=>{
        
        if(sidePanelContext.inputOutput?.input && sidePanelContext.inputOutput?.output){
            setMediatorInput(sidePanelContext.inputOutput?.input);
        setMediatorOutput(sidePanelContext.inputOutput?.output);
        
        setIsLoading(false);
    } else if (props.data) {
        setMediatorInput(props.data.input);
        setMediatorOutput(props.data.output);
        // try {
        //     if (props.data.input.payload) {
        //         JSON.parse(props.data.input.payload);
        //         setIsJsonInputPayload(true);
        //         console.log("isJsonInputPayload", isJsonInputPayload);
        //     }
        // } catch (error) {
        //     setIsJsonInputPayload(false);
        // }
        // try {
        //     if (props.data.output.payload) {
        //         JSON.parse(props.data.output.payload);
        //         setIsJsonOutputPayload(true);
        //         console.log("isJsonOutputPayload", isJsonOutputPayload);
        //     }
        // } catch (error) {
        //     setIsJsonOutputPayload(false);
        // }
        setIsLoading(false);
    }
    });

    const onTryOut = async () => {
        setTryout(true);
        const res = await rpcClient.getMiDiagramRpcClient().tryOutMediator({file: props.documentUri, line:props.nodePosition.start.line,column:props.nodePosition.start.character+1});
        if(res){
            setMediatorInput(res.input);
            setMediatorOutput(res.output);
        }
    }

    if (isLoading) {
        return <ProgressIndicator/>;
    }
    return (
        <>
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">{!props.isSchemaView ? `Mediator Try Out View` : `Input/Output Schema View`}</Typography>
            <div style={{ 
                padding: "5px 10px", 
                overflowY: "auto", 
                maxHeight: props.isColumnView ? "450px" : "calc(100vh - 100px)", // Adjust the value as needed
                fontSize: "0.9em" 
            }}>
                { mediatorInput && mediatorOutput && mediatorInput.synapse && mediatorOutput.synapse && (
                    <div style={{ 
                        display: "flex", 
                        flexDirection: props.isColumnView ? "row" : "column", 
                        height: props.isColumnView ? "450px" : "auto",
                        overflowY: props.isColumnView ? "auto" : "visible"
                    }}>
                        <div style={{ 
                            flex: props.isColumnView ? 1 : "auto", 
                            marginRight: props.isColumnView ? "10px" : "0",
                            marginBottom: props.isColumnView ? "0" : "20px"
                        }}>
                            <Field>
                                <Typography variant="h3" sx={{ fontSize: "1.2em" }}>Input</Typography>
                                <div>
                                    <Typography variant="h4" sx={{ fontSize: "0.9em", marginBottom: "5px" }}>Payload:</Typography>
                                    {isJsonInputPayload &&
                                        <div><ReactJson sortKeys name="Payload" src={mediatorInput.payload} theme="monokai" style={{ fontSize: "0.8em" }} /></div>
                                    }
                                    {!isJsonInputPayload && <CodeTextArea name="Payload" growRange={{start:5,offset:5}} value={mediatorInput.payload} />}
                                    
                                </div>
                                <br/>
                                <div><ReactJson sortKeys name="Synapse Properties" src={mediatorInput.synapse} theme="monokai" style={{ fontSize: "0.8em" }} /></div>
                                <br/>
                                <div><ReactJson sortKeys name="Axis2 Properties" src={mediatorInput.axis2} theme="monokai" style={{ fontSize: "0.8em" }} /></div>
                                <br/>
                                <div><ReactJson sortKeys name="Axis2 Client Propeties" src={mediatorInput.axis2Client} theme="monokai" style={{ fontSize: "0.8em" }} /></div>
                                <br/>
                                <div><ReactJson sortKeys name="Transport Properties" src={mediatorInput.axis2Transport} theme="monokai" style={{ fontSize: "0.8em" }} /></div>
                                <br/>
                                <div><ReactJson sortKeys name="Axis2 Operation Properties" src={mediatorInput.axis2Operation} theme="monokai" style={{ fontSize: "0.8em" }} /></div>
                            </Field>
                        </div>
                        {props.isColumnView ? (
                            <div style={{ width: "1px", backgroundColor: "var(--vscode-editorWidget-border)", margin: "0 10px" }}/>
                        ) : (
                            <hr style={{ width: "100%", border: "none", borderTop: "1px solid var(--vscode-editorWidget-border)", margin: "20px 0" }}/>
                        )}
                        <div style={{ 
                            flex: props.isColumnView ? 1 : "auto", 
                            marginLeft: props.isColumnView ? "10px" : "0"
                        }}>
                            <Field>
                                <Typography variant="h3" sx={{ fontSize: "1.2em" }}>Output</Typography>
                                <div>
                                    <Typography variant="h4" sx={{ fontSize: "0.9em", marginBottom: "5px" }}>Payload:</Typography>
                                    {isJsonInputPayload &&
                                        <div><ReactJson sortKeys name="Payload" src={mediatorOutput.payload} theme="monokai" style={{ fontSize: "0.8em" }} /></div>
                                    }
                                    {!isJsonInputPayload && <CodeTextArea name="Payload" growRange={{start:5,offset:5}} value={mediatorOutput.payload} />}
                                </div>
                                <br/>
                                <div><ReactJson sortKeys name="Synapse Properties" src={mediatorOutput.synapse} theme="monokai" style={{ fontSize: "0.8em" }} /></div>
                                <br/>
                                <div><ReactJson sortKeys name="Axis2 Properties" src={mediatorOutput.axis2} theme="monokai" style={{ fontSize: "0.8em" }} /></div>
                                <br/>
                                <div><ReactJson sortKeys name="Axis2 Client Propeties" src={mediatorOutput.axis2Client} theme="monokai" style={{ fontSize: "0.8em" }} /></div>
                                <br/>
                                <div><ReactJson sortKeys name="Transport Properties" src={mediatorOutput.axis2Transport} theme="monokai" style={{ fontSize: "0.8em" }} /></div>
                                <br/>
                                <div><ReactJson sortKeys name="Axis2 Operation Properties" src={mediatorOutput.axis2Operation} theme="monokai" style={{ fontSize: "0.8em" }} /></div>
                            </Field>
                        </div>
                    </div>
                )}
                {!mediatorInput && !mediatorOutput && <div>Loading...</div>}
                {!mediatorInput?.synapse && !mediatorOutput?.synapse && <div>Loading...</div>}
            </div>
        </>
    );
};

export default TryOutView; 
