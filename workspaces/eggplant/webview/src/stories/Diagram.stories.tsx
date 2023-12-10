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
    balFilename: "path",
    nodes: []
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