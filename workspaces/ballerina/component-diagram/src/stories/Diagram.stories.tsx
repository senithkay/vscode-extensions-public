import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";

import model1 from "./1-start.json";
import model2 from "./2-no-cons.json";
import model3 from "./3-no-service.json";

export default {
    title: "Eggplant/Component Diagram",
    component: Diagram,
} as Meta;

const Template: Story<DiagramProps> = (args: React.JSX.IntrinsicAttributes & DiagramProps) => <Diagram {...args} />;

export const Empty = Template.bind({});
Empty.args = {
    project: { name: "", entryPoints: [], connections: [] },
};

export const Sample = Template.bind({});
Sample.args = {
    project: model1,
};

export const NoConnections = Template.bind({});
NoConnections.args = {
    project: model2,
};

export const NoServices = Template.bind({});
NoServices.args = {
    project: model3,
};
