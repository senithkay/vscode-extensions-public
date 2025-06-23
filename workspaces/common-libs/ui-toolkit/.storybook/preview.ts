/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light Theme' },
          { value: 'dark', title: 'Dark Theme' }
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      // Remove any existing theme style
      const id = 'vscode-theme-style';
      const existing = document.getElementById(id);
      if (existing) existing.remove();
      // Add the correct theme CSS
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = context.globals.theme === 'dark'
        ? '/.storybook/darkTheme.css'
        : '/.storybook/lightTheme.css';
      document.head.appendChild(link);
      return Story();
    }
  ],
};

export default preview;
