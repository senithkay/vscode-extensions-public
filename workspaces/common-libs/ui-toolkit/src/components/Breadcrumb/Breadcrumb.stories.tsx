import React from "react";
import { ComponentStory } from "@storybook/react";
import Breadcrumbs, { BreadcrumbProps } from "./Breadcrumb";
import { Codicon } from "../Codicon/Codicon";

const Template: ComponentStory<typeof Breadcrumbs> = (args: BreadcrumbProps) => (
    <Breadcrumbs {...args}>
        <div key={1}>Home</div>
        <div key={2}>Products</div>
        <div key={3}>Category</div>
        <div key={4}>Sub Category</div>
        <div key={5}>Product</div>
    </Breadcrumbs>
);

export const Default = Template.bind();
Default.args = {
    maxItems: 3,
    separator: <Codicon name="chevron-right" />,
};

export default { component: Breadcrumbs, title: "Breadcrumb" };
