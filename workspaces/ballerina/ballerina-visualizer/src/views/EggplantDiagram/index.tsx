/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import styled from "@emotion/styled";
import { Diagram } from "@wso2-enterprise/eggplant-diagram";
import { Flow } from "@wso2-enterprise/ballerina-core";

const Container = styled.div`
    width: 100%;
    height: calc(100vh - 50px);
`;

export function EggplantDiagram() {
    const { rpcClient } = useVisualizerContext();

    const [model, setModel] = useState<Flow>();

    useEffect(() => {
        getSequenceModel();
    }, []);

    const getSequenceModel = () => {
        rpcClient
            .getEggplantDiagramRpcClient()
            .getEggplantModel()
            .then((model) => {
                setModel(model.flowDesignModel);
            });
    };

    return (
        <>
            <Container>{!!model && 
                <Diagram model={model} />
            }</Container>
        </>
    );
}
