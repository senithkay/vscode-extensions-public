/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import { ConnectorForm } from "../ConnectorConfigWizard/Components/ConnectorForm";

import { APIConfigForm } from "./APIConfigForm";
import { ConditionConfigForm } from "./ConditionConfigForms";
import { ConfigurableForm } from "./ConfigurableForm";
import { ConnectorInitForm } from "./ConnectorInitForm";
import { ConnectorList } from "./ConnectorList";
import { ConstantConfigForm } from "./ConstantConfigForm";
import { EndConfigForm } from "./EndConfigForms";
import { EndpointList } from "./EndpointList";
import { FunctionConfigForm } from './FunctionConfigForm';
import { ListenerConfigForm } from "./ListenerConfigForm";
import { ModuleDeclForm } from './ModuleVariableForm';
import { ProcessConfigForm } from "./ProcessConfigForms";
import { RecordEditor } from "./RecordEditor";
import { ApiConfigureWizard } from "./ResourceConfigForm/ApiConfigureWizard";
import { ServiceConfigForm } from './ServiceConfigForm';
import {TriggerForm} from "./TriggerConfigForm/TriggerServiceConfigForm";
import { TriggerList } from "./TriggerList";
import { TypeDefinitionConfigForm } from "./TypeDefinitionConfigForm";


export { APIConfigForm as apiConfig };
export { ConnectorInitForm as connectorInit };
export { ConditionConfigForm as If };
export { ConditionConfigForm as ForEach };
export { ConditionConfigForm as While };
export { ProcessConfigForm as Variable };
export { ProcessConfigForm as AssignmentStatement };
export { ProcessConfigForm as Log };
export { ConnectorList as ConnectorList };
export { ConnectorForm as Connector };
export { EndpointList as EndpointList };
export { ProcessConfigForm as Custom };
export { ProcessConfigForm as DataMapper };
export { EndConfigForm as Return };
export { EndConfigForm as Respond };
export { ServiceConfigForm as ServiceDeclaration };
export { FunctionConfigForm as FunctionDefinition };
export { RecordEditor as RecordEditor };
export { ApiConfigureWizard as ResourceAccessorDefinition}
export { ModuleDeclForm as ModuleVarDecl };
export { ConfigurableForm as Configurable };
export { ListenerConfigForm as ListenerDeclaration };
export { ConstantConfigForm as ConstDeclaration }
export { TypeDefinitionConfigForm as TypeDefinition };
export { TriggerList as TriggerList };
export {TriggerForm as TriggerForm};