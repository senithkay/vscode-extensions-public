import { ExpressionEditorType, FormField } from '../../../../ConfigurationSpec/types';

import { DataMapperViewState } from "./data-mapper-viewstate";
import { STNode } from "@ballerina/syntax-tree";

export class DataPointViewState extends DataMapperViewState {
    type: ExpressionEditorType | any;
    displayType?: string;
    name?: string;
    fields?: DataPointViewState[];
    isArray?: boolean;
    isRecord?: boolean;
    collectionDataType?: ExpressionEditorType | any;
    typeInfo?: any;
    model?: STNode;
}
