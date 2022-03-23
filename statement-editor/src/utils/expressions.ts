/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

export interface Expression {
    name: string;
    template: string;
    example: string;
}


export interface ExpressionGroup {
    name: string;
    expressions: Expression[];
}

export const PLACE_HOLDER = "expression";
/* tslint:disable-next-line */
export const SELECTED_EXPRESSION = "${SELECTED_EXPRESSION}";

// Copied from Ballerina Spec 2022R1
// 6. Expressions
//     6.1 Expression evaluation
//     6.2 Static typing of expressions
//         6.2.1 Lax static typing
//         6.2.2 Contextually expected type
//         6.2.3 Precise and broad types
//         6.2.4 Singleton typing
//         6.2.5 Nil lifting
//         6.2.6 Isolated expressions
//     6.3 Casting and conversion
//     6.4 Constant expressions
//     6.5 Literals
//     6.6 Template expressions
//         6.6.1 String template expression
//         6.6.2 XML template expression
//         6.6.3 Raw template expression
const templates: ExpressionGroup = {
    name: "Templates",
    expressions: [
        {
            name: "String Template",
            template: "string`value`",
            example: "string `value`"
        }, {
            name: "XML Template",
            template: "xml `value`",
            example: "xml `value`"
        }, {
            name: "Raw Template",
            template: "`value`",
            example: "`value`"
        }
    ]
}
//     6.7 Structural constructors
//         6.7.1 List constructor
//         6.7.2 Mapping constructor
//         6.7.3 Table constructor
const structuralConstructors: ExpressionGroup = {
    name: "Structural Constructors",
    expressions: [
        {
            name: "List",
            template: `[ ${SELECTED_EXPRESSION} ]`,
            example: "[ Es ]"
        }, {
            name: "Mapping",
            template: ` { key: ${PLACE_HOLDER} }`,
            example: "{ key : value }"
        }, {
            name: "Table",
            template: ` table [ { key: value } ]`,
            example: "table [ { key: value } ]"
        }
    ]
}
//     6.8 Object construction
//         6.8.1 Object constructor
//             6.8.1.1 Fields
//             6.8.1.2 Methods
//             6.8.1.3 Resources
//             6.8.1.4 Initialization
//         6.8.2 New expression
//     6.9 Variable reference expression
//     6.10 Field access expression
//     6.11 Optional field access expression
//     6.12 XML attribute access expression
//     6.13 Annotation access expression
//     6.14 Member access expression
//     6.15 Function call expression
//     6.16 Method call expression
//     6.17 Error constructor
//     6.18 Anonymous function expression
//     6.19 Let expression
//     6.20 Type cast expression
//     6.21 Typeof expression
const typeofEx: ExpressionGroup = {
    name: "Typeof",
    expressions: [
        {
            name: "Typeof",
            template: `typeof ${SELECTED_EXPRESSION}`,
            example: "typeof Es"
        }
    ]
}
//     6.22 Unary expression
//         6.22.1 Unary numeric expression
//         6.22.2 Unary logical expression
const unary: ExpressionGroup = {
    name: "Unary",
    expressions: [
        {
            name: "Unary +",
            template: `+ ${SELECTED_EXPRESSION}`,
            example: "+ Es"
        }, {
            name: "Unary -",
            template: `- ${SELECTED_EXPRESSION}`,
            example: "- Es"
        }, {
            name: "Unary ~",
            template: `~ ${SELECTED_EXPRESSION}`,
            example: "~ Es"
        }, {
            name: "Unary Logical",
            template: `! ${SELECTED_EXPRESSION}`,
            example: "! Es"
        }
    ]
}
//     6.24 Additive expression
//     6.23 Multiplicative expression
const operators: ExpressionGroup = {
    name: "Operators",
    expressions: [
        {
            name: "Add",
            template: ` ${SELECTED_EXPRESSION} + ${PLACE_HOLDER}`,
            example: "Es + Ex"
        }, {
            name: "Substract",
            template: ` ${SELECTED_EXPRESSION} - ${PLACE_HOLDER}`,
            example: "Es - Ex"
        }, {
            name: "Multiply",
            template: ` ${SELECTED_EXPRESSION} * ${PLACE_HOLDER}`,
            example: "Es * Ex"
        }, {
            name: "Divide",
            template: ` ${SELECTED_EXPRESSION} / ${PLACE_HOLDER}`,
            example: "Es / En"
        }, {
            name: "Modules",
            template: ` ${SELECTED_EXPRESSION} % ${PLACE_HOLDER}`,
            example: "Es % Ex"
        },
    ]
}
//     6.25 Shift expression
const shift: ExpressionGroup = {
    name: "Shift",
    expressions: [
        {
            name: "Left Shift",
            template: ` ${SELECTED_EXPRESSION} << ${PLACE_HOLDER}`,
            example: "Es << Ex"
        }, {
            name: "Signed Right Shipt",
            template: ` ${SELECTED_EXPRESSION} >> ${PLACE_HOLDER}`,
            example: "Es >> Ex"
        }, {
            name: "Right Shipt",
            template: ` ${SELECTED_EXPRESSION} >>> ${PLACE_HOLDER}`,
            example: "Es >>> Ex"
        }
    ]
}
//     6.26 Range expression
const range: ExpressionGroup = {
    name: "Range",
    expressions: [
        {
            name: "Range less than or equal",
            template: ` ${SELECTED_EXPRESSION} ... ${PLACE_HOLDER}`,
            example: "Es ... Ex"
        }, {
            name: "Range less than ",
            template: ` ${SELECTED_EXPRESSION} ..< ${PLACE_HOLDER}`,
            example: "Es ..< Ex"
        }
    ]
}
//     6.27 Relational expression
const relational: ExpressionGroup = {
    name: "Relational",
    expressions: [
        {
            name: "Less Than",
            template: ` ${SELECTED_EXPRESSION} < ${PLACE_HOLDER}`,
            example: "Es < Ex"
        }, {
            name: "GreaterThan",
            template: ` ${SELECTED_EXPRESSION} > ${PLACE_HOLDER}`,
            example: "Es > Ex"
        }, {
            name: "Less Than or Equal",
            template: ` ${SELECTED_EXPRESSION} <= ${PLACE_HOLDER}`,
            example: "Es <= Ex"
        }, {
            name: "Greater Than or Equal",
            template: ` ${SELECTED_EXPRESSION} >= ${PLACE_HOLDER}`,
            example: "Es >= En"
        }
    ]
}
//     6.28 Type test expression
const typeTest: ExpressionGroup = {
    name: "Type Test",
    expressions: [
        {
            name: "Type Test",
            template: ` ${SELECTED_EXPRESSION} is ${PLACE_HOLDER}`,
            example: "Es is Ex"
        }, {
            name: "Type Test Nigation",
            template: ` ${SELECTED_EXPRESSION} !is ${PLACE_HOLDER}`,
            example: "Es !is Ex"
        }
    ]
}
//     6.29 Equality expression
const equality: ExpressionGroup = {
    name: "Equality",
    expressions: [
        {
            name: "Equal",
            template: ` ${SELECTED_EXPRESSION} == ${PLACE_HOLDER}`,
            example: "Es == Ex"
        }, {
            name: "Not Equal",
            template: ` ${SELECTED_EXPRESSION} != ${PLACE_HOLDER}`,
            example: "Es != Ex"
        }
    ]
}
//     6.30 Binary bitwise expression
const binaryBitwise: ExpressionGroup = {
    name: "Binary Bitwise",
    expressions: [
        {
            name: "Bitwise AND",
            template: ` ${SELECTED_EXPRESSION} & ${PLACE_HOLDER}`,
            example: "Es & Ex"
        }, {
            name: "Bitwise OR",
            template: ` ${SELECTED_EXPRESSION} | ${PLACE_HOLDER}`,
            example: "Es | Ex"
        }, {
            name: "Bitwise XOR",
            template: ` ${SELECTED_EXPRESSION} ^ ${PLACE_HOLDER}`,
            example: "Es ^ Ex"
        }
    ]
}
//     6.31 Logical expression
const logical: ExpressionGroup = {
    name: "Logical",
    expressions: [
        {
            name: "Logical AND",
            template: ` ${SELECTED_EXPRESSION} && ${PLACE_HOLDER}`,
            example: "Es && Ex"
        }, {
            name: "Logical OR",
            template: ` ${SELECTED_EXPRESSION} || ${PLACE_HOLDER}`,
            example: "Es || Ex"
        }
    ]
}
//     6.32 Conditional expression
const conditional: ExpressionGroup = {
    name: "Conditional",
    expressions: [
        {
            name: "Ternary Conditional",
            template: ` ${SELECTED_EXPRESSION} ? T : F`,
            example: "C ? T : F"
        }, {
            name: "Nil Conditional",
            template: ` ${SELECTED_EXPRESSION} ?: R`,
            example: "L ?: R"
        }
    ]
}
//     6.33 Checking expression
const checking: ExpressionGroup = {
    name: "Checking errors",
    expressions: [
        {
            name: "Check",
            template: `check ${SELECTED_EXPRESSION}`,
            example: "check Es"
        }, {
            name: "Check and Panic",
            template: `checkpanic ${SELECTED_EXPRESSION}`,
            example: "checkpanic Es"
        }
    ]
}
//     6.34 Trap expression
const trap: ExpressionGroup = {
    name: "Trap",
    expressions: [
        {
            name: "Trap",
            template: `trap ${SELECTED_EXPRESSION}`,
            example: "trap Es"
        }
    ]
}
//     6.35 Query expression
//         6.35.1 From clause
//         6.35.2 Where clause
//         6.35.3 Let clause
//         6.35.4 Join clause
//         6.35.5 Order by clause
//         6.35.6 Limit clause
//         6.35.7 Select clause
//         6.35.8 On conflict clause
//     6.36 XML navigation expression
//         6.36.1 XML name pattern
//         6.36.2 XML filter expression
//         6.36.3 XML step expression
//     6.37 Transactional expression


export const expressions: ExpressionGroup[] = [
    operators,
    equality,
    relational,
    binaryBitwise,
    unary,
    logical,
    conditional,
    checking,
    trap,
    typeTest,
    typeofEx,
    templates,
    structuralConstructors,
    range,
    shift
];
