import { CompletionItemKind } from "monaco-languageclient";

export const acceptedKind: CompletionItemKind[] = [
    // Operator
    24 as CompletionItemKind,
    // Value
    12 as CompletionItemKind,
    // Property
    10 as CompletionItemKind,
    // Variable
    6 as CompletionItemKind,
    // Field
    5 as CompletionItemKind,
    // Method
    2 as CompletionItemKind,
    // Function
    3 as CompletionItemKind,
];

export const EXPAND_WIDGET_ID = "expand-widget";
export const COLLAPSE_WIDGET_ID = "collapse-widget";
export const DOUBLE_QUOTE_ERR_CODE = "BCE0411";
export const UNDEFINED_SYMBOL_ERR_CODE = "BCE2010";

// BCE0411 = Missing quotes, BCE2010 = Undefined symbol, BCE0012 = Missing plus token, BCE0400 = missing identifier, BCE2066 =  incompatible types
export const SUGGEST_DOUBLE_QUOTES_DIAGNOSTICS = ["BCE0411", "BCE2010", "BCE0012", "BCE0400", "BCE2066"];

// BCE2066 =  incompatible types
export const SUGGEST_TO_STRING_DIAGNOSTICS = ["BCE2066"];

export const EDITOR_MAXIMUM_CHARACTERS = 25;
