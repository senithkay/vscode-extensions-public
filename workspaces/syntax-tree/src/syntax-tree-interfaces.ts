// This is an auto-generated file. Do not edit.
// Run 'BALLERINA_HOME="your/ballerina/home" npm run gen-models' to generate.
// eslint-disable ban-types

export interface VisibleEndpoint {
    kind?: string;
    isCaller: boolean;
    isExternal: boolean;
    isModuleVar: boolean;
    moduleName: string;
    name: string;
    packageName: string;
    orgName: string;
    version: string;
    typeName: string;
    position: NodePosition;
    viewState?: any;
    isParameter?: boolean;
    isClassField?: boolean;
}

export interface NodePosition {
    startLine?: number;
    startColumn?: number;
    endLine?: number;
    endColumn?: number;
}

export interface Minutiae {
    isInvalid: boolean;
    kind: string;
    minutiae: string;
}

export interface ControlFlow {
    isReached?: boolean;
    isCompleted?: boolean;
    numberOfIterations?: number;
    executionTime?: number;
}

export interface SyntaxDiagnostics {
    diagnosticInfo: DiagnosticInfo;
    message: string;
}

export interface Diagnostic {
    diagnosticInfo: DiagnosticInfo;
    message: string;
}

export interface DiagnosticInfo {
    code: string;
    severity: string;
}

export interface PerfData {
    concurrency: string;
    latency: string;
    tps: string;
    analyzeType: string;
}

export interface STNode {
    kind: string;
    value?: any;
    parent?: STNode;
    viewState?: any;
    dataMapperViewState?: any;
    dataMapperTypeDescNode?: STNode;
    position?: any;
    typeData?: any;
    VisibleEndpoints?: VisibleEndpoint[];
    source: string;
    configurablePosition?: NodePosition;
    controlFlow?: ControlFlow;
    syntaxDiagnostics: SyntaxDiagnostics[];
    performance?: PerfData;
    leadingMinutiae: Minutiae[];
    trailingMinutiae: Minutiae[];
}

export interface ActionStatement extends STNode {
    expression: AsyncSendAction | CheckAction | RemoteMethodCallAction | WaitAction;
    semicolonToken: SemicolonToken;
}

export interface AnnotAccess extends STNode {
    annotChainingToken: AnnotChainingToken;
    annotTagReference: SimpleNameReference;
    expression: SimpleNameReference;
}

export interface AnnotChainingToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface Annotation extends STNode {
    annotReference: QualifiedNameReference | SimpleNameReference;
    annotValue?: MappingConstructor;
    atToken: AtToken;
}

export interface AnnotationAttachPoint extends STNode {
    identifiers: TypeKeyword[];
}

export interface AnnotationDeclaration extends STNode {
    annotationKeyword: AnnotationKeyword;
    annotationTag: IdentifierToken;
    attachPoints: AnnotationAttachPoint[];
    onKeyword: OnKeyword;
    semicolonToken: SemicolonToken;
    typeDescriptor: SimpleNameReference;
}

export interface AnnotationKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface AnyKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface AnyTypeDesc extends STNode {
    name: AnyKeyword;
}

export interface AnydataKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface AnydataTypeDesc extends STNode {
    name: AnydataKeyword;
}

export interface ArrayDimension extends STNode {
    arrayLength?: AsteriskLiteral | NumericLiteral | SimpleNameReference;
    closeBracket: CloseBracketToken;
    openBracket: OpenBracketToken;
}

export interface ArrayTypeDesc extends STNode {
    dimensions: ArrayDimension[];
    memberTypeDesc:
        | AnyTypeDesc
        | AnydataTypeDesc
        | ByteTypeDesc
        | FloatTypeDesc
        | IntTypeDesc
        | JsonTypeDesc
        | MapTypeDesc
        | OptionalTypeDesc
        | ParenthesisedTypeDesc
        | QualifiedNameReference
        | RecordTypeDesc
        | SimpleNameReference
        | StringTypeDesc
        | TupleTypeDesc;
}

export interface AsKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface AscendingKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface AssignmentStatement extends STNode {
    equalsToken: EqualToken;
    expression:
        | BinaryExpression
        | BooleanLiteral
        | CheckAction
        | CheckExpression
        | ClientResourceAccessAction
        | ConditionalExpression
        | FieldAccess
        | FunctionCall
        | ImplicitNewExpression
        | IndexedExpression
        | ListConstructor
        | MappingConstructor
        | MethodCall
        | NilLiteral
        | NumericLiteral
        | QueryExpression
        | ReceiveAction
        | RemoteMethodCallAction
        | SimpleNameReference
        | StringLiteral
        | SyncSendAction
        | TypeCastExpression;
    semicolonToken: SemicolonToken;
    varRef: ErrorBindingPattern | FieldAccess | IndexedExpression | ListBindingPattern | MappingBindingPattern | SimpleNameReference | WildcardBindingPattern;
}

export interface AsteriskLiteral extends STNode {
    literalToken: AsteriskToken;
}

export interface AsteriskToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface AsyncSendAction extends STNode {
    expression: NumericLiteral | SimpleNameReference | StringLiteral;
    peerWorker: SimpleNameReference;
    rightArrowToken: RightArrowToken;
}

export interface AtToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface BacktickToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface Base16Keyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface Base64Keyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface BinaryExpression extends STNode {
    lhsExpr:
        | BinaryExpression
        | FieldAccess
        | FunctionCall
        | IndexedExpression
        | ListConstructor
        | MethodCall
        | NumericLiteral
        | QualifiedNameReference
        | SimpleNameReference
        | StringLiteral
        | TypeTestExpression
        | TypeofExpression
        | UnaryExpression;
    operator:
        | AsteriskToken
        | BitwiseAndToken
        | DoubleDotLtToken
        | DoubleEqualToken
        | EllipsisToken
        | ElvisToken
        | GtEqualToken
        | GtToken
        | LogicalAndToken
        | LogicalOrToken
        | LtEqualToken
        | LtToken
        | MinusToken
        | NotDoubleEqualToken
        | NotEqualToken
        | PercentToken
        | PipeToken
        | PlusToken
        | SlashToken
        | TrippleEqualToken;
    rhsExpr:
        | BinaryExpression
        | BracedExpression
        | CheckExpression
        | FieldAccess
        | FunctionCall
        | IndexedExpression
        | ListConstructor
        | MappingConstructor
        | MethodCall
        | NilLiteral
        | NullLiteral
        | NumericLiteral
        | QualifiedNameReference
        | SimpleNameReference
        | StringLiteral
        | TypeCastExpression
        | TypeTestExpression
        | UnaryExpression
        | XmlFilterExpression;
}

export interface BitwiseAndToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface BlockStatement extends STNode {
    VisibleEndpoints?: any[];
    closeBraceToken: CloseBraceToken;
    openBraceToken: OpenBraceToken;
    statements: (
        | ActionStatement
        | AssignmentStatement
        | BreakStatement
        | CallStatement
        | CompoundAssignmentStatement
        | ContinueStatement
        | FailStatement
        | ForeachStatement
        | IfElseStatement
        | LocalVarDecl
        | PanicStatement
        | ReturnStatement
        | RollbackStatement
        | WhileStatement
    )[];
}

export interface BooleanKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface BooleanLiteral extends STNode {
    literalToken: FalseKeyword | TrueKeyword;
}

export interface BooleanTypeDesc extends STNode {
    name: BooleanKeyword;
}

export interface BracedExpression extends STNode {
    closeParen: CloseParenToken;
    expression:
        | BinaryExpression
        | CheckExpression
        | FunctionCall
        | MethodCall
        | SimpleNameReference
        | TypeCastExpression
        | TypeTestExpression
        | UnaryExpression
        | XmlStepExpression;
    openParen: OpenParenToken;
}

export interface BreakKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface BreakStatement extends STNode {
    breakToken: BreakKeyword;
    semicolonToken: SemicolonToken;
}

export interface ByKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ByteArrayLiteral extends STNode {
    content: TemplateString;
    endBacktick: BacktickToken;
    startBacktick: BacktickToken;
    type: Base16Keyword | Base64Keyword;
}

export interface ByteKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ByteTypeDesc extends STNode {
    name: ByteKeyword;
}

export interface CallStatement extends STNode {
    expression: CheckExpression | FunctionCall | MethodCall;
    semicolonToken: SemicolonToken;
}

export interface CaptureBindingPattern extends STNode {
    variableName: IdentifierToken;
}

export interface CheckAction extends STNode {
    checkKeyword: CheckKeyword | CheckpanicKeyword;
    expression: ClientResourceAccessAction | CommitAction | QueryAction | ReceiveAction | RemoteMethodCallAction | WaitAction;
}

export interface CheckExpression extends STNode {
    checkKeyword: CheckKeyword | CheckpanicKeyword;
    expression:
        | ExplicitNewExpression
        | FieldAccess
        | FunctionCall
        | ImplicitNewExpression
        | IndexedExpression
        | MethodCall
        | OptionalFieldAccess
        | QueryExpression
        | SimpleNameReference;
}

export interface CheckKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface CheckpanicKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ClassDefinition extends STNode {
    classKeyword: ClassKeyword;
    className: IdentifierToken;
    classTypeQualifiers: (ClientKeyword | DistinctKeyword | IsolatedKeyword | ReadonlyKeyword | ServiceKeyword)[];
    closeBrace: CloseBraceToken;
    members: (ObjectField | ObjectMethodDefinition | ResourceAccessorDefinition | TypeReference)[];
    metadata?: Metadata;
    openBrace: OpenBraceToken;
    visibilityQualifier?: PublicKeyword;
}

export interface ClassKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ClientKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ClientResourceAccessAction extends STNode {
    arguments?: ParenthesizedArgList;
    dotToken?: DotToken;
    expression: FieldAccess | SimpleNameReference;
    methodName?: SimpleNameReference;
    resourceAccessPath: (ComputedResourceAccessSegment | IdentifierToken | SlashToken)[];
    rightArrowToken: RightArrowToken;
    slashToken: SlashToken;
}

export interface CloseBracePipeToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface CloseBraceToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface CloseBracketToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface CloseParenToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface CodeContent extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ColonToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface CommaToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface CommitAction extends STNode {
    commitKeyword: CommitKeyword;
}

export interface CommitKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface CompoundAssignmentStatement extends STNode {
    binaryOperator: PlusToken;
    equalsToken: EqualToken;
    lhsExpression: FieldAccess | IndexedExpression | SimpleNameReference;
    rhsExpression: BinaryExpression | NumericLiteral | SimpleNameReference | StringLiteral;
    semicolonToken: SemicolonToken;
}

export interface ComputedNameField extends STNode {
    closeBracket: CloseBracketToken;
    colonToken: ColonToken;
    fieldNameExpr: BinaryExpression | SimpleNameReference;
    openBracket: OpenBracketToken;
    valueExpr: SimpleNameReference;
}

export interface ComputedResourceAccessSegment extends STNode {
    closeBracketToken: CloseBracketToken;
    expression: SimpleNameReference | StringLiteral;
    openBracketToken: OpenBracketToken;
}

export interface ConditionalExpression extends STNode {
    colonToken: ColonToken;
    endExpression: FieldAccess | MethodCall | NumericLiteral | SimpleNameReference | StringLiteral;
    lhsExpression: BinaryExpression | MethodCall | TypeTestExpression;
    middleExpression: MethodCall | NilLiteral | NumericLiteral | StringLiteral | TypeCastExpression;
    questionMarkToken: QuestionMarkToken;
}

export interface ConfigurableKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ConflictKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ConstDeclaration extends STNode {
    constKeyword: ConstKeyword;
    equalsToken: EqualToken;
    initializer: BinaryExpression | NumericLiteral | StringLiteral;
    semicolonToken: SemicolonToken;
    typeDescriptor?: IntTypeDesc | StringTypeDesc;
    variableName: IdentifierToken;
    visibilityQualifier?: PublicKeyword;
}

export interface ConstKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ContinueKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ContinueStatement extends STNode {
    continueToken: ContinueKeyword;
    semicolonToken: SemicolonToken;
}

export interface DecimalFloatingPointLiteralToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DecimalIntegerLiteralToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DecimalKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DecimalTypeDesc extends STNode {
    name: DecimalKeyword;
}

export interface DefaultableParam extends STNode {
    annotations: any;
    equalsToken: EqualToken;
    expression: BooleanLiteral | MappingConstructor | MethodCall | NilLiteral | NumericLiteral | QualifiedNameReference | SimpleNameReference | StringLiteral;
    paramName: IdentifierToken;
    typeName: BooleanTypeDesc | DecimalTypeDesc | IntTypeDesc | MapTypeDesc | OptionalTypeDesc | QualifiedNameReference | StringTypeDesc | UnionTypeDesc;
}

export interface DeprecationLiteral extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DescendingKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DistinctKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DistinctTypeDesc extends STNode {
    distinctKeyword: DistinctKeyword;
    typeDescriptor: ErrorTypeDesc | ObjectTypeDesc;
}

export interface DoKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DoStatement extends STNode {
    blockStatement: BlockStatement;
    doKeyword: DoKeyword;
    onFailClause?: OnFailClause;
}

export interface DocumentationDescription extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DotLtToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DotToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DoubleDotLtToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DoubleEqualToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DoubleQuoteToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface DoubleSlashDoubleAsteriskLtToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface EllipsisToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ElseBlock extends STNode {
    elseBody: BlockStatement | IfElseStatement;
    elseKeyword: ElseKeyword;
}

export interface ElseKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ElvisToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface EnumDeclaration extends STNode {
    closeBraceToken: CloseBraceToken;
    enumKeywordToken: EnumKeyword;
    enumMemberList: (CommaToken | EnumMember)[];
    identifier: IdentifierToken;
    openBraceToken: OpenBraceToken;
}

export interface EnumKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface EnumMember extends STNode {
    constExprNode?: StringLiteral;
    equalToken?: EqualToken;
    identifier: IdentifierToken;
    metadata?: Metadata;
}

export interface EofToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface EqualToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface EqualsKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ErrorBindingPattern extends STNode {
    argListBindingPatterns: (CaptureBindingPattern | CommaToken | NamedArgBindingPattern | RestBindingPattern | WildcardBindingPattern)[];
    closeParenthesis: CloseParenToken;
    errorKeyword: ErrorKeyword;
    openParenthesis: OpenParenToken;
    typeReference?: SimpleNameReference;
}

export interface ErrorConstructor extends STNode {
    arguments: (CommaToken | NamedArg | PositionalArg)[];
    closeParenToken: CloseParenToken;
    errorKeyword: ErrorKeyword;
    openParenToken: OpenParenToken;
    typeReference?: QualifiedNameReference | SimpleNameReference;
}

export interface ErrorKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ErrorTypeDesc extends STNode {
    keywordToken: ErrorKeyword;
    typeParamNode?: TypeParameter;
}

export interface ExclamationMarkToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ExplicitAnonymousFunctionExpression extends STNode {
    annotations: any;
    functionBody: ExpressionFunctionBody | FunctionBodyBlock;
    functionKeyword: FunctionKeyword;
    functionSignature: FunctionSignature;
    qualifierList: IsolatedKeyword[];
}

export interface ExplicitNewExpression extends STNode {
    newKeyword: NewKeyword;
    parenthesizedArgList: ParenthesizedArgList;
    typeDescriptor: QualifiedNameReference | SimpleNameReference | StreamTypeDesc;
}

export interface ExpressionFunctionBody extends STNode {
    expression: BinaryExpression | FieldAccess | LetExpression;
    rightDoubleArrow: RightDoubleArrowToken;
    semicolon?: SemicolonToken;
}

export interface ExternalFunctionBody extends STNode {
    annotations: Annotation[];
    equalsToken: EqualToken;
    externalKeyword: ExternalKeyword;
    semicolonToken: SemicolonToken;
}

export interface ExternalKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface FailKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface FailStatement extends STNode {
    expression: ErrorConstructor;
    failKeyword: FailKeyword;
    semicolonToken: SemicolonToken;
}

export interface FalseKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface FieldAccess extends STNode {
    dotToken: DotToken;
    expression: FieldAccess | IndexedExpression | MethodCall | SimpleNameReference;
    fieldName: SimpleNameReference;
}

export interface FieldBindingPattern extends STNode {
    bindingPattern?: CaptureBindingPattern | MappingBindingPattern | WildcardBindingPattern;
    colon?: ColonToken;
    variableName: SimpleNameReference;
}

export interface FieldMatchPattern extends STNode {
    colonToken: ColonToken;
    fieldNameNode: IdentifierToken;
    matchPattern: StringLiteral | TypedBindingPattern;
}

export interface FinalKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface FloatKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface FloatTypeDesc extends STNode {
    name: FloatKeyword;
}

export interface FlushAction extends STNode {
    flushKeyword: FlushKeyword;
    peerWorker: SimpleNameReference;
}

export interface FlushKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ForeachKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ForeachStatement extends STNode {
    actionOrExpressionNode: BinaryExpression | FieldAccess | MethodCall | SimpleNameReference;
    blockStatement: BlockStatement;
    forEachKeyword: ForeachKeyword;
    inKeyword: InKeyword;
    typedBindingPattern: TypedBindingPattern;
}

export interface FromClause extends STNode {
    expression: SimpleNameReference | XmlStepExpression;
    fromKeyword: FromKeyword;
    inKeyword: InKeyword;
    typedBindingPattern: TypedBindingPattern;
}

export interface FromKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface FunctionBodyBlock extends STNode {
    VisibleEndpoints?: any[];
    closeBraceToken: CloseBraceToken;
    namedWorkerDeclarator?: NamedWorkerDeclarator;
    openBraceToken: OpenBraceToken;
    statements: (
        | ActionStatement
        | AssignmentStatement
        | CallStatement
        | CompoundAssignmentStatement
        | DoStatement
        | ForeachStatement
        | IfElseStatement
        | LocalVarDecl
        | LockStatement
        | MatchStatement
        | PanicStatement
        | RetryStatement
        | ReturnStatement
        | TransactionStatement
        | WhileStatement
        | XmlNamespaceDeclaration
    )[];
}

export interface FunctionCall extends STNode {
    arguments: (CommaToken | NamedArg | PositionalArg | RestArg)[];
    closeParenToken: CloseParenToken;
    functionName: QualifiedNameReference | SimpleNameReference;
    openParenToken: OpenParenToken;
}

export interface FunctionDefinition extends STNode {
    functionBody: ExpressionFunctionBody | ExternalFunctionBody | FunctionBodyBlock;
    functionKeyword: FunctionKeyword;
    functionName: IdentifierToken;
    functionSignature: FunctionSignature;
    metadata?: Metadata;
    qualifierList: (IsolatedKeyword | PublicKeyword | TransactionalKeyword)[];
    relativeResourcePath: any;
    isRunnable?: boolean;
    runArgs?: any[];
}

export interface FunctionKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface FunctionSignature extends STNode {
    closeParenToken: CloseParenToken;
    openParenToken: OpenParenToken;
    parameters: (CommaToken | DefaultableParam | IncludedRecordParam | RequiredParam | RestParam)[];
    returnTypeDesc?: ReturnTypeDescriptor;
}

export interface FunctionTypeDesc extends STNode {
    functionKeyword: FunctionKeyword;
    functionSignature: FunctionSignature;
    qualifierList: IsolatedKeyword[];
}

export interface FutureKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface FutureTypeDesc extends STNode {
    keywordToken: FutureKeyword;
    typeParamNode: TypeParameter;
}

export interface GtEqualToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface GtToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface HandleKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface HandleTypeDesc extends STNode {
    name: HandleKeyword;
}

export interface HashToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface HexIntegerLiteralToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface IdentifierToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface IfElseStatement extends STNode {
    condition:
        | BinaryExpression
        | BracedExpression
        | FieldAccess
        | FunctionCall
        | MethodCall
        | SimpleNameReference
        | TransactionalExpression
        | TypeTestExpression
        | UnaryExpression;
    elseBody?: ElseBlock;
    ifBody: BlockStatement;
    ifKeyword: IfKeyword;
}

export interface IfKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ImplicitAnonymousFunctionExpression extends STNode {
    expression: BinaryExpression | FunctionCall | NumericLiteral;
    params: InferParamList | SimpleNameReference;
    rightDoubleArrow: RightDoubleArrowToken;
}

export interface ImplicitNewExpression extends STNode {
    newKeyword: NewKeyword;
    parenthesizedArgList?: ParenthesizedArgList;
}

export interface ImportDeclaration extends STNode {
    importKeyword: ImportKeyword;
    moduleName: (DotToken | IdentifierToken)[];
    orgName: ImportOrgName;
    prefix?: ImportPrefix;
    semicolon: SemicolonToken;
}

export interface ImportKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ImportOrgName extends STNode {
    orgName: IdentifierToken;
    slashToken: SlashToken;
}

export interface ImportPrefix extends STNode {
    asKeyword: AsKeyword;
    prefix: IdentifierToken | UnderscoreKeyword;
}

export interface InKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface IncludedRecordParam extends STNode {
    annotations: any;
    asteriskToken: AsteriskToken;
    paramName: IdentifierToken;
    typeName: QualifiedNameReference | SimpleNameReference;
}

export interface IndexedExpression extends STNode {
    closeBracket: CloseBracketToken;
    containerExpression: FieldAccess | FunctionCall | IndexedExpression | MethodCall | SimpleNameReference | XmlStepExpression;
    keyExpression: (BinaryExpression | CommaToken | MappingConstructor | NumericLiteral | SimpleNameReference | StringLiteral)[];
    openBracket: OpenBracketToken;
}

export interface InferParamList extends STNode {
    closeParenToken: CloseParenToken;
    openParenToken: OpenParenToken;
    parameters: (CommaToken | SimpleNameReference)[];
}

export interface InlineCodeReference extends STNode {
    codeReference: CodeContent;
    endBacktick: BacktickToken;
    startBacktick: BacktickToken;
}

export interface IntKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface IntTypeDesc extends STNode {
    name: IntKeyword;
}

export interface Interpolation extends STNode {
    expression: ConditionalExpression | FieldAccess | FunctionCall | IndexedExpression | MethodCall | QueryExpression | SimpleNameReference | StringLiteral;
    interpolationEndToken: CloseBraceToken;
    interpolationStartToken: InterpolationStartToken;
}

export interface InterpolationStartToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface IntersectionTypeDesc extends STNode {
    bitwiseAndToken: BitwiseAndToken;
    leftTypeDesc: ArrayTypeDesc | MapTypeDesc | QualifiedNameReference | ReadonlyTypeDesc | SimpleNameReference;
    rightTypeDesc:
        | ArrayTypeDesc
        | ErrorTypeDesc
        | MapTypeDesc
        | ObjectTypeDesc
        | OptionalTypeDesc
        | QualifiedNameReference
        | ReadonlyTypeDesc
        | RecordTypeDesc
        | SimpleNameReference;
}

export interface IsKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface IsolatedKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface JoinClause extends STNode {
    expression: SimpleNameReference;
    inKeyword: InKeyword;
    joinKeyword: JoinKeyword;
    joinOnCondition: OnClause;
    outerKeyword?: OuterKeyword;
    typedBindingPattern: TypedBindingPattern;
}

export interface JoinKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface JsonKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface JsonTypeDesc extends STNode {
    name: JsonKeyword;
}

export interface KeyKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface KeySpecifier extends STNode {
    closeParenToken: CloseParenToken;
    fieldNames: (CommaToken | IdentifierToken)[];
    keyKeyword: KeyKeyword;
    openParenToken: OpenParenToken;
}

export interface KeyTypeConstraint extends STNode {
    keyKeywordToken: KeyKeyword;
    typeParameterNode: TypeParameter;
}

export interface LeftArrowToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface LetClause extends STNode {
    letKeyword: LetKeyword;
    letVarDeclarations: (CommaToken | LetVarDecl)[];
}

export interface LetExpression extends STNode {
    expression: FunctionCall;
    inKeyword: InKeyword;
    letKeyword: LetKeyword;
    letVarDeclarations: LetVarDecl[];
}

export interface LetKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface LetVarDecl extends STNode {
    annotations: any;
    equalsToken: EqualToken;
    expression: BinaryExpression | BracedExpression;
    typedBindingPattern: TypedBindingPattern;
}

export interface LimitClause extends STNode {
    expression: NumericLiteral;
    limitKeyword: LimitKeyword;
}

export interface LimitKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ListBindingPattern extends STNode {
    bindingPatterns: (CaptureBindingPattern | CommaToken | ListBindingPattern | RestBindingPattern | WildcardBindingPattern)[];
    closeBracket: CloseBracketToken;
    openBracket: OpenBracketToken;
}

export interface ListConstructor extends STNode {
    closeBracket: CloseBracketToken;
    expressions: (
        | BooleanLiteral
        | CommaToken
        | ExplicitNewExpression
        | FieldAccess
        | ImplicitNewExpression
        | ListConstructor
        | MappingConstructor
        | NullLiteral
        | NumericLiteral
        | SimpleNameReference
        | StringLiteral
    )[];
    openBracket: OpenBracketToken;
}

export interface ListenerDeclaration extends STNode {
    equalsToken: EqualToken;
    initializer: CheckExpression | ExplicitNewExpression | ImplicitNewExpression;
    listenerKeyword: ListenerKeyword;
    metadata?: Metadata;
    semicolonToken: SemicolonToken;
    typeDescriptor: QualifiedNameReference;
    variableName: IdentifierToken;
}

export interface ListenerKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface LocalVarDecl extends STNode {
    annotations: any;
    equalsToken?: EqualToken;
    finalKeyword?: FinalKeyword;
    initializer?:
        | AnnotAccess
        | BinaryExpression
        | BooleanLiteral
        | BracedExpression
        | ByteArrayLiteral
        | CheckAction
        | CheckExpression
        | ClientResourceAccessAction
        | CommitAction
        | ConditionalExpression
        | ErrorConstructor
        | ExplicitAnonymousFunctionExpression
        | ExplicitNewExpression
        | FieldAccess
        | FunctionCall
        | ImplicitAnonymousFunctionExpression
        | ImplicitNewExpression
        | IndexedExpression
        | ListConstructor
        | MappingConstructor
        | MethodCall
        | NullLiteral
        | NumericLiteral
        | ObjectConstructor
        | QualifiedNameReference
        | QueryAction
        | QueryExpression
        | ReceiveAction
        | RemoteMethodCallAction
        | SimpleNameReference
        | StartAction
        | StringLiteral
        | StringTemplateExpression
        | SyncSendAction
        | TableConstructor
        | TrapAction
        | TrapExpression
        | TypeCastExpression
        | TypeTestExpression
        | TypeofExpression
        | UnaryExpression
        | WaitAction
        | XmlFilterExpression
        | XmlStepExpression
        | XmlTemplateExpression;
    semicolonToken: SemicolonToken;
    typedBindingPattern: TypedBindingPattern;
}

export interface LockKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface LockStatement extends STNode {
    blockStatement: BlockStatement;
    lockKeyword: LockKeyword;
}

export interface LogicalAndToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface LogicalOrToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface LtEqualToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface LtToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface MapKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface MapTypeDesc extends STNode {
    mapKeywordToken: MapKeyword;
    mapTypeParamsNode: TypeParameter;
}

export interface MappingBindingPattern extends STNode {
    closeBrace: CloseBraceToken;
    fieldBindingPatterns: (CommaToken | FieldBindingPattern | RestBindingPattern)[];
    openBrace: OpenBraceToken;
}

export interface MappingConstructor extends STNode {
    closeBrace: CloseBraceToken;
    fields: (CommaToken | ComputedNameField | SpecificField | SpreadField)[];
    openBrace: OpenBraceToken;
}

export interface MappingMatchPattern extends STNode {
    closeBraceToken: CloseBraceToken;
    fieldMatchPatterns: (CommaToken | FieldMatchPattern)[];
    openBraceToken: OpenBraceToken;
}

export interface MarkdownDeprecationDocumentationLine extends STNode {
    documentElements: DeprecationLiteral[];
    hashToken: HashToken;
}

export interface MarkdownDocumentation extends STNode {
    documentationLines: (
        | MarkdownDeprecationDocumentationLine
        | MarkdownDocumentationLine
        | MarkdownParameterDocumentationLine
        | MarkdownReferenceDocumentationLine
        | MarkdownReturnParameterDocumentationLine
    )[];
}

export interface MarkdownDocumentationLine extends STNode {
    documentElements: DocumentationDescription[];
    hashToken: HashToken;
}

export interface MarkdownParameterDocumentationLine extends STNode {
    documentElements: (DocumentationDescription | InlineCodeReference)[];
    hashToken: HashToken;
    minusToken: MinusToken;
    parameterName: ParameterName;
    plusToken: PlusToken;
}

export interface MarkdownReferenceDocumentationLine extends STNode {
    documentElements: (DocumentationDescription | InlineCodeReference)[];
    hashToken: HashToken;
}

export interface MarkdownReturnParameterDocumentationLine extends STNode {
    documentElements: (DocumentationDescription | InlineCodeReference)[];
    hashToken: HashToken;
    minusToken: MinusToken;
    parameterName: ReturnKeyword;
    plusToken: PlusToken;
}

export interface MatchClause extends STNode {
    blockStatement: BlockStatement;
    matchGuard?: MatchGuard;
    matchPatterns: (MappingMatchPattern | NumericLiteral | PipeToken | SimpleNameReference | StringLiteral | TypedBindingPattern)[];
    rightDoubleArrow: RightDoubleArrowToken;
}

export interface MatchGuard extends STNode {
    expression: BinaryExpression | UnaryExpression;
    ifKeyword: IfKeyword;
}

export interface MatchKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface MatchStatement extends STNode {
    closeBrace: CloseBraceToken;
    condition: SimpleNameReference;
    matchClauses: MatchClause[];
    matchKeyword: MatchKeyword;
    openBrace: OpenBraceToken;
}

export interface Metadata extends STNode {
    annotations: Annotation[];
    documentationString?: MarkdownDocumentation;
}

export interface MethodCall extends STNode {
    arguments: (CommaToken | NamedArg | PositionalArg)[];
    closeParenToken: CloseParenToken;
    dotToken: DotToken;
    expression:
        | BracedExpression
        | ExplicitNewExpression
        | FieldAccess
        | FunctionCall
        | IndexedExpression
        | ListConstructor
        | MethodCall
        | SimpleNameReference
        | StringLiteral;
    methodName: SimpleNameReference;
    openParenToken: OpenParenToken;
}

export interface MethodDeclaration extends STNode {
    functionKeyword: FunctionKeyword;
    methodName: IdentifierToken;
    methodSignature: FunctionSignature;
    qualifierList: any;
    relativeResourcePath: any;
    semicolon: SemicolonToken;
}

export interface MinusToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ModulePart extends STNode {
    eofToken: EofToken;
    imports: ImportDeclaration[];
    members: (
        | AnnotationDeclaration
        | ClassDefinition
        | ConstDeclaration
        | EnumDeclaration
        | FunctionDefinition
        | ListenerDeclaration
        | ModuleVarDecl
        | ModuleXmlNamespaceDeclaration
        | ServiceDeclaration
        | TypeDefinition
    )[];
}

export interface ModuleVarDecl extends STNode {
    equalsToken?: EqualToken;
    initializer?:
        | BinaryExpression
        | BooleanLiteral
        | BracedExpression
        | CheckExpression
        | ConditionalExpression
        | ErrorConstructor
        | FunctionCall
        | ImplicitNewExpression
        | ListConstructor
        | MappingConstructor
        | MethodCall
        | NilLiteral
        | NumericLiteral
        | ObjectConstructor
        | RequiredExpression
        | SimpleNameReference
        | StringLiteral
        | TableConstructor
        | TypeCastExpression
        | XmlTemplateExpression;
    metadata?: Metadata;
    qualifiers: (ConfigurableKeyword | FinalKeyword | IsolatedKeyword)[];
    semicolonToken: SemicolonToken;
    typedBindingPattern: TypedBindingPattern;
}

export interface ModuleXmlNamespaceDeclaration extends STNode {
    asKeyword: AsKeyword;
    namespacePrefix: IdentifierToken;
    namespaceuri: StringLiteral;
    semicolonToken: SemicolonToken;
    xmlnsKeyword: XmlnsKeyword;
}

export interface NamedArg extends STNode {
    argumentName: SimpleNameReference;
    equalsToken: EqualToken;
    expression:
        | BinaryExpression
        | BooleanLiteral
        | ExplicitAnonymousFunctionExpression
        | FieldAccess
        | ListConstructor
        | MappingConstructor
        | MethodCall
        | NumericLiteral
        | OptionalFieldAccess
        | QualifiedNameReference
        | SimpleNameReference
        | StringLiteral;
}

export interface NamedArgBindingPattern extends STNode {
    argName: IdentifierToken;
    bindingPattern: CaptureBindingPattern;
    equalsToken: EqualToken;
}

export interface NamedWorkerDeclaration extends STNode {
    annotations: any;
    returnTypeDesc?: ReturnTypeDescriptor;
    transactionalKeyword?: TransactionalKeyword;
    workerBody: BlockStatement;
    workerKeyword: WorkerKeyword;
    workerName: IdentifierToken;
}

export interface NamedWorkerDeclarator extends STNode {
    namedWorkerDeclarations: NamedWorkerDeclaration[];
    workerInitStatements: (CallStatement | LocalVarDecl)[];
}

export interface NeverKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface NeverTypeDesc extends STNode {
    name: NeverKeyword;
}

export interface NewKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface NilLiteral extends STNode {
    closeParenToken: CloseParenToken;
    openParenToken: OpenParenToken;
}

export interface NilTypeDesc extends STNode {
    closeParenToken: CloseParenToken;
    openParenToken: OpenParenToken;
}

export interface NotDoubleEqualToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface NotEqualToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface NotIsKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface NullKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface NullLiteral extends STNode {
    literalToken: NullKeyword;
}

export interface NumericLiteral extends STNode {
    literalToken: DecimalFloatingPointLiteralToken | DecimalIntegerLiteralToken | HexIntegerLiteralToken;
}

export interface ObjectConstructor extends STNode {
    annotations: any;
    closeBraceToken: CloseBraceToken;
    members: (ObjectField | ObjectMethodDefinition | ResourceAccessorDefinition)[];
    objectKeyword: ObjectKeyword;
    objectTypeQualifiers: ServiceKeyword[];
    openBraceToken: OpenBraceToken;
}

export interface ObjectField extends STNode {
    equalsToken?: EqualToken;
    expression?: ListConstructor | NilLiteral | NumericLiteral | StringLiteral | TableConstructor;
    fieldName: IdentifierToken;
    qualifierList: FinalKeyword[];
    semicolonToken: SemicolonToken;
    typeName:
        | ArrayTypeDesc
        | DecimalTypeDesc
        | IntTypeDesc
        | OptionalTypeDesc
        | QualifiedNameReference
        | SimpleNameReference
        | StreamTypeDesc
        | StringTypeDesc
        | TableTypeDesc;
    visibilityQualifier?: PrivateKeyword | PublicKeyword;
}

export interface ObjectKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ObjectMethodDefinition extends STNode {
    functionBody: ExpressionFunctionBody | FunctionBodyBlock;
    functionKeyword: FunctionKeyword;
    functionName: IdentifierToken;
    functionSignature: FunctionSignature;
    metadata?: Metadata;
    qualifierList: (IsolatedKeyword | PrivateKeyword | PublicKeyword | RemoteKeyword)[];
    relativeResourcePath: any;
}

export interface ObjectTypeDesc extends STNode {
    closeBrace: CloseBraceToken;
    members: (MethodDeclaration | ObjectField | ResourceAccessorDeclaration | TypeReference)[];
    objectKeyword: ObjectKeyword;
    objectTypeQualifiers: (IsolatedKeyword | ServiceKeyword)[];
    openBrace: OpenBraceToken;
}

export interface OnClause extends STNode {
    equalsKeyword: EqualsKeyword;
    lhsExpression: FieldAccess;
    onKeyword: OnKeyword;
    rhsExpression: ConditionalExpression | FieldAccess | OptionalFieldAccess;
}

export interface OnConflictClause extends STNode {
    conflictKeyword: ConflictKeyword;
    expression: NilLiteral | SimpleNameReference;
    onKeyword: OnKeyword;
}

export interface OnFailClause extends STNode {
    blockStatement: BlockStatement;
    failErrorName: IdentifierToken;
    failKeyword: FailKeyword;
    onKeyword: OnKeyword;
    typeDescriptor: ErrorTypeDesc | QualifiedNameReference | VarTypeDesc;
}

export interface OnKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface OpenBracePipeToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface OpenBraceToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface OpenBracketToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface OpenParenToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface OptionalChainingToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface OptionalFieldAccess extends STNode {
    expression: OptionalFieldAccess | SimpleNameReference;
    fieldName: SimpleNameReference;
    optionalChainingToken: OptionalChainingToken;
}

export interface OptionalTypeDesc extends STNode {
    questionMarkToken: QuestionMarkToken;
    typeDescriptor:
        | ArrayTypeDesc
        | ErrorTypeDesc
        | IntTypeDesc
        | JsonTypeDesc
        | MapTypeDesc
        | QualifiedNameReference
        | SimpleNameReference
        | StreamTypeDesc
        | StringTypeDesc
        | XmlTypeDesc;
}

export interface OrderByClause extends STNode {
    byKeyword: ByKeyword;
    orderKey: (CommaToken | OrderKey)[];
    orderKeyword: OrderKeyword;
}

export interface OrderKey extends STNode {
    expression: FieldAccess | SimpleNameReference;
    orderDirection?: AscendingKeyword | DescendingKeyword;
}

export interface OrderKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface OuterKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface PanicKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface PanicStatement extends STNode {
    expression: ErrorConstructor | SimpleNameReference;
    panicKeyword: PanicKeyword;
    semicolonToken: SemicolonToken;
}

export interface ParameterName extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ParenthesisedTypeDesc extends STNode {
    closeParenToken: CloseParenToken;
    openParenToken: OpenParenToken;
    typedesc: ArrayTypeDesc | IntersectionTypeDesc | JsonTypeDesc | QualifiedNameReference | UnionTypeDesc;
}

export interface ParenthesizedArgList extends STNode {
    arguments: (CommaToken | NamedArg | PositionalArg)[];
    closeParenToken: CloseParenToken;
    openParenToken: OpenParenToken;
}

export interface PercentToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface PipeToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface PlusToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface PositionalArg extends STNode {
    expression:
        | BinaryExpression
        | BooleanLiteral
        | CheckExpression
        | ConditionalExpression
        | ErrorConstructor
        | ExplicitAnonymousFunctionExpression
        | ExplicitNewExpression
        | FieldAccess
        | FloatTypeDesc
        | FunctionCall
        | ImplicitAnonymousFunctionExpression
        | IndexedExpression
        | JsonTypeDesc
        | ListConstructor
        | MappingConstructor
        | MethodCall
        | NilLiteral
        | NumericLiteral
        | OptionalFieldAccess
        | QualifiedNameReference
        | RawTemplateExpression
        | SimpleNameReference
        | StringLiteral
        | StringTemplateExpression
        | StringTypeDesc
        | TypeCastExpression
        | TypeTestExpression
        | TypeofExpression
        | UnaryExpression
        | XmlTemplateExpression;
}

export interface PrivateKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface PublicKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface QualifiedNameReference extends STNode {
    colon: ColonToken;
    identifier: IdentifierToken;
    modulePrefix: IdentifierToken;
}

export interface QueryAction extends STNode {
    blockStatement: BlockStatement;
    doKeyword: DoKeyword;
    queryPipeline: QueryPipeline;
}

export interface QueryConstructType extends STNode {
    keySpecifier?: KeySpecifier;
    keyword: MapKeyword | StreamKeyword | TableKeyword;
}

export interface QueryExpression extends STNode {
    onConflictClause?: OnConflictClause;
    queryConstructType?: QueryConstructType;
    queryPipeline: QueryPipeline;
    selectClause: SelectClause;
}

export interface QueryPipeline extends STNode {
    fromClause: FromClause;
    intermediateClauses: (FromClause | JoinClause | LetClause | LimitClause | OrderByClause | WhereClause)[];
}

export interface QuestionMarkToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface RawTemplateExpression extends STNode {
    content: (Interpolation | TemplateString)[];
    endBacktick: BacktickToken;
    startBacktick: BacktickToken;
}

export interface ReadonlyKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ReadonlyTypeDesc extends STNode {
    name: ReadonlyKeyword;
}

export interface ReceiveAction extends STNode {
    leftArrow: LeftArrowToken;
    receiveWorkers: SimpleNameReference;
}

export interface RecordField extends STNode {
    fieldName: IdentifierToken;
    metadata?: Metadata;
    questionMarkToken?: QuestionMarkToken;
    readonlyKeyword?: ReadonlyKeyword;
    semicolonToken: SemicolonToken;
    typeName:
        | ArrayTypeDesc
        | BooleanTypeDesc
        | DecimalTypeDesc
        | FloatTypeDesc
        | IntTypeDesc
        | MapTypeDesc
        | NeverTypeDesc
        | OptionalTypeDesc
        | QualifiedNameReference
        | RecordTypeDesc
        | SimpleNameReference
        | StreamTypeDesc
        | StringTypeDesc
        | TupleTypeDesc
        | UnionTypeDesc
        | XmlTypeDesc;
}

export interface RecordFieldWithDefaultValue extends STNode {
    equalsToken: EqualToken;
    expression: BooleanLiteral | MappingConstructor | NilLiteral | NumericLiteral | QualifiedNameReference | SimpleNameReference | StringLiteral;
    fieldName: IdentifierToken;
    metadata?: Metadata;
    semicolonToken: SemicolonToken;
    typeName: BooleanTypeDesc | DecimalTypeDesc | IntTypeDesc | OptionalTypeDesc | QualifiedNameReference | SimpleNameReference | StringTypeDesc;
}

export interface RecordKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface RecordRestType extends STNode {
    ellipsisToken: EllipsisToken;
    semicolonToken: SemicolonToken;
    typeName: AnydataTypeDesc | BooleanTypeDesc | StringTypeDesc;
}

export interface RecordTypeDesc extends STNode {
    bodyEndDelimiter: CloseBracePipeToken | CloseBraceToken;
    bodyStartDelimiter: OpenBracePipeToken | OpenBraceToken;
    fields: (RecordField | RecordFieldWithDefaultValue | TypeReference)[];
    recordKeyword: RecordKeyword;
    recordRestDescriptor?: RecordRestType;
}

export interface RemoteKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface RemoteMethodCallAction extends STNode {
    arguments: (CommaToken | NamedArg | PositionalArg)[];
    closeParenToken: CloseParenToken;
    expression: FieldAccess | SimpleNameReference;
    methodName: SimpleNameReference;
    openParenToken: OpenParenToken;
    rightArrowToken: RightArrowToken;
}

export interface RequiredExpression extends STNode {
    questionMarkToken: QuestionMarkToken;
}

export interface RequiredParam extends STNode {
    annotations: Annotation[];
    paramName?: IdentifierToken;
    typeName:
        | AnyTypeDesc
        | AnydataTypeDesc
        | ArrayTypeDesc
        | BooleanTypeDesc
        | DecimalTypeDesc
        | ErrorTypeDesc
        | FloatTypeDesc
        | FunctionTypeDesc
        | HandleTypeDesc
        | IntTypeDesc
        | IntersectionTypeDesc
        | JsonTypeDesc
        | MapTypeDesc
        | OptionalTypeDesc
        | QualifiedNameReference
        | RecordTypeDesc
        | SimpleNameReference
        | StreamTypeDesc
        | StringTypeDesc
        | UnionTypeDesc
        | XmlTypeDesc;
}

export interface ResourceAccessorDeclaration extends STNode {
    functionKeyword: FunctionKeyword;
    methodName: IdentifierToken;
    methodSignature: FunctionSignature;
    qualifierList: ResourceKeyword[];
    relativeResourcePath: IdentifierToken[];
    semicolon: SemicolonToken;
}

export interface ResourceAccessorDefinition extends STNode {
    functionBody: FunctionBodyBlock;
    functionKeyword: FunctionKeyword;
    functionName: IdentifierToken;
    functionSignature: FunctionSignature;
    metadata?: Metadata;
    qualifierList: (IsolatedKeyword | ResourceKeyword)[];
    relativeResourcePath: (DotToken | IdentifierToken | ResourcePathRestParam | ResourcePathSegmentParam | SlashToken)[];
}

export interface ResourceKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ResourcePathRestParam extends STNode {
    annotations: any;
    closeBracketToken: CloseBracketToken;
    ellipsisToken: EllipsisToken;
    openBracketToken: OpenBracketToken;
    paramName: IdentifierToken;
    typeDescriptor: StringTypeDesc;
}

export interface ResourcePathSegmentParam extends STNode {
    annotations: any;
    closeBracketToken: CloseBracketToken;
    openBracketToken: OpenBracketToken;
    paramName: IdentifierToken;
    typeDescriptor: StringTypeDesc;
}

export interface RestArg extends STNode {
    ellipsis: EllipsisToken;
    expression: SimpleNameReference;
}

export interface RestBindingPattern extends STNode {
    ellipsisToken: EllipsisToken;
    variableName: SimpleNameReference;
}

export interface RestParam extends STNode {
    annotations: any;
    ellipsisToken: EllipsisToken;
    paramName: IdentifierToken;
    typeName: AnyTypeDesc | QualifiedNameReference | StringTypeDesc | UnionTypeDesc;
}

export interface RestType extends STNode {
    ellipsisToken: EllipsisToken;
    typeDescriptor: AnydataTypeDesc | BooleanTypeDesc | IntTypeDesc;
}

export interface RetryKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface RetryStatement extends STNode {
    retryBody: TransactionStatement;
    retryKeyword: RetryKeyword;
}

export interface ReturnKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ReturnStatement extends STNode {
    expression?:
        | BinaryExpression
        | BooleanLiteral
        | BracedExpression
        | CheckAction
        | ConditionalExpression
        | ErrorConstructor
        | ExplicitNewExpression
        | FieldAccess
        | FunctionCall
        | ImplicitNewExpression
        | IndexedExpression
        | ListConstructor
        | MappingConstructor
        | MethodCall
        | NilLiteral
        | NumericLiteral
        | QualifiedNameReference
        | QueryExpression
        | RemoteMethodCallAction
        | SimpleNameReference
        | StartAction
        | StringLiteral
        | StringTemplateExpression
        | TypeCastExpression
        | WaitAction
        | XmlTemplateExpression;
    returnKeyword: ReturnKeyword;
    semicolonToken: SemicolonToken;
}

export interface ReturnTypeDescriptor extends STNode {
    annotations: Annotation[];
    returnsKeyword: ReturnsKeyword;
    type:
        | AnyTypeDesc
        | ArrayTypeDesc
        | BooleanTypeDesc
        | DecimalTypeDesc
        | FloatTypeDesc
        | FutureTypeDesc
        | HandleTypeDesc
        | IntTypeDesc
        | IntersectionTypeDesc
        | JsonTypeDesc
        | MapTypeDesc
        | NeverTypeDesc
        | NilTypeDesc
        | OptionalTypeDesc
        | ParenthesisedTypeDesc
        | QualifiedNameReference
        | SimpleNameReference
        | StreamTypeDesc
        | StringTypeDesc
        | TableTypeDesc
        | TupleTypeDesc
        | UnionTypeDesc
        | XmlTypeDesc;
}

export interface ReturnsKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface RightArrowToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface RightDoubleArrowToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface RollbackKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface RollbackStatement extends STNode {
    rollbackKeyword: RollbackKeyword;
    semicolon: SemicolonToken;
}

export interface SelectClause extends STNode {
    expression:
        | BinaryExpression
        | FieldAccess
        | FunctionCall
        | ListConstructor
        | MappingConstructor
        | RawTemplateExpression
        | SimpleNameReference
        | StringTemplateExpression
        | XmlTemplateExpression;
    selectKeyword: SelectKeyword;
}

export interface SelectKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface SemicolonToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface ServiceDeclaration extends STNode {
    VisibleEndpoints?: any[];
    absoluteResourcePath: (IdentifierToken | SlashToken | StringLiteral)[];
    closeBraceToken: CloseBraceToken;
    expressions: (ExplicitNewExpression | SimpleNameReference)[];
    members: (ObjectField | ObjectMethodDefinition | ResourceAccessorDefinition)[];
    metadata?: Metadata;
    onKeyword: OnKeyword;
    openBraceToken: OpenBraceToken;
    qualifiers: any;
    serviceKeyword: ServiceKeyword;
    typeDescriptor?: QualifiedNameReference;
    isRunnable?: boolean;
    runArgs?: any[];
}

export interface ServiceKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface SimpleNameReference extends STNode {
    name: FunctionKeyword | IdentifierToken;
}

export interface SingletonTypeDesc extends STNode {
    simpleContExprNode: StringLiteral;
}

export interface SlashAsteriskToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface SlashLtToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface SlashToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface SpecificField extends STNode {
    colon?: ColonToken;
    fieldName: IdentifierToken | StringLiteral;
    valueExpr?:
        | BinaryExpression
        | BooleanLiteral
        | ExplicitAnonymousFunctionExpression
        | ExplicitNewExpression
        | FieldAccess
        | ListConstructor
        | MappingConstructor
        | MethodCall
        | NullLiteral
        | NumericLiteral
        | OptionalFieldAccess
        | QualifiedNameReference
        | SimpleNameReference
        | StringLiteral
        | TypeCastExpression
        | UnaryExpression
        | XmlTemplateExpression;
}

export interface SpreadField extends STNode {
    ellipsis: EllipsisToken;
    valueExpr: SimpleNameReference;
}

export interface StartAction extends STNode {
    annotations: any;
    expression: FunctionCall;
    startKeyword: StartKeyword;
}

export interface StartKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface StreamKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface StreamTypeDesc extends STNode {
    streamKeywordToken: StreamKeyword;
    streamTypeParamsNode: StreamTypeParams;
}

export interface StreamTypeParams extends STNode {
    commaToken?: CommaToken;
    gtToken: GtToken;
    leftTypeDescNode:
        | AnydataTypeDesc
        | ArrayTypeDesc
        | IntTypeDesc
        | IntersectionTypeDesc
        | QualifiedNameReference
        | RecordTypeDesc
        | SimpleNameReference
        | StringTypeDesc;
    ltToken: LtToken;
    rightTypeDescNode?: OptionalTypeDesc;
}

export interface StringKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface StringLiteral extends STNode {
    literalToken: StringLiteralToken;
}

export interface StringLiteralToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface StringTemplateExpression extends STNode {
    content: (Interpolation | TemplateString)[];
    endBacktick: BacktickToken;
    startBacktick: BacktickToken;
    type: StringKeyword;
}

export interface StringTypeDesc extends STNode {
    name: StringKeyword;
}

export interface SyncSendAction extends STNode {
    expression: SimpleNameReference | StringLiteral;
    peerWorker: SimpleNameReference;
    syncSendToken: SyncSendToken;
}

export interface SyncSendToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface TableConstructor extends STNode {
    closeBracket: CloseBracketToken;
    keySpecifier?: KeySpecifier;
    openBracket: OpenBracketToken;
    rows: (CommaToken | MappingConstructor)[];
    tableKeyword: TableKeyword;
}

export interface TableKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface TableTypeDesc extends STNode {
    keyConstraintNode?: KeySpecifier | KeyTypeConstraint;
    rowTypeParameterNode: TypeParameter;
    tableKeywordToken: TableKeyword;
}

export interface TemplateString extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface TransactionKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface TransactionStatement extends STNode {
    blockStatement: BlockStatement;
    onFailClause?: OnFailClause;
    transactionKeyword: TransactionKeyword;
}

export interface TransactionalExpression extends STNode {
    transactionalKeyword: TransactionalKeyword;
}

export interface TransactionalKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface TrapAction extends STNode {
    expression: FlushAction;
    trapKeyword: TrapKeyword;
}

export interface TrapExpression extends STNode {
    expression: FunctionCall;
    trapKeyword: TrapKeyword;
}

export interface TrapKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface TrippleEqualToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface TrueKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface TupleTypeDesc extends STNode {
    closeBracketToken: CloseBracketToken;
    memberTypeDesc: (
        | AnydataTypeDesc
        | BooleanTypeDesc
        | ByteTypeDesc
        | CommaToken
        | FloatTypeDesc
        | IntTypeDesc
        | MapTypeDesc
        | RestType
        | StreamTypeDesc
        | StringTypeDesc
        | TupleTypeDesc
    )[];
    openBracketToken: OpenBracketToken;
}

export interface TypeCastExpression extends STNode {
    expression: BracedExpression | CheckAction | CheckExpression | FieldAccess | FunctionCall | IndexedExpression | MethodCall | SimpleNameReference;
    gtToken: GtToken;
    ltToken: LtToken;
    typeCastParam: TypeCastParam;
}

export interface TypeCastParam extends STNode {
    annotations: Annotation[];
    type?:
        | ArrayTypeDesc
        | ByteTypeDesc
        | ErrorTypeDesc
        | FloatTypeDesc
        | IntTypeDesc
        | JsonTypeDesc
        | MapTypeDesc
        | QualifiedNameReference
        | SimpleNameReference
        | StreamTypeDesc
        | StringTypeDesc;
}

export interface TypeDefinition extends STNode {
    metadata?: Metadata;
    semicolonToken: SemicolonToken;
    typeDescriptor:
        | ArrayTypeDesc
        | DistinctTypeDesc
        | ErrorTypeDesc
        | FunctionTypeDesc
        | IntTypeDesc
        | IntersectionTypeDesc
        | MapTypeDesc
        | ObjectTypeDesc
        | RecordTypeDesc
        | StringTypeDesc
        | TableTypeDesc
        | TypedescTypeDesc
        | UnionTypeDesc;
    typeKeyword: TypeKeyword;
    typeName: IdentifierToken;
    visibilityQualifier?: PublicKeyword;
}

export interface TypeKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface TypeParameter extends STNode {
    gtToken: GtToken;
    ltToken: LtToken;
    typeNode:
        | AnyTypeDesc
        | AnydataTypeDesc
        | ArrayTypeDesc
        | IntTypeDesc
        | JsonTypeDesc
        | NeverTypeDesc
        | NilTypeDesc
        | OptionalTypeDesc
        | ParenthesisedTypeDesc
        | QualifiedNameReference
        | RecordTypeDesc
        | SimpleNameReference
        | StringTypeDesc
        | TupleTypeDesc
        | UnionTypeDesc;
}

export interface TypeReference extends STNode {
    asteriskToken: AsteriskToken;
    semicolonToken: SemicolonToken;
    typeName: QualifiedNameReference | SimpleNameReference;
}

export interface TypeTestExpression extends STNode {
    expression: FieldAccess | FunctionCall | IndexedExpression | ListConstructor | MethodCall | NumericLiteral | SimpleNameReference;
    isKeyword: IsKeyword | NotIsKeyword;
    typeDescriptor:
        | ArrayTypeDesc
        | DecimalTypeDesc
        | ErrorTypeDesc
        | FloatTypeDesc
        | FunctionTypeDesc
        | IntTypeDesc
        | IntersectionTypeDesc
        | JsonTypeDesc
        | NilTypeDesc
        | OptionalTypeDesc
        | ParenthesisedTypeDesc
        | QualifiedNameReference
        | RecordTypeDesc
        | SimpleNameReference
        | SingletonTypeDesc
        | StreamTypeDesc
        | StringTypeDesc
        | TupleTypeDesc
        | UnionTypeDesc
        | XmlTypeDesc;
}

export interface TypedBindingPattern extends STNode {
    bindingPattern: CaptureBindingPattern | ErrorBindingPattern | ListBindingPattern | MappingBindingPattern | WildcardBindingPattern;
    typeDescriptor:
        | AnyTypeDesc
        | AnydataTypeDesc
        | ArrayTypeDesc
        | BooleanTypeDesc
        | DecimalTypeDesc
        | ErrorTypeDesc
        | FloatTypeDesc
        | FunctionTypeDesc
        | FutureTypeDesc
        | HandleTypeDesc
        | IntTypeDesc
        | IntersectionTypeDesc
        | JsonTypeDesc
        | MapTypeDesc
        | OptionalTypeDesc
        | QualifiedNameReference
        | RecordTypeDesc
        | SimpleNameReference
        | StreamTypeDesc
        | StringTypeDesc
        | TableTypeDesc
        | TupleTypeDesc
        | TypedescTypeDesc
        | UnionTypeDesc
        | VarTypeDesc
        | XmlTypeDesc;
}

export interface TypedescKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface TypedescTypeDesc extends STNode {
    keywordToken: TypedescKeyword;
    typeParamNode: TypeParameter;
}

export interface TypeofExpression extends STNode {
    expression: CheckExpression | IndexedExpression | SimpleNameReference;
    typeofKeyword: TypeofKeyword;
}

export interface TypeofKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface UnaryExpression extends STNode {
    expression: BracedExpression | FunctionCall | NumericLiteral | SimpleNameReference;
    unaryOperator: ExclamationMarkToken | MinusToken | PlusToken;
}

export interface UnderscoreKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface UnionTypeDesc extends STNode {
    leftTypeDesc:
        | AnyTypeDesc
        | AnydataTypeDesc
        | ArrayTypeDesc
        | ErrorTypeDesc
        | FloatTypeDesc
        | IntTypeDesc
        | JsonTypeDesc
        | MapTypeDesc
        | QualifiedNameReference
        | RecordTypeDesc
        | SimpleNameReference
        | StreamTypeDesc
        | StringTypeDesc
        | TableTypeDesc
        | UnionTypeDesc
        | XmlTypeDesc;
    pipeToken: PipeToken;
    rightTypeDesc:
        | AnydataTypeDesc
        | ArrayTypeDesc
        | BooleanTypeDesc
        | DecimalTypeDesc
        | ErrorTypeDesc
        | FloatTypeDesc
        | IntTypeDesc
        | JsonTypeDesc
        | ObjectTypeDesc
        | OptionalTypeDesc
        | ParenthesisedTypeDesc
        | QualifiedNameReference
        | SimpleNameReference
        | StringTypeDesc
        | XmlTypeDesc;
}

export interface VarKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface VarTypeDesc extends STNode {
    name: VarKeyword;
}

export interface WaitAction extends STNode {
    waitFutureExpr: BinaryExpression | SimpleNameReference | WaitFieldsList;
    waitKeyword: WaitKeyword;
}

export interface WaitField extends STNode {
    colon: ColonToken;
    fieldName: SimpleNameReference;
    waitFutureExpr: SimpleNameReference;
}

export interface WaitFieldsList extends STNode {
    closeBrace: CloseBraceToken;
    openBrace: OpenBraceToken;
    waitFields: (CommaToken | WaitField)[];
}

export interface WaitKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface WhereClause extends STNode {
    expression: BinaryExpression | FieldAccess;
    whereKeyword: WhereKeyword;
}

export interface WhereKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface WhileKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface WhileStatement extends STNode {
    condition: BinaryExpression | BooleanLiteral | BracedExpression | SimpleNameReference | UnaryExpression;
    whileBody: BlockStatement;
    whileKeyword: WhileKeyword;
}

export interface WildcardBindingPattern extends STNode {
    underscoreToken: UnderscoreKeyword;
}

export interface WorkerKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface XmlAtomicNamePattern extends STNode {
    colon: ColonToken;
    name: IdentifierToken;
    prefix: IdentifierToken;
}

export interface XmlAttribute extends STNode {
    attributeName: XmlQualifiedName | XmlSimpleName;
    equalToken: EqualToken;
    value: XmlAttributeValue;
}

export interface XmlAttributeValue extends STNode {
    endQuote: DoubleQuoteToken;
    startQuote: DoubleQuoteToken;
    value: (Interpolation | XmlTextContent)[];
}

export interface XmlComment extends STNode {
    commentEnd: XmlCommentEndToken;
    commentStart: XmlCommentStartToken;
    content: XmlTextContent[];
}

export interface XmlCommentEndToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface XmlCommentStartToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface XmlElement extends STNode {
    content: (Interpolation | XmlComment | XmlElement | XmlEmptyElement | XmlText)[];
    endTag: XmlElementEndTag;
    startTag: XmlElementStartTag;
}

export interface XmlElementEndTag extends STNode {
    getToken: GtToken;
    ltToken: LtToken;
    name: XmlQualifiedName | XmlSimpleName;
    slashToken: SlashToken;
}

export interface XmlElementStartTag extends STNode {
    attributes: XmlAttribute[];
    getToken: GtToken;
    ltToken: LtToken;
    name: XmlQualifiedName | XmlSimpleName;
}

export interface XmlEmptyElement extends STNode {
    attributes: XmlAttribute[];
    getToken: GtToken;
    ltToken: LtToken;
    name: XmlQualifiedName;
    slashToken: SlashToken;
}

export interface XmlFilterExpression extends STNode {
    expression: SimpleNameReference;
    xmlPatternChain: XmlNamePatternChain;
}

export interface XmlKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface XmlNamePatternChain extends STNode {
    gtToken: GtToken;
    startToken: DotLtToken | DoubleSlashDoubleAsteriskLtToken | SlashLtToken;
    xmlNamePattern: (AsteriskToken | PipeToken | SimpleNameReference | XmlAtomicNamePattern)[];
}

export interface XmlNamespaceDeclaration extends STNode {
    asKeyword: AsKeyword;
    namespacePrefix: IdentifierToken;
    namespaceuri: StringLiteral;
    semicolonToken: SemicolonToken;
    xmlnsKeyword: XmlnsKeyword;
}

export interface XmlPi extends STNode {
    data: XmlTextContent[];
    piEnd: XmlPiEndToken;
    piStart: XmlPiStartToken;
    target: XmlSimpleName;
}

export interface XmlPiEndToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface XmlPiStartToken extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface XmlQualifiedName extends STNode {
    colon: ColonToken;
    name: XmlSimpleName;
    prefix: XmlSimpleName;
}

export interface XmlSimpleName extends STNode {
    name: IdentifierToken;
}

export interface XmlStepExpression extends STNode {
    expression: SimpleNameReference;
    xmlStepStart: SlashAsteriskToken | XmlNamePatternChain;
}

export interface XmlTemplateExpression extends STNode {
    content: (XmlComment | XmlElement | XmlEmptyElement | XmlPi | XmlText)[];
    endBacktick: BacktickToken;
    startBacktick: BacktickToken;
    type: XmlKeyword;
}

export interface XmlText extends STNode {
    content: XmlTextContent;
}

export interface XmlTextContent extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

export interface XmlTypeDesc extends STNode {
    keywordToken: XmlKeyword;
    typeParamNode?: TypeParameter;
}

export interface XmlnsKeyword extends STNode {
    isMissing: boolean;
    isToken: boolean;
    value: string;
}

// eslint-enable ban-types
