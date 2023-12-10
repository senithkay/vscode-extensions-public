/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { EggplantApp, Flow } from "@wso2-enterprise/eggplant-diagram";
import styled from "@emotion/styled";

const Container = styled.div`
    width: 100%;
    height: 100svh;
`;

const model: Flow = {
    id: "1",
    name: "flow1",
    balFilename: "path",
    nodes: [
        {
            name: "A",
            templateId: "TRANSFORMER",
            codeLocation: {
                start: {
                    line: 4,
                    offset: 4,
                },
                end: {
                    line: 8,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 0,
                y: 0,
            },
            inputPorts: [],
            outputPorts: [
                {
                    id: "ao1",
                    type: "INT",
                    receiver: "B",
                },
            ],
        },
        {
            name: "B",
            templateId: "TRANSFORMER",
            codeLocation: {
                start: {
                    line: 10,
                    offset: 4,
                },
                end: {
                    line: 16,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 100,
                y: 0,
            },
            inputPorts: [
                {
                    id: "bi1",
                    type: "INT",
                    name: "x1",
                    sender: "A",
                },
            ],
            outputPorts: [],
        },
    ],
};


const LowCode = () => {
    const [flowModel, setModel] = useState<Flow>(model);

    const onModelChange = (model: Flow) => {
        setModel(model);
    }

    return (
        <Container>
            <EggplantApp flowModel={flowModel} onModelChange={onModelChange} />
        </Container>
    );
};

export default LowCode;
