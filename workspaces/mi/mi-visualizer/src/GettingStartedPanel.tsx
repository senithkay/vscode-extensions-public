import React, { useEffect, useState } from 'react';
import { MachineStateValue } from '@wso2-enterprise/mi-core';
import { GettingStarted } from '@wso2-enterprise/mi-overview';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';


const GettingStartedPanel = (props: { state: MachineStateValue }) => {
    const { state } = props;
    // const { rpcClient } = useVisualizerContext();
    // const [documentUri, setDocumentUri] = useState<string>("");

    useEffect(() => {
        // if (typeof state === 'object' && 'ready' in state && state.ready === 'viewReady') {
        //     try {
        //         rpcClient.getVisualizerState().then((vState: any) => {
        //             setDocumentUri(vState.documentUri);
        //         });
        //     } catch (error) {
                
        //     }
        // }
    }, [state]);

    return (
        <div>
            <GettingStarted />
        </div>
    );
};

export default GettingStartedPanel;
