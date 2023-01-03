import { createTheme, ThemeProvider  } from "@material-ui/core";

import theme from "../src/stories/theme.json"

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const decorators = [
  (Story) => (
    <ThemeProvider theme={createTheme(theme)} >
      <Story />
    </ThemeProvider>
  )
];
