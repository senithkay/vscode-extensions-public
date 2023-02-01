# The Ballerina Extension for Visual Studio Code

The Visual Studio Code Ballerina extension provides a set of rich language features along with an enhanced user experience. 

It offers easy development, execution, debugging, and testing for the Ballerina programming language. 
The Ballerina language possesses a bidirectional mapping between its syntaxes and the visual representation. 
You can visualize the graphical representation of your Ballerina source further via the extension.

## Quick Start

Follow the steps below to get the Ballerina VS Code extension up and running.

<img src="https://github.com/wso2/ballerina-plugin-vscode/blob/main/resources/images/running-your-program.gif?raw=true" width="100%" />

>**Info:** Before getting started, download and install the [Visual Studio Code editor ](https://code.visualstudio.com/download) version >= 1.67 and [Ballerina](https://ballerina.io/learn/installing-ballerina/setting-up-ballerina/).

1. Click `Ctrl + P` or (`Cmd + P` in macOS) to launch the VS Code **Quick Open** screen, and enter `ext install WSO2.ballerina` to install the Ballerina VS Code Extension.

2. Click **View** in the menu bar of the editor, and click **Command Palette**.

  >**Tip:** You can use the shortcut methods `⌘ + ↑ + P` on Mac and `Ctrl + Shift + P` on Windows and Linux.

3. In the search bar, type `Show Examples`, and click **Ballerina: Show Examples**.

4. Select the **Hello World Main** example.

5. Click on the **Run** CodeLens on the editor. 

    You just ran your first Ballerina program with a few clicks.

    >**Tip:** If you wish to debug further, you can either use the **Debug** code lens or see debugging guidelines below.

6. Click the **Show Diagram** button on the editor’s title bar to view the graphical representation of the program.

## Functionalities

The main functionalities of the extension are listed below.

### Edit Ballerina code

You can use the features below to edit Ballerina code via the source code view.

- IntelliSense
- Code formatting
- Diagnostics
- Debugging
- Code navigation
- Code actions
- CodeLens
- Commands

### Visual programming

<img src="https://github.com/wso2/ballerina-plugin-vscode/blob/main/resources/images/low-code-view.gif?raw=true" width="100%" />

Ballerina allows you to visualize a program written in Ballerina as a graphical representation via the features below. This displays the logic and network interaction of a function or a service resource, making it easy to understand the source. 

- Sequence Diagram view
- Project Design view
- Data Mapper

### Ballerina Notebooks

Ballerina notebooks can be created in VS Code using the `.balnotebook` extension for the filename. Markdown and Ballerina code snippets are supported by Ballerina notebook cells.

>**Info:** Make sure your VS Code version is `1.67.0` or higher when using Ballerina notebook.

- Code execution
- IntelliSense
- Code Completion
- Variable view
- Debugging

## Configurations

For configurations of the extension, see [Configure the extension](https://wso2.com/ballerina/vscode/docs/configure-the-extension/).

## Troubleshooting

For troubleshooting, see the Ballerina output. To view the Ballerina output tab, click **View**, click **Output,** and select **Ballerina** from the output list. It provides additional information if the plugin fails to detect a Ballerina distribution.  

You can also enable [debug logs](https://wso2.com/ballerina/vscode/docs/debug-the-code/#configuration-attributes) from the Ballerina extension settings to view any issues arising from the extension features.

## Documentation

The [Ballerina VS Code Extension Documentation](https://wso2.com/ballerina/vscode/docs/) describes the functionalities of this extension in detail.

## Ask for Help

Create [Github issues](https://github.com/wso2/ballerina-plugin-vscode/issues) to reach out to us.

## License

By downloading and using the Visual Studio Code Ballerina extension, you agree to the [license terms](https://wso2.com/licenses/ballerina-vscode-plugin-2021-05-25/) and [privacy statement](https://wso2.com/privacy-policy).

The VS Code Ballerina extension uses the following components, which are licensed separately.

- It runs with the support of the Ballerina Language Server, which is a part of the Ballerina language distribution. The [Ballerina language](https://ballerina.io/) is an open-source software that comes under the [Apache License](https://www.apache.org/licenses/LICENSE-2.0).
- It is structured as an extension pack along with the [TOML Language Support](https://marketplace.visualstudio.com/items?itemName=be5invis.toml) extension.
