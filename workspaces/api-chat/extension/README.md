# WSO2 APIChat VSCode Extension

The APIChat VS Code extension is a powerful tool that allows you to test APIs with OpenAPI descriptions using natural language and AI support. Whether you want to test all resources of an API, a single resource, an action involving multiple resources, or simply test by typing commands in natural language, APIChat has you covered.

## Features

- **Test with Natural Language:** Simply type commands in natural language to interact with your API.

## Getting Started

Follow these steps to set up and start using the APIChat VS Code extension:

### Prerequisites

Before you begin, make sure you have the following prerequisites installed on your system:

1. [Visual Studio Code](https://code.visualstudio.com/download)
2. [APIChat VS Code Extension](https://marketplace.visualstudio.com/items?itemName=WSO2.api-chat) version 1.0.0 or later.

### Installation

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window.
3. Search for "WSO2 APIChat" in the Extensions view search box.
4. Click the Install button for the APIChat extension.
5. Wait for the extension to be installed and activated.

### Usage

To get started with the APIChat VS Code extension, follow these steps:

1. Open a Visual Studio Code workspace.

2. Open an OpenAPI YAML file in Visual Studio Code.

3. Click the `Open Test Console` button to open the APIChat Test Console.
![Open Test Console](docs/test-gpt-extension/images/open-test-console.png)

Now, you are ready to use APIChat for testing your API using natural language and AI support. Here are some common use cases:

#### Test by using already available commands

1. With the Test Console open, use any of the available commands in Test Console to test the API.
![Test Using Available Commands](docs/test-gpt-extension/images/test-using-available-commands.gif)

#### Test by Typing a Command in Natural Language

1. With the Test Console open, simply type your command in natural language, and APIChat will understand and execute it.
![Command In Natural Language](docs/test-gpt-extension/images/command-with-natural-lang.gif)

#### Test with Authentication
1. Authenticate using one of the following authentication types:

   - **Basic Authorization:** This method uses a username and password for authentication.
   - **Authorization Bearer:** Authenticate using an authorization bearer token.
   - **API Key:** Provide an API key for authentication.
   ![Authentication](docs/test-gpt-extension/images/authentication.gif)

## Feedback and Support

We welcome your feedback and suggestions for improving the APIChat VS Code extension. If you encounter any issues or have questions, please [create a GitHub issue](https://github.com/wso2/choreo-vscode/issues) to reach out to us.

Happy testing with APIChat!
