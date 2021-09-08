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
import { Constant } from './Constant';
import { End } from "./End";
import { ForEach } from './ForEach';
import { Function } from "./Function";
import { IfElse } from './IfElse';
import { Listener } from './Listener';
import { ModulePartComponent } from "./ModulePart";
import { ModuleVariable } from './ModuleVariable';
import { Record } from "./Record";
import { Service } from "./Service";
import { Statement } from "./Statement";
import { While } from './While';

export { IfElse as IfElseStatement };
export { ForEach as ForeachStatement };
export { Service as ServiceDeclaration };
export { Statement as LocalVarDecl };
export { Statement as CallStatement };
export { Statement as ActionStatement };
export { Statement as AssignmentStatement }
export { Statement as DoStatement };
export { Listener as ListenerDeclaration };
export { Constant as ConstDeclaration };
export { ModuleVariable as ModuleVarDecl };
export { Record as TypeDefinition };
export { End as ReturnStatement };
export { Function as FunctionDefinition };
export { Function as ResourceAccessorDefinition };
export { ModulePartComponent as ModulePart};
export { While as WhileStatement };
