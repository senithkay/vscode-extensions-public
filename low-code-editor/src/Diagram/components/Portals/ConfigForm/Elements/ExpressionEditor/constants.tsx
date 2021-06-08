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

// 0411 = Missing quotes, 2010 = Undefined symbol, 0012 = Missing plus token
export const INCORRECT_STR_DIAGNOSTICS = ["BCE0411", "BCE2010", "BCE0012"];
