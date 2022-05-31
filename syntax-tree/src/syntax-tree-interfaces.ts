// This is an auto-generated file. Do not edit.
// Run 'BALLERINA_HOME="your/ballerina/home" npm run gen-models' to generate.
// tslint:disable:ban-types

export interface VisibleEndpoint {
  kind?: string;
  isCaller: boolean;
  moduleName: string;
  name: string;
  packageName: string;
  orgName: string;
  version: string;
  typeName: string;
  position: NodePosition;
  viewState?: any;
}

export interface NodePosition {
  startLine?: number;
  startColumn?: number;
  endLine?: number;
  endColumn?: number;
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

export interface DiagnosticInfo {
  code: string;
  severity: string;
}

export interface Minutiae {
  isInvalid: boolean;
  kind: string;
  minutiae: string;
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
  leadingMinutiae: Minutiae[];
  trailingMinutiae: Minutiae[];
}

export interface ActionStatement extends STNode {
  expression:
    | AsyncSendAction
    | CheckAction
    | FlushAction
    | ReceiveAction
    | RemoteMethodCallAction
    | StartAction
    | SyncSendAction
    | WaitAction;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface AnnotAccess extends STNode {
  annotChainingToken: AnnotChainingToken;
  annotTagReference: QualifiedNameReference | SimpleNameReference;
  expression: BracedExpression | SimpleNameReference;
  leadingMinutiae: any;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface AnnotChainingToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface Annotation extends STNode {
  annotReference: QualifiedNameReference | SimpleNameReference;
  annotValue?: MappingConstructor;
  atToken: AtToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface AnnotationAttachPoint extends STNode {
  identifiers:
    | AnnotationKeyword
    | ClassKeyword
    | ConstKeyword
    | ExternalKeyword
    | FieldKeyword
    | FunctionKeyword
    | ListenerKeyword
    | ObjectKeyword
    | ParameterKeyword
    | RecordKeyword
    | ReturnKeyword
    | ServiceKeyword
    | TypeKeyword
    | VarKeyword
    | WorkerKeyword[];
  leadingMinutiae: INVALID_NODE_MINUTIAE[];
  sourceKeyword?: SourceKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface AnnotationDeclaration extends STNode {
  annotationKeyword: AnnotationKeyword;
  annotationTag: IdentifierToken;
  attachPoints: AnnotationAttachPoint | CommaToken[];
  constKeyword?: ConstKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE[];
  metadata?: Metadata;
  onKeyword?: OnKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  typeDescriptor?:
    | ArrayTypeDesc
    | IntTypeDesc
    | MapTypeDesc
    | RecordTypeDesc
    | SimpleNameReference;
  visibilityQualifier?: PublicKeyword;
}

export interface AnnotationDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface AnnotationKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface AnyKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface AnyTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: AnyKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface AnydataKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface AnydataTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: AnydataKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface ArrayDimension extends STNode {
  arrayLength?:
    | AsteriskLiteral
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference;
  closeBracket: CloseBracketToken;
  leadingMinutiae: INVALID_NODE_MINUTIAE[];
  openBracket: OpenBracketToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface ArrayTypeDesc extends STNode {
  dimensions: ArrayDimension[];
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  memberTypeDesc:
    | AnyTypeDesc
    | AnydataTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | XmlTypeDesc;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface AsKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface AscendingKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface AssignmentStatement extends STNode {
  equalsToken: EqualToken;
  expression:
    | AnnotAccess
    | BinaryExpression
    | BooleanLiteral
    | BracedAction
    | BracedExpression
    | ByteArrayLiteral
    | CheckAction
    | CheckExpression
    | ConditionalExpression
    | ErrorConstructor
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | IndexedExpression
    | IntTypeDesc
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | ObjectConstructor
    | OptionalFieldAccess
    | QualifiedNameReference
    | QueryAction
    | QueryExpression
    | RawTemplateExpression
    | ReceiveAction
    | RemoteMethodCallAction
    | SimpleNameReference
    | StartAction
    | StringLiteral
    | StringTemplateExpression
    | SyncSendAction
    | TableConstructor
    | TrapExpression
    | TypeCastExpression
    | TypeTestExpression
    | TypeofExpression
    | UnaryExpression
    | WaitAction
    | XmlFilterExpression
    | XmlStepExpression
    | XmlTemplateExpression;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  varRef:
    | ErrorBindingPattern
    | FieldAccess
    | IndexedExpression
    | ListBindingPattern
    | MappingBindingPattern
    | QualifiedNameReference
    | SimpleNameReference
    | WildcardBindingPattern;
}

export interface AsteriskLiteral extends STNode {
  leadingMinutiae: any;
  literalToken: AsteriskToken;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface AsteriskToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface AsyncSendAction extends STNode {
  expression:
    | BinaryExpression
    | BracedExpression
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  peerWorker: SimpleNameReference;
  rightArrowToken: RightArrowToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: any;
}

export interface AtToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface BacktickToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface BallerinaNameReference extends STNode {
  endBacktick: BacktickToken;
  leadingMinutiae: any;
  nameReference:
    | CodeContent
    | FunctionCall
    | MethodCall
    | QualifiedNameReference
    | SimpleNameReference;
  referenceType:
    | AnnotationDocReferenceToken
    | ConstDocReferenceToken
    | FunctionDocReferenceToken
    | ParameterDocReferenceToken
    | ServiceDocReferenceToken
    | TypeDocReferenceToken
    | VarDocReferenceToken
    | VariableDocReferenceToken;
  startBacktick: BacktickToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface Base16Keyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface Base64Keyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface BinaryExpression extends STNode {
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  lhsExpr:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ByteArrayLiteral
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
    | ObjectConstructor
    | OptionalFieldAccess
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression
    | StringTypeDesc
    | TableConstructor
    | TypeCastExpression
    | TypeTestExpression
    | TypeofExpression
    | UnaryExpression
    | XmlStepExpression
    | XmlTemplateExpression;
  operator:
    | AsteriskToken
    | BitwiseAndToken
    | BitwiseXorToken
    | DoubleDotLtToken
    | DoubleEqualToken
    | DoubleGtToken
    | DoubleLtToken
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
    | TrippleEqualToken
    | TrippleGtToken;
  rhsExpr:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | CheckExpression
    | ErrorConstructor
    | ExplicitAnonymousFunctionExpression
    | FieldAccess
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | IndexedExpression
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | ObjectConstructor
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression
    | TableConstructor
    | TypeCastExpression
    | TypeTestExpression
    | TypeofExpression
    | UnaryExpression
    | XmlFilterExpression
    | XmlTemplateExpression;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface BitwiseAndToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface BitwiseXorToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface BlockStatement extends STNode {
  closeBraceToken: CloseBraceToken;
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  openBraceToken: OpenBraceToken;
  statements:
    | ActionStatement
    | AssignmentStatement
    | BlockStatement
    | BreakStatement
    | CallStatement
    | CompoundAssignmentStatement
    | ContinueStatement
    | DoStatement
    | FailStatement
    | ForeachStatement
    | ForkStatement
    | IfElseStatement
    | InvalidExpressionStatement
    | LocalVarDecl
    | LockStatement
    | MatchStatement
    | PanicStatement
    | ReturnStatement
    | RollbackStatement
    | WhileStatement
    | XmlNamespaceDeclaration[];
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface BooleanKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface BooleanLiteral extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  literalToken: FalseKeyword | TrueKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface BooleanTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: BooleanKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface BracedAction extends STNode {
  closeParen: CloseParenToken;
  expression: CheckAction | QueryAction | TrapAction | WaitAction;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  openParen: OpenParenToken;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface BracedExpression extends STNode {
  closeParen: CloseParenToken;
  expression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | CheckExpression
    | ConditionalExpression
    | ErrorConstructor
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | IndexedExpression
    | IntTypeDesc
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NumericLiteral
    | OptionalFieldAccess
    | QualifiedNameReference
    | QueryExpression
    | RawTemplateExpression
    | SimpleNameReference
    | StringLiteral
    | TableConstructor
    | TrapExpression
    | TypeCastExpression
    | TypeTestExpression
    | TypeofExpression
    | UnaryExpression
    | XmlFilterExpression
    | XmlStepExpression;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  openParen: OpenParenToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface BreakKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae: any;
  value: string;
}

export interface BreakStatement extends STNode {
  breakToken: BreakKeyword;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any;
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface ByKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ByteArrayLiteral extends STNode {
  content?: TemplateString;
  endBacktick: BacktickToken;
  leadingMinutiae: any;
  startBacktick: BacktickToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: any;
  type: Base16Keyword | Base64Keyword;
}

export interface ByteKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ByteTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: ByteKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface COMMENT_MINUTIAE extends STNode {
  isInvalid: boolean;
  minutiae: string;
}

export interface CallStatement extends STNode {
  expression: CheckExpression | FunctionCall | MethodCall;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface CaptureBindingPattern extends STNode {
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  variableName: IdentifierToken;
}

export interface CheckAction extends STNode {
  checkKeyword: CheckKeyword | CheckpanicKeyword;
  expression:
    | BracedAction
    | CommitAction
    | QueryAction
    | ReceiveAction
    | RemoteMethodCallAction
    | TrapAction
    | WaitAction;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface CheckExpression extends STNode {
  checkKeyword: CheckKeyword | CheckpanicKeyword;
  expression:
    | BracedExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | ImplicitNewExpression
    | IndexedExpression
    | LetExpression
    | MethodCall
    | NumericLiteral
    | OptionalFieldAccess
    | QueryExpression
    | SimpleNameReference
    | TrapExpression
    | TypeCastExpression;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface CheckKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface CheckpanicKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ClassDefinition extends STNode {
  classKeyword: ClassKeyword;
  className: IdentifierToken;
  classTypeQualifiers:
    | ClientKeyword
    | DistinctKeyword
    | IsolatedKeyword
    | ReadonlyKeyword
    | ServiceKeyword[];
  closeBrace: CloseBraceToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  members:
    | ObjectField
    | ObjectMethodDefinition
    | ResourceAccessorDefinition
    | TypeReference[];
  metadata?: Metadata;
  openBrace: OpenBraceToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  visibilityQualifier?: PublicKeyword;
}

export interface ClassKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ClientKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface CloseBracePipeToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface CloseBraceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface CloseBracketToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface CloseParenToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface CodeContent extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  value: string;
}

export interface ColonToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface CommaToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface CommitAction extends STNode {
  commitKeyword: CommitKeyword;
  leadingMinutiae: any;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface CommitKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface CompoundAssignmentStatement extends STNode {
  binaryOperator:
    | AsteriskToken
    | BitwiseAndToken
    | BitwiseXorToken
    | DoubleGtToken
    | DoubleLtToken
    | MinusToken
    | PipeToken
    | PlusToken
    | SlashToken
    | TrippleGtToken;
  equalsToken: EqualToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  lhsExpression: FieldAccess | IndexedExpression | SimpleNameReference;
  rhsExpression:
    | BinaryExpression
    | BracedExpression
    | ConditionalExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | LetExpression
    | MethodCall
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | TypeCastExpression;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface ComputedNameField extends STNode {
  closeBracket: CloseBracketToken;
  colonToken: ColonToken;
  fieldNameExpr:
    | BinaryExpression
    | FunctionCall
    | QualifiedNameReference
    | SimpleNameReference
    | StringTemplateExpression;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  openBracket: OpenBracketToken;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  valueExpr:
    | BinaryExpression
    | BooleanLiteral
    | FieldAccess
    | FunctionCall
    | MappingConstructor
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression;
}

export interface ConditionalExpression extends STNode {
  colonToken: ColonToken;
  endExpression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ConditionalExpression
    | FieldAccess
    | FunctionCall
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | TrapExpression
    | TypeCastExpression
    | UnaryExpression
    | XmlTemplateExpression;
  leadingMinutiae: any;
  lhsExpression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | FunctionCall
    | MethodCall
    | SimpleNameReference
    | TypeCastExpression
    | TypeTestExpression
    | UnaryExpression;
  middleExpression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ConditionalExpression
    | ErrorConstructor
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | QueryExpression
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression
    | TrapExpression
    | TypeCastExpression
    | UnaryExpression;
  questionMarkToken: QuestionMarkToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface ConfigurableKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ConflictKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ConstDeclaration extends STNode {
  constKeyword: ConstKeyword;
  equalsToken: EqualToken;
  initializer:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ImplicitNewExpression
    | MappingConstructor
    | NilLiteral
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | UnaryExpression;
  leadingMinutiae: COMMENT_MINUTIAE | END_OF_LINE_MINUTIAE[];
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  typeDescriptor?:
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | FloatTypeDesc
    | IntTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | QualifiedNameReference
    | SimpleNameReference
    | StringTypeDesc;
  variableName: IdentifierToken;
  visibilityQualifier?: PublicKeyword;
}

export interface ConstDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ConstKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: COMMENT_MINUTIAE | END_OF_LINE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ContinueKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: any;
  value: string;
}

export interface ContinueStatement extends STNode {
  continueToken: ContinueKeyword;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any;
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface DecimalFloatingPointLiteralToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface DecimalIntegerLiteralToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface DecimalKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface DecimalTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: DecimalKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface DefaultableParam extends STNode {
  annotations: Annotation[];
  equalsToken: EqualToken;
  expression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ErrorConstructor
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FloatTypeDesc
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | InferredTypedescDefault
    | IntTypeDesc
    | ListConstructor
    | MappingConstructor
    | NilLiteral
    | NumericLiteral
    | ObjectConstructor
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | UnaryExpression
    | XmlTemplateExpression;
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  paramName: IdentifierToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typeName:
    | AnyTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StringTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
}

export interface DeprecationLiteral extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  value: string;
}

export interface DescendingKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface DistinctKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface DistinctTypeDesc extends STNode {
  distinctKeyword: DistinctKeyword;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  typeDescriptor:
    | ErrorTypeDesc
    | IntTypeDesc
    | ObjectTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | TypedescTypeDesc;
}

export interface DoKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface DoStatement extends STNode {
  blockStatement: BlockStatement;
  doKeyword: DoKeyword;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  onFailClause?: OnFailClause;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface DocumentationDescription extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  value: string;
}

export interface DotLtToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface DotToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface DoubleBacktickToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  value: string;
}

export interface DoubleDotLtToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface DoubleEqualToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface DoubleGtToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface DoubleLtToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface DoubleQuoteToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface DoubleSlashDoubleAsteriskLtToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface END_OF_LINE_MINUTIAE extends STNode {
  isInvalid: boolean;
  minutiae: string;
}

export interface EllipsisToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ElseBlock extends STNode {
  elseBody: BlockStatement | IfElseStatement;
  elseKeyword: ElseKeyword;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface ElseKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ElvisToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface EnumDeclaration extends STNode {
  closeBraceToken: CloseBraceToken;
  enumKeywordToken: EnumKeyword;
  enumMemberList: CommaToken | EnumMember[];
  identifier: IdentifierToken;
  leadingMinutiae: COMMENT_MINUTIAE | END_OF_LINE_MINUTIAE[];
  metadata?: Metadata;
  openBraceToken: OpenBraceToken;
  qualifier?: PublicKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface EnumKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: COMMENT_MINUTIAE | END_OF_LINE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface EnumMember extends STNode {
  constExprNode?:
    | BinaryExpression
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral;
  equalToken?: EqualToken;
  identifier: IdentifierToken;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  metadata?: Metadata;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface EofToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: any;
  value: string;
}

export interface EqualToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface EqualsKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ErrorBindingPattern extends STNode {
  argListBindingPatterns:
    | CaptureBindingPattern
    | CommaToken
    | ErrorBindingPattern
    | NamedArgBindingPattern
    | RestBindingPattern
    | WildcardBindingPattern[];
  closeParenthesis: CloseParenToken;
  errorKeyword: ErrorKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  openParenthesis: OpenParenToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  typeReference?: SimpleNameReference;
}

export interface ErrorConstructor extends STNode {
  arguments: CommaToken | NamedArg | PositionalArg[];
  closeParenToken: CloseParenToken;
  errorKeyword: ErrorKeyword;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  typeReference?: QualifiedNameReference | SimpleNameReference;
}

export interface ErrorKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ErrorMatchPattern extends STNode {
  argListMatchPatternNode:
    | CommaToken
    | ErrorMatchPattern
    | IdentifierToken
    | NamedArgMatchPattern
    | RestMatchPattern
    | StringLiteral
    | TypedBindingPattern[];
  closeParenthesisToken: CloseParenToken;
  errorKeyword: ErrorKeyword;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  openParenthesisToken: OpenParenToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  typeReference?: SimpleNameReference;
}

export interface ErrorTypeDesc extends STNode {
  keywordToken: ErrorKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typeParamNode?: TypeParameter;
}

export interface ExclamationMarkToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: any;
  value: string;
}

export interface ExplicitAnonymousFunctionExpression extends STNode {
  annotations: Annotation[];
  functionBody: ExpressionFunctionBody | FunctionBodyBlock;
  functionKeyword: FunctionKeyword;
  functionSignature: FunctionSignature;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  qualifierList: IsolatedKeyword[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface ExplicitNewExpression extends STNode {
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  newKeyword: NewKeyword;
  parenthesizedArgList: ParenthesizedArgList;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typeDescriptor: QualifiedNameReference | SimpleNameReference | StreamTypeDesc;
}

export interface ExpressionFunctionBody extends STNode {
  expression:
    | BinaryExpression
    | BooleanLiteral
    | CheckExpression
    | ConditionalExpression
    | ErrorConstructor
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | IntTypeDesc
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NumericLiteral
    | ObjectConstructor
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression
    | XmlTemplateExpression;
  leadingMinutiae: any;
  rightDoubleArrow: RightDoubleArrowToken;
  semicolon?: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface ExternalFunctionBody extends STNode {
  annotations: Annotation[];
  equalsToken: EqualToken;
  externalKeyword: ExternalKeyword;
  leadingMinutiae: any;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface ExternalKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface FailKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface FailStatement extends STNode {
  expression: ErrorConstructor | FunctionCall | SimpleNameReference;
  failKeyword: FailKeyword;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any;
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface FalseKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface FieldAccess extends STNode {
  dotToken: DotToken;
  expression:
    | BracedExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | OptionalFieldAccess
    | QualifiedNameReference
    | SimpleNameReference
    | XmlStepExpression;
  fieldName: QualifiedNameReference | SimpleNameReference;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface FieldBindingPattern extends STNode {
  bindingPattern?:
    | CaptureBindingPattern
    | ErrorBindingPattern
    | ListBindingPattern
    | MappingBindingPattern
    | WildcardBindingPattern;
  colon?: ColonToken;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  variableName: SimpleNameReference;
}

export interface FieldKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface FieldMatchPattern extends STNode {
  colonToken: ColonToken;
  fieldNameNode: IdentifierToken;
  leadingMinutiae: any;
  matchPattern:
    | BooleanLiteral
    | ListMatchPattern
    | MappingMatchPattern
    | NilLiteral
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | TypedBindingPattern;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface FinalKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface FloatKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface FloatTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: FloatKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface FlushAction extends STNode {
  flushKeyword: FlushKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  peerWorker?: SimpleNameReference;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface FlushKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ForeachKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ForeachStatement extends STNode {
  actionOrExpressionNode:
    | BinaryExpression
    | FieldAccess
    | IndexedExpression
    | ListConstructor
    | MethodCall
    | SimpleNameReference
    | StringTypeDesc
    | WaitAction
    | XmlStepExpression;
  blockStatement: BlockStatement;
  forEachKeyword: ForeachKeyword;
  inKeyword: InKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  onFailClause?: OnFailClause;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  typedBindingPattern: TypedBindingPattern;
}

export interface ForkKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ForkStatement extends STNode {
  closeBraceToken: CloseBraceToken;
  forkKeyword: ForkKeyword;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  namedWorkerDeclarations: NamedWorkerDeclaration[];
  openBraceToken: OpenBraceToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface FromClause extends STNode {
  expression:
    | BinaryExpression
    | BracedExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | ListConstructor
    | MethodCall
    | NumericLiteral
    | QueryExpression
    | SimpleNameReference
    | TypeCastExpression
    | XmlStepExpression;
  fromKeyword: FromKeyword;
  inKeyword: InKeyword;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  typedBindingPattern: TypedBindingPattern;
}

export interface FromKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface FunctionBodyBlock extends STNode {
  VisibleEndpoints?: any[];
  closeBraceToken: CloseBraceToken;
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  namedWorkerDeclarator?: NamedWorkerDeclarator;
  openBraceToken: OpenBraceToken;
  statements:
    | ActionStatement
    | AssignmentStatement
    | BlockStatement
    | BreakStatement
    | CallStatement
    | CompoundAssignmentStatement
    | ContinueStatement
    | DoStatement
    | FailStatement
    | ForeachStatement
    | ForkStatement
    | IfElseStatement
    | InvalidExpressionStatement
    | LocalVarDecl
    | LockStatement
    | MatchStatement
    | PanicStatement
    | ReturnStatement
    | RollbackStatement
    | TransactionStatement
    | WhileStatement
    | XmlNamespaceDeclaration[];
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface FunctionCall extends STNode {
  arguments: CommaToken | NamedArg | PositionalArg | RestArg[];
  closeParenToken: CloseParenToken;
  functionName: QualifiedNameReference | SimpleNameReference;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface FunctionDefinition extends STNode {
  functionBody:
    | ExpressionFunctionBody
    | ExternalFunctionBody
    | FunctionBodyBlock;
  functionKeyword: FunctionKeyword;
  functionName: IdentifierToken;
  functionSignature: FunctionSignature;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  metadata?: Metadata;
  qualifierList: IsolatedKeyword | PublicKeyword | TransactionalKeyword[];
  relativeResourcePath: any;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface FunctionDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface FunctionKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface FunctionSignature extends STNode {
  closeParenToken: CloseParenToken;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  openParenToken: OpenParenToken;
  parameters:
    | CommaToken
    | DefaultableParam
    | IncludedRecordParam
    | RequiredParam
    | RestParam[];
  returnTypeDesc?: ReturnTypeDescriptor;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface FunctionTypeDesc extends STNode {
  functionKeyword: FunctionKeyword;
  functionSignature?: FunctionSignature;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  qualifierList: IsolatedKeyword | TransactionalKeyword[];
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface FutureKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface FutureTypeDesc extends STNode {
  keywordToken: FutureKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  typeParamNode?: TypeParameter;
}

export interface GtEqualToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface GtToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface HandleKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface HandleTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: HandleKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface HashToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface HexFloatingPointLiteralToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface HexIntegerLiteralToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface INVALID_NODE_MINUTIAE extends STNode {
  isInvalid: boolean;
  minutiae: string;
}

export interface IdentifierToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface IfElseStatement extends STNode {
  condition:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | FunctionCall
    | LetExpression
    | ListConstructor
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | TransactionalExpression
    | TrapExpression
    | TypeTestExpression
    | UnaryExpression;
  elseBody?: ElseBlock;
  ifBody: BlockStatement;
  ifKeyword: IfKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface IfKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ImplicitAnonymousFunctionExpression extends STNode {
  expression:
    | BinaryExpression
    | BooleanLiteral
    | CheckExpression
    | ExplicitAnonymousFunctionExpression
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | IndexedExpression
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression
    | UnaryExpression;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  params: InferParamList | SimpleNameReference;
  rightDoubleArrow: RightDoubleArrowToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface ImplicitNewExpression extends STNode {
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  newKeyword: NewKeyword;
  parenthesizedArgList?: ParenthesizedArgList;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface ImportDeclaration extends STNode {
  importKeyword: ImportKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  moduleName: DotToken | IdentifierToken[];
  orgName?: ImportOrgName;
  prefix?: ImportPrefix;
  semicolon: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface ImportKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ImportOrgName extends STNode {
  leadingMinutiae: any;
  orgName: IdentifierToken;
  slashToken: SlashToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: any;
}

export interface ImportPrefix extends STNode {
  asKeyword: AsKeyword;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  prefix: IdentifierToken | UnderscoreKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface InKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface IncludedRecordParam extends STNode {
  annotations: any;
  asteriskToken: AsteriskToken;
  leadingMinutiae: any;
  paramName: IdentifierToken;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
  typeName: IntTypeDesc | QualifiedNameReference | SimpleNameReference;
}

export interface IndexedExpression extends STNode {
  closeBracket: CloseBracketToken;
  containerExpression:
    | BracedExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | OptionalFieldAccess
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | TableConstructor
    | XmlStepExpression;
  keyExpression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | CommaToken
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | TypeCastExpression
    | UnaryExpression
    | XmlTemplateExpression[];
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  openBracket: OpenBracketToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface InferParamList extends STNode {
  closeParenToken: CloseParenToken;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  openParenToken: OpenParenToken;
  parameters: CommaToken | SimpleNameReference[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface InferredTypedescDefault extends STNode {
  gtToken: GtToken;
  leadingMinutiae: any;
  ltToken: LtToken;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface InlineCodeReference extends STNode {
  codeReference: CodeContent;
  endBacktick: BacktickToken | DoubleBacktickToken | TripleBacktickToken;
  leadingMinutiae: any;
  startBacktick: BacktickToken | DoubleBacktickToken | TripleBacktickToken;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface IntKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface IntTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: IntKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface Interpolation extends STNode {
  expression:
    | BinaryExpression
    | ConditionalExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | LetExpression
    | MethodCall
    | NumericLiteral
    | QueryExpression
    | SimpleNameReference
    | StringLiteral
    | TypeCastExpression
    | XmlTemplateExpression;
  interpolationEndToken: CloseBraceToken;
  interpolationStartToken: InterpolationStartToken;
  leadingMinutiae: any;
  syntaxDiagnostics: any[];
  trailingMinutiae: any;
}

export interface InterpolationStartToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface IntersectionTypeDesc extends STNode {
  bitwiseAndToken: BitwiseAndToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  leftTypeDesc:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | DistinctTypeDesc
    | ErrorTypeDesc
    | FutureTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NeverTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | XmlTypeDesc;
  rightTypeDesc:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | DistinctTypeDesc
    | ErrorTypeDesc
    | FunctionTypeDesc
    | IntTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | XmlTypeDesc;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface InvalidExpressionStatement extends STNode {
  expression:
    | BinaryExpression
    | BracedExpression
    | FieldAccess
    | ImplicitAnonymousFunctionExpression
    | IndexedExpression
    | ListConstructor
    | MappingConstructor
    | XmlTemplateExpression;
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface IsKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface IsolatedKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface JoinClause extends STNode {
  expression: BracedExpression | MethodCall | SimpleNameReference;
  inKeyword: InKeyword;
  joinKeyword: JoinKeyword;
  joinOnCondition: OnClause;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  outerKeyword?: OuterKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typedBindingPattern: TypedBindingPattern;
}

export interface JoinKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface JsonKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface JsonTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: JsonKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface KeyKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface KeySpecifier extends STNode {
  closeParenToken: CloseParenToken;
  fieldNames: CommaToken | IdentifierToken[];
  keyKeyword: KeyKeyword;
  leadingMinutiae: any;
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface KeyTypeConstraint extends STNode {
  keyKeywordToken: KeyKeyword;
  leadingMinutiae: any;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  typeParameterNode: TypeParameter;
}

export interface LeftArrowToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface LetClause extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  letKeyword: LetKeyword;
  letVarDeclarations: CommaToken | LetVarDecl[];
  syntaxDiagnostics: any;
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface LetExpression extends STNode {
  expression:
    | BinaryExpression
    | BracedExpression
    | ConditionalExpression
    | ExplicitAnonymousFunctionExpression
    | FieldAccess
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | IndexedExpression
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NumericLiteral
    | SimpleNameReference
    | TypeCastExpression;
  inKeyword: InKeyword;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  letKeyword: LetKeyword;
  letVarDeclarations: CommaToken | LetVarDecl[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface LetKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface LetVarDecl extends STNode {
  annotations: Annotation[];
  equalsToken: EqualToken;
  expression:
    | BinaryExpression
    | BracedExpression
    | CheckExpression
    | ErrorConstructor
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | ImplicitNewExpression
    | IndexedExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NumericLiteral
    | OptionalFieldAccess
    | SimpleNameReference
    | StringLiteral
    | TypeCastExpression
    | UnaryExpression;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  typedBindingPattern: TypedBindingPattern;
}

export interface LimitClause extends STNode {
  expression:
    | FunctionCall
    | NumericLiteral
    | SimpleNameReference
    | UnaryExpression;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  limitKeyword: LimitKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface LimitKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ListBindingPattern extends STNode {
  bindingPatterns:
    | CaptureBindingPattern
    | CommaToken
    | ErrorBindingPattern
    | ListBindingPattern
    | MappingBindingPattern
    | RestBindingPattern
    | WildcardBindingPattern[];
  closeBracket: CloseBracketToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  openBracket: OpenBracketToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface ListConstructor extends STNode {
  closeBracket: CloseBracketToken;
  expressions:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ByteTypeDesc
    | CheckExpression
    | CommaToken
    | ConditionalExpression
    | ErrorConstructor
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | ImplicitNewExpression
    | IndexedExpression
    | IntTypeDesc
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | ObjectConstructor
    | OptionalFieldAccess
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression
    | StringTypeDesc
    | TableConstructor
    | TrapExpression
    | TypeCastExpression
    | TypeTestExpression
    | TypeofExpression
    | UnaryExpression
    | XmlStepExpression
    | XmlTemplateExpression[];
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  openBracket: OpenBracketToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface ListMatchPattern extends STNode {
  closeBracket: CloseBracketToken;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  matchPatterns:
    | BooleanLiteral
    | CommaToken
    | ErrorMatchPattern
    | ListMatchPattern
    | MappingMatchPattern
    | NumericLiteral
    | QualifiedNameReference
    | RestMatchPattern
    | SimpleNameReference
    | StringLiteral
    | TypedBindingPattern[];
  openBracket: OpenBracketToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface ListenerDeclaration extends STNode {
  equalsToken: EqualToken;
  initializer:
    | CheckExpression
    | ExplicitNewExpression
    | ImplicitNewExpression
    | NilLiteral
    | NumericLiteral
    | ObjectConstructor
    | SimpleNameReference;
  leadingMinutiae: COMMENT_MINUTIAE | END_OF_LINE_MINUTIAE[];
  listenerKeyword: ListenerKeyword;
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  typeDescriptor?:
    | FunctionTypeDesc
    | ObjectTypeDesc
    | QualifiedNameReference
    | SimpleNameReference;
  variableName: IdentifierToken;
  visibilityQualifier?: PublicKeyword;
}

export interface ListenerKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: COMMENT_MINUTIAE | END_OF_LINE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface LocalVarDecl extends STNode {
  annotations: Annotation[];
  equalsToken?: EqualToken;
  finalKeyword?: FinalKeyword;
  initializer?:
    | AnnotAccess
    | AsyncSendAction
    | BinaryExpression
    | BooleanLiteral
    | BooleanTypeDesc
    | BracedAction
    | BracedExpression
    | ByteArrayLiteral
    | ByteTypeDesc
    | CheckAction
    | CheckExpression
    | CommitAction
    | ConditionalExpression
    | ErrorConstructor
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FloatTypeDesc
    | FlushAction
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | IndexedExpression
    | IntTypeDesc
    | JsonTypeDesc
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | ObjectConstructor
    | OptionalFieldAccess
    | QualifiedNameReference
    | QueryAction
    | QueryExpression
    | RawTemplateExpression
    | ReceiveAction
    | RemoteMethodCallAction
    | SimpleNameReference
    | StartAction
    | StringLiteral
    | StringTemplateExpression
    | StringTypeDesc
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
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  typedBindingPattern: TypedBindingPattern;
}

export interface LockKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface LockStatement extends STNode {
  blockStatement: BlockStatement;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  lockKeyword: LockKeyword;
  onFailClause?: OnFailClause;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface LogicalAndToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface LogicalOrToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface LtEqualToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface LtToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface MapKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface MapTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  mapKeywordToken: MapKeyword;
  mapTypeParamsNode: TypeParameter;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface MappingBindingPattern extends STNode {
  closeBrace: CloseBraceToken;
  fieldBindingPatterns: CommaToken | FieldBindingPattern | RestBindingPattern[];
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  openBrace: OpenBraceToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface MappingConstructor extends STNode {
  closeBrace: CloseBraceToken;
  fields: CommaToken | ComputedNameField | SpecificField | SpreadField[];
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  openBrace: OpenBraceToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface MappingMatchPattern extends STNode {
  closeBraceToken: CloseBraceToken;
  fieldMatchPatterns: CommaToken | FieldMatchPattern | RestMatchPattern[];
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  openBraceToken: OpenBraceToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface MarkdownCodeBlock extends STNode {
  codeLines: MarkdownCodeLine[];
  endBacktick: TripleBacktickToken;
  endLineHashToken: HashToken;
  langAttribute?: CodeContent;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  startBacktick: TripleBacktickToken;
  startLineHashToken: HashToken;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface MarkdownCodeLine extends STNode {
  codeDescription: CodeContent;
  hashToken: HashToken;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface MarkdownDeprecationDocumentationLine extends STNode {
  documentElements: DeprecationLiteral | DocumentationDescription[];
  hashToken: HashToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface MarkdownDocumentation extends STNode {
  documentationLines:
    | MarkdownCodeBlock
    | MarkdownDeprecationDocumentationLine
    | MarkdownDocumentationLine
    | MarkdownParameterDocumentationLine
    | MarkdownReferenceDocumentationLine
    | MarkdownReturnParameterDocumentationLine[];
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface MarkdownDocumentationLine extends STNode {
  documentElements: DocumentationDescription[];
  hashToken: HashToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface MarkdownParameterDocumentationLine extends STNode {
  documentElements:
    | BallerinaNameReference
    | DocumentationDescription
    | InlineCodeReference[];
  hashToken: HashToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  minusToken: MinusToken;
  parameterName: ParameterName;
  plusToken: PlusToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface MarkdownReferenceDocumentationLine extends STNode {
  documentElements:
    | BallerinaNameReference
    | DocumentationDescription
    | InlineCodeReference[];
  hashToken: HashToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface MarkdownReturnParameterDocumentationLine extends STNode {
  documentElements: DocumentationDescription | InlineCodeReference[];
  hashToken: HashToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  minusToken: MinusToken;
  parameterName: ReturnKeyword;
  plusToken: PlusToken;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface MatchClause extends STNode {
  blockStatement: BlockStatement;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  matchGuard?: MatchGuard;
  matchPatterns:
    | BooleanLiteral
    | ErrorMatchPattern
    | ListMatchPattern
    | MappingMatchPattern
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | PipeToken
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | TypedBindingPattern
    | UnaryExpression[];
  rightDoubleArrow: RightDoubleArrowToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface MatchGuard extends STNode {
  expression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | FunctionCall
    | MethodCall
    | SimpleNameReference
    | TypeTestExpression
    | UnaryExpression;
  ifKeyword: IfKeyword;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface MatchKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface MatchStatement extends STNode {
  closeBrace: CloseBraceToken;
  condition:
    | BracedAction
    | BracedExpression
    | CheckAction
    | LetExpression
    | QueryAction
    | SimpleNameReference
    | TypeCastExpression
    | WaitAction;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  matchClauses: MatchClause[];
  matchKeyword: MatchKeyword;
  onFailClause?: OnFailClause;
  openBrace: OpenBraceToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface Metadata extends STNode {
  annotations: Annotation[];
  documentationString?: MarkdownDocumentation;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface MethodCall extends STNode {
  arguments: CommaToken | NamedArg | PositionalArg | RestArg[];
  closeParenToken: CloseParenToken;
  dotToken: DotToken;
  expression:
    | BracedExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | IntTypeDesc
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | OptionalFieldAccess
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | StringTypeDesc
    | XmlStepExpression;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  methodName: SimpleNameReference;
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface MethodDeclaration extends STNode {
  functionKeyword: FunctionKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  metadata?: Metadata;
  methodName: IdentifierToken;
  methodSignature: FunctionSignature;
  qualifierList:
    | IsolatedKeyword
    | PublicKeyword
    | RemoteKeyword
    | TransactionalKeyword[];
  relativeResourcePath: any;
  semicolon: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface MinusToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ModulePart extends STNode {
  eofToken: EofToken;
  imports: ImportDeclaration[];
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  members:
    | AnnotationDeclaration
    | ClassDefinition
    | ConstDeclaration
    | EnumDeclaration
    | FunctionDefinition
    | ListenerDeclaration
    | ModuleVarDecl
    | ModuleXmlNamespaceDeclaration
    | ServiceDeclaration
    | TypeDefinition[];
  syntaxDiagnostics: any[];
  trailingMinutiae: any;
}

export interface ModuleVarDecl extends STNode {
  equalsToken?: EqualToken;
  initializer?:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ByteArrayLiteral
    | CheckExpression
    | ConditionalExpression
    | ErrorConstructor
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | IndexedExpression
    | IntTypeDesc
    | JsonTypeDesc
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | ObjectConstructor
    | OptionalFieldAccess
    | QualifiedNameReference
    | QueryExpression
    | RequiredExpression
    | SimpleNameReference
    | StringLiteral
    | TableConstructor
    | TypeCastExpression
    | TypeofExpression
    | UnaryExpression
    | XmlFilterExpression
    | XmlTemplateExpression;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  metadata?: Metadata;
  qualifiers: ConfigurableKeyword | FinalKeyword | IsolatedKeyword[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  typedBindingPattern: TypedBindingPattern;
  visibilityQualifier?: PublicKeyword;
}

export interface ModuleXmlNamespaceDeclaration extends STNode {
  asKeyword?: AsKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  namespacePrefix?: IdentifierToken;
  namespaceuri: SimpleNameReference | StringLiteral;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  xmlnsKeyword: XmlnsKeyword;
}

export interface NamedArg extends STNode {
  argumentName: SimpleNameReference;
  equalsToken: EqualToken;
  expression:
    | BinaryExpression
    | BooleanLiteral
    | BooleanTypeDesc
    | ErrorConstructor
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FloatTypeDesc
    | FunctionCall
    | ImplicitNewExpression
    | IndexedExpression
    | IntTypeDesc
    | JsonTypeDesc
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | StringTypeDesc
    | TypeCastExpression
    | TypeTestExpression;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface NamedArgBindingPattern extends STNode {
  argName: IdentifierToken;
  bindingPattern:
    | CaptureBindingPattern
    | ErrorBindingPattern
    | ListBindingPattern
    | MappingBindingPattern
    | WildcardBindingPattern;
  equalsToken: EqualToken;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface NamedArgMatchPattern extends STNode {
  equalToken: EqualToken;
  identifier: IdentifierToken;
  leadingMinutiae: any;
  matchPattern:
    | ListMatchPattern
    | MappingMatchPattern
    | NumericLiteral
    | QualifiedNameReference
    | TypedBindingPattern;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface NamedWorkerDeclaration extends STNode {
  annotations: Annotation[];
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  returnTypeDesc?: ReturnTypeDescriptor;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  transactionalKeyword?: TransactionalKeyword;
  workerBody: BlockStatement;
  workerKeyword: WorkerKeyword;
  workerName: IdentifierToken;
}

export interface NamedWorkerDeclarator extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  namedWorkerDeclarations: NamedWorkerDeclaration[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  workerInitStatements:
    | ActionStatement
    | AssignmentStatement
    | CallStatement
    | ForkStatement
    | IfElseStatement
    | LocalVarDecl[];
}

export interface NegationToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface NeverKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface NeverTypeDesc extends STNode {
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  name: NeverKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface NewKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface NilLiteral extends STNode {
  closeParenToken: CloseParenToken;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface NilTypeDesc extends STNode {
  closeParenToken: CloseParenToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface NotDoubleEqualToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface NotEqualToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface NotIsKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface NullKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface NullLiteral extends STNode {
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  literalToken: NullKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface NumericLiteral extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  literalToken:
    | DecimalFloatingPointLiteralToken
    | DecimalIntegerLiteralToken
    | HexFloatingPointLiteralToken
    | HexIntegerLiteralToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface ObjectConstructor extends STNode {
  annotations: Annotation[];
  closeBraceToken: CloseBraceToken;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  members: ObjectField | ObjectMethodDefinition | ResourceAccessorDefinition[];
  objectKeyword: ObjectKeyword;
  objectTypeQualifiers: ClientKeyword | IsolatedKeyword | ServiceKeyword[];
  openBraceToken: OpenBraceToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typeReference?: QualifiedNameReference | SimpleNameReference;
}

export interface ObjectField extends STNode {
  equalsToken?: EqualToken;
  expression?:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ByteArrayLiteral
    | CheckExpression
    | ErrorConstructor
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NumericLiteral
    | ObjectConstructor
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | TableConstructor
    | TypeCastExpression
    | UnaryExpression
    | XmlTemplateExpression;
  fieldName: IdentifierToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  metadata?: Metadata;
  qualifierList: FinalKeyword[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  typeName:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | DistinctTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | FutureTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
  visibilityQualifier?: PrivateKeyword | PublicKeyword;
}

export interface ObjectKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ObjectMethodDefinition extends STNode {
  functionBody:
    | ExpressionFunctionBody
    | ExternalFunctionBody
    | FunctionBodyBlock;
  functionKeyword: FunctionKeyword;
  functionName: IdentifierToken;
  functionSignature: FunctionSignature;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  metadata?: Metadata;
  qualifierList:
    | IsolatedKeyword
    | PrivateKeyword
    | PublicKeyword
    | RemoteKeyword
    | TransactionalKeyword[];
  relativeResourcePath: any;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface ObjectTypeDesc extends STNode {
  closeBrace: CloseBraceToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  members:
    | MethodDeclaration
    | ObjectField
    | ResourceAccessorDeclaration
    | TypeReference[];
  objectKeyword: ObjectKeyword;
  objectTypeQualifiers: ClientKeyword | IsolatedKeyword | ServiceKeyword[];
  openBrace: OpenBraceToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface OnClause extends STNode {
  equalsKeyword: EqualsKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  lhsExpression:
    | BinaryExpression
    | BooleanLiteral
    | FieldAccess
    | FunctionCall
    | MethodCall
    | NumericLiteral
    | SimpleNameReference;
  onKeyword: OnKeyword;
  rhsExpression:
    | BooleanLiteral
    | FieldAccess
    | FunctionCall
    | MethodCall
    | NumericLiteral
    | SimpleNameReference;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface OnConflictClause extends STNode {
  conflictKeyword: ConflictKeyword;
  expression: ErrorConstructor | FunctionCall | SimpleNameReference;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  onKeyword: OnKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface OnFailClause extends STNode {
  blockStatement: BlockStatement;
  failErrorName: IdentifierToken;
  failKeyword: FailKeyword;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  onKeyword: OnKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  typeDescriptor:
    | ErrorTypeDesc
    | SimpleNameReference
    | StringTypeDesc
    | UnionTypeDesc
    | VarTypeDesc;
}

export interface OnKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface OpenBracePipeToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface OpenBraceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface OpenBracketToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface OpenParenToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface OptionalChainingToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface OptionalFieldAccess extends STNode {
  expression:
    | AnnotAccess
    | BracedExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | OptionalFieldAccess
    | SimpleNameReference;
  fieldName: QualifiedNameReference | SimpleNameReference;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  optionalChainingToken: OptionalChainingToken;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface OptionalTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  questionMarkToken: QuestionMarkToken;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  typeDescriptor:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | XmlTypeDesc;
}

export interface OrderByClause extends STNode {
  byKeyword: ByKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  orderKey: CommaToken | OrderKey[];
  orderKeyword: OrderKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface OrderKey extends STNode {
  expression:
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | SimpleNameReference;
  leadingMinutiae: any;
  orderDirection?: AscendingKeyword | DescendingKeyword;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface OrderKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface OuterKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface PanicKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface PanicStatement extends STNode {
  expression:
    | BracedExpression
    | ErrorConstructor
    | FieldAccess
    | FunctionCall
    | SimpleNameReference
    | TypeCastExpression;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  panicKeyword: PanicKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any;
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface ParameterDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ParameterKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface ParameterName extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ParenthesisedTypeDesc extends STNode {
  closeParenToken: CloseParenToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typedesc:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | DecimalTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
}

export interface ParenthesizedArgList extends STNode {
  arguments: CommaToken | NamedArg | PositionalArg | RestArg[];
  closeParenToken: CloseParenToken;
  leadingMinutiae: any;
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface PercentToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface PipeToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface PlusToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface PositionalArg extends STNode {
  expression:
    | AnnotAccess
    | AnyTypeDesc
    | AnydataTypeDesc
    | BinaryExpression
    | BooleanLiteral
    | BooleanTypeDesc
    | BracedExpression
    | ByteArrayLiteral
    | CheckExpression
    | ConditionalExpression
    | DecimalTypeDesc
    | ErrorConstructor
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FloatTypeDesc
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | IndexedExpression
    | IntTypeDesc
    | JsonTypeDesc
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | ObjectConstructor
    | OptionalFieldAccess
    | QualifiedNameReference
    | RawTemplateExpression
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression
    | StringTypeDesc
    | TableConstructor
    | TrapExpression
    | TypeCastExpression
    | TypeTestExpression
    | TypeofExpression
    | UnaryExpression
    | XmlTemplateExpression;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface PrivateKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface PublicKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface QualifiedNameReference extends STNode {
  colon: ColonToken;
  identifier: IdentifierToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  modulePrefix: IdentifierToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface QueryAction extends STNode {
  blockStatement: BlockStatement;
  doKeyword: DoKeyword;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  queryPipeline: QueryPipeline;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface QueryConstructType extends STNode {
  keySpecifier?: KeySpecifier;
  keyword: StreamKeyword | TableKeyword;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface QueryExpression extends STNode {
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  onConflictClause?: OnConflictClause;
  queryConstructType?: QueryConstructType;
  queryPipeline: QueryPipeline;
  selectClause: SelectClause;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface QueryPipeline extends STNode {
  fromClause: FromClause;
  intermediateClauses:
    | FromClause
    | JoinClause
    | LetClause
    | LimitClause
    | OrderByClause
    | WhereClause[];
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface QuestionMarkToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface RawTemplateExpression extends STNode {
  content: Interpolation | TemplateString[];
  endBacktick: BacktickToken;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  startBacktick: BacktickToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: any;
}

export interface ReadonlyKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ReadonlyTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: ReadonlyKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface ReceiveAction extends STNode {
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  leftArrow: LeftArrowToken;
  receiveWorkers: ReceiveFields | SimpleNameReference;
  syntaxDiagnostics: any[];
  trailingMinutiae: any;
}

export interface ReceiveFields extends STNode {
  closeBrace: CloseBraceToken;
  leadingMinutiae: any;
  openBrace: OpenBraceToken;
  receiveFields: IdentifierToken[];
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface RecordField extends STNode {
  fieldName: IdentifierToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  metadata?: Metadata;
  questionMarkToken?: QuestionMarkToken;
  readonlyKeyword?: ReadonlyKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  typeName:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | DistinctTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | FutureTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
}

export interface RecordFieldWithDefaultValue extends STNode {
  equalsToken: EqualToken;
  expression:
    | BinaryExpression
    | BooleanLiteral
    | ByteTypeDesc
    | CheckExpression
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | IntTypeDesc
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | ObjectConstructor
    | SimpleNameReference
    | StringLiteral
    | StringTypeDesc
    | TableConstructor
    | TypeCastExpression
    | UnaryExpression;
  fieldName: IdentifierToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  metadata?: Metadata;
  readonlyKeyword?: ReadonlyKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  typeName:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc;
}

export interface RecordKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface RecordRestType extends STNode {
  ellipsisToken: EllipsisToken;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typeName:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | FutureTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | SimpleNameReference
    | StreamTypeDesc
    | StringTypeDesc
    | TupleTypeDesc
    | UnionTypeDesc;
}

export interface RecordTypeDesc extends STNode {
  bodyEndDelimiter: CloseBracePipeToken | CloseBraceToken;
  bodyStartDelimiter: OpenBracePipeToken | OpenBraceToken;
  fields: RecordField | RecordFieldWithDefaultValue | TypeReference[];
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  recordKeyword: RecordKeyword;
  recordRestDescriptor?: RecordRestType;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface RemoteKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface RemoteMethodCallAction extends STNode {
  arguments: CommaToken | NamedArg | PositionalArg | RestArg[];
  closeParenToken: CloseParenToken;
  expression:
    | FieldAccess
    | FunctionCall
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  methodName: SimpleNameReference;
  openParenToken: OpenParenToken;
  rightArrowToken: RightArrowToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface RequiredExpression extends STNode {
  leadingMinutiae: any;
  questionMarkToken: QuestionMarkToken;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface RequiredParam extends STNode {
  annotations: Annotation[];
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  paramName?: IdentifierToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  typeName:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
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
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
}

export interface ResourceAccessorDeclaration extends STNode {
  functionKeyword: FunctionKeyword;
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  methodName: IdentifierToken;
  methodSignature: FunctionSignature;
  qualifierList: ResourceKeyword[];
  relativeResourcePath:
    | DotToken
    | IdentifierToken
    | ResourcePathSegmentParam
    | SlashToken[];
  semicolon: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface ResourceAccessorDefinition extends STNode {
  functionBody:
    | ExpressionFunctionBody
    | ExternalFunctionBody
    | FunctionBodyBlock;
  functionKeyword: FunctionKeyword;
  functionName: IdentifierToken;
  functionSignature: FunctionSignature;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  metadata?: Metadata;
  qualifierList: IsolatedKeyword | ResourceKeyword[];
  relativeResourcePath:
    | DotToken
    | IdentifierToken
    | ResourcePathRestParam
    | ResourcePathSegmentParam
    | SlashToken[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface ResourceKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ResourcePathRestParam extends STNode {
  annotations: any;
  closeBracketToken: CloseBracketToken;
  ellipsisToken: EllipsisToken;
  leadingMinutiae: any;
  openBracketToken: OpenBracketToken;
  paramName: IdentifierToken;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  typeDescriptor: AnydataTypeDesc | IntTypeDesc | StringTypeDesc;
}

export interface ResourcePathSegmentParam extends STNode {
  annotations: any;
  closeBracketToken: CloseBracketToken;
  leadingMinutiae: any;
  openBracketToken: OpenBracketToken;
  paramName: IdentifierToken;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
  typeDescriptor:
    | AnydataTypeDesc
    | BooleanTypeDesc
    | FloatTypeDesc
    | IntTypeDesc
    | JsonTypeDesc
    | QualifiedNameReference
    | StringTypeDesc;
}

export interface RestArg extends STNode {
  ellipsis: EllipsisToken;
  expression:
    | FieldAccess
    | FunctionCall
    | ListConstructor
    | MethodCall
    | NilLiteral
    | SimpleNameReference;
  leadingMinutiae: any;
  syntaxDiagnostics: any[];
  trailingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface RestBindingPattern extends STNode {
  ellipsisToken: EllipsisToken;
  leadingMinutiae: any;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  variableName: SimpleNameReference;
}

export interface RestMatchPattern extends STNode {
  ellipsisToken: EllipsisToken;
  leadingMinutiae: any;
  syntaxDiagnostics: any[];
  trailingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  varKeywordToken: VarKeyword;
  variableName: SimpleNameReference;
}

export interface RestParam extends STNode {
  annotations: Annotation[];
  ellipsisToken: EllipsisToken;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  paramName?: IdentifierToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typeName:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | MapTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | SimpleNameReference
    | StringTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc;
}

export interface RestType extends STNode {
  ellipsisToken: EllipsisToken;
  leadingMinutiae: any;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
  typeDescriptor:
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | DecimalTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NilTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | StringTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
}

export interface RetryKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ReturnKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ReturnStatement extends STNode {
  expression?:
    | AnnotAccess
    | BinaryExpression
    | BooleanLiteral
    | BracedAction
    | BracedExpression
    | CheckAction
    | CheckExpression
    | ConditionalExpression
    | ErrorConstructor
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | IndexedExpression
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | ObjectConstructor
    | OptionalFieldAccess
    | QualifiedNameReference
    | QueryAction
    | QueryExpression
    | RawTemplateExpression
    | RemoteMethodCallAction
    | SimpleNameReference
    | StartAction
    | StringLiteral
    | StringTemplateExpression
    | TrapAction
    | TrapExpression
    | TypeCastExpression
    | TypeTestExpression
    | TypeofExpression
    | UnaryExpression
    | WaitAction
    | XmlStepExpression
    | XmlTemplateExpression;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  returnKeyword: ReturnKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface ReturnTypeDescriptor extends STNode {
  annotations: Annotation[];
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  returnsKeyword: ReturnsKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  type:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
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
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
}

export interface ReturnsKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface RightArrowToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface RightDoubleArrowToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface RollbackKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface RollbackStatement extends STNode {
  arguments?: ParenthesizedArgList;
  expression?: FunctionCall;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  onFailClause?: OnFailClause;
  retryBody?: BlockStatement | TransactionStatement;
  retryKeyword?: RetryKeyword;
  rollbackKeyword?: RollbackKeyword;
  semicolon?: SemicolonToken;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  typeParameter?: TypeParameter;
}

export interface SelectClause extends STNode {
  expression:
    | BinaryExpression
    | BracedExpression
    | CheckExpression
    | ExplicitAnonymousFunctionExpression
    | FieldAccess
    | FunctionCall
    | ImplicitNewExpression
    | MappingConstructor
    | MethodCall
    | NumericLiteral
    | QueryExpression
    | RawTemplateExpression
    | SimpleNameReference
    | TypeCastExpression
    | XmlTemplateExpression;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  selectKeyword: SelectKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface SelectKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface SemicolonToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ServiceDeclaration extends STNode {
  absoluteResourcePath: IdentifierToken | SlashToken | StringLiteral[];
  closeBraceToken: CloseBraceToken;
  expressions:
    | BinaryExpression
    | CommaToken
    | ExplicitNewExpression
    | ImplicitNewExpression
    | MappingConstructor
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference[];
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  members: ObjectField | ObjectMethodDefinition | ResourceAccessorDefinition[];
  metadata?: Metadata;
  onKeyword: OnKeyword;
  openBraceToken: OpenBraceToken;
  qualifiers: IsolatedKeyword[];
  serviceKeyword: ServiceKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typeDescriptor?: MapTypeDesc | QualifiedNameReference | SimpleNameReference;
}

export interface ServiceDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface ServiceKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface SimpleNameReference extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: FunctionKeyword | IdentifierToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface SingleQuoteToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface SingletonTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  simpleContExprNode:
    | BooleanLiteral
    | NullLiteral
    | NumericLiteral
    | StringLiteral
    | UnaryExpression;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface SlashAsteriskToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  value: string;
}

export interface SlashLtToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface SlashToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface SourceKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface SpecificField extends STNode {
  colon?: ColonToken;
  fieldName: IdentifierToken | StringLiteral;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  readonlyKeyword?: ReadonlyKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  valueExpr?:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ByteTypeDesc
    | CheckExpression
    | ConditionalExpression
    | ErrorConstructor
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | IndexedExpression
    | IntTypeDesc
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | ObjectConstructor
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression
    | StringTypeDesc
    | TableConstructor
    | TypeCastExpression
    | TypeTestExpression
    | TypeofExpression
    | UnaryExpression
    | XmlTemplateExpression;
}

export interface SpreadField extends STNode {
  ellipsis: EllipsisToken;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  valueExpr:
    | BooleanLiteral
    | BracedExpression
    | FunctionCall
    | MappingConstructor
    | SimpleNameReference;
}

export interface StartAction extends STNode {
  annotations: Annotation[];
  expression: FunctionCall | MethodCall | RemoteMethodCallAction;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  startKeyword: StartKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface StartKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface StreamKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface StreamTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  streamKeywordToken: StreamKeyword;
  streamTypeParamsNode?: StreamTypeParams;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface StreamTypeParams extends STNode {
  commaToken?: CommaToken;
  gtToken: GtToken;
  leadingMinutiae: any;
  leftTypeDescNode:
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | FloatTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | OptionalTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | SimpleNameReference
    | StreamTypeDesc
    | StringTypeDesc
    | UnionTypeDesc;
  ltToken: LtToken;
  rightTypeDescNode?:
    | ErrorTypeDesc
    | IntTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | OptionalTypeDesc
    | QualifiedNameReference;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface StringKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface StringLiteral extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  literalToken: StringLiteralToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
}

export interface StringLiteralToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface StringTemplateExpression extends STNode {
  content: Interpolation | TemplateString[];
  endBacktick: BacktickToken;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  startBacktick: BacktickToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  type: StringKeyword;
}

export interface StringTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: StringKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface SyncSendAction extends STNode {
  expression:
    | BinaryExpression
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  peerWorker: SimpleNameReference;
  syncSendToken: SyncSendToken;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface SyncSendToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface TableConstructor extends STNode {
  closeBracket: CloseBracketToken;
  keySpecifier?: KeySpecifier;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  openBracket: OpenBracketToken;
  rows: CommaToken | MappingConstructor[];
  syntaxDiagnostics: any[];
  tableKeyword: TableKeyword;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface TableKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface TableTypeDesc extends STNode {
  keyConstraintNode?: KeySpecifier | KeyTypeConstraint;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  rowTypeParameterNode: TypeParameter;
  syntaxDiagnostics: any[];
  tableKeywordToken: TableKeyword;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface TemplateString extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface TransactionKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface TransactionStatement extends STNode {
  blockStatement: BlockStatement;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  onFailClause?: OnFailClause;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  transactionKeyword: TransactionKeyword;
}

export interface TransactionalExpression extends STNode {
  leadingMinutiae: any;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  transactionalKeyword: TransactionalKeyword;
}

export interface TransactionalKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface TrapAction extends STNode {
  expression:
    | BracedAction
    | CheckAction
    | QueryAction
    | ReceiveAction
    | StartAction
    | WaitAction;
  leadingMinutiae: any;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
  trapKeyword: TrapKeyword;
}

export interface TrapExpression extends STNode {
  expression:
    | BinaryExpression
    | BracedExpression
    | ConditionalExpression
    | ExplicitNewExpression
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | SimpleNameReference
    | StringLiteral
    | TypeCastExpression;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: INVALID_NODE_MINUTIAE | WHITESPACE_MINUTIAE[];
  trapKeyword: TrapKeyword;
}

export interface TrapKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface TripleBacktickToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  value: string;
}

export interface TrippleEqualToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface TrippleGtToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface TrueKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface TupleTypeDesc extends STNode {
  closeBracketToken: CloseBracketToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  memberTypeDesc:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | CommaToken
    | DecimalTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | RestType
    | SimpleNameReference
    | SingletonTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc[];
  openBracketToken: OpenBracketToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface TypeCastExpression extends STNode {
  expression:
    | AnnotAccess
    | BooleanLiteral
    | BracedAction
    | BracedExpression
    | CheckAction
    | CheckExpression
    | ErrorConstructor
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NumericLiteral
    | ObjectConstructor
    | OptionalFieldAccess
    | QueryAction
    | RemoteMethodCallAction
    | SimpleNameReference
    | StringLiteral
    | TrapExpression
    | TypeCastExpression
    | XmlTemplateExpression;
  gtToken: GtToken;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  ltToken: LtToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typeCastParam: TypeCastParam;
}

export interface TypeCastParam extends STNode {
  annotations: Annotation[];
  leadingMinutiae: any;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  type?:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
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
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
}

export interface TypeDefinition extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  typeDescriptor:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | DistinctTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | FutureTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
  typeKeyword: TypeKeyword;
  typeName: IdentifierToken;
  visibilityQualifier?: PublicKeyword;
}

export interface TypeDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface TypeKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface TypeParameter extends STNode {
  gtToken: GtToken;
  leadingMinutiae: any;
  ltToken: LtToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  typeNode:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
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
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | SimpleNameReference
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
}

export interface TypeReference extends STNode {
  asteriskToken: AsteriskToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  trailingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  typeName: QualifiedNameReference | SimpleNameReference;
}

export interface TypeTestExpression extends STNode {
  expression:
    | AnnotAccess
    | BooleanLiteral
    | BracedExpression
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | ListConstructor
    | MethodCall
    | NumericLiteral
    | ObjectConstructor
    | OptionalFieldAccess
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | TypeCastExpression;
  isKeyword: IsKeyword | NotIsKeyword;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typeDescriptor:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
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
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
}

export interface TypedBindingPattern extends STNode {
  bindingPattern:
    | CaptureBindingPattern
    | ErrorBindingPattern
    | ListBindingPattern
    | MappingBindingPattern
    | WildcardBindingPattern;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typeDescriptor:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | DistinctTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | FutureTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
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
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface TypedescTypeDesc extends STNode {
  keywordToken: TypedescKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  typeParamNode?: TypeParameter;
}

export interface TypeofExpression extends STNode {
  expression:
    | BracedExpression
    | CheckExpression
    | FieldAccess
    | IndexedExpression
    | ListConstructor
    | NumericLiteral
    | SimpleNameReference;
  leadingMinutiae: any;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  typeofKeyword: TypeofKeyword;
}

export interface TypeofKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface UnaryExpression extends STNode {
  expression:
    | BooleanLiteral
    | BracedExpression
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | UnaryExpression;
  leadingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  unaryOperator: ExclamationMarkToken | MinusToken | NegationToken | PlusToken;
}

export interface UnderscoreKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface UnionTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  leftTypeDesc:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
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
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
  pipeToken: PipeToken;
  rightTypeDesc:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | DistinctTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | FutureTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | MapTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | XmlTypeDesc;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
}

export interface VarDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface VarKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface VarTypeDesc extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  name: VarKeyword;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface VariableDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface WHITESPACE_MINUTIAE extends STNode {
  isInvalid: boolean;
  minutiae: string;
}

export interface WaitAction extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  waitFutureExpr:
    | BinaryExpression
    | FieldAccess
    | FunctionCall
    | SimpleNameReference
    | StartAction
    | WaitFieldsList;
  waitKeyword: WaitKeyword;
}

export interface WaitField extends STNode {
  colon: ColonToken;
  fieldName: SimpleNameReference;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae: any;
  waitFutureExpr: FunctionCall | SimpleNameReference;
}

export interface WaitFieldsList extends STNode {
  closeBrace: CloseBraceToken;
  leadingMinutiae: any;
  openBrace: OpenBraceToken;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
  waitFields: CommaToken | SimpleNameReference | WaitField[];
}

export interface WaitKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface WhereClause extends STNode {
  expression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | NumericLiteral
    | TypeTestExpression
    | UnaryExpression;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  whereKeyword: WhereKeyword;
}

export interface WhereKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface WhileKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface WhileStatement extends STNode {
  condition:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | FunctionCall
    | ListConstructor
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | TypeTestExpression
    | UnaryExpression;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  onFailClause?: OnFailClause;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  whileBody: BlockStatement;
  whileKeyword: WhileKeyword;
}

export interface WildcardBindingPattern extends STNode {
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  underscoreToken: UnderscoreKeyword;
}

export interface WorkerKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}

export interface XmlAtomicNamePattern extends STNode {
  colon: ColonToken;
  leadingMinutiae: any;
  name: AsteriskToken | IdentifierToken;
  prefix: IdentifierToken;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface XmlAttribute extends STNode {
  attributeName: XmlQualifiedName | XmlSimpleName;
  equalToken: EqualToken;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: XmlAttributeValue;
}

export interface XmlAttributeValue extends STNode {
  endQuote: DoubleQuoteToken | SingleQuoteToken;
  leadingMinutiae: any;
  startQuote: DoubleQuoteToken | SingleQuoteToken;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: Interpolation | XmlTextContent[];
}

export interface XmlCdata extends STNode {
  cdataEnd: XmlCdataEndToken;
  cdataStart: XmlCdataStartToken;
  content: Interpolation | XmlTextContent[];
  leadingMinutiae: any;
  syntaxDiagnostics: any[];
  trailingMinutiae: any;
}

export interface XmlCdataEndToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface XmlCdataStartToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface XmlComment extends STNode {
  commentEnd: XmlCommentEndToken;
  commentStart: XmlCommentStartToken;
  content: Interpolation | XmlTextContent[];
  leadingMinutiae: any;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface XmlCommentEndToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface XmlCommentStartToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface XmlElement extends STNode {
  content:
    | Interpolation
    | XmlCdata
    | XmlComment
    | XmlElement
    | XmlEmptyElement
    | XmlPi
    | XmlText[];
  endTag: XmlElementEndTag;
  leadingMinutiae: any;
  startTag: XmlElementStartTag;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface XmlElementEndTag extends STNode {
  getToken: GtToken;
  leadingMinutiae: any;
  ltToken: LtToken;
  name: XmlQualifiedName | XmlSimpleName;
  slashToken: SlashToken;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface XmlElementStartTag extends STNode {
  attributes: XmlAttribute[];
  getToken: GtToken;
  leadingMinutiae: any;
  ltToken: LtToken;
  name: XmlQualifiedName | XmlSimpleName;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface XmlEmptyElement extends STNode {
  attributes: XmlAttribute[];
  getToken: GtToken;
  leadingMinutiae: any;
  ltToken: LtToken;
  name: XmlQualifiedName | XmlSimpleName;
  slashToken: SlashToken;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface XmlFilterExpression extends STNode {
  expression: FunctionCall | SimpleNameReference | XmlStepExpression;
  leadingMinutiae: any;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
  xmlPatternChain: XmlNamePatternChain;
}

export interface XmlKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  value: string;
}

export interface XmlNamePatternChain extends STNode {
  gtToken: GtToken;
  leadingMinutiae: any;
  startToken: DotLtToken | DoubleSlashDoubleAsteriskLtToken | SlashLtToken;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  xmlNamePattern:
    | AsteriskToken
    | PipeToken
    | SimpleNameReference
    | XmlAtomicNamePattern[];
}

export interface XmlNamespaceDeclaration extends STNode {
  asKeyword?: AsKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  namespacePrefix?: IdentifierToken;
  namespaceuri: StringLiteral;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  xmlnsKeyword: XmlnsKeyword;
}

export interface XmlPi extends STNode {
  data: Interpolation | XmlTextContent[];
  leadingMinutiae: any;
  piEnd: XmlPiEndToken;
  piStart: XmlPiStartToken;
  syntaxDiagnostics: any;
  target: XmlSimpleName;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
}

export interface XmlPiEndToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: END_OF_LINE_MINUTIAE[];
  value: string;
}

export interface XmlPiStartToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface XmlQualifiedName extends STNode {
  colon: ColonToken;
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  name: XmlSimpleName;
  prefix: XmlSimpleName;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface XmlSimpleName extends STNode {
  leadingMinutiae: WHITESPACE_MINUTIAE[];
  name: IdentifierToken;
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
}

export interface XmlStepExpression extends STNode {
  expression:
    | BracedExpression
    | IndexedExpression
    | SimpleNameReference
    | TypeCastExpression
    | XmlFilterExpression
    | XmlStepExpression;
  leadingMinutiae: any;
  syntaxDiagnostics: any[];
  trailingMinutiae: END_OF_LINE_MINUTIAE | WHITESPACE_MINUTIAE[];
  xmlStepStart: SlashAsteriskToken | XmlNamePatternChain;
}

export interface XmlTemplateExpression extends STNode {
  content:
    | Interpolation
    | XmlCdata
    | XmlComment
    | XmlElement
    | XmlEmptyElement
    | XmlPi
    | XmlText[];
  endBacktick: BacktickToken;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  startBacktick: BacktickToken;
  syntaxDiagnostics: any[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  type: XmlKeyword;
}

export interface XmlText extends STNode {
  content: XmlTextContent;
  leadingMinutiae: any;
  syntaxDiagnostics: any;
  trailingMinutiae: any;
}

export interface XmlTextContent extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae: any;
  trailingMinutiae: any;
  value: string;
}

export interface XmlTypeDesc extends STNode {
  keywordToken: XmlKeyword;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  syntaxDiagnostics: any;
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  typeParamNode?: TypeParameter;
}

export interface XmlnsKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  leadingMinutiae:
    | COMMENT_MINUTIAE
    | END_OF_LINE_MINUTIAE
    | INVALID_NODE_MINUTIAE
    | WHITESPACE_MINUTIAE[];
  trailingMinutiae: WHITESPACE_MINUTIAE[];
  value: string;
}
// tslint:enable:ban-types
