import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";

import model1 from "./1-start.json";

export default {
    title: "Eggplant/Component Diagram",
    component: Diagram,
} as Meta;

const Template: Story<DiagramProps> = (args: React.JSX.IntrinsicAttributes & DiagramProps) => <Diagram {...args} />;

export const Empty = Template.bind({});
Empty.args = {
    project: { name: "", entryPoints: [], connections: [] },
};

export const Start = Template.bind({});
Start.args = {
    project: model1,
};
