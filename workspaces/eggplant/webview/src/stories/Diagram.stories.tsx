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
import { storiesOf } from "@storybook/react";
import LowCode from "../LowCode";

const Container = styled.div`
    width: 100%;
    height: 100svh;
`;

const simpleModel: Flow = {
    id: "1",
    name: "flow1",
    fileName: "path",
    nodes: [],
    bodyCodeLocation: {
        start: {
            line: 1,
            offset: 1,
        },
        end: {
            line: 1,
            offset: 1,
        },
    },
    fileSourceRange: {
        start: {
            line: 1,
            offset: 1,
        },
        end: {
            line: 1,
            offset: 1,
        },
    },
};


storiesOf("LowCode", module)
  .add("Default", () => {
    const [flowModel, setModel] = useState(simpleModel);

    const onModelChange = (model) => {
      setModel(model);
    };

    return (
        <Container>
            <EggplantApp flowModel={flowModel} onModelChange={onModelChange} />
        </Container>
    );
  });
  