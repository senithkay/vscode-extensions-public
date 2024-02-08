import React, { useEffect, useState } from 'react';
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client";
import { MachineStateValue, VisualizerLocation } from "@wso2-enterprise/eggplant-core";
import { ServiceDesignerView, Resource } from "@wso2-enterprise/service-designer-view";
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
                            documentUri: vState.documentUri,
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

    const showDiagram = (resource: Resource) => {
        const context: any = {
            view: "Overview",
            position: resource.position
        }
        eggplantRpcClient.getWebviewRpcClient().openVisualizerView(context);
    }

    return (
        <div>
            {serviceST ? <ServiceDesignerView model={serviceST} rpcClient={eggplantRpcClient.getServiceDesignerRpcClient()} goToSource={showDiagram} /> : <LowCode state={state} />}
        </div>
    );
};

export default WebPanel;

