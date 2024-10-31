# WSO2 VSCode Extensions
This repository contains VSCode extensions developed by WSO2. The repository houses several extensions along with a set of shared libraries.
- [Ballerina] (https://marketplace.visualstudio.com/items?itemName=WSO2.ballerina)
- [Choreo] (https://marketplace.visualstudio.com/items?itemName=WSO2.choreo)

## Prerequisites

Before you can use this repository, you must have the following installed on your system:

- Node.js version 16.3.

- npm version 8.5 .

- pnpm version 7.26 or later. You can install it by running the following command:

    ```bash
    npm install -g pnpm
    ``` 
- Rush.js version 5.89 or later. You can install it by running the following command:

    ```bash
    npm install -g @microsoft/rush
    ```
## Installation

To install the dependencies for this repository, you can run the following command:

```bash
rush install
```

This command will install all the dependencies for all the workspaces in the mono-repo.

## Building the Mono-Repo

To build the entire mono-repo, you can run the following command:

```bash
rush build
```

This command will build all the packages in the mono-repo. The repository is configured to use a local build cache, so only the changed packages will be built.

### Building a Single Workspace

To build a single workspace in the mono-repo, you can run the following command:

```bash
rush build -o <package name>
```

Replace <package name> with the name of the package you want to build.

Example: To build ballerina-low-code-editor, you can run the following command:
```bash
rush build -o @wso2-enterprise/ballerina-low-code-editor
```
### Adding a New Package

To add a new package to the mono-repo, you can use the following command:

```bash
rush add -p <package-name> 
```

Replace <package-name> with the name of the package you want to add. If `-m` argument passed, other packages with this dependency will have their package.json files updated to use the same version of the dependency

## Other Important Commands

- `rush update`: This command updates the dependencies shrinkwrap file in the mono-repo.
- `rush rebuild`: This command cleans the common/temp folder and then runs rush build command.
- `rush check`: This command checks the consistency of the package dependencies, and ensures that all the packages are built with the same version of the dependencies.
- `rush purge`: This command cleans up the temporary files and folders in the mono-repo.

## License

By downloading and using the Visual Studio Code Ballerina extension, you agree to the [license terms](https://wso2.com/licenses/ballerina-vscode-plugin-2021-05-25/) and [privacy statement](https://wso2.com/privacy-policy).

The VS Code Ballerina extension uses the following components, which are licensed separately.

- It runs with the support of the Ballerina Language Server, which is a part of the Ballerina language distribution. The [Ballerina language](https://ballerina.io/) is an open-source software that comes under the [Apache License](https://www.apache.org/licenses/LICENSE-2.0).
- It is structured as an extension pack along with the [TOML Language Support](https://marketplace.visualstudio.com/items?itemName=be5invis.toml) extension.
