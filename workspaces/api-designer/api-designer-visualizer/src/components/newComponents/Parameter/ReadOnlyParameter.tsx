/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { Parameter } from '../../../Definitions/ServiceDefinitions';
import { resolveTypeFormSchema } from '../../Utils/OpenAPIUtils';

interface ReadOnlyParameterProps {
    parameter: Parameter;
}

const ParamContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const ParamWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

export function ReadOnlyParameter(props: ReadOnlyParameterProps) {
    const { parameter } = props;

    return (
        <ParamContainer>
            <ParamWrapper>
                <Typography sx={{ margin: 0 }} variant='body2'> {parameter.name} </Typography>
                <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {`${resolveTypeFormSchema(parameter.schema)} ${parameter.schema.format ? `<${parameter.schema.format}>` : ""}`} </Typography>
            </ParamWrapper>
            <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'> {parameter.description} </Typography>
        </ParamContainer>
    )
}
