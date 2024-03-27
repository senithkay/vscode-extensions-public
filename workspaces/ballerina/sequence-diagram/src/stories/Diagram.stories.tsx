import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";

import basicModel from "./basic.json";

export default {
    title: "Example/Diagram",
    component: Diagram,
} as Meta;

const Template: Story<DiagramProps> = (
    args: React.JSX.IntrinsicAttributes & DiagramProps,
) => <Diagram {...args} />;

export const Empty = Template.bind({});
Empty.args = {
    model: { name: "", nodes: [], clients: [] },
};

export const Basic = Template.bind({});
Basic.args = {
    model: basicModel,
};
