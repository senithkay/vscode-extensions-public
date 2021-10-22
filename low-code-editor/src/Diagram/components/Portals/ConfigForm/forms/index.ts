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
import { ConditionConfigForm } from "../../../ConfigForms/ConditionConfigForms";
import { EndConfigForm } from "../../../ConfigForms/EndConfigForms";
import { ListenerConfigForm } from "../../../ConfigForms/ListenerConfigForm";
import { ProcessConfigForm } from "../../../ConfigForms/ProcessConfigForms";
import { RecordEditor } from "../../../ConfigForms/RecordEditor";
import { ApiConfigureWizard } from "../../../ConfigForms/ResourceConfigForm/ApiConfigureWizard";
import { TypeDefinitionConfigForm } from "../../../ConfigForms/TypeDefinitionConfigForm";
import { ConnectorForm } from "../../../ConnectorConfigWizard/Components/ConnectorForm";
import { APIOptions } from "../../Overlay/Elements/PlusHolder/PlusElementOptions/APIOptions";

import { APIConfigForm } from "./APIConfigForm";
import { ConnectorInitForm } from "./ConnectorInitForm";
import { FunctionConfigForm } from './FunctionConfigForm';
import { ScheduleConfigForm } from "./ScheduleConfigForm";
import { ServiceConfigForm } from './ServiceConfigForm';
import { WebhookConfigForm } from "./WebhookConfigForm";

export { WebhookConfigForm as webhookConfig };
export { ScheduleConfigForm as scheduleConfig };
export { APIConfigForm as apiConfig };
export { ConnectorInitForm as connectorInit };
export { ConditionConfigForm as If };
export { ConditionConfigForm as ForEach };
export { ConditionConfigForm as While };
export { ProcessConfigForm as Variable };
export { ProcessConfigForm as Log };
export { APIOptions as ConnectorList };
export { ConnectorForm as Connector };
export { ProcessConfigForm as Custom };
export { ProcessConfigForm as DataMapper };
export { EndConfigForm as Return };
export { EndConfigForm as Respond };
export { ServiceConfigForm as ServiceDeclaration };
export { FunctionConfigForm as FunctionDefinition };
export { RecordEditor as RecordEditor };
export { ListenerConfigForm as ListenerDeclaration };
export { ApiConfigureWizard as ResourceAccessorDefinition}
export { TypeDefinitionConfigForm as TypeDefinition };
