import React from "react";
import { ComponentTypeCard } from './ComponentTypeCard';
import styled from "@emotion/styled";
const CardContainer = styled.div `
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
`;
export const ConfigCardList = (props) => (React.createElement(CardContainer, null, props.items.map((item) => (React.createElement(ComponentTypeCard, Object.assign({}, item, { formKey: props.formKey, formData: props.formData, onFormDataChange: props.onFormDataChange }))))));
//# sourceMappingURL=ConfigCardList.js.map