import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";

import modelS1 from "./s1-currency-convert.json";

export default {
    title: "Eggplant/Samples",
    component: Diagram,
} as Meta;

const Template: Story<DiagramProps> = (args: React.JSX.IntrinsicAttributes & DiagramProps) => <Diagram {...args} />;


export const Currency = Template.bind({});
Currency.args = {
    model: modelS1,
};
