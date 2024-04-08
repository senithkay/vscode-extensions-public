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
import { SequenceModelResponse } from "@wso2-enterprise/ballerina-core";
import { Diagram } from "@wso2-enterprise/sequence-diagram";
import styled from "@emotion/styled";

const Container = styled.div`
    width: 100%;
    height: calc(100vh - 50px);
`;

const MessageContainer = styled.div({
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
});

export function SequenceDiagram() {
    const { rpcClient } = useVisualizerContext();

    const [flowModel, setModel] = useState<SequenceModelResponse>(undefined);

    useEffect(() => {
        getSequenceModel();
    }, []);

    const getSequenceModel = () => {
        rpcClient
            .getSequenceDiagramRpcClient()
            .getSequenceModel()
            .then((model) => {
                if ("participants" in model) {
                    setModel(model as SequenceModelResponse);
                }
                // TODO: handle SequenceModelDiagnostic
            });
    };

    console.log(">>> flowModel", flowModel);

    return (
        <>
            <Container>
                {flowModel && <Diagram model={flowModel} />}
                {!flowModel && <MessageContainer>Loading sequence diagram ...</MessageContainer>}
            </Container>
        </>
    );
}
