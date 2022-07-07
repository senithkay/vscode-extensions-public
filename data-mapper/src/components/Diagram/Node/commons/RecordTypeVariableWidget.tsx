import { MappingConstructor, RecordTypeDesc, RequiredParam, SimpleNameReference } from "@wso2-enterprise/syntax-tree";
import React from "react";
import { DataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";

export interface RecordTypeVariableWidgetProps {
    typeDesc: RecordTypeDesc;
    value: RequiredParam | SimpleNameReference;
    context: DataMapperContext;
}

export function RecordTypeVariableWidget(props: RecordTypeVariableWidgetProps) {
    
}
