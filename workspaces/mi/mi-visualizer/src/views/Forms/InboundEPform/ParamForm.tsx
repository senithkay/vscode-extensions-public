/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import { FormGroup } from '@wso2-enterprise/ui-toolkit';
import ParamField, { getParameterName } from './InboundParamField';

const Container = styled.div({
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
});

const ParamForm = ({ params }: any) => {
    return (
        <Container>
            {Object.keys(params).map((group: string) => (
                <FormGroup
                    key={group}
                    title={getParameterName(group)}
                    isCollapsed={group !== "basic"}
                >
                    {Object.keys(params[group]).map((prop: string) => (
                        <ParamField
                            key={prop}
                            id={prop}
                            field={params[group][prop]}
                        />
                    ))}
                </FormGroup>
            ))}
        </Container>
    );
}

export default ParamForm;
