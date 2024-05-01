import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";

import sampleOneModel from "./sample-1.json";
import sampleTwoModel from "./sample-2.json";

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

export const Sample1 = Template.bind({});
Sample1.args = {
    model: sampleOneModel,
};

export const Sample2 = Template.bind({});
Sample2.args = {
    model: sampleTwoModel,
};
