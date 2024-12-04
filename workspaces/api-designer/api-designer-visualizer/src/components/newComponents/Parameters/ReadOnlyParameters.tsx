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
import { Parameter as P, ReferenceObject as R } from '../../../Definitions/ServiceDefinitions';
import { ReadOnlyParameter } from '../Parameter/ReadOnlyParameter';

interface ReadOnlyParameterProps {
    parameters: (P | R)[];
    paramTypes?: string[];
    currentReferences?: R[];
    title?: string;
    type: "query" | "header" | "path" | "cookie";
}
export const ContentTypeWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

function isReferenceObject(obj: (P | R)): obj is R {
    return obj && typeof obj === 'object' && '$ref' in obj;
}

export function ReadOnlyParameters(props: ReadOnlyParameterProps) {
    const { parameters, title, type } = props;

    return (
        <>
            <Typography sx={{ margin: 0 }} variant='h4'> {title} </Typography>
            {parameters?.map((parameter) => {
                if (type === parameter.in || isReferenceObject(parameter)) {
                    if (isReferenceObject(parameter)) {
                        return (
                            <>
                                {/* TODO: Fix me */}
                            </>
                        );
                    } else {
                        return (
                            <>
                                {parameter.in === type && <ReadOnlyParameter parameter={parameter as P} />}
                            </>
                        );
                    }
                }
            })}
        </>
    )
}
