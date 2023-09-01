import React from "react";
import { ComponentTypeCard, ComponentTypeCardProps } from './ComponentTypeCard'
import { ComponentWizardState } from "./types";
import styled from "@emotion/styled";

const CardContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
`;

export const ConfigCardList = (props: {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (
        updater: (
            prevFormData: Partial<ComponentWizardState>
        ) => Partial<ComponentWizardState>
    ) => void;
    formKey: keyof ComponentWizardState;
    items: Pick<ComponentTypeCardProps, "label" | "description" | "value">[];
}) => (
    <CardContainer>
        {props.items.map((item) => (
            <ComponentTypeCard
                {...item}
                formKey={props.formKey}
                formData={props.formData}
                onFormDataChange={props.onFormDataChange}
            />
        ))}
    </CardContainer>
);