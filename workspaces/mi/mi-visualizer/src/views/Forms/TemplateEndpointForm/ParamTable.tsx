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

const Row = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr 0.2fr;
    align-items: center;
    justify-content: center;
    gap: 20;
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
            <Row style={{
                padding: '10px 0',
                borderBottom: "1px solid #e0e0e0",
            }}>
                <span style={{ textAlign: 'center' }}>Name</span>
                <span style={{ textAlign: 'center' }}>Value</span>
                <span style={{ textAlign: 'center' }}>Remove</span>
            </Row>
            {params.length > 0 ? params.map((param: any, index: number) => (
                <Row style={{
                    paddingBottom: (index === params.length - 1) ? 0 : 10,
                    borderBottom: (index === params.length - 1) ? 0 : "1px solid #e0e0e0",
                }}>
                    <TextField
                        id='param-name'
                        value={param.name}
                        placeholder="Param name"
                        onChange={(text: string) => handleParamChange(index, "name", text)}
                        sx={{ marginTop: '-2px' }}
                    />
                    <TextField
                        id='param-value'
                        value={param.value}
                        placeholder="Param value"
                        onChange={(text: string) => handleParamChange(index, "value", text)}
                        sx={{ marginTop: '-2px' }}
                    />
                    <Codicon iconSx={{ fontSize: 18, mx: 'auto' }} name='trash' onClick={() => handleParamDelete(index)} />
                </Row>
            )) : (
                <p style={{
                    margin: "10px 0",
                }}>No Params to display</p>
            )}
        </Table>
    )
}

export default ParamsTable;
