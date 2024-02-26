/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */


import { useEffect, useMemo, useState } from "react";
import { EggplantApp, Flow } from "@wso2-enterprise/eggplant-diagram";
import styled from "@emotion/styled";
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client";

const Container = styled.div`
    width: 100%;
    height: 100svh;
`;

const MessageContainer = styled.div({
    width: "100%",
    overflow: "hidden",
    height: "100vh",
    display: "grid"
});

const MessageContent = styled.div({
    margin: "auto"
});


const EggplantDiagram = () => {
    const { rpcClient } = useVisualizerContext();
    const [flowModel, setModel] = useState<Flow>(undefined);

    useEffect(() => {
        try {
            rpcClient.getEggplantDiagramRpcClient().getEggplantModel().then((model) => {
                setModel(model);
            });
        } catch (error) {
            setModel(undefined);
        }
    }, []);

    const onModelChange = async (model: Flow) => {
        if (rpcClient) {
            await rpcClient.getEggplantDiagramRpcClient().updateEggplantModel(model);
        }
    }

    const eggplantDiagram = useMemo(() => {
        return <EggplantApp flowModel={flowModel} onModelChange={onModelChange} />;
    }, [flowModel]);

    return (
        <Container>
            {flowModel ? eggplantDiagram :
                <MessageContainer>
                    <MessageContent>Select Construct from Overview</MessageContent>
                </MessageContainer>
            }
        </Container>
    );
};

export default EggplantDiagram;
