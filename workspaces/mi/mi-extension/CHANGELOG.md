# Change Log

All notable changes to the "micro-integrator" extension will be documented in this file.

## [1.1.0] - 2024-09-06

### New Features

- Added: Add feature to import CAPP to vscode workspace ([#113](https://github.com/wso2/mi-vscode/issues/113))  
- Added: Implement AI Data Mapping for MI Extension Data Mapper Mediator ([#377](https://github.com/wso2/mi-vscode/issues/377))  
### Fixes

- Fixed: Getting Started Sample Icons are not rendered properly ([#119](https://github.com/wso2/mi-vscode/issues/119))  
- Fixed: Update artifact.xml file when the name is changed of an artifact in the registry ([#132](https://github.com/wso2/mi-vscode/issues/132))  
- Fixed: Change Input Schema window not opened in the Data Mapper for CSV ([#175](https://github.com/wso2/mi-vscode/issues/175))  
- Fixed: Connector operations don't show config key or connection name ([#186](https://github.com/wso2/mi-vscode/issues/186))  
- Fixed: In a nested switch case mediator we can't add mediators to the first case.  ([#196](https://github.com/wso2/mi-vscode/issues/196))  
- Fixed: Expression editor is not shown HTTP Endpoint Auth configs ([#200](https://github.com/wso2/mi-vscode/issues/200))  
- Fixed: Modifying the local entry, originally configured using a `source URL entry`, gets converted to an `inline XML entry`. ([#242](https://github.com/wso2/mi-vscode/issues/242))  
- Fixed: New mediator got added in wrong place in nested switch mediator ([#247](https://github.com/wso2/mi-vscode/issues/247))  
- Fixed: Provider URL with tcp not accepted when creating JMS message store ([#263](https://github.com/wso2/mi-vscode/issues/263))  
- Fixed: Edit form for message stores doesn't work properly when there are invalid values in the synapse code ([#275](https://github.com/wso2/mi-vscode/issues/275))  
- Fixed: JMS API Version field in the Message store edit form doesn't retain value previously selected ([#276](https://github.com/wso2/mi-vscode/issues/276))  
- Fixed: Typo in WSDL Resources section in Edit Proxy form ([#277](https://github.com/wso2/mi-vscode/issues/277))  
- Fixed: The placeholders in the additional properties section in an endpoint creation form needs to be manually deleted ([#286](https://github.com/wso2/mi-vscode/issues/286))  
- Fixed: Fast XSLT mediator dropdown not displaying XSLT and XSL registry resources ([#297](https://github.com/wso2/mi-vscode/issues/297))  
- Fixed: Empty form generated when trying to add parameters to a sql statement in the DB Report mediator ([#301](https://github.com/wso2/mi-vscode/issues/301))  
- Fixed: Possible to create a DB Report mediator with no statement  ([#302](https://github.com/wso2/mi-vscode/issues/302))  
- Fixed: Possible to create a DB Report mediator with no statement  ([#302](https://github.com/wso2/mi-vscode/issues/302))  
- Fixed: DB Report mediator form fields `Connection DB Type` and  `Database Configuration` resets when trying to edit the form ([#303](https://github.com/wso2/mi-vscode/issues/303))  
- Fixed: Nodes disappears while filtering ([#304](https://github.com/wso2/mi-vscode/issues/304))  
- Fixed: Nodes disappears while filtering ([#304](https://github.com/wso2/mi-vscode/issues/304))  
- Fixed: Fast clearing search term in FilterBox cause to broken links ([#312](https://github.com/wso2/mi-vscode/issues/312))  
- Fixed: You can add an `XSLT mediator` without specifying a schema key for the required `XSLT Schema Key field`. ([#314](https://github.com/wso2/mi-vscode/issues/314))  
- Fixed: For the `Inline` payload format, changing the `Media Type` does not update the placeholder in the payload field. ([#315](https://github.com/wso2/mi-vscode/issues/315))  
- Fixed: When adding arguments to a `Payload Factory` mediator, the `Evaluator` field is only needed if the value is an expression. ([#317](https://github.com/wso2/mi-vscode/issues/317))  
- Fixed: Adding wrong inline endpoint definition, doesn't allow to edit the `Call` mediator. ([#319](https://github.com/wso2/mi-vscode/issues/319))  
- Fixed: Adding an incorrect element for the inline definition of Call mediator cause unexpected behaviour.  ([#322](https://github.com/wso2/mi-vscode/issues/322))  
- Fixed: Scheduled message forwarding processor create form doesn't mandate the message store field ([#324](https://github.com/wso2/mi-vscode/issues/324))  
- Fixed: Creating a new Message Store form with ActiveMQ default values gives validation errors. ([#328](https://github.com/wso2/mi-vscode/issues/328))  
- Fixed: Clicking on Dblookup Mediator in Design View results in UI Crash ([#331](https://github.com/wso2/mi-vscode/issues/331))  
- Fixed: Deprecated Mediators available in Mediators pallet.  ([#337](https://github.com/wso2/mi-vscode/issues/337))  
- Fixed: Export option don't build the new CAR file ([#342](https://github.com/wso2/mi-vscode/issues/342))  
- Fixed: In the Enrich mediator, the `Inline Registry Key` dropdown does not display available Local Entries. ([#343](https://github.com/wso2/mi-vscode/issues/343))  
- Fixed: In the Validate mediator, the Schemas dropdown does not display available Local Entries. ([#346](https://github.com/wso2/mi-vscode/issues/346))  
- Fixed: Sequence edit form does not show onError sequences properly ([#348](https://github.com/wso2/mi-vscode/issues/348))  
- Fixed: MI Co-pilot is not recovering from Token errors ([#349](https://github.com/wso2/mi-vscode/issues/349))  
- Fixed: Error occurs when editing submapping in datamapper ([#350](https://github.com/wso2/mi-vscode/issues/350))  
- Fixed: Data Mapper UI is not resize on window resizing ([#351](https://github.com/wso2/mi-vscode/issues/351))  
- Fixed: Should not be possible to create a `Reception List Endpoint` without including any endpoints. ([#353](https://github.com/wso2/mi-vscode/issues/353))  
- Fixed: Cannot uncheck attribute linked as enableCondition in Inbound endpoints ([#354](https://github.com/wso2/mi-vscode/issues/354))  
- Fixed: Mix use of local and global scroll cause to unexpected behaviour ([#355](https://github.com/wso2/mi-vscode/issues/355))  
- Fixed: Global scrolling of the data mapper is not working when no submapping is present ([#356](https://github.com/wso2/mi-vscode/issues/356))  
- Fixed: MI Extension for VS Code Problem with Data Source creation ([#357](https://github.com/wso2/mi-vscode/issues/357))  
- Fixed: [DataMapper] Mapping conditions getting corrupted after initialising an array element  ([#359](https://github.com/wso2/mi-vscode/issues/359))  
- Fixed: Add Artifact has no Option for Data Service ([#360](https://github.com/wso2/mi-vscode/issues/360))  
- Fixed: Invalid XML error in proxy service when parameter is entered before target element ([#362](https://github.com/wso2/mi-vscode/issues/362))  
- Fixed: Migration tool fails when source project lacks expected folders ([#372](https://github.com/wso2/mi-vscode/issues/372))  
- Fixed: Message inject destination sequence is not updated correctly when creating a new scheduled task ([#376](https://github.com/wso2/mi-vscode/issues/376))  
### Improvements

- Improved: Sample projects always opening in a new window ([#94](https://github.com/wso2/mi-vscode/issues/94))  
- Improved: Project name cannot contain special characters ([#115](https://github.com/wso2/mi-vscode/issues/115))  
- Improved: resource created when creating an API has "/resource" as the uri-template ([#164](https://github.com/wso2/mi-vscode/issues/164))  
- Improved: Input Schema is not populated in the Data Mapper for CSV payload ([#177](https://github.com/wso2/mi-vscode/issues/177))  
- Improved: Instead of a placeholder, a predefined value is present in the form for adding case branches in the Switch mediator ([#202](https://github.com/wso2/mi-vscode/issues/202))  
- Improved: Improvement needed for datamapper search feature ([#225](https://github.com/wso2/mi-vscode/issues/225))  
- Improved: Improve Inbound and Connector form generator to support conditional rendering ([#236](https://github.com/wso2/mi-vscode/issues/236))  
- Improved: Improve Inbound and Connector form generator to support conditional rendering ([#236](https://github.com/wso2/mi-vscode/issues/236))  
- Improved: Add option to define custom parameter for Inbound and Connectors ([#298](https://github.com/wso2/mi-vscode/issues/298))  
- Improved: Improve the form generator of the inbound endpoints ([#305](https://github.com/wso2/mi-vscode/issues/305))  
- Improved: In the `Call` mediator, the `Select Endpoint` dropdown does not require a button to indicate an expression (`Ex`). ([#316](https://github.com/wso2/mi-vscode/issues/316))  
- Improved: Support for custom data types in submappings ([#323](https://github.com/wso2/mi-vscode/issues/323))  
- Improved: Improve sequence creation UX of inbound Endpoint creation form ([#326](https://github.com/wso2/mi-vscode/issues/326))  
- Improved: Show download progress of inbound endpoint connectors ([#329](https://github.com/wso2/mi-vscode/issues/329))  
- Improved: Project name creation - Project name cannot contain spaces or special characters   ([#330](https://github.com/wso2/mi-vscode/issues/330))  
- Improved: Added connection's source view is not formatted correctly ([#334](https://github.com/wso2/mi-vscode/issues/334))  
- Improved: Improve diagram reload when update ([#374](https://github.com/wso2/mi-vscode/issues/374))  

## [1.0.5] - 2024-08-20

### Fixes

- Fixed: Update artifact.xml file when the name is changed of an artifact in the registry ([#132](https://github.com/wso2/mi-vscode/issues/132))  
- Fixed: Change Input Schema window not opened in the Data Mapper for CSV ([#175](https://github.com/wso2/mi-vscode/issues/175))  
- Fixed: Connector operations don't show config key or connection name ([#186](https://github.com/wso2/mi-vscode/issues/186))  
- Fixed: Expression editor is not shown HTTP Endpoint Auth configs ([#200](https://github.com/wso2/mi-vscode/issues/200))  
- Fixed: Provider URL with tcp not accepted when creating JMS message store ([#263](https://github.com/wso2/mi-vscode/issues/263))  
- Fixed: Edit form for message stores doesn't work properly when there are invalid values in the synapse code ([#275](https://github.com/wso2/mi-vscode/issues/275))  
- Fixed: Fast XSLT mediator dropdown not displaying XSLT and XSL registry resources ([#297](https://github.com/wso2/mi-vscode/issues/297))  
- Fixed: Empty form generated when trying to add parameters to a sql statement in the DB Report mediator ([#301](https://github.com/wso2/mi-vscode/issues/301))  
- Fixed: DB Report mediator form fields `Connection DB Type` and  `Database Configuration` resets when trying to edit the form ([#303](https://github.com/wso2/mi-vscode/issues/303))  
- Fixed: Nodes disappears while filtering ([#304](https://github.com/wso2/mi-vscode/issues/304))  
- Fixed: Nodes disappears while filtering ([#304](https://github.com/wso2/mi-vscode/issues/304))  
- Fixed: Fast clearing search term in FilterBox cause to broken links ([#312](https://github.com/wso2/mi-vscode/issues/312))  
- Fixed: You can add an `XSLT mediator` without specifying a schema key for the required `XSLT Schema Key field`. ([#314](https://github.com/wso2/mi-vscode/issues/314))  
- Fixed: For the `Inline` payload format, changing the `Media Type` does not update the placeholder in the payload field. ([#315](https://github.com/wso2/mi-vscode/issues/315))  
- Fixed: When adding arguments to a `Payload Factory` mediator, the `Evaluator` field is only needed if the value is an expression. ([#317](https://github.com/wso2/mi-vscode/issues/317))  
- Fixed: Adding wrong inline endpoint definition, doesn't allow to edit the `Call` mediator. ([#319](https://github.com/wso2/mi-vscode/issues/319))  
- Fixed: Adding an incorrect element for the inline definition of Call mediator cause unexpected behaviour.  ([#322](https://github.com/wso2/mi-vscode/issues/322))  
- Fixed: Creating a new Message Store form with ActiveMQ default values gives validation errors. ([#328](https://github.com/wso2/mi-vscode/issues/328))  
- Fixed: Clicking on Dblookup Mediator in Design View results in UI Crash ([#331](https://github.com/wso2/mi-vscode/issues/331))  
- Fixed: In the Enrich mediator, the `Inline Registry Key` dropdown does not display available Local Entries. ([#343](https://github.com/wso2/mi-vscode/issues/343))  
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

## [1.0.4] - 2024-08-09
### Fixes
- Fixed: Salesforcerest Connector: Update view does not display field values after connection creation ([#109](https://github.com/wso2/mi-vscode/issues/109))
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
- Fixed: Cannot uncheck attribute linked as enableCondition in Inbound endpoints ([#354](https://github.com/wso2/mi-vscode/issues/354))
### Improvements

Improved: Not possible to provide a description for the Aggregate mediator ([#174](https://github.com/wso2/mi-vscode/issues/174))  

## [1.0.1] - 2024-07-26

- Fixed inbound endpoint editing 
- Other minor bug fixes

## [1.0.0]

- Initial release
