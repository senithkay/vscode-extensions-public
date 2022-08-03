// This is an auto-generated file. Do not edit.
// Run 'BALLERINA_HOME="your/ballerina/home" npm run gen-models' to generate.
// tslint:disable:ban-types

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

export interface Diagnostic {
  diagnosticInfo: DiagnosticInfo;
  message: string;
}

export interface DiagnosticInfo {
  code: string;
  severity: string;
}

export interface PerfData {
  concurrency?: string;
  latency: string;
  tps?: string;
  analyzeType?: string;
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
  syntaxDiagnostics: Diagnostic[];
  diagnostics?: Diagnostic[];
  performance?: PerfData;
  leadingMinutiae: Minutiae[];
  trailingMinutiae: Minutiae[];
  isInSelectedPath?: boolean;
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
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
}

export interface AnnotAccess extends STNode {
  annotChainingToken: AnnotChainingToken;
  annotTagReference: QualifiedNameReference | SimpleNameReference;
  expression: BracedExpression | SimpleNameReference;
  syntaxDiagnostics: any;
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
  syntaxDiagnostics: any[];
}

export interface AnnotationAttachPoint extends STNode {
  identifiers: (
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
    | WorkerKeyword
  )[];
  sourceKeyword?: SourceKeyword;
  syntaxDiagnostics: any[];
}

export interface AnnotationDeclaration extends STNode {
  annotationKeyword: AnnotationKeyword;
  annotationTag: IdentifierToken;
  attachPoints: (AnnotationAttachPoint | CommaToken)[];
  constKeyword?: ConstKeyword;
  metadata?: Metadata;
  onKeyword?: OnKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  value: string;
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
  syntaxDiagnostics: any;
}

export interface AnydataKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface AnydataTypeDesc extends STNode {
  name: AnydataKeyword;
  syntaxDiagnostics: any;
}

export interface ArrayDimension extends STNode {
  arrayLength?:
    | AsteriskLiteral
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference;
  closeBracket: CloseBracketToken;
  openBracket: OpenBracketToken;
  syntaxDiagnostics: any[];
}

export interface ArrayTypeDesc extends STNode {
  dimensions: ArrayDimension[];
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
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  literalToken: AsteriskToken;
  syntaxDiagnostics: any;
}

export interface AsteriskToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface AsyncSendAction extends STNode {
  expression:
    | BinaryExpression
    | BracedExpression
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral;
  peerWorker: SimpleNameReference;
  rightArrowToken: RightArrowToken;
  syntaxDiagnostics: any[];
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

export interface BallerinaNameReference extends STNode {
  endBacktick: BacktickToken;
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
}

export interface BitwiseAndToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface BitwiseXorToken extends STNode {
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
    | XmlNamespaceDeclaration
  )[];
  syntaxDiagnostics: any[];
}

export interface BooleanKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface BooleanLiteral extends STNode {
  literalToken: FalseKeyword | TrueKeyword;
  syntaxDiagnostics: any[];
}

export interface BooleanTypeDesc extends STNode {
  name: BooleanKeyword;
  syntaxDiagnostics: any;
}

export interface BracedAction extends STNode {
  closeParen: CloseParenToken;
  expression: CheckAction | QueryAction | TrapAction | WaitAction;
  openParen: OpenParenToken;
  syntaxDiagnostics: any;
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
  openParen: OpenParenToken;
  syntaxDiagnostics: any[];
}

export interface BreakKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface BreakStatement extends STNode {
  breakToken: BreakKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any;
}

export interface ByKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface ByteArrayLiteral extends STNode {
  content?: TemplateString;
  endBacktick: BacktickToken;
  startBacktick: BacktickToken;
  syntaxDiagnostics: any[];
  type: Base16Keyword | Base64Keyword;
}

export interface ByteKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface ByteTypeDesc extends STNode {
  name: ByteKeyword;
  syntaxDiagnostics: any;
}

export interface CallStatement extends STNode {
  expression: CheckExpression | FunctionCall | MethodCall;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
}

export interface CaptureBindingPattern extends STNode {
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
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
  classTypeQualifiers: (
    | ClientKeyword
    | DistinctKeyword
    | IsolatedKeyword
    | ReadonlyKeyword
    | ServiceKeyword
  )[];
  closeBrace: CloseBraceToken;
  members: (
    | ObjectField
    | ObjectMethodDefinition
    | ResourceAccessorDefinition
    | TypeReference
  )[];
  metadata?: Metadata;
  openBrace: OpenBraceToken;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any;
}

export interface CommitKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
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
  openBracket: OpenBracketToken;
  syntaxDiagnostics: any;
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
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  value: string;
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
  syntaxDiagnostics: any;
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
  syntaxDiagnostics: any;
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
  paramName: IdentifierToken;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any;
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
  value: string;
}

export interface DoStatement extends STNode {
  blockStatement: BlockStatement;
  doKeyword: DoKeyword;
  onFailClause?: OnFailClause;
  syntaxDiagnostics: any;
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

export interface DoubleBacktickToken extends STNode {
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

export interface DoubleGtToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface DoubleLtToken extends STNode {
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
  syntaxDiagnostics: any[];
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
  metadata?: Metadata;
  openBraceToken: OpenBraceToken;
  qualifier?: PublicKeyword;
  syntaxDiagnostics: any[];
}

export interface EnumKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
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
  metadata?: Metadata;
  syntaxDiagnostics: any[];
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
  argListBindingPatterns: (
    | CaptureBindingPattern
    | CommaToken
    | ErrorBindingPattern
    | NamedArgBindingPattern
    | RestBindingPattern
    | WildcardBindingPattern
  )[];
  closeParenthesis: CloseParenToken;
  errorKeyword: ErrorKeyword;
  openParenthesis: OpenParenToken;
  syntaxDiagnostics: any[];
  typeReference?: SimpleNameReference;
}

export interface ErrorConstructor extends STNode {
  arguments: (CommaToken | NamedArg | PositionalArg)[];
  closeParenToken: CloseParenToken;
  errorKeyword: ErrorKeyword;
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
  typeReference?: QualifiedNameReference | SimpleNameReference;
}

export interface ErrorKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface ErrorMatchPattern extends STNode {
  argListMatchPatternNode: (
    | CommaToken
    | ErrorMatchPattern
    | IdentifierToken
    | NamedArgMatchPattern
    | RestMatchPattern
    | StringLiteral
    | TypedBindingPattern
  )[];
  closeParenthesisToken: CloseParenToken;
  errorKeyword: ErrorKeyword;
  openParenthesisToken: OpenParenToken;
  syntaxDiagnostics: any[];
  typeReference?: SimpleNameReference;
}

export interface ErrorTypeDesc extends STNode {
  keywordToken: ErrorKeyword;
  syntaxDiagnostics: any[];
  typeParamNode?: TypeParameter;
}

export interface ExclamationMarkToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface ExplicitAnonymousFunctionExpression extends STNode {
  annotations: Annotation[];
  functionBody: ExpressionFunctionBody | FunctionBodyBlock;
  functionKeyword: FunctionKeyword;
  functionSignature: FunctionSignature;
  qualifierList: IsolatedKeyword[];
  syntaxDiagnostics: any[];
}

export interface ExplicitNewExpression extends STNode {
  newKeyword: NewKeyword;
  parenthesizedArgList: ParenthesizedArgList;
  syntaxDiagnostics: any[];
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
  rightDoubleArrow: RightDoubleArrowToken;
  semicolon?: SemicolonToken;
  syntaxDiagnostics: any[];
}

export interface ExternalFunctionBody extends STNode {
  annotations: Annotation[];
  equalsToken: EqualToken;
  externalKeyword: ExternalKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  expression: ErrorConstructor | FunctionCall | SimpleNameReference;
  failKeyword: FailKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any;
}

export interface FalseKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
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
  syntaxDiagnostics: any[];
}

export interface FieldBindingPattern extends STNode {
  bindingPattern?:
    | CaptureBindingPattern
    | ErrorBindingPattern
    | ListBindingPattern
    | MappingBindingPattern
    | WildcardBindingPattern;
  colon?: ColonToken;
  syntaxDiagnostics: any[];
  variableName: SimpleNameReference;
}

export interface FieldKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface FieldMatchPattern extends STNode {
  colonToken: ColonToken;
  fieldNameNode: IdentifierToken;
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
  syntaxDiagnostics: any;
}

export interface FlushAction extends STNode {
  flushKeyword: FlushKeyword;
  peerWorker?: SimpleNameReference;
  syntaxDiagnostics: any;
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
  onFailClause?: OnFailClause;
  syntaxDiagnostics: any[];
  typedBindingPattern: TypedBindingPattern;
}

export interface ForkKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface ForkStatement extends STNode {
  closeBraceToken: CloseBraceToken;
  forkKeyword: ForkKeyword;
  namedWorkerDeclarations: NamedWorkerDeclaration[];
  openBraceToken: OpenBraceToken;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any;
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
    | XmlNamespaceDeclaration
  )[];
  syntaxDiagnostics: any[];
}

export interface FunctionCall extends STNode {
  arguments: (CommaToken | NamedArg | PositionalArg | RestArg)[];
  closeParenToken: CloseParenToken;
  functionName: QualifiedNameReference | SimpleNameReference;
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
}

export interface FunctionDefinition extends STNode {
  functionBody:
    | ExpressionFunctionBody
    | ExternalFunctionBody
    | FunctionBodyBlock;
  functionKeyword: FunctionKeyword;
  functionName: IdentifierToken;
  functionSignature: FunctionSignature;
  metadata?: Metadata;
  qualifierList: (IsolatedKeyword | PublicKeyword | TransactionalKeyword)[];
  relativeResourcePath: any;
  syntaxDiagnostics: any[];
  isRunnable?: boolean;
  runArgs?: any[];
}

export interface FunctionDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface FunctionKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface FunctionSignature extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  parameters: (
    | CommaToken
    | DefaultableParam
    | IncludedRecordParam
    | RequiredParam
    | RestParam
  )[];
  returnTypeDesc?: ReturnTypeDescriptor;
  syntaxDiagnostics: any[];
}

export interface FunctionTypeDesc extends STNode {
  functionKeyword: FunctionKeyword;
  functionSignature?: FunctionSignature;
  qualifierList: (IsolatedKeyword | TransactionalKeyword)[];
  syntaxDiagnostics: any[];
}

export interface FutureKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface FutureTypeDesc extends STNode {
  keywordToken: FutureKeyword;
  syntaxDiagnostics: any;
  typeParamNode?: TypeParameter;
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
  syntaxDiagnostics: any;
}

export interface HashToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface HexFloatingPointLiteralToken extends STNode {
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
  syntaxDiagnostics: any[];
}

export interface IfKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
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
  params: InferParamList | SimpleNameReference;
  rightDoubleArrow: RightDoubleArrowToken;
  syntaxDiagnostics: any[];
}

export interface ImplicitNewExpression extends STNode {
  newKeyword: NewKeyword;
  parenthesizedArgList?: ParenthesizedArgList;
  syntaxDiagnostics: any[];
}

export interface ImportDeclaration extends STNode {
  importKeyword: ImportKeyword;
  moduleName: (DotToken | IdentifierToken)[];
  orgName?: ImportOrgName;
  prefix?: ImportPrefix;
  semicolon: SemicolonToken;
  syntaxDiagnostics: any[];
}

export interface ImportKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface ImportOrgName extends STNode {
  orgName: IdentifierToken;
  slashToken: SlashToken;
  syntaxDiagnostics: any[];
}

export interface ImportPrefix extends STNode {
  asKeyword: AsKeyword;
  prefix: IdentifierToken | UnderscoreKeyword;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any;
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
  keyExpression: (
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
    | XmlTemplateExpression
  )[];
  openBracket: OpenBracketToken;
  syntaxDiagnostics: any[];
}

export interface InferParamList extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  parameters: (CommaToken | SimpleNameReference)[];
  syntaxDiagnostics: any[];
}

export interface InferredTypedescDefault extends STNode {
  gtToken: GtToken;
  ltToken: LtToken;
  syntaxDiagnostics: any;
}

export interface InlineCodeReference extends STNode {
  codeReference: CodeContent;
  endBacktick: BacktickToken | DoubleBacktickToken | TripleBacktickToken;
  startBacktick: BacktickToken | DoubleBacktickToken | TripleBacktickToken;
  syntaxDiagnostics: any;
}

export interface IntKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface IntTypeDesc extends STNode {
  name: IntKeyword;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
}

export interface InterpolationStartToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface IntersectionTypeDesc extends STNode {
  bitwiseAndToken: BitwiseAndToken;
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
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  expression: BracedExpression | MethodCall | SimpleNameReference;
  inKeyword: InKeyword;
  joinKeyword: JoinKeyword;
  joinOnCondition: OnClause;
  outerKeyword?: OuterKeyword;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any;
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
  syntaxDiagnostics: any;
}

export interface KeyTypeConstraint extends STNode {
  keyKeywordToken: KeyKeyword;
  syntaxDiagnostics: any;
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
  syntaxDiagnostics: any;
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
  letKeyword: LetKeyword;
  letVarDeclarations: (CommaToken | LetVarDecl)[];
  syntaxDiagnostics: any[];
}

export interface LetKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
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
  syntaxDiagnostics: any;
  typedBindingPattern: TypedBindingPattern;
}

export interface LimitClause extends STNode {
  expression:
    | FunctionCall
    | NumericLiteral
    | SimpleNameReference
    | UnaryExpression;
  limitKeyword: LimitKeyword;
  syntaxDiagnostics: any;
}

export interface LimitKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface ListBindingPattern extends STNode {
  bindingPatterns: (
    | CaptureBindingPattern
    | CommaToken
    | ErrorBindingPattern
    | ListBindingPattern
    | MappingBindingPattern
    | RestBindingPattern
    | WildcardBindingPattern
  )[];
  closeBracket: CloseBracketToken;
  openBracket: OpenBracketToken;
  syntaxDiagnostics: any[];
}

export interface ListConstructor extends STNode {
  closeBracket: CloseBracketToken;
  expressions: (
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
    | XmlTemplateExpression
  )[];
  openBracket: OpenBracketToken;
  syntaxDiagnostics: any[];
}

export interface ListMatchPattern extends STNode {
  closeBracket: CloseBracketToken;
  matchPatterns: (
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
    | TypedBindingPattern
  )[];
  openBracket: OpenBracketToken;
  syntaxDiagnostics: any[];
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
  listenerKeyword: ListenerKeyword;
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  onFailClause?: OnFailClause;
  syntaxDiagnostics: any;
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
  syntaxDiagnostics: any[];
}

export interface MappingBindingPattern extends STNode {
  closeBrace: CloseBraceToken;
  fieldBindingPatterns: (
    | CommaToken
    | FieldBindingPattern
    | RestBindingPattern
  )[];
  openBrace: OpenBraceToken;
  syntaxDiagnostics: any[];
}

export interface MappingConstructor extends STNode {
  closeBrace: CloseBraceToken;
  fields: (CommaToken | ComputedNameField | SpecificField | SpreadField)[];
  openBrace: OpenBraceToken;
  syntaxDiagnostics: any[];
}

export interface MappingMatchPattern extends STNode {
  closeBraceToken: CloseBraceToken;
  fieldMatchPatterns: (CommaToken | FieldMatchPattern | RestMatchPattern)[];
  openBraceToken: OpenBraceToken;
  syntaxDiagnostics: any[];
}

export interface MarkdownCodeBlock extends STNode {
  codeLines: MarkdownCodeLine[];
  endBacktick: TripleBacktickToken;
  endLineHashToken: HashToken;
  langAttribute?: CodeContent;
  startBacktick: TripleBacktickToken;
  startLineHashToken: HashToken;
  syntaxDiagnostics: any;
}

export interface MarkdownCodeLine extends STNode {
  codeDescription: CodeContent;
  hashToken: HashToken;
  syntaxDiagnostics: any;
}

export interface MarkdownDeprecationDocumentationLine extends STNode {
  documentElements: (DeprecationLiteral | DocumentationDescription)[];
  hashToken: HashToken;
  syntaxDiagnostics: any;
}

export interface MarkdownDocumentation extends STNode {
  documentationLines: (
    | MarkdownCodeBlock
    | MarkdownDeprecationDocumentationLine
    | MarkdownDocumentationLine
    | MarkdownParameterDocumentationLine
    | MarkdownReferenceDocumentationLine
    | MarkdownReturnParameterDocumentationLine
  )[];
  syntaxDiagnostics: any[];
}

export interface MarkdownDocumentationLine extends STNode {
  documentElements: DocumentationDescription[];
  hashToken: HashToken;
  syntaxDiagnostics: any;
}

export interface MarkdownParameterDocumentationLine extends STNode {
  documentElements: (
    | BallerinaNameReference
    | DocumentationDescription
    | InlineCodeReference
  )[];
  hashToken: HashToken;
  minusToken: MinusToken;
  parameterName: ParameterName;
  plusToken: PlusToken;
  syntaxDiagnostics: any[];
}

export interface MarkdownReferenceDocumentationLine extends STNode {
  documentElements: (
    | BallerinaNameReference
    | DocumentationDescription
    | InlineCodeReference
  )[];
  hashToken: HashToken;
  syntaxDiagnostics: any[];
}

export interface MarkdownReturnParameterDocumentationLine extends STNode {
  documentElements: (DocumentationDescription | InlineCodeReference)[];
  hashToken: HashToken;
  minusToken: MinusToken;
  parameterName: ReturnKeyword;
  plusToken: PlusToken;
  syntaxDiagnostics: any;
}

export interface MatchClause extends STNode {
  blockStatement: BlockStatement;
  matchGuard?: MatchGuard;
  matchPatterns: (
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
    | UnaryExpression
  )[];
  rightDoubleArrow: RightDoubleArrowToken;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
}

export interface MatchKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
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
  matchClauses: MatchClause[];
  matchKeyword: MatchKeyword;
  onFailClause?: OnFailClause;
  openBrace: OpenBraceToken;
  syntaxDiagnostics: any[];
}

export interface Metadata extends STNode {
  annotations: Annotation[];
  documentationString?: MarkdownDocumentation;
  syntaxDiagnostics: any[];
}

export interface MethodCall extends STNode {
  arguments: (CommaToken | NamedArg | PositionalArg | RestArg)[];
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
  methodName: SimpleNameReference;
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
}

export interface MethodDeclaration extends STNode {
  functionKeyword: FunctionKeyword;
  metadata?: Metadata;
  methodName: IdentifierToken;
  methodSignature: FunctionSignature;
  qualifierList: (IsolatedKeyword | PublicKeyword | RemoteKeyword)[];
  relativeResourcePath: any;
  semicolon: SemicolonToken;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
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
  metadata?: Metadata;
  qualifiers: (ConfigurableKeyword | FinalKeyword | IsolatedKeyword)[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
  typedBindingPattern: TypedBindingPattern;
  visibilityQualifier?: PublicKeyword;
}

export interface ModuleXmlNamespaceDeclaration extends STNode {
  asKeyword?: AsKeyword;
  namespacePrefix?: IdentifierToken;
  namespaceuri: SimpleNameReference | StringLiteral;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any;
}

export interface NamedArgMatchPattern extends STNode {
  equalToken: EqualToken;
  identifier: IdentifierToken;
  matchPattern:
    | ListMatchPattern
    | MappingMatchPattern
    | NumericLiteral
    | QualifiedNameReference
    | TypedBindingPattern;
  syntaxDiagnostics: any;
}

export interface NamedWorkerDeclaration extends STNode {
  annotations: Annotation[];
  returnTypeDesc?: ReturnTypeDescriptor;
  syntaxDiagnostics: any[];
  transactionalKeyword?: TransactionalKeyword;
  workerBody: BlockStatement;
  workerKeyword: WorkerKeyword;
  workerName: IdentifierToken;
}

export interface NamedWorkerDeclarator extends STNode {
  namedWorkerDeclarations: NamedWorkerDeclaration[];
  syntaxDiagnostics: any[];
  workerInitStatements: (
    | ActionStatement
    | AssignmentStatement
    | CallStatement
    | ForkStatement
    | IfElseStatement
    | LocalVarDecl
  )[];
}

export interface NegationToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface NeverKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface NeverTypeDesc extends STNode {
  name: NeverKeyword;
  syntaxDiagnostics: any;
}

export interface NewKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface NilLiteral extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
}

export interface NilTypeDesc extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
}

export interface NumericLiteral extends STNode {
  literalToken:
    | DecimalFloatingPointLiteralToken
    | DecimalIntegerLiteralToken
    | HexFloatingPointLiteralToken
    | HexIntegerLiteralToken;
  syntaxDiagnostics: any[];
}

export interface ObjectConstructor extends STNode {
  annotations: Annotation[];
  closeBraceToken: CloseBraceToken;
  members: (
    | ObjectField
    | ObjectMethodDefinition
    | ResourceAccessorDefinition
  )[];
  objectKeyword: ObjectKeyword;
  objectTypeQualifiers: (ClientKeyword | IsolatedKeyword | ServiceKeyword)[];
  openBraceToken: OpenBraceToken;
  syntaxDiagnostics: any[];
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
  metadata?: Metadata;
  qualifierList: FinalKeyword[];
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  metadata?: Metadata;
  qualifierList: (
    | IsolatedKeyword
    | PrivateKeyword
    | PublicKeyword
    | RemoteKeyword
    | TransactionalKeyword
  )[];
  relativeResourcePath: any;
  syntaxDiagnostics: any[];
}

export interface ObjectTypeDesc extends STNode {
  closeBrace: CloseBraceToken;
  members: (
    | MethodDeclaration
    | ObjectField
    | ResourceAccessorDeclaration
    | TypeReference
  )[];
  objectKeyword: ObjectKeyword;
  objectTypeQualifiers: (ClientKeyword | IsolatedKeyword | ServiceKeyword)[];
  openBrace: OpenBraceToken;
  syntaxDiagnostics: any[];
}

export interface OnClause extends STNode {
  equalsKeyword: EqualsKeyword;
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
}

export interface OnConflictClause extends STNode {
  conflictKeyword: ConflictKeyword;
  expression: ErrorConstructor | FunctionCall | SimpleNameReference;
  onKeyword: OnKeyword;
  syntaxDiagnostics: any;
}

export interface OnFailClause extends STNode {
  blockStatement: BlockStatement;
  failErrorName: IdentifierToken;
  failKeyword: FailKeyword;
  onKeyword: OnKeyword;
  syntaxDiagnostics: any;
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
  optionalChainingToken: OptionalChainingToken;
  syntaxDiagnostics: any;
}

export interface OptionalTypeDesc extends STNode {
  questionMarkToken: QuestionMarkToken;
  syntaxDiagnostics: any;
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
  orderKey: (CommaToken | OrderKey)[];
  orderKeyword: OrderKeyword;
  syntaxDiagnostics: any;
}

export interface OrderKey extends STNode {
  expression:
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | SimpleNameReference;
  orderDirection?: AscendingKeyword | DescendingKeyword;
  syntaxDiagnostics: any;
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
  expression:
    | BracedExpression
    | ErrorConstructor
    | FieldAccess
    | FunctionCall
    | SimpleNameReference
    | TypeCastExpression;
  panicKeyword: PanicKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any;
}

export interface ParameterDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface ParameterKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface ParameterName extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface ParenthesisedTypeDesc extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
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
  arguments: (CommaToken | NamedArg | PositionalArg | RestArg)[];
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
}

export interface QueryAction extends STNode {
  blockStatement: BlockStatement;
  doKeyword: DoKeyword;
  queryPipeline: QueryPipeline;
  syntaxDiagnostics: any;
}

export interface QueryConstructType extends STNode {
  keySpecifier?: KeySpecifier;
  keyword: StreamKeyword | TableKeyword;
  syntaxDiagnostics: any;
}

export interface QueryExpression extends STNode {
  onConflictClause?: OnConflictClause;
  queryConstructType?: QueryConstructType;
  queryPipeline: QueryPipeline;
  selectClause: SelectClause;
  syntaxDiagnostics: any[];
}

export interface QueryPipeline extends STNode {
  fromClause: FromClause;
  intermediateClauses: (
    | FromClause
    | JoinClause
    | LetClause
    | LimitClause
    | OrderByClause
    | WhereClause
  )[];
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
}

export interface ReadonlyKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface ReadonlyTypeDesc extends STNode {
  name: ReadonlyKeyword;
  syntaxDiagnostics: any[];
}

export interface ReceiveAction extends STNode {
  leftArrow: LeftArrowToken;
  receiveWorkers: ReceiveFields | SimpleNameReference;
  syntaxDiagnostics: any[];
}

export interface ReceiveFields extends STNode {
  closeBrace: CloseBraceToken;
  openBrace: OpenBraceToken;
  receiveFields: IdentifierToken[];
  syntaxDiagnostics: any;
}

export interface RecordField extends STNode {
  fieldName: IdentifierToken;
  metadata?: Metadata;
  questionMarkToken?: QuestionMarkToken;
  readonlyKeyword?: ReadonlyKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  metadata?: Metadata;
  readonlyKeyword?: ReadonlyKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  value: string;
}

export interface RecordRestType extends STNode {
  ellipsisToken: EllipsisToken;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  fields: (RecordField | RecordFieldWithDefaultValue | TypeReference)[];
  recordKeyword: RecordKeyword;
  recordRestDescriptor?: RecordRestType;
  syntaxDiagnostics: any[];
}

export interface RemoteKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface RemoteMethodCallAction extends STNode {
  arguments: (CommaToken | NamedArg | PositionalArg | RestArg)[];
  closeParenToken: CloseParenToken;
  expression:
    | FieldAccess
    | FunctionCall
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral;
  methodName: SimpleNameReference;
  openParenToken: OpenParenToken;
  rightArrowToken: RightArrowToken;
  syntaxDiagnostics: any[];
}

export interface RequiredExpression extends STNode {
  questionMarkToken: QuestionMarkToken;
  syntaxDiagnostics: any;
}

export interface RequiredParam extends STNode {
  annotations: Annotation[];
  paramName?: IdentifierToken;
  syntaxDiagnostics: any[];
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
  methodName: IdentifierToken;
  methodSignature: FunctionSignature;
  qualifierList: ResourceKeyword[];
  relativeResourcePath: (
    | DotToken
    | IdentifierToken
    | ResourcePathSegmentParam
    | SlashToken
  )[];
  semicolon: SemicolonToken;
  syntaxDiagnostics: any[];
}

export interface ResourceAccessorDefinition extends STNode {
  functionBody:
    | ExpressionFunctionBody
    | ExternalFunctionBody
    | FunctionBodyBlock;
  functionKeyword: FunctionKeyword;
  functionName: IdentifierToken;
  functionSignature: FunctionSignature;
  metadata?: Metadata;
  qualifierList: (IsolatedKeyword | ResourceKeyword)[];
  relativeResourcePath: (
    | DotToken
    | IdentifierToken
    | ResourcePathRestParam
    | ResourcePathSegmentParam
    | SlashToken
  )[];
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any;
  typeDescriptor: AnydataTypeDesc | IntTypeDesc | StringTypeDesc;
}

export interface ResourcePathSegmentParam extends STNode {
  annotations: any;
  closeBracketToken: CloseBracketToken;
  openBracketToken: OpenBracketToken;
  paramName: IdentifierToken;
  syntaxDiagnostics: any;
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
  syntaxDiagnostics: any[];
}

export interface RestBindingPattern extends STNode {
  ellipsisToken: EllipsisToken;
  syntaxDiagnostics: any;
  variableName: SimpleNameReference;
}

export interface RestMatchPattern extends STNode {
  ellipsisToken: EllipsisToken;
  syntaxDiagnostics: any[];
  varKeywordToken: VarKeyword;
  variableName: SimpleNameReference;
}

export interface RestParam extends STNode {
  annotations: Annotation[];
  ellipsisToken: EllipsisToken;
  paramName?: IdentifierToken;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any;
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
  value: string;
}

export interface ReturnKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
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
  returnKeyword: ReturnKeyword;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
}

export interface ReturnTypeDescriptor extends STNode {
  annotations: Annotation[];
  returnsKeyword: ReturnsKeyword;
  syntaxDiagnostics: any[];
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
  arguments?: ParenthesizedArgList;
  expression?: FunctionCall;
  onFailClause?: OnFailClause;
  retryBody?: BlockStatement | TransactionStatement;
  retryKeyword?: RetryKeyword;
  rollbackKeyword?: RollbackKeyword;
  semicolon?: SemicolonToken;
  syntaxDiagnostics: any;
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
  selectKeyword: SelectKeyword;
  syntaxDiagnostics: any[];
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
  absoluteResourcePath: (IdentifierToken | SlashToken | StringLiteral)[];
  closeBraceToken: CloseBraceToken;
  expressions: (
    | BinaryExpression
    | CommaToken
    | ExplicitNewExpression
    | ImplicitNewExpression
    | MappingConstructor
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference
  )[];
  members: (
    | ObjectField
    | ObjectMethodDefinition
    | ResourceAccessorDefinition
  )[];
  metadata?: Metadata;
  onKeyword: OnKeyword;
  openBraceToken: OpenBraceToken;
  qualifiers: IsolatedKeyword[];
  serviceKeyword: ServiceKeyword;
  syntaxDiagnostics: any[];
  typeDescriptor?: MapTypeDesc | QualifiedNameReference | SimpleNameReference;
  isRunnable?: boolean;
  runArgs?: any[];
}

export interface ServiceDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface ServiceKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface SimpleNameReference extends STNode {
  name: FunctionKeyword | IdentifierToken;
  syntaxDiagnostics: any[];
}

export interface SingleQuoteToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface SingletonTypeDesc extends STNode {
  simpleContExprNode:
    | BooleanLiteral
    | NullLiteral
    | NumericLiteral
    | StringLiteral
    | UnaryExpression;
  syntaxDiagnostics: any[];
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

export interface SourceKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface SpecificField extends STNode {
  colon?: ColonToken;
  fieldName: IdentifierToken | StringLiteral;
  readonlyKeyword?: ReadonlyKeyword;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
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
  startKeyword: StartKeyword;
  syntaxDiagnostics: any[];
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
  streamTypeParamsNode?: StreamTypeParams;
  syntaxDiagnostics: any[];
}

export interface StreamTypeParams extends STNode {
  commaToken?: CommaToken;
  gtToken: GtToken;
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
}

export interface StringKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface StringLiteral extends STNode {
  literalToken: StringLiteralToken;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
  type: StringKeyword;
}

export interface StringTypeDesc extends STNode {
  name: StringKeyword;
  syntaxDiagnostics: any[];
}

export interface SyncSendAction extends STNode {
  expression:
    | BinaryExpression
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral;
  peerWorker: SimpleNameReference;
  syncSendToken: SyncSendToken;
  syntaxDiagnostics: any;
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
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
  transactionKeyword: TransactionKeyword;
}

export interface TransactionalExpression extends STNode {
  syntaxDiagnostics: any;
  transactionalKeyword: TransactionalKeyword;
}

export interface TransactionalKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
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
  syntaxDiagnostics: any;
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
  syntaxDiagnostics: any[];
  trapKeyword: TrapKeyword;
}

export interface TrapKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface TripleBacktickToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface TrippleEqualToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface TrippleGtToken extends STNode {
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
    | XmlTypeDesc
  )[];
  openBracketToken: OpenBracketToken;
  syntaxDiagnostics: any[];
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
  ltToken: LtToken;
  syntaxDiagnostics: any[];
  typeCastParam: TypeCastParam;
}

export interface TypeCastParam extends STNode {
  annotations: Annotation[];
  syntaxDiagnostics: any[];
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
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  value: string;
}

export interface TypeKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface TypeParameter extends STNode {
  gtToken: GtToken;
  ltToken: LtToken;
  syntaxDiagnostics: any[];
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
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any[];
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
  value: string;
}

export interface TypedescTypeDesc extends STNode {
  keywordToken: TypedescKeyword;
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any;
  typeofKeyword: TypeofKeyword;
}

export interface TypeofKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
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
  syntaxDiagnostics: any[];
  unaryOperator: ExclamationMarkToken | MinusToken | NegationToken | PlusToken;
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
}

export interface VarDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface VarKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface VarTypeDesc extends STNode {
  name: VarKeyword;
  syntaxDiagnostics: any[];
}

export interface VariableDocReferenceToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface WaitAction extends STNode {
  syntaxDiagnostics: any[];
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
  syntaxDiagnostics: any;
  waitFutureExpr: FunctionCall | SimpleNameReference;
}

export interface WaitFieldsList extends STNode {
  closeBrace: CloseBraceToken;
  openBrace: OpenBraceToken;
  syntaxDiagnostics: any;
  waitFields: (CommaToken | SimpleNameReference | WaitField)[];
}

export interface WaitKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
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
  syntaxDiagnostics: any;
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
  onFailClause?: OnFailClause;
  syntaxDiagnostics: any[];
  whileBody: BlockStatement;
  whileKeyword: WhileKeyword;
}

export interface WildcardBindingPattern extends STNode {
  syntaxDiagnostics: any;
  underscoreToken: UnderscoreKeyword;
}

export interface WorkerKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface XmlAtomicNamePattern extends STNode {
  colon: ColonToken;
  name: AsteriskToken | IdentifierToken;
  prefix: IdentifierToken;
  syntaxDiagnostics: any;
}

export interface XmlAttribute extends STNode {
  attributeName: XmlQualifiedName | XmlSimpleName;
  equalToken: EqualToken;
  syntaxDiagnostics: any;
  value: XmlAttributeValue;
}

export interface XmlAttributeValue extends STNode {
  endQuote: DoubleQuoteToken | SingleQuoteToken;
  startQuote: DoubleQuoteToken | SingleQuoteToken;
  syntaxDiagnostics: any;
  value: (Interpolation | XmlTextContent)[];
}

export interface XmlCdata extends STNode {
  cdataEnd: XmlCdataEndToken;
  cdataStart: XmlCdataStartToken;
  content: (Interpolation | XmlTextContent)[];
  syntaxDiagnostics: any[];
}

export interface XmlCdataEndToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface XmlCdataStartToken extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface XmlComment extends STNode {
  commentEnd: XmlCommentEndToken;
  commentStart: XmlCommentStartToken;
  content: (Interpolation | XmlTextContent)[];
  syntaxDiagnostics: any;
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
  content: (
    | Interpolation
    | XmlCdata
    | XmlComment
    | XmlElement
    | XmlEmptyElement
    | XmlPi
    | XmlText
  )[];
  endTag: XmlElementEndTag;
  startTag: XmlElementStartTag;
  syntaxDiagnostics: any;
}

export interface XmlElementEndTag extends STNode {
  getToken: GtToken;
  ltToken: LtToken;
  name: XmlQualifiedName | XmlSimpleName;
  slashToken: SlashToken;
  syntaxDiagnostics: any;
}

export interface XmlElementStartTag extends STNode {
  attributes: XmlAttribute[];
  getToken: GtToken;
  ltToken: LtToken;
  name: XmlQualifiedName | XmlSimpleName;
  syntaxDiagnostics: any;
}

export interface XmlEmptyElement extends STNode {
  attributes: XmlAttribute[];
  getToken: GtToken;
  ltToken: LtToken;
  name: XmlQualifiedName | XmlSimpleName;
  slashToken: SlashToken;
  syntaxDiagnostics: any;
}

export interface XmlFilterExpression extends STNode {
  expression: FunctionCall | SimpleNameReference | XmlStepExpression;
  syntaxDiagnostics: any;
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
  syntaxDiagnostics: any;
  xmlNamePattern: (
    | AsteriskToken
    | PipeToken
    | SimpleNameReference
    | XmlAtomicNamePattern
  )[];
}

export interface XmlNamespaceDeclaration extends STNode {
  asKeyword?: AsKeyword;
  namespacePrefix?: IdentifierToken;
  namespaceuri: StringLiteral;
  semicolonToken: SemicolonToken;
  syntaxDiagnostics: any;
  xmlnsKeyword: XmlnsKeyword;
}

export interface XmlPi extends STNode {
  data: (Interpolation | XmlTextContent)[];
  piEnd: XmlPiEndToken;
  piStart: XmlPiStartToken;
  syntaxDiagnostics: any;
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
  syntaxDiagnostics: any;
}

export interface XmlSimpleName extends STNode {
  name: IdentifierToken;
  syntaxDiagnostics: any;
}

export interface XmlStepExpression extends STNode {
  expression:
    | BracedExpression
    | IndexedExpression
    | SimpleNameReference
    | TypeCastExpression
    | XmlFilterExpression
    | XmlStepExpression;
  syntaxDiagnostics: any[];
  xmlStepStart: SlashAsteriskToken | XmlNamePatternChain;
}

export interface XmlTemplateExpression extends STNode {
  content: (
    | Interpolation
    | XmlCdata
    | XmlComment
    | XmlElement
    | XmlEmptyElement
    | XmlPi
    | XmlText
  )[];
  endBacktick: BacktickToken;
  startBacktick: BacktickToken;
  syntaxDiagnostics: any[];
  type: XmlKeyword;
}

export interface XmlText extends STNode {
  content: XmlTextContent;
  syntaxDiagnostics: any;
}

export interface XmlTextContent extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface XmlTypeDesc extends STNode {
  keywordToken: XmlKeyword;
  syntaxDiagnostics: any;
  typeParamNode?: TypeParameter;
}

export interface XmlnsKeyword extends STNode {
  isMissing: boolean;
  isToken: boolean;
  value: string;
}

export interface undefined extends STNode {}

// tslint:enable:ban-types
