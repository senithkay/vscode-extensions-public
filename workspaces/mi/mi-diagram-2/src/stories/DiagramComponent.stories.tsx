import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { DiagramComponent } from '../components/Diagram';

export default {
  title: 'Example/DiagramComponent',
  component: DiagramComponent,
} as Meta;

const Template: Story = (args) => <DiagramComponent {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  // Add your primary args here
};

export const Secondary = Template.bind({});
Secondary.args = {
  // Add your secondary args here
};
