/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { EggplantDiagram } from "@wso2-enterprise/eggplant-diagram";

const model = {
    nodes: [
        { name: "A", links: [{ name: "B" }, { name: "C" }] },
        { name: "B", links: [{ name: "FunctionEnd" }] },
        { name: "C", links: [{ name: "FunctionEnd" }] },
        { name: "FunctionStart", links: [{ name: "A" }] },
        { name: "FunctionEnd", links: [] },
    ],
};


const LowCode = () => {
    return (
        <div>
            <EggplantDiagram model={model} />
        </div>
    );
};

export default LowCode;
