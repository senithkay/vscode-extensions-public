/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 * Run 'npm run generate' to regenerate this file
 */

import * as ts from 'typescript';

export interface Visitor {
    beginVisit?(node: ts.Node, parent?: ts.Node): void;
    endVisit?(node: ts.Node, parent?: ts.Node): void;
    
    beginVisitNumericLiteral?(node: ts.NumericLiteral, parent?: ts.Node): void;
    endVisitNumericLiteral?(node: ts.NumericLiteral, parent?: ts.Node): void;

    beginVisitBigIntLiteral?(node: ts.BigIntLiteral, parent?: ts.Node): void;
    endVisitBigIntLiteral?(node: ts.BigIntLiteral, parent?: ts.Node): void;

    beginVisitStringLiteral?(node: ts.StringLiteral, parent?: ts.Node): void;
    endVisitStringLiteral?(node: ts.StringLiteral, parent?: ts.Node): void;

    beginVisitRegularExpressionLiteral?(node: ts.RegularExpressionLiteral, parent?: ts.Node): void;
    endVisitRegularExpressionLiteral?(node: ts.RegularExpressionLiteral, parent?: ts.Node): void;

    beginVisitNoSubstitutionTemplateLiteral?(node: ts.NoSubstitutionTemplateLiteral, parent?: ts.Node): void;
    endVisitNoSubstitutionTemplateLiteral?(node: ts.NoSubstitutionTemplateLiteral, parent?: ts.Node): void;

    beginVisitTemplateHead?(node: ts.TemplateHead, parent?: ts.Node): void;
    endVisitTemplateHead?(node: ts.TemplateHead, parent?: ts.Node): void;

    beginVisitTemplateMiddle?(node: ts.TemplateMiddle, parent?: ts.Node): void;
    endVisitTemplateMiddle?(node: ts.TemplateMiddle, parent?: ts.Node): void;

    beginVisitTemplateTail?(node: ts.TemplateTail, parent?: ts.Node): void;
    endVisitTemplateTail?(node: ts.TemplateTail, parent?: ts.Node): void;

    beginVisitIdentifier?(node: ts.Identifier, parent?: ts.Node): void;
    endVisitIdentifier?(node: ts.Identifier, parent?: ts.Node): void;

    beginVisitPrivateIdentifier?(node: ts.PrivateIdentifier, parent?: ts.Node): void;
    endVisitPrivateIdentifier?(node: ts.PrivateIdentifier, parent?: ts.Node): void;

    beginVisitQualifiedName?(node: ts.QualifiedName, parent?: ts.Node): void;
    endVisitQualifiedName?(node: ts.QualifiedName, parent?: ts.Node): void;

    beginVisitComputedPropertyName?(node: ts.ComputedPropertyName, parent?: ts.Node): void;
    endVisitComputedPropertyName?(node: ts.ComputedPropertyName, parent?: ts.Node): void;

    beginVisitTypeParameter?(node: ts.TypeParameter, parent?: ts.Node): void;
    endVisitTypeParameter?(node: ts.TypeParameter, parent?: ts.Node): void;

    beginVisitDecorator?(node: ts.Decorator, parent?: ts.Node): void;
    endVisitDecorator?(node: ts.Decorator, parent?: ts.Node): void;

    beginVisitPropertyDeclaration?(node: ts.PropertyDeclaration, parent?: ts.Node): void;
    endVisitPropertyDeclaration?(node: ts.PropertyDeclaration, parent?: ts.Node): void;

    beginVisitMethodDeclaration?(node: ts.MethodDeclaration, parent?: ts.Node): void;
    endVisitMethodDeclaration?(node: ts.MethodDeclaration, parent?: ts.Node): void;

    beginVisitClassStaticBlockDeclaration?(node: ts.ClassStaticBlockDeclaration, parent?: ts.Node): void;
    endVisitClassStaticBlockDeclaration?(node: ts.ClassStaticBlockDeclaration, parent?: ts.Node): void;

    beginVisitTypePredicate?(node: ts.TypePredicate, parent?: ts.Node): void;
    endVisitTypePredicate?(node: ts.TypePredicate, parent?: ts.Node): void;

    beginVisitTypeReference?(node: ts.TypeReference, parent?: ts.Node): void;
    endVisitTypeReference?(node: ts.TypeReference, parent?: ts.Node): void;

    beginVisitNamedTupleMember?(node: ts.NamedTupleMember, parent?: ts.Node): void;
    endVisitNamedTupleMember?(node: ts.NamedTupleMember, parent?: ts.Node): void;

    beginVisitTemplateLiteralTypeSpan?(node: ts.TemplateLiteralTypeSpan, parent?: ts.Node): void;
    endVisitTemplateLiteralTypeSpan?(node: ts.TemplateLiteralTypeSpan, parent?: ts.Node): void;

    beginVisitObjectBindingPattern?(node: ts.ObjectBindingPattern, parent?: ts.Node): void;
    endVisitObjectBindingPattern?(node: ts.ObjectBindingPattern, parent?: ts.Node): void;

    beginVisitArrayBindingPattern?(node: ts.ArrayBindingPattern, parent?: ts.Node): void;
    endVisitArrayBindingPattern?(node: ts.ArrayBindingPattern, parent?: ts.Node): void;

    beginVisitBindingElement?(node: ts.BindingElement, parent?: ts.Node): void;
    endVisitBindingElement?(node: ts.BindingElement, parent?: ts.Node): void;

    beginVisitArrayLiteralExpression?(node: ts.ArrayLiteralExpression, parent?: ts.Node): void;
    endVisitArrayLiteralExpression?(node: ts.ArrayLiteralExpression, parent?: ts.Node): void;

    beginVisitObjectLiteralExpression?(node: ts.ObjectLiteralExpression, parent?: ts.Node): void;
    endVisitObjectLiteralExpression?(node: ts.ObjectLiteralExpression, parent?: ts.Node): void;

    beginVisitPropertyAccessExpression?(node: ts.PropertyAccessExpression, parent?: ts.Node): void;
    endVisitPropertyAccessExpression?(node: ts.PropertyAccessExpression, parent?: ts.Node): void;

    beginVisitElementAccessExpression?(node: ts.ElementAccessExpression, parent?: ts.Node): void;
    endVisitElementAccessExpression?(node: ts.ElementAccessExpression, parent?: ts.Node): void;

    beginVisitCallExpression?(node: ts.CallExpression, parent?: ts.Node): void;
    endVisitCallExpression?(node: ts.CallExpression, parent?: ts.Node): void;

    beginVisitNewExpression?(node: ts.NewExpression, parent?: ts.Node): void;
    endVisitNewExpression?(node: ts.NewExpression, parent?: ts.Node): void;

    beginVisitTaggedTemplateExpression?(node: ts.TaggedTemplateExpression, parent?: ts.Node): void;
    endVisitTaggedTemplateExpression?(node: ts.TaggedTemplateExpression, parent?: ts.Node): void;

    beginVisitParenthesizedExpression?(node: ts.ParenthesizedExpression, parent?: ts.Node): void;
    endVisitParenthesizedExpression?(node: ts.ParenthesizedExpression, parent?: ts.Node): void;

    beginVisitFunctionExpression?(node: ts.FunctionExpression, parent?: ts.Node): void;
    endVisitFunctionExpression?(node: ts.FunctionExpression, parent?: ts.Node): void;

    beginVisitArrowFunction?(node: ts.ArrowFunction, parent?: ts.Node): void;
    endVisitArrowFunction?(node: ts.ArrowFunction, parent?: ts.Node): void;

    beginVisitDeleteExpression?(node: ts.DeleteExpression, parent?: ts.Node): void;
    endVisitDeleteExpression?(node: ts.DeleteExpression, parent?: ts.Node): void;

    beginVisitTypeOfExpression?(node: ts.TypeOfExpression, parent?: ts.Node): void;
    endVisitTypeOfExpression?(node: ts.TypeOfExpression, parent?: ts.Node): void;

    beginVisitVoidExpression?(node: ts.VoidExpression, parent?: ts.Node): void;
    endVisitVoidExpression?(node: ts.VoidExpression, parent?: ts.Node): void;

    beginVisitAwaitExpression?(node: ts.AwaitExpression, parent?: ts.Node): void;
    endVisitAwaitExpression?(node: ts.AwaitExpression, parent?: ts.Node): void;

    beginVisitPrefixUnaryExpression?(node: ts.PrefixUnaryExpression, parent?: ts.Node): void;
    endVisitPrefixUnaryExpression?(node: ts.PrefixUnaryExpression, parent?: ts.Node): void;

    beginVisitPostfixUnaryExpression?(node: ts.PostfixUnaryExpression, parent?: ts.Node): void;
    endVisitPostfixUnaryExpression?(node: ts.PostfixUnaryExpression, parent?: ts.Node): void;

    beginVisitBinaryExpression?(node: ts.BinaryExpression, parent?: ts.Node): void;
    endVisitBinaryExpression?(node: ts.BinaryExpression, parent?: ts.Node): void;

    beginVisitConditionalExpression?(node: ts.ConditionalExpression, parent?: ts.Node): void;
    endVisitConditionalExpression?(node: ts.ConditionalExpression, parent?: ts.Node): void;

    beginVisitTemplateExpression?(node: ts.TemplateExpression, parent?: ts.Node): void;
    endVisitTemplateExpression?(node: ts.TemplateExpression, parent?: ts.Node): void;

    beginVisitYieldExpression?(node: ts.YieldExpression, parent?: ts.Node): void;
    endVisitYieldExpression?(node: ts.YieldExpression, parent?: ts.Node): void;

    beginVisitSpreadElement?(node: ts.SpreadElement, parent?: ts.Node): void;
    endVisitSpreadElement?(node: ts.SpreadElement, parent?: ts.Node): void;

    beginVisitClassExpression?(node: ts.ClassExpression, parent?: ts.Node): void;
    endVisitClassExpression?(node: ts.ClassExpression, parent?: ts.Node): void;

    beginVisitOmittedExpression?(node: ts.OmittedExpression, parent?: ts.Node): void;
    endVisitOmittedExpression?(node: ts.OmittedExpression, parent?: ts.Node): void;

    beginVisitExpressionWithTypeArguments?(node: ts.ExpressionWithTypeArguments, parent?: ts.Node): void;
    endVisitExpressionWithTypeArguments?(node: ts.ExpressionWithTypeArguments, parent?: ts.Node): void;

    beginVisitAsExpression?(node: ts.AsExpression, parent?: ts.Node): void;
    endVisitAsExpression?(node: ts.AsExpression, parent?: ts.Node): void;

    beginVisitNonNullExpression?(node: ts.NonNullExpression, parent?: ts.Node): void;
    endVisitNonNullExpression?(node: ts.NonNullExpression, parent?: ts.Node): void;

    beginVisitMetaProperty?(node: ts.MetaProperty, parent?: ts.Node): void;
    endVisitMetaProperty?(node: ts.MetaProperty, parent?: ts.Node): void;

    beginVisitSyntheticExpression?(node: ts.SyntheticExpression, parent?: ts.Node): void;
    endVisitSyntheticExpression?(node: ts.SyntheticExpression, parent?: ts.Node): void;

    beginVisitSatisfiesExpression?(node: ts.SatisfiesExpression, parent?: ts.Node): void;
    endVisitSatisfiesExpression?(node: ts.SatisfiesExpression, parent?: ts.Node): void;

    beginVisitTemplateSpan?(node: ts.TemplateSpan, parent?: ts.Node): void;
    endVisitTemplateSpan?(node: ts.TemplateSpan, parent?: ts.Node): void;

    beginVisitSemicolonClassElement?(node: ts.SemicolonClassElement, parent?: ts.Node): void;
    endVisitSemicolonClassElement?(node: ts.SemicolonClassElement, parent?: ts.Node): void;

    beginVisitBlock?(node: ts.Block, parent?: ts.Node): void;
    endVisitBlock?(node: ts.Block, parent?: ts.Node): void;

    beginVisitEmptyStatement?(node: ts.EmptyStatement, parent?: ts.Node): void;
    endVisitEmptyStatement?(node: ts.EmptyStatement, parent?: ts.Node): void;

    beginVisitVariableStatement?(node: ts.VariableStatement, parent?: ts.Node): void;
    endVisitVariableStatement?(node: ts.VariableStatement, parent?: ts.Node): void;

    beginVisitExpressionStatement?(node: ts.ExpressionStatement, parent?: ts.Node): void;
    endVisitExpressionStatement?(node: ts.ExpressionStatement, parent?: ts.Node): void;

    beginVisitIfStatement?(node: ts.IfStatement, parent?: ts.Node): void;
    endVisitIfStatement?(node: ts.IfStatement, parent?: ts.Node): void;

    beginVisitDoStatement?(node: ts.DoStatement, parent?: ts.Node): void;
    endVisitDoStatement?(node: ts.DoStatement, parent?: ts.Node): void;

    beginVisitWhileStatement?(node: ts.WhileStatement, parent?: ts.Node): void;
    endVisitWhileStatement?(node: ts.WhileStatement, parent?: ts.Node): void;

    beginVisitForStatement?(node: ts.ForStatement, parent?: ts.Node): void;
    endVisitForStatement?(node: ts.ForStatement, parent?: ts.Node): void;

    beginVisitForInStatement?(node: ts.ForInStatement, parent?: ts.Node): void;
    endVisitForInStatement?(node: ts.ForInStatement, parent?: ts.Node): void;

    beginVisitForOfStatement?(node: ts.ForOfStatement, parent?: ts.Node): void;
    endVisitForOfStatement?(node: ts.ForOfStatement, parent?: ts.Node): void;

    beginVisitContinueStatement?(node: ts.ContinueStatement, parent?: ts.Node): void;
    endVisitContinueStatement?(node: ts.ContinueStatement, parent?: ts.Node): void;

    beginVisitBreakStatement?(node: ts.BreakStatement, parent?: ts.Node): void;
    endVisitBreakStatement?(node: ts.BreakStatement, parent?: ts.Node): void;

    beginVisitReturnStatement?(node: ts.ReturnStatement, parent?: ts.Node): void;
    endVisitReturnStatement?(node: ts.ReturnStatement, parent?: ts.Node): void;

    beginVisitWithStatement?(node: ts.WithStatement, parent?: ts.Node): void;
    endVisitWithStatement?(node: ts.WithStatement, parent?: ts.Node): void;

    beginVisitSwitchStatement?(node: ts.SwitchStatement, parent?: ts.Node): void;
    endVisitSwitchStatement?(node: ts.SwitchStatement, parent?: ts.Node): void;

    beginVisitLabeledStatement?(node: ts.LabeledStatement, parent?: ts.Node): void;
    endVisitLabeledStatement?(node: ts.LabeledStatement, parent?: ts.Node): void;

    beginVisitThrowStatement?(node: ts.ThrowStatement, parent?: ts.Node): void;
    endVisitThrowStatement?(node: ts.ThrowStatement, parent?: ts.Node): void;

    beginVisitTryStatement?(node: ts.TryStatement, parent?: ts.Node): void;
    endVisitTryStatement?(node: ts.TryStatement, parent?: ts.Node): void;

    beginVisitDebuggerStatement?(node: ts.DebuggerStatement, parent?: ts.Node): void;
    endVisitDebuggerStatement?(node: ts.DebuggerStatement, parent?: ts.Node): void;

    beginVisitVariableDeclaration?(node: ts.VariableDeclaration, parent?: ts.Node): void;
    endVisitVariableDeclaration?(node: ts.VariableDeclaration, parent?: ts.Node): void;

    beginVisitVariableDeclarationList?(node: ts.VariableDeclarationList, parent?: ts.Node): void;
    endVisitVariableDeclarationList?(node: ts.VariableDeclarationList, parent?: ts.Node): void;

    beginVisitFunctionDeclaration?(node: ts.FunctionDeclaration, parent?: ts.Node): void;
    endVisitFunctionDeclaration?(node: ts.FunctionDeclaration, parent?: ts.Node): void;

    beginVisitClassDeclaration?(node: ts.ClassDeclaration, parent?: ts.Node): void;
    endVisitClassDeclaration?(node: ts.ClassDeclaration, parent?: ts.Node): void;

    beginVisitInterfaceDeclaration?(node: ts.InterfaceDeclaration, parent?: ts.Node): void;
    endVisitInterfaceDeclaration?(node: ts.InterfaceDeclaration, parent?: ts.Node): void;

    beginVisitTypeAliasDeclaration?(node: ts.TypeAliasDeclaration, parent?: ts.Node): void;
    endVisitTypeAliasDeclaration?(node: ts.TypeAliasDeclaration, parent?: ts.Node): void;

    beginVisitEnumDeclaration?(node: ts.EnumDeclaration, parent?: ts.Node): void;
    endVisitEnumDeclaration?(node: ts.EnumDeclaration, parent?: ts.Node): void;

    beginVisitModuleDeclaration?(node: ts.ModuleDeclaration, parent?: ts.Node): void;
    endVisitModuleDeclaration?(node: ts.ModuleDeclaration, parent?: ts.Node): void;

    beginVisitModuleBlock?(node: ts.ModuleBlock, parent?: ts.Node): void;
    endVisitModuleBlock?(node: ts.ModuleBlock, parent?: ts.Node): void;

    beginVisitCaseBlock?(node: ts.CaseBlock, parent?: ts.Node): void;
    endVisitCaseBlock?(node: ts.CaseBlock, parent?: ts.Node): void;

    beginVisitNamespaceExportDeclaration?(node: ts.NamespaceExportDeclaration, parent?: ts.Node): void;
    endVisitNamespaceExportDeclaration?(node: ts.NamespaceExportDeclaration, parent?: ts.Node): void;

    beginVisitImportEqualsDeclaration?(node: ts.ImportEqualsDeclaration, parent?: ts.Node): void;
    endVisitImportEqualsDeclaration?(node: ts.ImportEqualsDeclaration, parent?: ts.Node): void;

    beginVisitImportDeclaration?(node: ts.ImportDeclaration, parent?: ts.Node): void;
    endVisitImportDeclaration?(node: ts.ImportDeclaration, parent?: ts.Node): void;

    beginVisitImportClause?(node: ts.ImportClause, parent?: ts.Node): void;
    endVisitImportClause?(node: ts.ImportClause, parent?: ts.Node): void;

    beginVisitNamespaceImport?(node: ts.NamespaceImport, parent?: ts.Node): void;
    endVisitNamespaceImport?(node: ts.NamespaceImport, parent?: ts.Node): void;

    beginVisitNamedImports?(node: ts.NamedImports, parent?: ts.Node): void;
    endVisitNamedImports?(node: ts.NamedImports, parent?: ts.Node): void;

    beginVisitImportSpecifier?(node: ts.ImportSpecifier, parent?: ts.Node): void;
    endVisitImportSpecifier?(node: ts.ImportSpecifier, parent?: ts.Node): void;

    beginVisitExportDeclaration?(node: ts.ExportDeclaration, parent?: ts.Node): void;
    endVisitExportDeclaration?(node: ts.ExportDeclaration, parent?: ts.Node): void;

    beginVisitNamedExports?(node: ts.NamedExports, parent?: ts.Node): void;
    endVisitNamedExports?(node: ts.NamedExports, parent?: ts.Node): void;

    beginVisitNamespaceExport?(node: ts.NamespaceExport, parent?: ts.Node): void;
    endVisitNamespaceExport?(node: ts.NamespaceExport, parent?: ts.Node): void;

    beginVisitExportSpecifier?(node: ts.ExportSpecifier, parent?: ts.Node): void;
    endVisitExportSpecifier?(node: ts.ExportSpecifier, parent?: ts.Node): void;

    beginVisitMissingDeclaration?(node: ts.MissingDeclaration, parent?: ts.Node): void;
    endVisitMissingDeclaration?(node: ts.MissingDeclaration, parent?: ts.Node): void;

    beginVisitExternalModuleReference?(node: ts.ExternalModuleReference, parent?: ts.Node): void;
    endVisitExternalModuleReference?(node: ts.ExternalModuleReference, parent?: ts.Node): void;

    beginVisitJsxElement?(node: ts.JsxElement, parent?: ts.Node): void;
    endVisitJsxElement?(node: ts.JsxElement, parent?: ts.Node): void;

    beginVisitJsxSelfClosingElement?(node: ts.JsxSelfClosingElement, parent?: ts.Node): void;
    endVisitJsxSelfClosingElement?(node: ts.JsxSelfClosingElement, parent?: ts.Node): void;

    beginVisitJsxOpeningElement?(node: ts.JsxOpeningElement, parent?: ts.Node): void;
    endVisitJsxOpeningElement?(node: ts.JsxOpeningElement, parent?: ts.Node): void;

    beginVisitJsxClosingElement?(node: ts.JsxClosingElement, parent?: ts.Node): void;
    endVisitJsxClosingElement?(node: ts.JsxClosingElement, parent?: ts.Node): void;

    beginVisitJsxFragment?(node: ts.JsxFragment, parent?: ts.Node): void;
    endVisitJsxFragment?(node: ts.JsxFragment, parent?: ts.Node): void;

    beginVisitJsxOpeningFragment?(node: ts.JsxOpeningFragment, parent?: ts.Node): void;
    endVisitJsxOpeningFragment?(node: ts.JsxOpeningFragment, parent?: ts.Node): void;

    beginVisitJsxClosingFragment?(node: ts.JsxClosingFragment, parent?: ts.Node): void;
    endVisitJsxClosingFragment?(node: ts.JsxClosingFragment, parent?: ts.Node): void;

    beginVisitJsxAttribute?(node: ts.JsxAttribute, parent?: ts.Node): void;
    endVisitJsxAttribute?(node: ts.JsxAttribute, parent?: ts.Node): void;

    beginVisitJsxAttributes?(node: ts.JsxAttributes, parent?: ts.Node): void;
    endVisitJsxAttributes?(node: ts.JsxAttributes, parent?: ts.Node): void;

    beginVisitJsxSpreadAttribute?(node: ts.JsxSpreadAttribute, parent?: ts.Node): void;
    endVisitJsxSpreadAttribute?(node: ts.JsxSpreadAttribute, parent?: ts.Node): void;

    beginVisitJsxExpression?(node: ts.JsxExpression, parent?: ts.Node): void;
    endVisitJsxExpression?(node: ts.JsxExpression, parent?: ts.Node): void;

    beginVisitJsxNamespacedName?(node: ts.JsxNamespacedName, parent?: ts.Node): void;
    endVisitJsxNamespacedName?(node: ts.JsxNamespacedName, parent?: ts.Node): void;

    beginVisitCaseClause?(node: ts.CaseClause, parent?: ts.Node): void;
    endVisitCaseClause?(node: ts.CaseClause, parent?: ts.Node): void;

    beginVisitDefaultClause?(node: ts.DefaultClause, parent?: ts.Node): void;
    endVisitDefaultClause?(node: ts.DefaultClause, parent?: ts.Node): void;

    beginVisitHeritageClause?(node: ts.HeritageClause, parent?: ts.Node): void;
    endVisitHeritageClause?(node: ts.HeritageClause, parent?: ts.Node): void;

    beginVisitCatchClause?(node: ts.CatchClause, parent?: ts.Node): void;
    endVisitCatchClause?(node: ts.CatchClause, parent?: ts.Node): void;

    beginVisitImportAttributes?(node: ts.ImportAttributes, parent?: ts.Node): void;
    endVisitImportAttributes?(node: ts.ImportAttributes, parent?: ts.Node): void;

    beginVisitImportAttribute?(node: ts.ImportAttribute, parent?: ts.Node): void;
    endVisitImportAttribute?(node: ts.ImportAttribute, parent?: ts.Node): void;

    beginVisitAssertClause?(node: ts.AssertClause, parent?: ts.Node): void;
    endVisitAssertClause?(node: ts.AssertClause, parent?: ts.Node): void;

    beginVisitAssertEntry?(node: ts.AssertEntry, parent?: ts.Node): void;
    endVisitAssertEntry?(node: ts.AssertEntry, parent?: ts.Node): void;

    beginVisitImportTypeAssertionContainer?(node: ts.ImportTypeAssertionContainer, parent?: ts.Node): void;
    endVisitImportTypeAssertionContainer?(node: ts.ImportTypeAssertionContainer, parent?: ts.Node): void;

    beginVisitEnumMember?(node: ts.EnumMember, parent?: ts.Node): void;
    endVisitEnumMember?(node: ts.EnumMember, parent?: ts.Node): void;

    beginVisitUnparsedPrologue?(node: ts.UnparsedPrologue, parent?: ts.Node): void;
    endVisitUnparsedPrologue?(node: ts.UnparsedPrologue, parent?: ts.Node): void;

    beginVisitUnparsedPrepend?(node: ts.UnparsedPrepend, parent?: ts.Node): void;
    endVisitUnparsedPrepend?(node: ts.UnparsedPrepend, parent?: ts.Node): void;

    beginVisitUnparsedSyntheticReference?(node: ts.UnparsedSyntheticReference, parent?: ts.Node): void;
    endVisitUnparsedSyntheticReference?(node: ts.UnparsedSyntheticReference, parent?: ts.Node): void;

    beginVisitSourceFile?(node: ts.SourceFile, parent?: ts.Node): void;
    endVisitSourceFile?(node: ts.SourceFile, parent?: ts.Node): void;

    beginVisitBundle?(node: ts.Bundle, parent?: ts.Node): void;
    endVisitBundle?(node: ts.Bundle, parent?: ts.Node): void;

    beginVisitUnparsedSource?(node: ts.UnparsedSource, parent?: ts.Node): void;
    endVisitUnparsedSource?(node: ts.UnparsedSource, parent?: ts.Node): void;

    beginVisitInputFiles?(node: ts.InputFiles, parent?: ts.Node): void;
    endVisitInputFiles?(node: ts.InputFiles, parent?: ts.Node): void;

    beginVisitJSDocTypeExpression?(node: ts.JSDocTypeExpression, parent?: ts.Node): void;
    endVisitJSDocTypeExpression?(node: ts.JSDocTypeExpression, parent?: ts.Node): void;

    beginVisitJSDocNameReference?(node: ts.JSDocNameReference, parent?: ts.Node): void;
    endVisitJSDocNameReference?(node: ts.JSDocNameReference, parent?: ts.Node): void;

    beginVisitJSDocMemberName?(node: ts.JSDocMemberName, parent?: ts.Node): void;
    endVisitJSDocMemberName?(node: ts.JSDocMemberName, parent?: ts.Node): void;

    beginVisitJSDoc?(node: ts.JSDoc, parent?: ts.Node): void;
    endVisitJSDoc?(node: ts.JSDoc, parent?: ts.Node): void;

    beginVisitJSDocComment?(node: ts.JSDocComment, parent?: ts.Node): void;
    endVisitJSDocComment?(node: ts.JSDocComment, parent?: ts.Node): void;

    beginVisitJSDocTypeLiteral?(node: ts.JSDocTypeLiteral, parent?: ts.Node): void;
    endVisitJSDocTypeLiteral?(node: ts.JSDocTypeLiteral, parent?: ts.Node): void;

    beginVisitJSDocLink?(node: ts.JSDocLink, parent?: ts.Node): void;
    endVisitJSDocLink?(node: ts.JSDocLink, parent?: ts.Node): void;

    beginVisitJSDocLinkCode?(node: ts.JSDocLinkCode, parent?: ts.Node): void;
    endVisitJSDocLinkCode?(node: ts.JSDocLinkCode, parent?: ts.Node): void;

    beginVisitJSDocLinkPlain?(node: ts.JSDocLinkPlain, parent?: ts.Node): void;
    endVisitJSDocLinkPlain?(node: ts.JSDocLinkPlain, parent?: ts.Node): void;

    beginVisitJSDocTag?(node: ts.JSDocTag, parent?: ts.Node): void;
    endVisitJSDocTag?(node: ts.JSDocTag, parent?: ts.Node): void;

    beginVisitJSDocAugmentsTag?(node: ts.JSDocAugmentsTag, parent?: ts.Node): void;
    endVisitJSDocAugmentsTag?(node: ts.JSDocAugmentsTag, parent?: ts.Node): void;

    beginVisitJSDocImplementsTag?(node: ts.JSDocImplementsTag, parent?: ts.Node): void;
    endVisitJSDocImplementsTag?(node: ts.JSDocImplementsTag, parent?: ts.Node): void;

    beginVisitJSDocAuthorTag?(node: ts.JSDocAuthorTag, parent?: ts.Node): void;
    endVisitJSDocAuthorTag?(node: ts.JSDocAuthorTag, parent?: ts.Node): void;

    beginVisitJSDocDeprecatedTag?(node: ts.JSDocDeprecatedTag, parent?: ts.Node): void;
    endVisitJSDocDeprecatedTag?(node: ts.JSDocDeprecatedTag, parent?: ts.Node): void;

    beginVisitJSDocClassTag?(node: ts.JSDocClassTag, parent?: ts.Node): void;
    endVisitJSDocClassTag?(node: ts.JSDocClassTag, parent?: ts.Node): void;

    beginVisitJSDocPublicTag?(node: ts.JSDocPublicTag, parent?: ts.Node): void;
    endVisitJSDocPublicTag?(node: ts.JSDocPublicTag, parent?: ts.Node): void;

    beginVisitJSDocPrivateTag?(node: ts.JSDocPrivateTag, parent?: ts.Node): void;
    endVisitJSDocPrivateTag?(node: ts.JSDocPrivateTag, parent?: ts.Node): void;

    beginVisitJSDocProtectedTag?(node: ts.JSDocProtectedTag, parent?: ts.Node): void;
    endVisitJSDocProtectedTag?(node: ts.JSDocProtectedTag, parent?: ts.Node): void;

    beginVisitJSDocReadonlyTag?(node: ts.JSDocReadonlyTag, parent?: ts.Node): void;
    endVisitJSDocReadonlyTag?(node: ts.JSDocReadonlyTag, parent?: ts.Node): void;

    beginVisitJSDocOverrideTag?(node: ts.JSDocOverrideTag, parent?: ts.Node): void;
    endVisitJSDocOverrideTag?(node: ts.JSDocOverrideTag, parent?: ts.Node): void;

    beginVisitJSDocCallbackTag?(node: ts.JSDocCallbackTag, parent?: ts.Node): void;
    endVisitJSDocCallbackTag?(node: ts.JSDocCallbackTag, parent?: ts.Node): void;

    beginVisitJSDocOverloadTag?(node: ts.JSDocOverloadTag, parent?: ts.Node): void;
    endVisitJSDocOverloadTag?(node: ts.JSDocOverloadTag, parent?: ts.Node): void;

    beginVisitJSDocEnumTag?(node: ts.JSDocEnumTag, parent?: ts.Node): void;
    endVisitJSDocEnumTag?(node: ts.JSDocEnumTag, parent?: ts.Node): void;

    beginVisitJSDocParameterTag?(node: ts.JSDocParameterTag, parent?: ts.Node): void;
    endVisitJSDocParameterTag?(node: ts.JSDocParameterTag, parent?: ts.Node): void;

    beginVisitJSDocReturnTag?(node: ts.JSDocReturnTag, parent?: ts.Node): void;
    endVisitJSDocReturnTag?(node: ts.JSDocReturnTag, parent?: ts.Node): void;

    beginVisitJSDocThisTag?(node: ts.JSDocThisTag, parent?: ts.Node): void;
    endVisitJSDocThisTag?(node: ts.JSDocThisTag, parent?: ts.Node): void;

    beginVisitJSDocTypeTag?(node: ts.JSDocTypeTag, parent?: ts.Node): void;
    endVisitJSDocTypeTag?(node: ts.JSDocTypeTag, parent?: ts.Node): void;

    beginVisitJSDocTemplateTag?(node: ts.JSDocTemplateTag, parent?: ts.Node): void;
    endVisitJSDocTemplateTag?(node: ts.JSDocTemplateTag, parent?: ts.Node): void;

    beginVisitJSDocTypedefTag?(node: ts.JSDocTypedefTag, parent?: ts.Node): void;
    endVisitJSDocTypedefTag?(node: ts.JSDocTypedefTag, parent?: ts.Node): void;

    beginVisitJSDocSeeTag?(node: ts.JSDocSeeTag, parent?: ts.Node): void;
    endVisitJSDocSeeTag?(node: ts.JSDocSeeTag, parent?: ts.Node): void;

    beginVisitJSDocPropertyTag?(node: ts.JSDocPropertyTag, parent?: ts.Node): void;
    endVisitJSDocPropertyTag?(node: ts.JSDocPropertyTag, parent?: ts.Node): void;

    beginVisitJSDocThrowsTag?(node: ts.JSDocThrowsTag, parent?: ts.Node): void;
    endVisitJSDocThrowsTag?(node: ts.JSDocThrowsTag, parent?: ts.Node): void;

    beginVisitJSDocSatisfiesTag?(node: ts.JSDocSatisfiesTag, parent?: ts.Node): void;
    endVisitJSDocSatisfiesTag?(node: ts.JSDocSatisfiesTag, parent?: ts.Node): void;

    beginVisitSyntaxList?(node: ts.SyntaxList, parent?: ts.Node): void;
    endVisitSyntaxList?(node: ts.SyntaxList, parent?: ts.Node): void;

    beginVisitNotEmittedStatement?(node: ts.NotEmittedStatement, parent?: ts.Node): void;
    endVisitNotEmittedStatement?(node: ts.NotEmittedStatement, parent?: ts.Node): void;

    beginVisitPartiallyEmittedExpression?(node: ts.PartiallyEmittedExpression, parent?: ts.Node): void;
    endVisitPartiallyEmittedExpression?(node: ts.PartiallyEmittedExpression, parent?: ts.Node): void;

    beginVisitCommaListExpression?(node: ts.CommaListExpression, parent?: ts.Node): void;
    endVisitCommaListExpression?(node: ts.CommaListExpression, parent?: ts.Node): void;
}
