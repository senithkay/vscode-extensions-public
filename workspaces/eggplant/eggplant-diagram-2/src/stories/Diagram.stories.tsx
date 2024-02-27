import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";

import basicModel from "./basic.json";
import advancedModel from "./advanced.json";
import advanced2Model from "./advanced-2.json";
import advanced3Model from "./advanced-3.json";

export default {
    title: "Example/Diagram",
    component: Diagram,
} as Meta;

const Template: Story<DiagramProps> = (args: React.JSX.IntrinsicAttributes & DiagramProps) => <Diagram {...args} />;

export const Basic = Template.bind({});
Basic.args = {
    model: basicModel,
};

export const Advanced = Template.bind({});
Advanced.args = {
    model: advancedModel,
};

export const Advanced2 = Template.bind({});
Advanced2.args = {
    model: advanced2Model,
};

export const Advanced3 = Template.bind({});
Advanced3.args = {
    model: advanced3Model,
};
