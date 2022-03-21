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
}

export interface ActionStatement extends STNode {
  expression: CheckAction | RemoteMethodCallAction;
  semicolonToken: SemicolonToken;
}

export interface Annotation extends STNode {
  annotReference: QualifiedNameReference | SimpleNameReference;
  annotValue?: MappingConstructor;
  atToken: AtToken;
}

export interface AnyKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface AnyTypeDesc extends STNode {
  name: AnyKeyword;
}

export interface AnydataKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface AnydataTypeDesc extends STNode {
  name: AnydataKeyword;
}

export interface ArrayTypeDesc extends STNode {
  arrayLength?: AsteriskLiteral | NumericLiteral;
  closeBracket: CloseBracketToken;
  memberTypeDesc:
  | AnydataTypeDesc
  | ArrayTypeDesc
  | BooleanTypeDesc
  | ByteTypeDesc
  | DecimalTypeDesc
  | FloatTypeDesc
  | IntTypeDesc
  | JsonTypeDesc
  | OptionalTypeDesc
  | ParenthesisedTypeDesc
  | QualifiedNameReference
  | SimpleNameReference
  | StringTypeDesc;
  openBracket: OpenBracketToken;
}

export interface AsKeyword extends STNode {
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
  | FieldAccess
  | FunctionCall
  | IndexedExpression
  | ListConstructor
  | MappingConstructor
  | MethodCall
  | NumericLiteral
  | OptionalFieldAccess
  | QualifiedNameReference
  | RemoteMethodCallAction
  | SimpleNameReference
  | StringLiteral
  | StringTemplateExpression
  | TypeCastExpression
  | WaitAction;
  semicolonToken: SemicolonToken;
  varRef:
  | ErrorBindingPattern
  | FieldAccess
  | IndexedExpression
  | ListBindingPattern
  | SimpleNameReference;
}

export interface AsteriskLiteral extends STNode {
  literalToken: AsteriskToken;
}

export interface AsteriskToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface AtToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface BacktickContent extends STNode {
  isToken: boolean;
  value: string;
}

export interface BacktickToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface Base16Keyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface Base64Keyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface BinaryExpression extends STNode {
  lhsExpr:
  | BinaryExpression
  | FieldAccess
  | FunctionCall
  | IndexedExpression
  | MethodCall
  | NumericLiteral
  | OptionalFieldAccess
  | QualifiedNameReference
  | SimpleNameReference
  | StringLiteral
  | OptionalFieldAccess;
  operator:
  | AsteriskToken
  | BitwiseAndToken
  | BitwiseXorToken
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
  | MethodCall
  | NilLiteral
  | NumericLiteral
  | QualifiedNameReference
  | SimpleNameReference
  | StringLiteral
  | StringTypeDesc
  | TypeCastExpression
  | TypeTestExpression;
}

export interface BitwiseAndToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface BitwiseXorToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface BlockStatement extends STNode {
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
    | MatchStatement
    | PanicStatement
    | ReturnStatement
    | RollbackStatement
    | WhileStatement
  )[];
}

export interface BooleanKeyword extends STNode {
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
  | BooleanLiteral
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
  isToken: boolean;
  value: string;
}

export interface BreakStatement extends STNode {
  breakToken: BreakKeyword;
  semicolonToken: SemicolonToken;
}

export interface ByteArrayLiteral extends STNode {
  content: TemplateString;
  endBacktick: BacktickToken;
  startBacktick: BacktickToken;
  type: Base16Keyword | Base64Keyword;
}

export interface ByteKeyword extends STNode {
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
  expression: RemoteMethodCallAction;
}

export interface CheckExpression extends STNode {
  checkKeyword: CheckKeyword | CheckpanicKeyword;
  expression:
  | FieldAccess
  | FunctionCall
  | ImplicitNewExpression
  | MethodCall
  | SimpleNameReference;
}

export interface CheckKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface CheckpanicKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ClassDefinition extends STNode {
  classKeyword: ClassKeyword;
  className: IdentifierToken;
  classTypeQualifiers: (IsolatedKeyword | ReadonlyKeyword | ClientKeyword)[];
  closeBrace: CloseBraceToken;
  members: (ObjectField | ObjectMethodDefinition | TypeReference)[];
  metadata?: Metadata;
  openBrace: OpenBraceToken;
  visibilityQualifier?: PublicKeyword;
}

export interface ClassKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ClientKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface CloseBracePipeToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface CloseBraceToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface CloseBracketToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface CloseParenToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface ColonToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface CommaToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface CommitAction extends STNode {
  commitKeyword: CommitKeyword;
}

export interface CommitKeyword extends STNode {
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
  lhsExpression: FieldAccess | SimpleNameReference;
  rhsExpression:
  | MethodCall
  | NumericLiteral
  | SimpleNameReference
  | StringTemplateExpression;
  semicolonToken: SemicolonToken;
}

export interface ComputedNameField extends STNode {
  closeBracket: CloseBracketToken;
  colonToken: ColonToken;
  fieldNameExpr: SimpleNameReference;
  openBracket: OpenBracketToken;
  valueExpr: StringLiteral;
}

export interface ConditionalExpression extends STNode {
  colonToken: ColonToken;
  endExpression: MethodCall | SimpleNameReference;
  lhsExpression: TypeTestExpression;
  middleExpression: MethodCall | StringLiteral;
  questionMarkToken: QuestionMarkToken;
}

export interface ConfigurableKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ConstDeclaration extends STNode {
  constKeyword: ConstKeyword;
  equalsToken: EqualToken;
  initializer: MappingConstructor | NumericLiteral | StringLiteral;
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  typeDescriptor?: FloatTypeDesc | ParameterizedTypeDesc | StringTypeDesc;
  variableName: IdentifierToken;
  visibilityQualifier?: PublicKeyword;
}

export interface ConstKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ContinueKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ContinueStatement extends STNode {
  continueToken: ContinueKeyword;
  semicolonToken: SemicolonToken;
}

export interface DecimalFloatingPointLiteralToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface DecimalIntegerLiteralToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface DecimalKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface DecimalTypeDesc extends STNode {
  name: DecimalKeyword;
  source: string;
}

export interface DefaultableParam extends STNode {
  annotations: any;
  equalsToken: EqualToken;
  expression: NilLiteral | NumericLiteral;
  paramName: IdentifierToken;
  typeName: FloatTypeDesc | IntTypeDesc | OptionalTypeDesc;
}

export interface DeprecationLiteral extends STNode {
  isToken: boolean;
  value: string;
}

export interface DoKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface DoStatement extends STNode {
  blockStatement: BlockStatement;
  doKeyword: DoKeyword;
  onFailClause: OnFailClause;
}

export interface DocumentationDescription extends STNode {
  isToken: boolean;
  value: string;
}

export interface DocumentationReference extends STNode {
  backtickContent: BacktickContent | SimpleNameReference;
  endBacktick: BacktickToken;
  referenceType?: TypeDocReferenceToken;
  startBacktick: BacktickToken;
}

export interface DotToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface DoubleDotLtToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface DoubleEqualToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface DoubleGtToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface DoubleLtToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface DoubleQuoteToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface EllipsisToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface ElseBlock extends STNode {
  elseBody: BlockStatement | IfElseStatement;
  elseKeyword: ElseKeyword;
}

export interface ElseKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ElvisToken extends STNode {
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
  isToken: boolean;
  value: string;
}

export interface EnumMember extends STNode {
  constExprNode?: BinaryExpression | StringLiteral;
  equalToken?: EqualToken;
  identifier: IdentifierToken;
}

export interface EofToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface EqualToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface ErrorBindingPattern extends STNode {
  argListBindingPatterns: (
    | CaptureBindingPattern
    | CommaToken
    | NamedArgBindingPattern
    | RestBindingPattern
    | WildcardBindingPattern
  )[];
  closeParenthesis: CloseParenToken;
  errorKeyword: ErrorKeyword;
  openParenthesis: OpenParenToken;
}

export interface ErrorConstructor extends STNode {
  arguments: (CommaToken | NamedArg | PositionalArg)[];
  closeParenToken: CloseParenToken;
  errorKeyword: ErrorKeyword;
  openParenToken: OpenParenToken;
  typeReference?: SimpleNameReference;
}

export interface ErrorKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ErrorMatchPattern extends STNode {
  argListMatchPatternNode: (
    | CommaToken
    | NamedArgMatchPattern
    | RestMatchPattern
    | StringLiteral
  )[];
  closeParenthesisToken: CloseParenToken;
  errorKeyword: ErrorKeyword;
  openParenthesisToken: OpenParenToken;
  typeReference?: SimpleNameReference;
}

export interface ErrorTypeDesc extends STNode {
  errorKeywordToken: ErrorKeyword;
  errorTypeParamsNode?: ErrorTypeParams;
  name?: ErrorKeyword;
}

export interface ErrorTypeParams extends STNode {
  gtToken: GtToken;
  ltToken: LtToken;
  parameter: SimpleNameReference;
}

export interface ExclamationMarkToken extends STNode {
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
  typeDescriptor: QualifiedNameReference | SimpleNameReference;
}

export interface ExpressionFunctionBody extends STNode {
  expression:
  | BinaryExpression
  | ConditionalExpression
  | FieldAccess
  | MappingConstructor
  | StringLiteral
  | StringTemplateExpression
  | NumericLiteral;
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
  isToken: boolean;
  value: string;
}

export interface FailKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface FailStatement extends STNode {
  expression: SimpleNameReference;
  failKeyword: FailKeyword;
  semicolonToken: SemicolonToken;
}

export interface FalseKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface FieldAccess extends STNode {
  dotToken: DotToken;
  expression:
  | FieldAccess
  | FunctionCall
  | IndexedExpression
  | MethodCall
  | SimpleNameReference;
  fieldName: SimpleNameReference;
}

export interface FieldBindingPattern extends STNode {
  bindingPattern: CaptureBindingPattern;
  colon: ColonToken;
  variableName: SimpleNameReference;
}

export interface FieldMatchPattern extends STNode {
  colonToken: ColonToken;
  fieldNameNode: IdentifierToken;
  matchPattern: TypedBindingPattern;
}

export interface FinalKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface FloatKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface FloatTypeDesc extends STNode {
  name: FloatKeyword;
}

export interface ForeachKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ForeachStatement extends STNode {
  actionOrExpressionNode:
  | BinaryExpression
  | MethodCall
  | SimpleNameReference
  | XmlStepExpression;
  blockStatement: BlockStatement;
  forEachKeyword: ForeachKeyword;
  inKeyword: InKeyword;
  typedBindingPattern: TypedBindingPattern;
}

export interface ForkKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ForkStatement extends STNode {
  closeBraceToken: CloseBraceToken;
  forkKeyword: ForkKeyword;
  namedWorkerDeclarations: NamedWorkerDeclaration[];
  openBraceToken: OpenBraceToken;
}

export interface FromClause extends STNode {
  expression: SimpleNameReference;
  fromKeyword: FromKeyword;
  inKeyword: InKeyword;
  source: string;
  typedBindingPattern: TypedBindingPattern;
}

export interface FromKeyword extends STNode {
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
    | ForkStatement
    | IfElseStatement
    | LocalVarDecl
    | LockStatement
    | MatchStatement
    | PanicStatement
    | ReturnStatement
    | RollbackStatement
    | TransactionStatement
    | WhileStatement
  )[];
}

export interface FunctionCall extends STNode {
  arguments: (CommaToken | NamedArg | PositionalArg | RestArg)[];
  closeParenToken: CloseParenToken;
  functionName: ErrorTypeDesc | QualifiedNameReference | SimpleNameReference;
  openParenToken: OpenParenToken;
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
  qualifierList: (
    | IsolatedKeyword
    | PublicKeyword
    | TransactionalKeyword
    | ResourceKeyword
  )[];
  relativeResourcePath: any;
  isRunnable?: boolean;
  runArgs?: any[];
}

export interface FunctionKeyword extends STNode {
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
}

export interface FunctionTypeDesc extends STNode {
  functionKeyword: FunctionKeyword;
  functionSignature: FunctionSignature;
  qualifierList: any;
}

export interface FutureKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface GtEqualToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface GtToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface HandleKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface HandleTypeDesc extends STNode {
  name: HandleKeyword;
}

export interface HashToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface IdentifierToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface IfElseStatement extends STNode {
  condition:
  | BinaryExpression
  | BracedExpression
  | TypeTestExpression
  | UnaryExpression;
  elseBody?: ElseBlock;
  ifBody: BlockStatement;
  ifKeyword: IfKeyword;
}

export interface IfKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ImplicitAnonymousFunctionExpression extends STNode {
  expression: BinaryExpression;
  params: InferParamList;
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
  isToken: boolean;
  value: string;
}

export interface ImportOrgName extends STNode {
  orgName: IdentifierToken;
  slashToken: SlashToken;
}

export interface ImportPrefix extends STNode {
  asKeyword: AsKeyword;
  prefix: IdentifierToken;
}

export interface InKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface IncludedRecordParam extends STNode {
  annotations: any;
  asteriskToken: AsteriskToken;
  paramName: IdentifierToken;
  typeName: SimpleNameReference;
}

export interface IndexedExpression extends STNode {
  closeBracket: CloseBracketToken;
  containerExpression:
  | FieldAccess
  | IndexedExpression
  | MethodCall
  | SimpleNameReference;
  keyExpression: (
    | FieldAccess
    | MethodCall
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
  )[];
  openBracket: OpenBracketToken;
}

export interface InferParamList extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  parameters: SimpleNameReference[];
}

export interface IntKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface IntTypeDesc extends STNode {
  name: IntKeyword;
}

export interface Interpolation extends STNode {
  expression: FieldAccess | MethodCall | SimpleNameReference;
  interpolationEndToken: CloseBraceToken;
  interpolationStartToken: InterpolationStartToken;
}

export interface InterpolationStartToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface IntersectionTypeDesc extends STNode {
  bitwiseAndToken: BitwiseAndToken;
  leftTypeDesc: ArrayTypeDesc | ReadonlyTypeDesc | SimpleNameReference;
  rightTypeDesc: ArrayTypeDesc | ReadonlyTypeDesc;
}

export interface IsKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface IsolatedKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface JsonKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface JsonTypeDesc extends STNode {
  name: JsonKeyword;
}

export interface KeyKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface KeySpecifier extends STNode {
  closeParenToken: CloseParenToken;
  fieldNames: IdentifierToken[];
  keyKeyword: KeyKeyword;
  openParenToken: OpenParenToken;
}

export interface KeyTypeConstraint extends STNode {
  keyKeywordToken: KeyKeyword;
  source: string;
  typeParameterNode: TypeParameter;
}

export interface LetClause extends STNode {
  letKeyword: LetKeyword;
  letVarDeclarations: (CommaToken | LetVarDecl)[];
  source: string;
}

export interface LetExpression extends STNode {
  expression: BinaryExpression | SimpleNameReference;
  inKeyword: InKeyword;
  letKeyword: LetKeyword;
  letVarDeclarations: (CommaToken | LetVarDecl)[];
  source: string;
}

export interface LetKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface LetVarDecl extends STNode {
  annotations: any;
  equalsToken: EqualToken;
  expression:
  | BinaryExpression
  | FunctionCall
  | NumericLiteral
  | SimpleNameReference
  | StringLiteral;
  source: string;
  typedBindingPattern: TypedBindingPattern;
}

export interface LimitClause extends STNode {
  expression: NumericLiteral;
  limitKeyword: LimitKeyword;
  source: string;
}

export interface LimitKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ListBindingPattern extends STNode {
  bindingPatterns: (
    | CaptureBindingPattern
    | CommaToken
    | WildcardBindingPattern
  )[];
  closeBracket: CloseBracketToken;
  openBracket: OpenBracketToken;
}

export interface ListConstructor extends STNode {
  closeBracket: CloseBracketToken;
  expressions: (
    | BooleanLiteral
    | CommaToken
    | FieldAccess
    | IndexedExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NullLiteral
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | UnaryExpression
  )[];
  openBracket: OpenBracketToken;
}

export interface ListMatchPattern extends STNode {
  closeBracket: CloseBracketToken;
  matchPatterns: (CommaToken | TypedBindingPattern)[];
  openBracket: OpenBracketToken;
}

export interface ListenerDeclaration extends STNode {
  equalsToken: EqualToken;
  initializer: ExplicitNewExpression | ImplicitNewExpression;
  listenerKeyword: ListenerKeyword;
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  typeDescriptor: QualifiedNameReference;
  variableName: IdentifierToken;
}

export interface ListenerKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface LocalVarDecl extends STNode {
  annotations: any;
  equalsToken?: EqualToken;
  initializer?:
  | BinaryExpression
  | BooleanLiteral
  | ByteArrayLiteral
  | CheckAction
  | CheckExpression
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
  | TableConstructor
  | TrapExpression
  | TypeCastExpression
  | UnaryExpression
  | WaitAction
  | XmlTemplateExpression;
  semicolonToken: SemicolonToken;
  typedBindingPattern: TypedBindingPattern;
}

export interface LockKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface LockStatement extends STNode {
  blockStatement: BlockStatement;
  lockKeyword: LockKeyword;
}

export interface LogicalAndToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface LogicalOrToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface LtEqualToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface LtToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface MapKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface MappingBindingPattern extends STNode {
  closeBrace: CloseBraceToken;
  fieldBindingPatterns: (CommaToken | FieldBindingPattern)[];
  openBrace: OpenBraceToken;
  restBindingPattern: RestBindingPattern;
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
  documentElements: (DocumentationDescription | DocumentationReference)[];
  hashToken: HashToken;
  minusToken: MinusToken;
  parameterName: ParameterName;
  plusToken: PlusToken;
}

export interface MarkdownReferenceDocumentationLine extends STNode {
  documentElements: (DocumentationDescription | DocumentationReference)[];
  hashToken: HashToken;
}

export interface MarkdownReturnParameterDocumentationLine extends STNode {
  documentElements: (DocumentationDescription | DocumentationReference)[];
  hashToken: HashToken;
  minusToken: MinusToken;
  parameterName: ReturnKeyword;
  plusToken: PlusToken;
}

export interface MatchClause extends STNode {
  blockStatement: BlockStatement;
  matchPatterns: (
    | NumericLiteral
    | PipeToken
    | SimpleNameReference
    | ErrorMatchPattern
    | ListMatchPattern
    | MappingMatchPattern
    | StringLiteral
  )[];
  rightDoubleArrow: RightDoubleArrowToken;
}

export interface MatchKeyword extends STNode {
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
  arguments: (CommaToken | NamedArg | PositionalArg | RestArg)[];
  closeParenToken: CloseParenToken;
  dotToken: DotToken;
  expression:
  | BracedExpression
  | FieldAccess
  | FunctionCall
  | IndexedExpression
  | MethodCall
  | OptionalFieldAccess
  | SimpleNameReference
  | StringLiteral;
  methodName: SimpleNameReference;
  openParenToken: OpenParenToken;
}

export interface MethodDeclaration extends STNode {
  functionKeyword: FunctionKeyword;
  metadata: Metadata;
  methodName: IdentifierToken;
  methodSignature: FunctionSignature;
  qualifierList: PublicKeyword[];
  relativeResourcePath: any;
  semicolon: SemicolonToken;
}

export interface MinusToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface ModulePart extends STNode {
  eofToken: EofToken;
  imports: ImportDeclaration[];
  members: (
    | ClassDefinition
    | ConstDeclaration
    | EnumDeclaration
    | FunctionDefinition
    | ListenerDeclaration
    | ModuleVarDecl
    | ServiceDeclaration
    | TypeDefinition
  )[];
}

export interface ModuleVarDecl extends STNode {
  equalsToken: EqualToken;
  initializer:
  | BinaryExpression
  | BooleanLiteral
  | CheckExpression
  | ImplicitNewExpression
  | ListConstructor
  | MappingConstructor
  | NumericLiteral
  | ServiceConstructorExpression
  | ObjectConstructor
  | RequiredExpression
  | StringLiteral;
  metadata?: Metadata;
  qualifiers: (ConfigurableKeyword | FinalKeyword)[];
  semicolonToken: SemicolonToken;
  typedBindingPattern: TypedBindingPattern;
}

export interface NamedArg extends STNode {
  argumentName: SimpleNameReference;
  equalsToken: EqualToken;
  expression:
  | BinaryExpression
  | BooleanLiteral
  | FunctionCall
  | MappingConstructor
  | NumericLiteral
  | QualifiedNameReference
  | SimpleNameReference
  | StringLiteral
  | StringTypeDesc;
}

export interface NamedArgBindingPattern extends STNode {
  argName: IdentifierToken;
  bindingPattern: CaptureBindingPattern;
  equalsToken: EqualToken;
}

export interface NamedArgMatchPattern extends STNode {
  equalToken: EqualToken;
  identifier: IdentifierToken;
  matchPattern: TypedBindingPattern;
}

export interface NamedWorkerDeclaration extends STNode {
  annotations: Annotation[];
  returnTypeDesc?: ReturnTypeDescriptor;
  workerBody: BlockStatement;
  workerKeyword: WorkerKeyword;
  workerName: IdentifierToken;
}

export interface NamedWorkerDeclarator extends STNode {
  namedWorkerDeclarations: NamedWorkerDeclaration[];
  workerInitStatements: any;
}

export interface NeverKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface NeverTypeDesc extends STNode {
  name: NeverKeyword;
}

export interface NewKeyword extends STNode {
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
  isToken: boolean;
  value: string;
}

export interface NotEqualToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface NullKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface NullLiteral extends STNode {
  literalToken: NullKeyword;
  source: string;
}

export interface NumericLiteral extends STNode {
  literalToken: DecimalFloatingPointLiteralToken | DecimalIntegerLiteralToken;
}

export interface ObjectConstructor extends STNode {
  annotations: any;
  closeBraceToken: CloseBraceToken;
  members: (
    | ObjectField
    | ObjectMethodDefinition
    | ResourceAccessorDefinition
  )[];
  objectKeyword: ObjectKeyword;
  objectTypeQualifiers: (ServiceKeyword | any)[];
  openBraceToken: OpenBraceToken;
}

export interface ObjectField extends STNode {
  equalsToken?: EqualToken;
  expression?:
  | ListConstructor
  | MappingConstructor
  | NilLiteral
  | NumericLiteral
  | StringLiteral
  | UnaryExpression;
  fieldName: IdentifierToken;
  finalKeyword?: FinalKeyword;
  qualifierList: any;
  semicolonToken: SemicolonToken;
  typeName:
  | ArrayTypeDesc
  | BooleanTypeDesc
  | FloatTypeDesc
  | IntTypeDesc
  | IntersectionTypeDesc
  | OptionalTypeDesc
  | QualifiedNameReference
  | SimpleNameReference
  | StringTypeDesc
  | UnionTypeDesc;
  visibilityQualifier?: PrivateKeyword | PublicKeyword;
}

export interface ObjectKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ObjectMethodDefinition extends STNode {
  functionBody: ExpressionFunctionBody | FunctionBodyBlock;
  functionKeyword: FunctionKeyword;
  functionName: IdentifierToken;
  functionSignature: FunctionSignature;
  metadata?: Metadata;
  qualifierList: (
    | IsolatedKeyword
    | PrivateKeyword
    | PublicKeyword
    | RemoteKeyword
  )[];
  relativeResourcePath: any;
}

export interface ObjectTypeDesc extends STNode {
  closeBrace: CloseBraceToken;
  members: (MethodDeclaration | ObjectField | TypeReference)[];
  objectKeyword: ObjectKeyword;
  objectTypeQualifiers: any;
  openBrace: OpenBraceToken;
}

export interface OnFailClause extends STNode {
  blockStatement: BlockStatement;
  failErrorName: IdentifierToken;
  failKeyword: FailKeyword;
  onKeyword: OnKeyword;
  typeDescriptor: ErrorTypeDesc | UnionTypeDesc;
}

export interface OnKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface OpenBracePipeToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface OpenBraceToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface OpenBracketToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface OpenParenToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface OptionalChainingToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface OptionalFieldAccess extends STNode {
  expression: SimpleNameReference | OptionalFieldAccess | MethodCall;
  fieldName: SimpleNameReference;
  optionalChainingToken: OptionalChainingToken;
}

export interface OptionalTypeDesc extends STNode {
  questionMarkToken: QuestionMarkToken;
  typeDescriptor:
  | ArrayTypeDesc
  | ErrorTypeDesc
  | IntTypeDesc
  | QualifiedNameReference
  | RecordTypeDesc
  | SimpleNameReference
  | StreamTypeDesc
  | StringTypeDesc;
}

export interface PanicKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface PanicStatement extends STNode {
  expression: FunctionCall | SimpleNameReference;
  panicKeyword: PanicKeyword;
  semicolonToken: SemicolonToken;
}

export interface ParameterName extends STNode {
  isToken: boolean;
  value: string;
}

export interface ParameterizedTypeDesc extends STNode {
  parameterizedType: FutureKeyword | MapKeyword;
  typeParameter: TypeParameter;
}

export interface ParenthesisedTypeDesc extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  typedesc: FunctionTypeDesc | StringTypeDesc | UnionTypeDesc;
}

export interface ParenthesizedArgList extends STNode {
  arguments: (CommaToken | NamedArg | PositionalArg)[];
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
}

export interface PercentToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface PerfData {
  concurrency: string;
  latency: string;
  tps: string;
  analyzeType: string;
}

export interface PipeToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface PlusToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface PositionalArg extends STNode {
  expression:
  | BinaryExpression
  | BooleanLiteral
  | CheckExpression
  | ExplicitAnonymousFunctionExpression
  | FieldAccess
  | FunctionCall
  | ImplicitAnonymousFunctionExpression
  | IndexedExpression
  | IntTypeDesc
  | JsonTypeDesc
  | MappingConstructor
  | MethodCall
  | NilLiteral
  | NumericLiteral
  | OptionalFieldAccess
  | QualifiedNameReference
  | SimpleNameReference
  | StringLiteral
  | StringTemplateExpression
  | TypeCastExpression
  | TypeTestExpression
  | UnaryExpression
  | XmlTemplateExpression
  | ListConstructor;
}

export interface PrivateKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface PublicKeyword extends STNode {
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
  source: string;
}

export interface QueryConstructType extends STNode {
  keyword: StreamKeyword;
  source: string;
}

export interface QueryExpression extends STNode {
  queryConstructType?: QueryConstructType;
  queryPipeline: QueryPipeline;
  selectClause: SelectClause;
  source: string;
}

export interface QueryPipeline extends STNode {
  fromClause: FromClause;
  intermediateClauses: (LetClause | LimitClause | WhereClause)[];
  source: string;
}

export interface QuestionMarkToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface RawTemplateExpression extends STNode {
  content: Interpolation | TemplateString[];
  endBacktick: BacktickToken;
  source: string;
  startBacktick: BacktickToken;
}

export interface ReadonlyKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ReadonlyTypeDesc extends STNode {
  name: ReadonlyKeyword;
}

export interface RecordField extends STNode {
  fieldName: IdentifierToken;
  questionMarkToken?: QuestionMarkToken;
  readonlyKeyword?: ReadonlyKeyword;
  semicolonToken: SemicolonToken;
  typeName:
  | ArrayTypeDesc
  | BooleanTypeDesc
  | ErrorTypeDesc
  | FloatTypeDesc
  | IntTypeDesc
  | NeverTypeDesc
  | OptionalTypeDesc
  | ParameterizedTypeDesc
  | QualifiedNameReference
  | RecordTypeDesc
  | SimpleNameReference
  | StringTypeDesc;
}

export interface RecordFieldWithDefaultValue extends STNode {
  equalsToken: EqualToken;
  expression: BooleanLiteral | NumericLiteral | StringLiteral;
  fieldName: IdentifierToken;
  semicolonToken: SemicolonToken;
  typeName: BooleanTypeDesc | FloatTypeDesc | IntTypeDesc | StringTypeDesc;
}

export interface RecordKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface RecordRestType extends STNode {
  ellipsisToken: EllipsisToken;
  semicolonToken: SemicolonToken;
  typeName: IntTypeDesc | StringTypeDesc;
}

export interface RecordTypeDesc extends STNode {
  bodyEndDelimiter: CloseBracePipeToken | CloseBraceToken;
  bodyStartDelimiter: OpenBracePipeToken | OpenBraceToken;
  fields: (RecordField | RecordFieldWithDefaultValue)[];
  recordKeyword: RecordKeyword;
  recordRestDescriptor?: RecordRestType;
}

export interface RemoteKeyword extends STNode {
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
  | ArrayTypeDesc
  | BooleanTypeDesc
  | ErrorTypeDesc
  | FunctionTypeDesc
  | IntTypeDesc
  | IntersectionTypeDesc
  | JsonTypeDesc
  | OptionalTypeDesc
  | ParameterizedTypeDesc
  | QualifiedNameReference
  | RecordTypeDesc
  | SimpleNameReference
  | StreamTypeDesc
  | StringTypeDesc
  | TupleTypeDesc
  | UnionTypeDesc
  | XmlTypeDesc;
}

export interface ResourceAccessorDefinition extends STNode {
  functionBody: FunctionBodyBlock;
  functionKeyword: FunctionKeyword;
  functionName: IdentifierToken;
  functionSignature: FunctionSignature;
  qualifierList: (ResourceKeyword | TransactionalKeyword)[];
  relativeResourcePath: (IdentifierToken | SlashToken)[];
  performance?: PerfData;
}

export interface ResourceKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface RestArg extends STNode {
  ellipsis: EllipsisToken;
  expression: SimpleNameReference;
}

export interface RestBindingPattern extends STNode {
  ellipsisToken: EllipsisToken;
  variableName: SimpleNameReference;
}

export interface RestMatchPattern extends STNode {
  ellipsisToken: EllipsisToken;
  varKeywordToken: VarKeyword;
  variableName: SimpleNameReference;
}

export interface RestParam extends STNode {
  annotations: any;
  ellipsisToken: EllipsisToken;
  paramName: IdentifierToken;
  typeName: AnyTypeDesc | StringTypeDesc | UnionTypeDesc;
}

export interface RetryKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ReturnKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ReturnStatement extends STNode {
  expression?:
  | BinaryExpression
  | BooleanLiteral
  | BracedExpression
  | CheckExpression
  | ErrorConstructor
  | ExplicitAnonymousFunctionExpression
  | ExplicitNewExpression
  | FieldAccess
  | FunctionCall
  | IndexedExpression
  | ListConstructor
  | MappingConstructor
  | MethodCall
  | NilLiteral
  | NumericLiteral
  | QualifiedNameReference
  | RemoteMethodCallAction
  | SimpleNameReference
  | StringLiteral
  | StringTemplateExpression
  | TypeCastExpression;
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
  | ErrorTypeDesc
  | FloatTypeDesc
  | HandleTypeDesc
  | IntTypeDesc
  | NeverTypeDesc
  | ObjectTypeDesc
  | JsonTypeDesc
  | OptionalTypeDesc
  | ParenthesisedTypeDesc
  | QualifiedNameReference
  | SimpleNameReference
  | StreamTypeDesc
  | StringTypeDesc
  | TableTypeDesc
  | TupleTypeDesc
  | UnionTypeDesc;
}

export interface ReturnsKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface RightArrowToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface RightDoubleArrowToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface RollbackKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface RollbackStatement extends STNode {
  arguments?: ParenthesizedArgList;
  retryBody?: BlockStatement;
  retryKeyword?: RetryKeyword;
  rollbackKeyword?: RollbackKeyword;
  semicolon?: SemicolonToken;
}

export interface SelectClause extends STNode {
  expression: BinaryExpression | MappingConstructor | RawTemplateExpression;
  selectKeyword: SelectKeyword;
  source: string;
}

export interface SelectKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface SemicolonToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface ServiceBody extends STNode {
  closeBraceToken: CloseBraceToken;
  openBraceToken: OpenBraceToken;
  resources: FunctionDefinition[];
}

export interface ServiceConstructorExpression extends STNode {
  annotations: Annotation[];
  serviceBody: ServiceBody;
  serviceKeyword: ServiceKeyword;
}

export interface ServiceDeclaration extends STNode {
  absoluteResourcePath: (IdentifierToken | SlashToken | StringLiteral)[];
  closeBraceToken: CloseBraceToken;
  expressions: (ExplicitNewExpression | SimpleNameReference)[];
  members: (ObjectMethodDefinition | ResourceAccessorDefinition)[];
  metadata?: Metadata;
  onKeyword: OnKeyword;
  openBraceToken: OpenBraceToken;
  qualifiers: any;
  serviceKeyword: ServiceKeyword;
  typeDescriptor?: QualifiedNameReference;
  serviceBody: ServiceBody;
  serviceName: IdentifierToken;
  isRunnable?: boolean;
  runArgs?: any[];
}

export interface ServiceKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ServiceTypeDesc extends STNode {
  name: ServiceKeyword;
  source: string;
}

export interface SimpleNameReference extends STNode {
  name: IdentifierToken;
}

export interface SlashLtToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface SlashToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface SpecificField extends STNode {
  colon?: ColonToken;
  fieldName: IdentifierToken | StringLiteral;
  valueExpr?:
  | BinaryExpression
  | BooleanLiteral
  | FieldAccess
  | IndexedExpression
  | FunctionCall
  | ListConstructor
  | MappingConstructor
  | NilLiteral
  | NullLiteral
  | MethodCall
  | NumericLiteral
  | ObjectConstructor
  | QualifiedNameReference
  | SimpleNameReference
  | StringLiteral
  | TypeCastExpression
  | UnaryExpression;
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
  isToken: boolean;
  value: string;
}

export interface StreamKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface StreamTypeDesc extends STNode {
  streamKeywordToken: StreamKeyword;
  streamTypeParamsNode: StreamTypeParams;
}

export interface StreamTypeParams extends STNode {
  commaToken: CommaToken;
  gtToken: GtToken;
  leftTypeDescNode:
  | ArrayTypeDesc
  | RecordTypeDesc
  | QualifiedNameReference
  | SimpleNameReference
  | StringTypeDesc;
  ltToken: LtToken;
  rightTypeDescNode: ErrorTypeDesc | OptionalTypeDesc | QualifiedNameReference;
}

export interface StringKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface StringLiteral extends STNode {
  literalToken: StringLiteralToken;
}

export interface StringLiteralToken extends STNode {
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

export interface TableConstructor extends STNode {
  closeBracket: CloseBracketToken;
  openBracket: OpenBracketToken;
  rows: (CommaToken | MappingConstructor)[];
  tableKeyword: TableKeyword;
}

export interface TableKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface TableTypeDesc extends STNode {
  keyConstraintNode: KeySpecifier | KeyTypeConstraint;
  rowTypeParameterNode: TypeParameter;
  tableKeywordToken: TableKeyword;
}

export interface TemplateString extends STNode {
  isToken: boolean;
  value: string;
}

export interface TransactionKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface TransactionStatement extends STNode {
  blockStatement: BlockStatement;
  onFailClause?: OnFailClause;
  transactionKeyword: TransactionKeyword;
}

export interface TransactionalKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface TrapExpression extends STNode {
  expression: FunctionCall;
  source: string;
  trapKeyword: TrapKeyword;
}

export interface TrapKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface TrippleEqualToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface TrippleGtToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface TrueKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface TupleTypeDesc extends STNode {
  closeBracketToken: CloseBracketToken;
  memberTypeDesc: (
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | CommaToken
    | FloatTypeDesc
    | IntTypeDesc
    | ParameterizedTypeDesc
    | QualifiedNameReference
    | StringTypeDesc
    | UnionTypeDesc
  )[];
  openBracketToken: OpenBracketToken;
}

export interface TypeCastExpression extends STNode {
  expression:
  | BracedExpression
  | CheckAction
  | CheckExpression
  | ErrorConstructor
  | FieldAccess
  | FunctionCall
  | IndexedExpression
  | MethodCall
  | SimpleNameReference
  | TypeCastExpression
  | RemoteMethodCallAction;
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
  | IntTypeDesc
  | JsonTypeDesc
  | ParameterizedTypeDesc
  | QualifiedNameReference
  | SimpleNameReference
  | StreamTypeDesc
  | StringTypeDesc
  | XmlTypeDesc;
}

export interface TypeDefinition extends STNode {
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  typeDescriptor:
  | ErrorTypeDesc
  | ObjectTypeDesc
  | ParameterizedTypeDesc
  | RecordTypeDesc
  | TableTypeDesc
  | UnionTypeDesc;
  typeKeyword: TypeKeyword;
  typeName: IdentifierToken;
  visibilityQualifier?: PublicKeyword;
}

export interface TypeDocReferenceToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface TypeKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface TypeParameter extends STNode {
  gtToken: GtToken;
  ltToken: LtToken;
  typeNode:
  | AnyTypeDesc
  | AnydataTypeDesc
  | IntTypeDesc
  | JsonTypeDesc
  | NeverTypeDesc
  | ParameterizedTypeDesc
  | QualifiedNameReference
  | RecordTypeDesc
  | SimpleNameReference
  | StringTypeDesc
  | UnionTypeDesc;
}

export interface TypeReference extends STNode {
  asteriskToken: AsteriskToken;
  semicolonToken: SemicolonToken;
  typeName: QualifiedNameReference | SimpleNameReference;
}

export interface TypeTestExpression extends STNode {
  expression: SimpleNameReference;
  isKeyword: IsKeyword;
  typeDescriptor:
  | ArrayTypeDesc
  | BooleanTypeDesc
  | ErrorTypeDesc
  | FloatTypeDesc
  | IntTypeDesc
  | JsonTypeDesc
  | NilTypeDesc
  | ParameterizedTypeDesc
  | QualifiedNameReference
  | RecordTypeDesc
  | SimpleNameReference
  | StreamTypeDesc
  | StringTypeDesc
  | TableTypeDesc
  | XmlTypeDesc;
}

export interface TypedBindingPattern extends STNode {
  bindingPattern:
  | CaptureBindingPattern
  | ListBindingPattern
  | MappingBindingPattern;
  typeDescriptor:
  | AnyTypeDesc
  | AnydataTypeDesc
  | ArrayTypeDesc
  | BooleanTypeDesc
  | ByteTypeDesc
  | ErrorTypeDesc
  | FloatTypeDesc
  | FunctionTypeDesc
  | IntTypeDesc
  | IntersectionTypeDesc
  | JsonTypeDesc
  | ObjectTypeDesc
  | OptionalTypeDesc
  | ParameterizedTypeDesc
  | QualifiedNameReference
  | RecordTypeDesc
  | ServiceTypeDesc
  | SimpleNameReference
  | StreamTypeDesc
  | StringTypeDesc
  | TableTypeDesc
  | TupleTypeDesc
  | UnionTypeDesc
  | VarTypeDesc
  | XmlTypeDesc;
}

export interface UnaryExpression extends STNode {
  expression:
  | BracedExpression
  | MethodCall
  | NumericLiteral
  | SimpleNameReference;
  unaryOperator: ExclamationMarkToken | MinusToken;
}

export interface UnionTypeDesc extends STNode {
  leftTypeDesc:
  | AnyTypeDesc
  | AnydataTypeDesc
  | ArrayTypeDesc
  | BooleanTypeDesc
  | FloatTypeDesc
  | IntTypeDesc
  | JsonTypeDesc
  | ParameterizedTypeDesc
  | QualifiedNameReference
  | RecordTypeDesc
  | SimpleNameReference
  | StreamTypeDesc
  | StringTypeDesc
  | TupleTypeDesc;
  pipeToken: PipeToken;
  rightTypeDesc:
  | ArrayTypeDesc
  | ErrorTypeDesc
  | IntTypeDesc
  | OptionalTypeDesc
  | ParenthesisedTypeDesc
  | QualifiedNameReference
  | SimpleNameReference
  | StringTypeDesc
  | UnionTypeDesc;
}

export interface VarKeyword extends STNode {
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
  waitFields: (CommaToken | SimpleNameReference | WaitField)[];
}

export interface WaitKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface WhereClause extends STNode {
  expression: BinaryExpression;
  source: string;
  whereKeyword: WhereKeyword;
}

export interface WhereKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface WhileKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface WhileStatement extends STNode {
  condition: BracedExpression | UnaryExpression;
  whileBody: BlockStatement;
  whileKeyword: WhileKeyword;
}

export interface WildcardBindingPattern extends STNode {
  underscoreToken: IdentifierToken;
}

export interface WorkerKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface XmlAttribute extends STNode {
  attributeName: XmlQualifiedName | XmlSimpleName;
  equalToken: EqualToken;
  source: string;
  value: XmlAttributeValue;
}

export interface XmlAttributeValue extends STNode {
  endQuote: DoubleQuoteToken;
  source: string;
  startQuote: DoubleQuoteToken;
  value: XmlTextContent[];
}

export interface XmlComment extends STNode {
  commentEnd: XmlCommentEndToken;
  commentStart: XmlCommentStartToken;
  content: XmlTextContent[];
  source: string;
}

export interface XmlCommentEndToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface XmlCommentStartToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface XmlElement extends STNode {
  content: (XmlElement | XmlText | XmlComment)[];
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
  attributes: any;
  getToken: GtToken;
  ltToken: LtToken;
  name: XmlQualifiedName | XmlSimpleName;
}

export interface XmlKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface XmlNamePatternChain extends STNode {
  gtToken: GtToken;
  startToken: SlashLtToken;
  xmlNamePattern: AsteriskToken[];
}

export interface XmlQualifiedName extends STNode {
  colon: ColonToken;
  name: XmlSimpleName;
  prefix: XmlSimpleName;
  source: string;
}

export interface XmlSimpleName extends STNode {
  name: IdentifierToken;
}

export interface XmlStepExpression extends STNode {
  expression: SimpleNameReference;
  xmlStepStart: XmlNamePatternChain;
}

export interface XmlTemplateExpression extends STNode {
  content: XmlElement[];
  endBacktick: BacktickToken;
  startBacktick: BacktickToken;
  type: XmlKeyword;
}

export interface XmlText extends STNode {
  content: XmlTextContent;
}

export interface XmlTextContent extends STNode {
  isToken: boolean;
  value: string;
}

export interface XmlTypeDesc extends STNode {
  xmlKeywordToken: XmlKeyword;
  xmlTypeParamsNode?: TypeParameter;
  keywordToken: XmlKeyword;
}

// tslint:enable:ban-types
