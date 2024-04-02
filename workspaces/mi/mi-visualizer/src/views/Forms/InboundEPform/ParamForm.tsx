/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import ParamField from '../Commons/ParamField';

const Container = styled.div({
    display: "flex",
    flexDirection: "column",
});

const Title = styled.h2({
    marginBottom: "30px",
});

const ParamForm = ({ paramState, parameters, handleOnChange }: any) => {
    const { advance, ...basic } = parameters;

    return (
        <Container>
            {basic && Object.keys(basic).map((key: string) => (
                <ParamField
                    key={key}
                    stateValue={paramState[key] ?? ''}
                    id={key}
                    field={basic[key]}
                    handleOnChange={handleOnChange}
                />
            ))}

            {advance && <>
                <Title>Advance Parameters</Title>
                {Object.keys(advance).map((key: string) => (
                    <ParamField
                        key={key}
                        stateValue={paramState[key] ?? ''}
                        id={key}
                        field={advance[key]}
                        handleOnChange={handleOnChange}
                    />
                ))}
            </>}
        </Container>
    );
}

export default ParamForm;
