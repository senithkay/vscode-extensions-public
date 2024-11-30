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
import ReactJson from 'react-json-view';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { MediatorTryOutInfo } from '@wso2-enterprise/mi-core';
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
    const [mediatorInput, setMediatorInput] = React.useState<any>(undefined);
    const [mediatorOutput, setMediatorOutput] = React.useState<any>({});
    const [isDefaultInput, setIsDefaultInput] = React.useState(true);
    const [inputPayload, setInputPayload] = React.useState('');
    const sidePanelContext = React.useContext(SidePanelContext);

    useEffect(() => {
        if (!props.isActive) {
            return;
        }
        getSchema();
    }, [props]);

    const getSchema = async () => {
        try {
            if (nodeRange) {
                const schema = await rpcClient.getMiDiagramRpcClient().getMediatorInputOutputSchema({
                    file: documentUri,
                    line: nodeRange.start.line,
                    column: nodeRange.start.character + 1,
                    edits: []
                });

                setMediatorInput(schema.input);
            }
            await getInputPayload();

        } catch (error) {
            console.error("Error fetching mediator input/output schema:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const getInputPayload = async () => {
        try {
            const payload = await rpcClient.getMiDiagramRpcClient().getInputPayload({ documentUri });
            setInputPayload(payload.payload || '');
        } catch (error) {
            console.error("Error fetching input payload:", error);
        }
    }

    const onTryOut = async () => {
        try {
            setIsTryOutLoading(true);
            setTryOutError(null);
            const res = await rpcClient.getMiDiagramRpcClient().tryOutMediator({
                file: documentUri,
                line: nodeRange.start.line,
                column: nodeRange.start.character + 1,
                ...(!isDefaultInput && { inputPayload })
            });
            if (res.error) {
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

    const Properties = ({ properties, isExpanded }: { properties: MediatorTryOutInfo, isExpanded?: boolean }) => {
        return (
            <FormGroup title='Properties' isCollapsed={!isExpanded}>
                <PropertiesContainer>
                    <ReactJson sortKeys name="Synapse Properties" src={properties?.synapse} theme={REACT_JSON_THEME} />
                    <ReactJson sortKeys name="Axis2 Properties" src={properties?.axis2} theme={REACT_JSON_THEME} />
                    <ReactJson sortKeys name="Axis2 Client Propeties" src={properties?.axis2Client} theme={REACT_JSON_THEME} />
                    <ReactJson sortKeys name="Transport Properties" src={properties?.axis2Transport} theme={REACT_JSON_THEME} />
                    <ReactJson sortKeys name="Axis2 Operation Properties" src={properties?.axis2Operation} theme={REACT_JSON_THEME} />
                </PropertiesContainer>
            </FormGroup>
        );
    }

    if (isLoading) {
        return (
            <TryoutContainer>
                <ProgressIndicator />
            </TryoutContainer>
        );
    } else if ((!mediatorInput || !mediatorInput.synapse) && (inputPayload === undefined)) {
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
                <Properties properties={mediatorInput} isExpanded />

                <div style={{ marginTop: "10px" }}>
                    <CheckBox
                        label="Use default payload"
                        checked={isDefaultInput}
                        onChange={() => setIsDefaultInput(!isDefaultInput)}
                    />
                    {!isDefaultInput &&
                        <div>
                            <Typography variant="body3">Payload</Typography>
                            <CodeTextArea name="Payload" rows={5} value={inputPayload} onChange={(e) => setInputPayload(e.target.value)} />
                        </div>}
                </div>
                <Button onClick={onTryOut} sx={{ marginTop: "10px", marginLeft: "auto" }} disabled={isTryOutLoading}>
                    {isTryOutLoading ? 'Running...' : 'Run'}
                </Button>
            </Section>
            <hr style={{ width: "100%", border: "none", borderTop: "1px solid var(--vscode-editorWidget-border)", margin: "20px 0" }} />

            {tryOutError && <ErrorBanner errorMsg={tryOutError} />}
            {mediatorOutput && mediatorOutput.synapse && <Section>
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
                <Properties properties={mediatorOutput} />
            </Section>}
        </TryoutContainer>
    );
};

export default TryOutView; 
