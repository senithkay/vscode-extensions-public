import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";

import model1 from "./1-start.json";
import model2 from "./2-action.json";
import model3 from "./3-if.json";
import model4 from "./4-if-else-body.json";
import model5 from "./5-if-then-body.json";
import model6 from "./6-if-body.json";
import model7 from "./7-if-then-body-draft.json";
import model8 from "./8-comment.json";
import model9 from "./9-suggested.json";

export default {
    title: "Eggplant/Diagram",
    component: Diagram,
} as Meta;

const Template: Story<DiagramProps> = (args: React.JSX.IntrinsicAttributes & DiagramProps) => <Diagram {...args} />;

export const Empty = Template.bind({});
Empty.args = {
    model: { name: "", nodes: [], clients: [] },
};

export const Start = Template.bind({});
Start.args = {
    model: model1,
};

export const Action = Template.bind({});
Action.args = {
    model: model2,
};

export const IfEmpty = Template.bind({});
IfEmpty.args = {
    model: model3,
};

export const IfElseBody = Template.bind({});
IfElseBody.args = {
    model: model4,
};

export const IfThenBody = Template.bind({});
IfThenBody.args = {
    model: model5,
};

export const IfBody = Template.bind({});
IfBody.args = {
    model: model6,
};

export const IfThenBodyDraft = Template.bind({});
IfThenBodyDraft.args = {
    model: model7,
    suggestions: {
        fetching: false,
        onAccept: () => {},
        onDiscard: () => {},
    }
};

export const Comment = Template.bind({});
Comment.args = {
    model: model8,
};

export const Suggested = Template.bind({});
Suggested.args = {
    model: model9,
};
