/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as Synapse from "./syntax-tree-interfaces";

export interface Visitor {
    beginVisitSTNode?(node: Synapse.STNode): void;
    endVisitSTNode?(node: Synapse.STNode): void;

    beginVisitImport?(node: Synapse.Import): void;
    endVisitImport?(node: Synapse.Import): void;

    beginVisitInterface?(node: Synapse.Interface): void;
    endVisitInterface?(node: Synapse.Interface): void;

    beginVisitOutput?(node: Synapse.Output): void;
    endVisitOutput?(node: Synapse.Output): void;

    beginVisitInfault?(node: Synapse.Infault): void;
    endVisitInfault?(node: Synapse.Infault): void;

    beginVisitOperation?(node: Synapse.Operation): void;
    endVisitOperation?(node: Synapse.Operation): void;

    beginVisitDescription?(node: Synapse.Description): void;
    endVisitDescription?(node: Synapse.Description): void;

    beginVisitSequence?(node: Synapse.Sequence): void;
    endVisitSequence?(node: Synapse.Sequence): void;

    beginVisitDefinitions?(node: Synapse.Definitions): void;
    endVisitDefinitions?(node: Synapse.Definitions): void;

    beginVisitOutfault?(node: Synapse.Outfault): void;
    endVisitOutfault?(node: Synapse.Outfault): void;

    beginVisitTypes?(node: Synapse.Types): void;
    endVisitTypes?(node: Synapse.Types): void;

    beginVisitFault?(node: Synapse.Fault): void;
    endVisitFault?(node: Synapse.Fault): void;

    beginVisitParameter?(node: Synapse.Parameter): void;
    endVisitParameter?(node: Synapse.Parameter): void;

    beginVisitDocumentation?(node: Synapse.Documentation): void;
    endVisitDocumentation?(node: Synapse.Documentation): void;

    beginVisitInput?(node: Synapse.Input): void;
    endVisitInput?(node: Synapse.Input): void;

    beginVisitInclude?(node: Synapse.Include): void;
    endVisitInclude?(node: Synapse.Include): void;

    beginVisitBinding?(node: Synapse.Binding): void;
    endVisitBinding?(node: Synapse.Binding): void;

    beginVisitResource?(node: Synapse.Resource): void;
    endVisitResource?(node: Synapse.Resource): void;

    beginVisitFeature?(node: Synapse.Feature): void;
    endVisitFeature?(node: Synapse.Feature): void;

    beginVisitEndpoint?(node: Synapse.Endpoint): void;
    endVisitEndpoint?(node: Synapse.Endpoint): void;

    beginVisitService?(node: Synapse.Service): void;
    endVisitService?(node: Synapse.Service): void;

    beginVisitLog?(node: Synapse.Log): void;
    endVisitLog?(node: Synapse.Log): void;
}