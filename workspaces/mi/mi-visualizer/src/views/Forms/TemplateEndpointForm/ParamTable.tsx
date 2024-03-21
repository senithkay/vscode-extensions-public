/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { TextField, Codicon } from "@wso2-enterprise/ui-toolkit";

const Row = styled.div({
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 0.2fr',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
}, (props: any) => ({
    paddingTop: 3,
    paddingBottom: props["is-last"] ? 0 : 5,
    borderBottom: props["is-last"] ? 0 : "1px solid #e0e0e0",
}));

const HeadingRow = styled(Row)`
    padding: 10px 0;
    border-bottom: 1px solid #e0e0e0;
`;

const Table = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10;
    padding: 15px 30px;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    margin-top: 20px;
`;

const CenteredSpan = styled.span`
    text-align: center;
`;

const CustomLabel = styled.p`
    margin: 10px 0;
`;

const ParamsTable = ({ params, setParams }: any) => {
    const handleParamChange = (index: number, field: string, value: string) => {
        const newParams = [...params];
        newParams[index] = { ...newParams[index], [field]: value };
        setParams(newParams);
    }

    const handleParamDelete = (index: number) => {
        const newParams = [...params];
        newParams.splice(index, 1);
        setParams(newParams);
    }

    return (
        <Table>
            <HeadingRow>
                <CenteredSpan>Name</CenteredSpan>
                <CenteredSpan>Value</CenteredSpan>
                <CenteredSpan>Remove</CenteredSpan>
            </HeadingRow>
            {params.length > 0 ? params.map((param: any, index: number) => (
                <Row
                    is-last={index === params.length - 1}
                >
                    <TextField
                        id='param-name'
                        value={param.name}
                        placeholder="Param name"
                        onChange={(text: string) => handleParamChange(index, "name", text)}
                    />
                    <TextField
                        id='param-value'
                        value={param.value}
                        placeholder="Param value"
                        onChange={(text: string) => handleParamChange(index, "value", text)}
                    />
                    <Codicon iconSx={{ fontSize: 18, mx: 'auto' }} name='trash' onClick={() => handleParamDelete(index)} />
                </Row>
            )) : (
                <CustomLabel>No Params to display</CustomLabel>
            )}
        </Table>
    )
}

export default ParamsTable;
