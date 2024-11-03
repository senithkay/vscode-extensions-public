/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useState } from "react";
import { Parameter as P } from "../../../Definitions/ServiceDefinitions";
import { Parameters } from "./Parameters";

export default {
    component: Parameters,
    title: 'New Parameters',
};

const parameter: P = {
    name: "name",
    in: "query",
    description: "description",
    required: true,
    schema: {
        type: "string",
    },
};

const parameters: P[] = [parameter];

export const ParametersStory = () => {
    const [parameters, setParameters] = useState<P[]>([parameter]);
    const onParametersChange = (parameters: P[]) => {
        console.log(parameters);
        setParameters(parameters);
    }
    return (
        <Parameters title="Query Parameters" parameters={parameters} onParametersChange={onParametersChange} />
    );
};
