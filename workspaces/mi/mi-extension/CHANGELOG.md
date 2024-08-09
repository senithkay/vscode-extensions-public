# Change Log

All notable changes to the "micro-integrator" extension will be documented in this file.

## [1.0.4] - 2024-08-09

### Fixes

- Fixed: Update artifact.xml file when the name is changed of an artifact in the registry ([#132](https://github.com/wso2/mi-vscode/issues/132))  
- Fixed: Connector operations don't show config key or connection name ([#186](https://github.com/wso2/mi-vscode/issues/186))  
- Fixed: Expression editor is not shown HTTP Endpoint Auth configs ([#200](https://github.com/wso2/mi-vscode/issues/200))  
- Fixed: Fast XSLT mediator dropdown not displaying XSLT and XSL registry resources ([#297](https://github.com/wso2/mi-vscode/issues/297))  
- Fixed: Empty form generated when trying to add parameters to a sql statement in the DB Report mediator ([#301](https://github.com/wso2/mi-vscode/issues/301))  
- Fixed: DB Report mediator form fields `Connection DB Type` and  `Database Configuration` resets when trying to edit the form ([#303](https://github.com/wso2/mi-vscode/issues/303))  
- Fixed: Nodes disappears while filtering ([#304](https://github.com/wso2/mi-vscode/issues/304))  
- Fixed: You can add an `XSLT mediator` without specifying a schema key for the required `XSLT Schema Key field`. ([#314](https://github.com/wso2/mi-vscode/issues/314))  
- Fixed: For the `Inline` payload format, changing the `Media Type` does not update the placeholder in the payload field. ([#315](https://github.com/wso2/mi-vscode/issues/315))  
- Fixed: Adding wrong inline endpoint definition, doesn't allow to edit the `Call` mediator. ([#319](https://github.com/wso2/mi-vscode/issues/319))  
- Fixed: Adding an incorrect element for the inline definition of Call mediator cause unexpected behaviour.  ([#322](https://github.com/wso2/mi-vscode/issues/322))  
- Fixed: Clicking on Dblookup Mediator in Design View results in UI Crash ([#331](https://github.com/wso2/mi-vscode/issues/331))  
### Improvements

- Improved: Input Schema is not populated in the Data Mapper for CSV payload ([#177](https://github.com/wso2/mi-vscode/issues/177))  
- Improved: Instead of a placeholder, a predefined value is present in the form for adding case branches in the Switch mediator ([#202](https://github.com/wso2/mi-vscode/issues/202))  
- Improved: Improvement needed for datamapper search feature ([#225](https://github.com/wso2/mi-vscode/issues/225))  
- Improved: Improve Inbound and Connector form generator to support conditional rendering ([#236](https://github.com/wso2/mi-vscode/issues/236))  
- Improved: Improve Inbound and Connector form generator to support conditional rendering ([#236](https://github.com/wso2/mi-vscode/issues/236))  
- Improved: Add option to define custom parameter for Inbound and Connectors ([#298](https://github.com/wso2/mi-vscode/issues/298))  
- Improved: Improve the form generator of the inbound endpoints ([#305](https://github.com/wso2/mi-vscode/issues/305))  
- Improved: In the `Call` mediator, the `Select Endpoint` dropdown does not require a button to indicate an expression (`Ex`). ([#316](https://github.com/wso2/mi-vscode/issues/316))  
- Improved: Improve sequence creation UX of inbound Endpoint creation form ([#326](https://github.com/wso2/mi-vscode/issues/326))  
- Improved: Show download progress of inbound endpoint connectors ([#329](https://github.com/wso2/mi-vscode/issues/329))  

## [1.0.3] - 2024-08-01

### Fixes

- Fixed: <implementation> tag is added in cache mediator when "Max Entry Count" is empty ([#241](https://github.com/wso2/mi-vscode/issues/241))  
- Fixed: Adding a namespace for `Fast Xslt Dynamic SchemaKey` in `Fast XSLT` Mediator doesn't get saved.  ([#289](https://github.com/wso2/mi-vscode/issues/289))  
- Fixed: Cache mediator form generate invalid xml when editing ([#296](https://github.com/wso2/mi-vscode/issues/296))  

## [1.0.2] - 2024-07-31

### Fixes

- Fixed: Issue with trigger count of a scheduled task ([#110](https://github.com/wso2/mi-vscode/issues/110))  
- Fixed: Task form view mandate count parameter ([#170](https://github.com/wso2/mi-vscode/issues/170))  
- Fixed: Cannot delete cases of the switch case mediator ([#201](https://github.com/wso2/mi-vscode/issues/201))  
- Fixed: Cannot delete target from clone mediator ([#232](https://github.com/wso2/mi-vscode/issues/232))  
- Fixed: Drop mediator's description field is now mandatory in v1.0.0 ([#237](https://github.com/wso2/mi-vscode/issues/237))  
- Fixed: Typo in Local Entry creation form ([#243](https://github.com/wso2/mi-vscode/issues/243))  
- Fixed: New call endpoint creation form doesn't provide inline endpoint option ([#248](https://github.com/wso2/mi-vscode/issues/248))  
- Fixed: Connections associated with method calls are not rendered in Data Mapper ([#253](https://github.com/wso2/mi-vscode/issues/253))  
- Fixed: New inbound creation not shown when an inbound form is opened ([#254](https://github.com/wso2/mi-vscode/issues/254))  
- Fixed: Parameters are messed in Inbound endpoints ([#255](https://github.com/wso2/mi-vscode/issues/255))  
- Fixed: Inbound Endpoint hidden attributes are missing in source XML ([#264](https://github.com/wso2/mi-vscode/issues/264))  
### Improvements

Improved: Not possible to provide a description for the Aggregate mediator ([#174](https://github.com/wso2/mi-vscode/issues/174))  

## [1.0.1] - 2024-07-26

- Fixed inbound endpoint editing 
- Other minor bug fixes

## [1.0.0]

- Initial release
