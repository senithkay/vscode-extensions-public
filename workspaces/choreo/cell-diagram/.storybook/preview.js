import { addDecorator } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

addDecorator(withInfo);
export const decorators = [
    (Story, context) => {
      import('../.storybook/lightTheme.css');
      return <Story />
    }
];
