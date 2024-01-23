import React, { useEffect, useState } from 'react';
import { MachineStateValue } from '@wso2-enterprise/mi-core';
import { MIDiagram } from '@wso2-enterprise/mi-diagram';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';


const DiagramPanel = (props: { state: MachineStateValue }) => {
    const { state } = props;
    const { rpcClient } = useVisualizerContext();
    const [documentUri, setDocumentUri] = useState<string>("");

    useEffect(() => {
        setDocumentUri("");
        if (typeof state === 'object' && 'ready' in state && state.ready === 'viewReady') {
            try {
                rpcClient.getVisualizerState().then((vState: any) => {
                    setDocumentUri(vState.documentUri);
                });
            } catch (error) {
                
            }
        }
    }, [state]);

    // const showDiagram = (position: NodePosition) => {
    //     const context: any = {
    //         view: "Overview",
    //         position: position
    //     }
    //     // rpcClient.getWebviewRpcClient().openVisualizerView(context);
    // }

    return (
        <div>
            { documentUri && <MIDiagram documentUri={documentUri} />}
        </div>
    );
};

export default DiagramPanel;
