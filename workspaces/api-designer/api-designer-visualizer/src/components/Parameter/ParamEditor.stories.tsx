/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Param } from "../../Definitions/ServiceDefinitions";
import { ParamEditor } from "./ParamEditor";
import styled from "@emotion/styled";

export default {
    component: ParamEditor,
    title: 'Resource',
};

const Container = styled.div`
    min-height: 500px;
`;

export const ParamEditorStory = () => {
    const handleParamChange = (params: Param[]) => {
        console.log(params);
    }
    return (
        <Container>
            <ParamEditor title="Query Param" params={[]} type="Query" onParamsChange={handleParamChange}/>
        </Container>
    );
};
