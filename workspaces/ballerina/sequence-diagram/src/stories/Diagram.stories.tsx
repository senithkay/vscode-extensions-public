import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";

import basicModel from "./basic.json";

export default {
    title: "Example/Diagram",
    component: Diagram,
} as Meta;

const Template: Story<DiagramProps> = (args: React.JSX.IntrinsicAttributes & DiagramProps) => <Diagram {...args} />;

export const Empty = Template.bind({});
Empty.args = {
    model: {
        participants: [],
        location: {
            fileName: "empty.bal",
            startLine: { line: 0, offset: 0 },
            endLine: { line: 0, offset: 0 },
        },
    },
};

export const Basic = Template.bind({});
Basic.args = {
    model: basicModel,
};
