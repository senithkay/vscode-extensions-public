# Choreo Extension

The Choreo VS Code extension provides a range of Choreo project and component management capabilities to enrich the local development experience of Choreo projects. 


## Getting Started

To access the Choreo capabilities of the extension, the users are required to have an active Choreo account to which they can sign in via the Choreo extension. Hence, upon successful activation of the extension, the user will be prompted to sign in to Choreo. Else, the user can do so by clicking on the Choreo icon in the activity bar and selecting the **Sign In** option as seen below.
    ![Sign In](docs/img/sign-in.png)

This will redirect the user to an external URI to complete the authentication process. If the login is successful, all the projects and organizations linked to the user's Choreo account will be visible on the Choreo activity panel as seen below.
    ![Project & Organization Tree View](docs/img/projects-and-orgs.png)

Henceforth, the users will be able to experience the capabilities of the Choreo extension.


## Features

### Choreo Project Management

#### Create a Choreo Project

The Choreo extension provides the capability to create a new Choreo project from VS Code Editor. This can be done by one of the following approaches.
1) Via the `Choreo: Create New Project` command available in the VS Code command palette
![Create New Project Cmd](docs/img/create-project-cmd.gif)

2) Via the Choreo activity panel, by clicking on the plus icon in the project tree view
![Create New Project - TreeView](docs/img/create-project-treeview.png)

This will open up a separate VS Code webview panel to fill in the details of the new Choreo project. The user has to fill in the basic project details and configure a GitHub repository to be used for the project. The user can either choose an existing repository or configure a new one.

Upon filling in the required details and configuring the repository, the user can click on the **Create** button to create the project. Upon successful creation, the user will be redirected to a separate webview containing an overview of the project. Furthermore, this newly created project will also be reflected on the project tree view of the Choreo activity panel.
    ![Project Creation](docs/img/project-creation.gif)


#### Clone Choreo Projects

By cloning a Choreo project, the user can download a copy of the Choreo project to their local development environment. This option is not restricted to projects created only via the Choreo Extension: it is available for all Choreo projects linked to the user's Choreo account.

The user can clone a project by selecting the respective project in the project tree view of the Choreo activity panel. This will open up the Project Overview panel that displays basic project-related details including those of the components. Via this overview, the user can select the **Clone Project** option to get the local copy of the project. If the cloning is successful, the user will automatically be redirected to a new VS Code workspace containing the project.
    ![Project Cloning](docs/img/cloning-project.gif)


If the project selected is one that is already cloned to the local environment, the user will be notified of the same, as seen below. Hence, the user can directly access the project workspace by selecting the **Open Project** option.
    ![Open cloned project](docs/img/open-project.gif)



### Choreo Component Management

#### Create New Components

The Choreo extension also allows users to create new Choreo components from the VS Code Editor. This can be done by one of the following approaches.
1) Via the `Choreo: Create New Component` command available in the VS Code command palette
![Create New Component Cmd](docs/img/create-component-cmd.gif)

2) Via the Project Overview panel, by clicking on the plus icon in the components section
![Create New Component from Overview](docs/img/create-component-from-overview.png)

This will open up a separate VS Code webview panel to fill in the details of the new Choreo component. The user has to fill in the basic component details and configure the GitHub repository. Similar to project creation, the user can either choose an existing repository or configure a new one.

Upon filling in the required details and configuring the repository, the user can click on the **Create** button to create the component. This will generate a basic template for the selected component type and the user will also be able to see the changes reflected under the Components section of the Project Overview panel.
    ![Component Creation](docs/img/component-creation.gif)


Once the changes are committed to the GitHub repository, the users can directly update their Choreo projects using the **Push to Choreo** option. This will update the Choreo project with the latest changes in the GitHub repository.
    ![Push to Choreo](docs/img/push-to-choreo.png)


#### Develop Choreo Components

By successfully cloning the projects, the users can directly access the complete Choreo project and start developing Choreo components. In addition to creating and managing new components as mentioned above, the users will have access to local copies of existing Choreo components using which they can seamlessly work on Choreo projects.


### Visualizing the Architecture of the Ballerina components in Choreo Projects

The Choreo extension links the capability to visualize the architecture of the Ballerina components in Choreo projects. To access this feature, the users will also need to install the [Ballerina Extension](https://marketplace.visualstudio.com/items?itemName=WSO2.ballerina) for the VS Code editor.

Once the Ballerina extension is installed, the users can visualize the architecture of the Ballerina components by selecting the **View Architecture** option in the Project Overview panel. This will open up a separate webview panel containing the architecture of the Ballerina components in the Choreo project. The users can delve into a high-level view of the components in the project, their interactions, and their exposure via the service diagrams and cell diagram.
    ![View Architecture](docs/img/architecture-view.gif)

