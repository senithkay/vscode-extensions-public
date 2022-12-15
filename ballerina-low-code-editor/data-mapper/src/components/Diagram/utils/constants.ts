export const MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX = "mappingConstructor";
export const LIST_CONSTRUCTOR_TARGET_PORT_PREFIX = "listConstructor";
export const PRIMITIVE_TYPE_TARGET_PORT_PREFIX = "primitiveType";
export const LET_EXPRESSION_SOURCE_PORT_PREFIX = "letExpression";
export const EXPANDED_QUERY_SOURCE_PORT_PREFIX = "expandedQueryExpr.source";
export const EXPANDED_QUERY_INPUT_NODE_PREFIX = "expandedQueryExpr.input";
export const FUNCTION_BODY_QUERY = "FunctionBody.query";

export const OFFSETS = {
    SOURCE_NODE: {
        X: 50,
        Y: 100,
    },
    TARGET_NODE: {
        X: 950,
        Y: 100
    },
    TARGET_NODE_WITHOUT_MAPPING: {
        X: 650,
    },
    QUERY_MAPPING_HEADER_NODE: {
        X: 25,
        Y: 25,
    },
    LINK_CONNECTOR_NODE: {
        X: 750
    },
    LINK_CONNECTOR_NODE_WITH_ERROR: {
        X: 718
    },
    QUERY_EXPRESSION_NODE: {
        X: 750
    },
    LOCAL_VAR_MANAGER_NODE: {
        X: 50,
        Y: 25,
    }
}

