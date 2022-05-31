export const acceptedCompletionKindForTypes : number[] = [
    // Type
    11,
    // Record
    22];

export const acceptedCompletionKindForExpressions : number[] = [
    // Operator
    24,
    // Value
    12,
    // Property
    10 ,
    // Variable
    6 ,
    // Field
    5 ,
    // Method
    2 ,
    // Function
    3,
    20];

export const completionEditorTypeKinds : number[] = [
    // Type
    11,
    // Union
    25,
    // Record
    22,
    // Module
    9,
    // Class
    8
]

export const FILE_SCHEME = "file://";
export const EXPR_SCHEME = "expr://";

export const INPUT_EDITOR_PLACEHOLDERS = new Map<string, string>([
    ['EXPRESSION', '<add-expression>'],
    ['STATEMENT', '<add-statement>'],
    ['TYPE_DESCRIPTOR', '<add-type>'],
    ['BINDING_PATTERN', '<add-field-name>'],
    ['CONF_NAME', '<add-config-name>']
]);
