# Change Log

## **3.3.0**
#### Added
- Visual Data Mapper - Helps you write and visualize data transformations easily
- GraphQL Tryit - Facilitates  trying out the GraphQL services with the integrated client
- Project Design View (Experimental) - Allows you to visualize service interactions in your project

> **Info:** For more information, see the [release note](https://github.com/wso2/ballerina-plugin-vscode/blob/main/docs/release-notes/3.3.0-release-note.md).

    ### **3.3.5**
    
    #### Fixed
    - Broken links in readme [335] (https://github.com/wso2/ballerina-plugin-vscode/issues/335)

    ### **3.3.4**
    #### Improved
    - Data Mapper - Display banner if DM function contains unsupported input/output types [217] (https://github.com/wso2/ballerina-plugin-vscode/issues/217)
    - Data Mapper - Improve the transformer name suggestion by providing an non-existing name  [218] (https://github.com/wso2/ballerina-plugin-vscode/issues/218)
    - Data Mapper - Add support to have types from imported packages as inputs and output [219] (https://github.com/wso2/ballerina-plugin-vscode/issues/219)
    - Data Mapper - Add support for mapping with query expressions for primitive type arrays [232] (https://github.com/wso2/ballerina-plugin-vscode/issues/232)
    - Data Mapper - Automatically show the data mapper config panel if the input or output types are not supported [244] (https://github.com/wso2/ballerina-plugin-vscode/issues/244)

    #### Fixed
    - Data Mapper - Failed to create mapping for a port that is already mapped with multiple ports [230] (https://github.com/wso2/ballerina-plugin-vscode/issues/230)
    - Data Mapper - output type name is misaligned when the output node is collapsed [235] (https://github.com/wso2/ballerina-plugin-vscode/issues/235)
    - Data Mapper - incorrect source is generated when map root of the input record within query expression [237] (https://github.com/wso2/ballerina-plugin-vscode/issues/237)
    - Data Mapper - UI shows a valid transform function as invalid [239] (https://github.com/wso2/ballerina-plugin-vscode/issues/239)
    - Data Mapper - Links are not getting rendered for multi input mappings contains root level references [240] (https://github.com/wso2/ballerina-plugin-vscode/issues/240)
    - Data Mapper - Generates invalid source when there is an invalid expression body [242] (https://github.com/wso2/ballerina-plugin-vscode/issues/242)
    - Oops embarassing error when trying to edit a ModuleVarDecl without initialization [285] (https://github.com/wso2/ballerina-plugin-vscode/issues/285)
    - Data Mapper - Output type disappears when creating data mapping function [293] (https://github.com/wso2/ballerina-plugin-vscode/issues/293)
    - Data Mapper - Data Mapper puts auto-gen input param name as Type Name [329] (https://github.com/wso2/ballerina-plugin-vscode/issues/329)

    ### **3.3.3**
    #### Fixed
    - Diagrams not loading with VSCode v1.73 issue.

    ### **3.3.2**
    #### Improved
    - The low-code diagram editor

    ### **3.3.1**
    #### Fixed
    - Try it button not working for services with comments issue.

    #### Improved
    - Improved record editor - Provides a better editing experience with suggestions

## **3.2.0**
#### Improved
- New performance analyzer introduced. This will help users to identify the performance of the multiple execution paths of the code.

## **3.1.0**
#### Added
- Ballerina Notebook. [#183](https://github.com/wso2/ballerina-plugin-vscode/issues/183)

#### Improved
- The low-code diagram editor - New statement editor introduced.

    - Statement-editor allows users to easily discover Ballerina libraries and use predefined expression templates along with the context based suggestions to build statements even without having a prior knowledge on Ballerina syntaxes.

#### Fixed
- Swagger client send an invalid Content type header.

## **3.0.0**
#### Added
- The `Ballerina Low-Code` activity. [#118](https://github.com/wso2/ballerina-plugin-vscode/issues/118)
- [WSO2 Choreo](https://wso2.com/choreo/) integration.
- Graphical editing capability.
- The `Diagram Explorer` view.
- The Ballerina testing activity. [#119](https://github.com/wso2/ballerina-plugin-vscode/issues/119) 
- The readonly editor for Ballerina library source. [#97](https://github.com/wso2/ballerina-plugin-vscode/issues/97)
- Ballerina semantic highlighting support. [#105](https://github.com/wso2/ballerina-plugin-vscode/issues/105)
- The Swagger try out view. [#130](https://github.com/wso2/ballerina-plugin-vscode/issues/130)
- The Ballerina configurable editor.
- AI driven real-time performance forecasting.

#### Improved
- Dynamic Language Server capability registration. [#91](https://github.com/wso2/ballerina-plugin-vscode/issues/91)
- The Language Server client version. [#109](https://github.com/wso2/ballerina-plugin-vscode/issues/109)
- Diagram and source parallel editing capability.

#### Fixed
- Ballerina syntax highlighting. [#120](https://github.com/wso2/ballerina-plugin-vscode/issues/120) [#121](https://github.com/wso2/ballerina-plugin-vscode/issues/121) [#122](https://github.com/wso2/ballerina-plugin-vscode/issues/122) [#123](https://github.com/wso2/ballerina-plugin-vscode/issues/123) [#126](https://github.com/wso2/ballerina-plugin-vscode/issues/126) [#128](https://github.com/wso2/ballerina-plugin-vscode/issues/128) [#129](https://github.com/wso2/ballerina-plugin-vscode/issues/129)

    ### **3.0.2**
    #### Improved
    - The low-code diagram editor.

    #### Fixed
    - Swagger View. [#416](https://github.com/wso2/ballerina-plugin-vscode/issues/197)

    ### **3.0.1**
    #### Added
    - A palette command that creates the distribution format of the Ballerina package. [#180](https://github.com/wso2/ballerina-plugin-vscode/issues/180)

    #### Improved
    - The low-code diagram editor. [#186](https://github.com/wso2/ballerina-plugin-vscode/issues/186)
    - Executor options. [#168](https://github.com/wso2/ballerina-plugin-vscode/issues/168)

    #### Fixed
    - Ballerina syntax highlighting. [#170](https://github.com/wso2/ballerina-plugin-vscode/issues/170) [#184](https://github.com/wso2/ballerina-plugin-vscode/issues/184) [#185](https://github.com/wso2/ballerina-plugin-vscode/issues/185) [#188](https://github.com/wso2/ballerina-plugin-vscode/issues/188) [#190](https://github.com/wso2/ballerina-plugin-vscode/issues/190) [#191](https://github.com/wso2/ballerina-plugin-vscode/issues/191)
    - Diagram editor reflection on paste, undo, redo, etc. operations. [#151](https://github.com/wso2/ballerina-plugin-vscode/issues/151)
    - Choreo login error at startup. [#189](https://github.com/wso2/ballerina-plugin-vscode/issues/189)

## **2.1.0**
#### Added
- A palette command that converts a JSON to a Ballerina record. [#94](https://github.com/wso2/ballerina-plugin-vscode/issues/94)

#### Improved
- The *vscode-languageclient* and other dependency versions. [#43](https://github.com/wso2/ballerina-plugin-vscode/issues/43)

#### Fixed
- Positioning on the examples view. [#87](https://github.com/wso2/ballerina-plugin-vscode/issues/87)

    ### **2.1.1**

    #### Improved
    - Ballerina syntax highlighting via TextMate grammar. [#105](https://github.com/wso2/ballerina-plugin-vscode/issues/105)

    #### Fixed
    - Language Server's extended API compatibility with previous Ballerina runtimes. [#108](https://github.com/wso2/ballerina-plugin-vscode/issues/108)
    - Language Server client deactivation. [#110](https://github.com/wso2/ballerina-plugin-vscode/issues/110)

## **2.0.0**
- Initial release.
