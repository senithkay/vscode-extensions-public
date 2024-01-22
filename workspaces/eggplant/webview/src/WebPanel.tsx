import React, { useEffect, useState } from 'react';
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client";
import { MachineStateValue, VisualizerLocation, NodePosition } from "@wso2-enterprise/eggplant-core";
import { ServiceDesigner } from "@wso2-enterprise/service-designer-view";
import LowCode from "./LowCode";


const WebPanel = (props: { state: MachineStateValue }) => {
    const { state } = props;
    const { eggplantRpcClient } = useVisualizerContext();
    const [serviceST, setServiceSt] = useState<any>();

    useEffect(() => {
        if (typeof state === 'object' && 'ready' in state && state.ready === 'viewReady') {
            try {
                eggplantRpcClient.getWebviewRpcClient().getVisualizerState().then(async (vState: VisualizerLocation) => {
                    if (vState.view === "ServiceDesigner") {
                        const context: VisualizerLocation = {
                            fileName: vState.fileName,
                            position: vState.position
                        }
                        const serviceST = await eggplantRpcClient.getWebviewRpcClient().getSTNodeFromLocation(context);
                        setServiceSt(serviceST);
                    } else {
                        setServiceSt(undefined);
                    }
                });
            } catch (error) {
                setServiceSt(undefined);
            }
        }
    }, [state]);

    const showDiagram = (position: NodePosition) => {
        const context: any = {
            view: "Overview",
            position: position
        }
        eggplantRpcClient.getWebviewRpcClient().openVisualizerView(context);
    }

    return (
        <div>
            {serviceST ? <ServiceDesigner model={serviceST} rpcClient={eggplantRpcClient.getServiceDesignerRpcClient()} goToSource={showDiagram} /> : <LowCode state={state} />}
        </div>
    );
};

export default WebPanel;

