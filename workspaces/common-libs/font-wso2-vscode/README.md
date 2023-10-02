# @wso2-enterprise/font-wso2-vscode

## Getting Started

### Developer Guide

- To install all the dependencies, including this module, run the following command:
  ```bash
  rush install
- Copy the icons you want to add to the font to the src/icons directory.
- Generate the font files by running the following command from the font-wso2-vscode root directory:
  ```bash
  npm run gen-icons
- To view the generated icons, use the following command:
  ```bash
  npm run start
- Copy the genrated font files in the respective package.

### How use the Font

- If the SVG icon name is `ballerina`, you can use it in your HTML as follows:
  ```html
  <i class="fw-ballerina"></i>
