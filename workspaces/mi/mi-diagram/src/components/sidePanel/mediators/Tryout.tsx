/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/

import React, { useEffect } from 'react';
import { Button, ProgressIndicator, Typography, FormGroup, ErrorBanner, CheckBox } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { CodeTextArea } from '../../Form/CodeTextArea';
import ReactJson, { InteractionProps } from 'react-json-view';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { Header, MediatorProperties, MediatorTryOutInfo, Params } from '@wso2-enterprise/mi-core';
import { Colors, ERROR_MESSAGES, REACT_JSON_THEME } from '../../../resources/constants';
import SidePanelContext, { clearSidePanelState } from '../SidePanelContexProvider';

const TryoutContainer = styled.div`
    width: 100%;
`;
const Section = styled.div`
   margin-bottom: 12px;
`;
const PropertiesContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

interface TryoutProps {
    documentUri: string;
    nodeRange?: Range;
    isActive: boolean;
}

export function TryOutView(props: TryoutProps) {
    const { documentUri, nodeRange } = props;
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const [isLoading, setIsLoading] = React.useState(true);
    const [isTryOutLoading, setIsTryOutLoading] = React.useState(false);
    const [tryOutError, setTryOutError] = React.useState<string | null>(null);
    const [mediatorInput, setMediatorInput] = React.useState<MediatorTryOutInfo>(undefined);
    const [mediatorOutput, setMediatorOutput] = React.useState<MediatorTryOutInfo>(undefined);
    const [isDefaultInput, setIsDefaultInput] = React.useState(true);
    const [inputPayload, setInputPayload] = React.useState('');
    const [tryoutId, setTryoutId] = React.useState<string>();

    // State to manage the expanded/collapsed state of each section
    const [isInputExpanded, setIsInputExpanded] = React.useState({
        properties: false,
        headers: false,
        params: false,
        variables: false,
    });

    const [isOutputExpanded, setIsOutputExpanded] = React.useState({
        properties: false,
        headers: false,
        params: false,
        variables: false,
    });

    const sidePanelContext = React.useContext(SidePanelContext);

    useEffect(() => {
        if (!props.isActive) {
            return;
        }
        getInputData();
    }, [props]);

    const getInputData = async () => {
        try {
            await getInputPayload();
            if (!nodeRange) return;

            const res = await rpcClient.getMiDiagramRpcClient().tryOutMediator({
                file: documentUri,
                line: nodeRange.start.line,
                column: nodeRange.start.character + 1,
                isServerLess: false,
                inputPayload,
                edits: []
            });

            if (res.error) {
                setTryOutError(typeof res.error === 'string' ? res.error : ERROR_MESSAGES.ERROR_TRYING_OUT_MEDIATOR);
                console.error("Error trying out mediator:", res.error);
            } else {
                setMediatorInput(res.input);
                setTryoutId(res.id);
            }
        } catch (error) {
            console.error("Error fetching mediator input/output schema:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const getInputPayload = async () => {
        try {
            const { payload } = await rpcClient.getMiDiagramRpcClient().getInputPayload({ documentUri });
            setInputPayload(payload || '');
        } catch (error) {
            console.error("Error fetching input payload:", error);
        }
    }

    const onTryOut = async () => {
        try {
            setIsTryOutLoading(true);
            setTryOutError(null);

            const res = await rpcClient.getMiDiagramRpcClient().tryOutMediator({
                tryoutId,
                file: documentUri,
                line: nodeRange.start.line,
                column: nodeRange.start.character + 1,
                isServerLess: false,
                inputPayload,
                mediatorInfo: mediatorInput
            });

            if (res.error) {
                setMediatorOutput(undefined);
                setTryOutError(typeof res.error === 'string' ? res.error : ERROR_MESSAGES.ERROR_TRYING_OUT_MEDIATOR);
                console.error("Error trying out mediator:", res.error);
            } else {
                setMediatorOutput(res.output);
            }
        } catch (error) {
            console.error("Error during try out:", error);
        } finally {
            setIsTryOutLoading(false);
        }
    }

    const onSavePayload = async () => {
        await rpcClient.getMiDiagramRpcClient().saveInputPayload({ payload: inputPayload });
        clearSidePanelState(sidePanelContext);
    }

    if (isLoading) {
        return (
            <TryoutContainer>
                <ProgressIndicator />
            </TryoutContainer>
        );
    } else if ((!mediatorInput || !mediatorInput.properties) && (inputPayload === undefined)) {
        return (
            <TryoutContainer>
                <ErrorBanner errorMsg={ERROR_MESSAGES.ERROR_LOADING_TRYOUT} />
            </TryoutContainer>
        )
    } else if (!nodeRange && (inputPayload || inputPayload === '')) {
        return (
            <TryoutContainer>
                <Typography
                    sx={{ padding: "10px", marginBottom: "10px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }}
                    variant="body3">
                    {`Save the payload to try out the mediators`}
                </Typography>

                <Typography variant="body3">Payload</Typography>
                <CodeTextArea name="Payload" rows={30} value={inputPayload} onChange={(e) => setInputPayload(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'end', marginTop: '10px' }}>
                    <Button onClick={() => clearSidePanelState(sidePanelContext)} appearance="secondary">
                        Cancel
                    </Button>
                    <Button onClick={onSavePayload} sx={{ marginRight: "10px" }}>
                        Save
                    </Button>
                </div>
            </TryoutContainer>
        );
    }

    return (
        <TryoutContainer>
            <Typography
                sx={{ padding: "10px", marginBottom: "10px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }}
                variant="body3">
                {`Try the request flow up to this mediator`}
            </Typography>

            <Section>
                <Typography variant="h3">Payload</Typography>
                <CheckBox
                    label="Use default payload"
                    checked={isDefaultInput}
                    onChange={() => setIsDefaultInput(!isDefaultInput)}
                />
                {!isDefaultInput &&
                    <div>
                        <Typography variant="body3">Custom payload</Typography>
                        <CodeTextArea name="Payload" rows={5} value={inputPayload} onChange={(e) => setInputPayload(e.target.value)} />
                    </div>}

                <div style={{ marginTop: "10px" }}>
                    <MediatorDetails
                        data={mediatorInput}
                        setMediatorInfo={setMediatorInput}
                        isExpanded={isInputExpanded}
                        setIsExpanded={setIsInputExpanded}
                        isEditable={true}
                    />
                </div>
                <Button onClick={onTryOut} sx={{ marginTop: "10px", marginLeft: "auto" }} disabled={isTryOutLoading}>
                    {isTryOutLoading ? 'Running...' : 'Run'}
                </Button>
            </Section>
            <hr style={{ width: "100%", border: "none", borderTop: "1px solid var(--vscode-editorWidget-border)", margin: "20px 0" }} />

            {tryOutError && <ErrorBanner errorMsg={tryOutError} />}
            {mediatorOutput && mediatorOutput.properties.synapse && <Section>
                <Typography variant="h3" sx={{ fontSize: "1.2em" }}>Output</Typography>
                <div>
                    <Typography variant="body3">Payload</Typography>
                    {isDefaultInput &&
                        <div style={{
                            border: "1px solid",
                            borderRadius: "4px",
                            padding: "10px",
                            whiteSpace: "pre-wrap",
                            backgroundColor: Colors.SURFACE_CONTAINER,
                            borderColor: Colors.OUTLINE
                        }}>
                            {mediatorOutput.payload}
                        </div>
                    }
                    {!isDefaultInput && <CodeTextArea name="Payload" growRange={{ start: 5, offset: 5 }} value={mediatorOutput.payload} />}
                </div>
                <br />
                <MediatorDetails
                    data={mediatorOutput}
                    setMediatorInfo={setMediatorOutput}
                    isExpanded={isOutputExpanded}
                    setIsExpanded={setIsOutputExpanded}
                    isEditable={false}
                />
            </Section>}
        </TryoutContainer>
    );
};

const MediatorDetails = ({ data, setMediatorInfo, isExpanded, setIsExpanded, isEditable }: { data: MediatorTryOutInfo, setMediatorInfo: React.Dispatch<React.SetStateAction<MediatorTryOutInfo>>, isExpanded: any, setIsExpanded: any, isEditable: boolean }) => {
    const handleEdit = (type: string, edit: InteractionProps, key?: string) => {
        if (!isEditable) return; // Prevent editing if not editable
        setMediatorInfo((prev) => {
            const updated = { ...prev };
            if (key !== undefined) {
                (updated as any)[type][key] = edit.updated_src;
            } else {
                (updated as any)[type] = edit.updated_src;
            }
            return updated;
        });
    }
    const toggleExpanded = (type: any, collapsed: boolean) => {
        setIsExpanded((prev: any) => {
            return {
                ...prev,
                [type]: !collapsed
            }
        });
    }

    const Properties = ({ properties }: { properties: MediatorProperties }) => (
        <FormGroup title='Properties' isCollapsed={!isExpanded.properties} onToggle={(collapsed) => toggleExpanded('properties', collapsed)}>
            <PropertiesContainer>
                {['synapse', 'axis2', 'axis2Client', 'axis2Transport', 'axis2Operation'].map((key) => (
                    <ReactJson
                        key={key}
                        sortKeys
                        name={`${key.charAt(0).toUpperCase() + key.slice(1)} Properties`}
                        src={(properties as any)?.[key]}
                        theme={REACT_JSON_THEME}
                        onEdit={isEditable ? (edit: InteractionProps) => handleEdit('properties', edit, key) : undefined}
                    />
                ))}
            </PropertiesContainer>
        </FormGroup>
    );

    const Headers = ({ headers }: { headers: Header[] }) => (
        <FormGroup title='Headers' isCollapsed={!isExpanded.headers} onToggle={(collapsed) => toggleExpanded('headers', collapsed)}>
            <PropertiesContainer>
                <ReactJson
                    sortKeys
                    name={false}
                    src={headers}
                    theme={REACT_JSON_THEME}
                    onEdit={isEditable ? (edit: InteractionProps) => handleEdit('headers', edit) : undefined}
                />
            </PropertiesContainer>
        </FormGroup>
    );

    const Params = ({ params }: { params: Params }) => (
        <FormGroup title='Params' isCollapsed={!isExpanded.params} onToggle={(collapsed) => toggleExpanded('params', collapsed)}>
            <PropertiesContainer>
                {['functionParams', 'queryParams', 'uriParams'].map((key) => (
                    <ReactJson
                        sortKeys
                        name={key.charAt(0).toUpperCase() + key.slice(1)}
                        src={(params as any)?.[key]}
                        theme={REACT_JSON_THEME}
                        onEdit={isEditable ? (edit: InteractionProps) => handleEdit('params', edit, key) : undefined}
                    />
                ))}
            </PropertiesContainer>
        </FormGroup>
    );

    const Variables = ({ variables }: { variables: any }) => (
        <FormGroup title='Variables' isCollapsed={!isExpanded.variables} onToggle={(collapsed) => toggleExpanded('variables', collapsed)}>
            <PropertiesContainer>
                <ReactJson
                    sortKeys
                    name={false}
                    src={variables}
                    theme={REACT_JSON_THEME}
                    onEdit={isEditable ? (edit: InteractionProps) => handleEdit('variables', edit) : undefined}
                />
            </PropertiesContainer>
        </FormGroup>
    );

    return (
        <>
            <Headers headers={data.headers} />
            <Params params={data.params} />
            <Variables variables={data.variables} />
            <Properties properties={data.properties} />
        </>
    );
}

export default TryOutView; 
