/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { EggplantApp, Flow } from "@wso2-enterprise/eggplant-diagram";

const model: Flow = {
    id: "1",
    name: "flow1",
    balFilename: "path",
    nodes: [
        {
            name: "A",
            templateId: "TRANSFORMER",
            codeLocation: {
                startLine: {
                    line: 4,
                    column: 4,
                },
                endLine: {
                    line: 8,
                    column: 5,
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
                startLine: {
                    line: 10,
                    column: 4,
                },
                endLine: {
                    line: 16,
                    column: 5,
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
    return (
        <div>
            <EggplantApp flowModel={model} />
        </div>
    );
};

export default LowCode;
