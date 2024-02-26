import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";

import basicModel from "./basic.json";
import advancedModel from "./advanced.json";


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
