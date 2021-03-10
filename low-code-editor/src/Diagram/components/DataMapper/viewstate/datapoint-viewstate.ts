import { ExpressionEditorType, FormField } from '../../../../ConfigurationSpec/types';

import { DataMapperViewState } from "./data-mapper-viewstate";

export class DataPointViewstate extends DataMapperViewState {
    type: ExpressionEditorType | any;
    displayType?: string;
    name?: string;
    fields?: DataPointViewstate[];
    isArray?: boolean;
    isRecord?: boolean;
    collectionDataType?: ExpressionEditorType | any;
    typeInfo?: any;
}
