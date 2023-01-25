/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { ExpressionGroup } from "../../../../utils/expressions";
import { ModelType } from "../../../../utils/statement-editor-viewstate";

export const ARITHMETIC_OPERATORS = ["+", "-", "*", "/", "%"];
export const LOGICAL_OPERATORS = ["&&", "||"];
export const EQUALITY_OPERATORS = ["==", "!="];
export const RELATIONAL_OPERATORS = ["<", ">", "<=", ">="];
export const BINARYBITWISE_OPERATORS = ["&", "|", "^"];
export const RANGE_OPERATORS = ["...", "..<"];
export const CHECKING_OPERATORS = ["Check", "checkpanic"];
export const TRAP_OPERATORS = ["trap"];
export const OPTIONALRECORDFIELD_OPERATORS = ["?"];

export const operatorsEdits : ExpressionGroup = {
    name: "Operators",
    expressions: [
        {
            name: "Plus",
            template: `+`,
            example: "+",
            symbol: "+"
        }, {
            name: "Minus",
            template: "-",
            example: "-",
            symbol: "-"
        }, {
            name: "Asterisk",
            template: `*`,
            example: "*",
            symbol: "*"
        }, {
            name: "Slash",
            template: `/`,
            example: "/",
            symbol: "/"
        }, {
            name: "BitwiseAnd",
            template: `&`,
            example: "&",
            symbol: "&"
        }, {
            name: "BitwiseXor",
            template: `|`,
            example: "|",
            symbol: "|"
        }, {
            name: "LogicalAnd",
            template: `&&`,
            example: "&&",
            symbol: "&&"
        }, {
            name: "LogicalOr",
            template: `||`,
            example: "||",
            symbol: "||"
        },
    ],
    relatedModelType: ModelType.OPERATOR
}

export const logicalOperators: ExpressionGroup = {
    name: "Logical",
    expressions: [
        {
            name: "Logical AND",
            template: ` && `,
            example: "&&",
            symbol: "&&"
        }, {
            name: "Logical OR",
            template: ` || `,
            example: "||",
            symbol: "||"
        }
    ],
    relatedModelType: ModelType.OPERATOR
}

export const equalityOperators: ExpressionGroup = {
    name: "Equality",
    expressions: [
        {
            name: "Equal",
            template: ` == `,
            example: "==",
            symbol: "=="
        }, {
            name: "Not Equal",
            template: ` != `,
            example: "!=",
            symbol: "!="
        }
    ],
    relatedModelType: ModelType.OPERATOR
}

export const relationalOperators: ExpressionGroup = {
    name: "Relational",
    expressions: [
        {
            name: "Less Than",
            template: ` < `,
            example: "<",
            symbol: "<"
        }, {
            name: "GreaterThan",
            template: ` > `,
            example: ">",
            symbol: ">"
        }, {
            name: "Less Than or Equal",
            template: ` <= `,
            example: "<=",
            symbol: "<="
        }, {
            name: "Greater Than or Equal",
            template: ` >= `,
            example: ">=",
            symbol: ">="
        }
    ],
    relatedModelType: ModelType.OPERATOR
}

export const binaryBitwiseOperators: ExpressionGroup = {
    name: "Binary Bitwise",
    expressions: [
        {
            name: "Bitwise AND",
            template: ` & `,
            example: "&",
            symbol: "&"
        }, {
            name: "Bitwise OR",
            template: ` | `,
            example: "|",
            symbol: "|"
        }, {
            name: "Bitwise XOR",
            template: ` ^ `,
            example: "^",
            symbol: "^"
        }
    ],
    relatedModelType: ModelType.OPERATOR
}

export const rangeOperators: ExpressionGroup = {
    name: "Range",
    expressions: [
        {
            name: "Range less than or equal",
            template: ` ... `,
            example: "...",
            symbol: "..."
        }, {
            name: "Range less than ",
            template: ` ..< `,
            example: "..<",
            symbol: "..<"
        }
    ],
    relatedModelType: ModelType.OPERATOR
}

export const checkingOperators: ExpressionGroup = {
    name: "Checking errors",
    expressions: [
        {
            name: "Check",
            template: ` check `,
            example: "check",
            symbol: "check"
        }, {
            name: "Check and Panic",
            template: `checkpanic `,
            example: "checkpanic",
            symbol: "checkpanic"
        }
    ],
    relatedModelType: ModelType.OPERATOR
}

export const trapOperators: ExpressionGroup = {
    name: "Trap",
    expressions: [
        {
            name: "Trap",
            template: ` trap `,
            example: "trap",
            symbol: "trap"
        }
    ],
    relatedModelType: ModelType.OPERATOR
}

export const optionalRecordFieldOperators: ExpressionGroup = {
    name: "Optional Record Field",
    expressions: [
        {
            name: "Optional record field",
            template: `?`,
            example: "?",
            symbol: "?"
        }
    ],
    relatedModelType: ModelType.OPERATOR
}

export const plusOperator : ExpressionGroup = {
    name: "Plus Operator",
    expressions: [
        {
            name: "Plus",
            template: `+`,
            example: "+",
            symbol: "+"
        },
    ],
    relatedModelType: ModelType.OPERATOR
}
