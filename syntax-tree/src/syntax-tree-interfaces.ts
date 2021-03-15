// This is an auto-generated file. Do not edit.
// Run 'BALLERINA_HOME="your/ballerina/home" npm run gen-models' to generate.
// tslint:disable:ban-types

export interface VisibleEndpoint {
  kind?: string;
  isCaller: boolean;
  moduleName: string;
  name: string;
  orgName: string;
  typeName: string;
  viewState?: any;
}

export interface NodePosition {
  startLine?: number;
  startColumn?: number;
  endLine?: number;
  endColumn?: number;
}

export interface STNode {
  kind: string;
  value?: any;
  parent?: STNode;
  viewState?: any;
  dataMapperViewState?: any;
  position?: any;
  typeData?: any;
  VisibleEndpoints?: VisibleEndpoint[];
  source: string;
}

export interface ActionStatement extends STNode {
  expression: CheckAction | RemoteMethodCallAction;
  semicolonToken: SemicolonToken;
  source: string;
}

export interface Annotation extends STNode {
  annotReference: QualifiedNameReference | SimpleNameReference;
  annotValue?: MappingConstructor;
  atToken: AtToken;
  source: string;
}

export interface AnyKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface AnyTypeDesc extends STNode {
  name: AnyKeyword;
  source: string;
}

export interface AnydataKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface AnydataTypeDesc extends STNode {
  name: AnydataKeyword;
  source: string;
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
  source: string;
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
  | TypeCastExpression
  | WaitAction;
  semicolonToken: SemicolonToken;
  source: string;
  varRef:
  | ErrorBindingPattern
  | FieldAccess
  | IndexedExpression
  | ListBindingPattern
  | SimpleNameReference;
}

export interface AsteriskLiteral extends STNode {
  literalToken: AsteriskToken;
  source: string;
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
  | TypeTestExpression;
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
  | SimpleNameReference
  | StringLiteral
  | StringTypeDesc
  | TypeCastExpression
  | TypeTestExpression;
  source: string;
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
  source: string;
  statements:
  (| ActionStatement
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
    | WhileStatement)[];
}

export interface BooleanKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface BooleanLiteral extends STNode {
  literalToken: FalseKeyword | TrueKeyword;
  source: string;
}

export interface BooleanTypeDesc extends STNode {
  name: BooleanKeyword;
  source: string;
}

export interface BracedExpression extends STNode {
  closeParen: CloseParenToken;
  expression:
  | BinaryExpression
  | BooleanLiteral
  | FunctionCall
  | MethodCall
  | SimpleNameReference
  | TypeCastExpression
  | TypeTestExpression
  | UnaryExpression
  | XmlStepExpression;
  openParen: OpenParenToken;
  source: string;
}

export interface BreakKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface BreakStatement extends STNode {
  breakToken: BreakKeyword;
  semicolonToken: SemicolonToken;
  source: string;
}

export interface ByteArrayLiteral extends STNode {
  content: TemplateString;
  endBacktick: BacktickToken;
  source: string;
  startBacktick: BacktickToken;
  type: Base16Keyword | Base64Keyword;
}

export interface ByteKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ByteTypeDesc extends STNode {
  name: ByteKeyword;
  source: string;
}

export interface CallStatement extends STNode {
  expression: CheckExpression | FunctionCall | MethodCall;
  semicolonToken: SemicolonToken;
  source: string;
}

export interface CaptureBindingPattern extends STNode {
  source: string;
  variableName: IdentifierToken;
}

export interface CheckAction extends STNode {
  checkKeyword: CheckKeyword | CheckpanicKeyword;
  expression: RemoteMethodCallAction;
  source: string;
}

export interface CheckExpression extends STNode {
  checkKeyword: CheckKeyword | CheckpanicKeyword;
  expression: FieldAccess | FunctionCall | ImplicitNewExpression | MethodCall;
  source: string;
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
  classTypeQualifiers: (IsolatedKeyword | ReadonlyKeyword)[];
  closeBrace: CloseBraceToken;
  members: (ObjectField | ObjectMethodDefinition | TypeReference)[];
  metadata?: Metadata;
  openBrace: OpenBraceToken;
  source: string;
  visibilityQualifier?: PublicKeyword;
}

export interface ClassKeyword extends STNode {
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
  source: string;
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
  rhsExpression: MethodCall | NumericLiteral | SimpleNameReference;
  semicolonToken: SemicolonToken;
  source: string;
}

export interface ComputedNameField extends STNode {
  closeBracket: CloseBracketToken;
  colonToken: ColonToken;
  fieldNameExpr: SimpleNameReference;
  openBracket: OpenBracketToken;
  source: string;
  valueExpr: StringLiteral;
}

export interface ConditionalExpression extends STNode {
  colonToken: ColonToken;
  endExpression: SimpleNameReference;
  lhsExpression: TypeTestExpression;
  middleExpression: StringLiteral;
  questionMarkToken: QuestionMarkToken;
  source: string;
}

export interface ConstDeclaration extends STNode {
  constKeyword: ConstKeyword;
  equalsToken: EqualToken;
  initializer: MappingConstructor | NumericLiteral | StringLiteral;
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  source: string;
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
  source: string;
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
  source: string;
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
  source: string;
}

export interface DocumentationDescription extends STNode {
  isToken: boolean;
  value: string;
}

export interface DocumentationReference extends STNode {
  backtickContent: BacktickContent | SimpleNameReference;
  endBacktick: BacktickToken;
  referenceType?: TypeDocReferenceToken;
  source: string;
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
  source: string;
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
  source: string;
}

export interface EnumKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface EnumMember extends STNode {
  constExprNode?: BinaryExpression | StringLiteral;
  equalToken?: EqualToken;
  identifier: IdentifierToken;
  source: string;
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
  argListBindingPatterns:
  (| CaptureBindingPattern
    | CommaToken
    | NamedArgBindingPattern
    | RestBindingPattern
    | WildcardBindingPattern)[];
  closeParenthesis: CloseParenToken;
  errorKeyword: ErrorKeyword;
  openParenthesis: OpenParenToken;
  source: string;
}

export interface ErrorKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ErrorTypeDesc extends STNode {
  errorKeywordToken?: ErrorKeyword;
  errorTypeParamsNode?: ErrorTypeParams;
  name?: ErrorKeyword;
  source: string;
}

export interface ErrorTypeParams extends STNode {
  gtToken: GtToken;
  ltToken: LtToken;
  parameter: SimpleNameReference;
  source: string;
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
  source: string;
}

export interface ExplicitNewExpression extends STNode {
  newKeyword: NewKeyword;
  parenthesizedArgList: ParenthesizedArgList;
  source: string;
  typeDescriptor: QualifiedNameReference | SimpleNameReference;
}

export interface ExpressionFunctionBody extends STNode {
  expression:
  | BinaryExpression
  | MappingConstructor
  | NumericLiteral
  | StringTemplateExpression;
  rightDoubleArrow: RightDoubleArrowToken;
  semicolon?: SemicolonToken;
  source: string;
}

export interface FailKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface FailStatement extends STNode {
  expression: SimpleNameReference;
  failKeyword: FailKeyword;
  semicolonToken: SemicolonToken;
  source: string;
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
  source: string;
}

export interface FieldBindingPattern extends STNode {
  bindingPattern: CaptureBindingPattern;
  colon: ColonToken;
  source: string;
  variableName: SimpleNameReference;
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
  source: string;
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
  source: string;
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
  source: string;
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
  closeBraceToken: CloseBraceToken;
  namedWorkerDeclarator?: NamedWorkerDeclarator;
  openBraceToken: OpenBraceToken;
  source: string;
  statements:
  (| ActionStatement
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
    | WhileStatement)[];
}

export interface FunctionCall extends STNode {
  arguments: (CommaToken | NamedArg | PositionalArg | RestArg)[];
  closeParenToken: CloseParenToken;
  functionName: ErrorTypeDesc | QualifiedNameReference | SimpleNameReference;
  openParenToken: OpenParenToken;
  source: string;
}

export interface FunctionDefinition extends STNode {
  functionBody: ExpressionFunctionBody | FunctionBodyBlock;
  functionKeyword: FunctionKeyword;
  functionName: IdentifierToken;
  functionSignature: FunctionSignature;
  metadata?: Metadata;
  qualifierList: (IsolatedKeyword | PublicKeyword | ResourceKeyword)[];
  source: string;
}

export interface FunctionKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface FunctionSignature extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  parameters: (CommaToken | DefaultableParam | RequiredParam | RestParam)[];
  returnTypeDesc?: ReturnTypeDescriptor;
  source: string;
}

export interface FunctionTypeDesc extends STNode {
  functionKeyword: FunctionKeyword;
  functionSignature: FunctionSignature;
  qualifierList: any;
  source: string;
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

export interface HashToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface IdentifierToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface IfElseStatement extends STNode {
  condition: BinaryExpression | BracedExpression | TypeTestExpression;
  elseBody?: ElseBlock;
  ifBody: BlockStatement;
  ifKeyword: IfKeyword;
  source: string;
}

export interface IfKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ImplicitAnonymousFunctionExpression extends STNode {
  expression: BinaryExpression;
  params: InferParamList;
  rightDoubleArrow: RightDoubleArrowToken;
  source: string;
}

export interface ImplicitNewExpression extends STNode {
  newKeyword: NewKeyword;
  parenthesizedArgList?: ParenthesizedArgList;
  source: string;
}

export interface ImportDeclaration extends STNode {
  importKeyword: ImportKeyword;
  moduleName: DotToken | IdentifierToken[];
  orgName: ImportOrgName;
  prefix?: ImportPrefix;
  semicolon: SemicolonToken;
  source: string;
}

export interface ImportKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ImportOrgName extends STNode {
  orgName: IdentifierToken;
  slashToken: SlashToken;
  source: string;
}

export interface ImportPrefix extends STNode {
  asKeyword: AsKeyword;
  prefix: IdentifierToken;
  source: string;
}

export interface InKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface IndexedExpression extends STNode {
  closeBracket: CloseBracketToken;
  containerExpression:
  | FieldAccess
  | IndexedExpression
  | MethodCall
  | SimpleNameReference;
  keyExpression:
  | FieldAccess
  | MethodCall
  | NumericLiteral
  | SimpleNameReference
  | StringLiteral[];
  openBracket: OpenBracketToken;
  source: string;
}

export interface InferParamList extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  parameters: SimpleNameReference[];
  source: string;
}

export interface IntKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface IntTypeDesc extends STNode {
  name: IntKeyword;
  source: string;
}

export interface Interpolation extends STNode {
  expression: FieldAccess | MethodCall | SimpleNameReference;
  interpolationEndToken: CloseBraceToken;
  interpolationStartToken: InterpolationStartToken;
  source: string;
}

export interface InterpolationStartToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface IntersectionTypeDesc extends STNode {
  bitwiseAndToken: BitwiseAndToken;
  leftTypeDesc: ArrayTypeDesc | ReadonlyTypeDesc | SimpleNameReference;
  rightTypeDesc: ArrayTypeDesc | ReadonlyTypeDesc;
  source: string;
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
  source: string;
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
  source: string;
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
  bindingPatterns:
  (| CaptureBindingPattern
    | CommaToken
    | WildcardBindingPattern)[];
  closeBracket: CloseBracketToken;
  openBracket: OpenBracketToken;
  source: string;
}

export interface ListConstructor extends STNode {
  closeBracket: CloseBracketToken;
  expressions:
  (| BooleanLiteral
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
    | UnaryExpression)[];
  openBracket: OpenBracketToken;
  source: string;
}

export interface ListenerDeclaration extends STNode {
  equalsToken: EqualToken;
  initializer: ExplicitNewExpression | ImplicitNewExpression;
  listenerKeyword: ListenerKeyword;
  semicolonToken: SemicolonToken;
  source: string;
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
  source: string;
  typedBindingPattern: TypedBindingPattern;
}

export interface LockKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface LockStatement extends STNode {
  blockStatement: BlockStatement;
  lockKeyword: LockKeyword;
  source: string;
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
  source: string;
}

export interface MappingConstructor extends STNode {
  closeBrace: CloseBraceToken;
  fields: (CommaToken | ComputedNameField | SpecificField | SpreadField)[];
  openBrace: OpenBraceToken;
  source: string;
}

export interface MarkdownDeprecationDocumentationLine extends STNode {
  documentElements: DeprecationLiteral[];
  hashToken: HashToken;
  source: string;
}

export interface MarkdownDocumentation extends STNode {
  documentationLines:
  (| MarkdownDeprecationDocumentationLine
    | MarkdownDocumentationLine
    | MarkdownParameterDocumentationLine
    | MarkdownReferenceDocumentationLine
    | MarkdownReturnParameterDocumentationLine)[];
  source: string;
}

export interface MarkdownDocumentationLine extends STNode {
  documentElements: DocumentationDescription[];
  hashToken: HashToken;
  source: string;
}

export interface MarkdownParameterDocumentationLine extends STNode {
  documentElements: (DocumentationDescription | DocumentationReference)[];
  hashToken: HashToken;
  minusToken: MinusToken;
  parameterName: ParameterName;
  plusToken: PlusToken;
  source: string;
}

export interface MarkdownReferenceDocumentationLine extends STNode {
  documentElements: (DocumentationDescription | DocumentationReference)[];
  hashToken: HashToken;
  source: string;
}

export interface MarkdownReturnParameterDocumentationLine extends STNode {
  documentElements: (DocumentationDescription | DocumentationReference)[];
  hashToken: HashToken;
  minusToken: MinusToken;
  parameterName: ReturnKeyword;
  plusToken: PlusToken;
  source: string;
}

export interface MatchClause extends STNode {
  blockStatement: BlockStatement;
  matchPatterns:
  (| NumericLiteral
    | PipeToken
    | SimpleNameReference
    | StringLiteral)[];
  rightDoubleArrow: RightDoubleArrowToken;
  source: string;
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
  source: string;
}

export interface Metadata extends STNode {
  annotations: Annotation[];
  documentationString?: MarkdownDocumentation;
  source: string;
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
  | SimpleNameReference
  | StringLiteral;
  methodName: SimpleNameReference;
  openParenToken: OpenParenToken;
  source: string;
}

export interface MethodDeclaration extends STNode {
  functionKeyword: FunctionKeyword;
  metadata?: Metadata;
  methodName: IdentifierToken;
  methodSignature: FunctionSignature;
  qualifierList: PublicKeyword[];
  semicolon: SemicolonToken;
  source: string;
}

export interface MinusToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface ModuleVarDecl extends STNode {
  equalsToken: EqualToken;
  finalKeyword?: FinalKeyword;
  initializer:
  | BinaryExpression
  | BooleanLiteral
  | ImplicitNewExpression
  | ListConstructor
  | MappingConstructor
  | NumericLiteral
  | ServiceConstructorExpression
  | StringLiteral;
  semicolonToken: SemicolonToken;
  source: string;
  typedBindingPattern: TypedBindingPattern;
}

export interface NamedArg extends STNode {
  argumentName: SimpleNameReference;
  equalsToken: EqualToken;
  expression:
  | BinaryExpression
  | BooleanLiteral
  | MappingConstructor
  | NumericLiteral
  | QualifiedNameReference
  | SimpleNameReference
  | StringLiteral
  | StringTypeDesc;
  source: string;
}

export interface NamedArgBindingPattern extends STNode {
  argName: IdentifierToken;
  bindingPattern: CaptureBindingPattern;
  equalsToken: EqualToken;
  source: string;
}

export interface NamedWorkerDeclaration extends STNode {
  annotations: Annotation[];
  returnTypeDesc?: ReturnTypeDescriptor;
  source: string;
  workerBody: BlockStatement;
  workerKeyword: WorkerKeyword;
  workerName: IdentifierToken;
}

export interface NamedWorkerDeclarator extends STNode {
  namedWorkerDeclarations: NamedWorkerDeclaration[];
  source: string;
  workerInitStatements: any;
}

export interface NeverKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface NeverTypeDesc extends STNode {
  name: NeverKeyword;
  source: string;
}

export interface NewKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface NilLiteral extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  source: string;
}

export interface NilTypeDesc extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  source: string;
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
  source: string;
}

export interface ObjectConstructor extends STNode {
  annotations: any;
  closeBraceToken: CloseBraceToken;
  members: (ObjectField | ObjectMethodDefinition)[];
  objectKeyword: ObjectKeyword;
  objectTypeQualifiers: any;
  openBraceToken: OpenBraceToken;
  source: string;
  typeReference?: SimpleNameReference;
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
  semicolonToken: SemicolonToken;
  source: string;
  typeName:
  | ArrayTypeDesc
  | FloatTypeDesc
  | IntTypeDesc
  | IntersectionTypeDesc
  | OptionalTypeDesc
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
  qualifierList: (IsolatedKeyword | PublicKeyword)[];
  source: string;
}

export interface ObjectTypeDesc extends STNode {
  closeBrace: CloseBraceToken;
  members: (MethodDeclaration | ObjectField | TypeReference)[];
  objectKeyword: ObjectKeyword;
  objectTypeQualifiers: any;
  openBrace: OpenBraceToken;
  source: string;
}

export interface OnFailClause extends STNode {
  blockStatement: BlockStatement;
  failErrorName: IdentifierToken;
  failKeyword: FailKeyword;
  onKeyword: OnKeyword;
  source: string;
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
  expression: MethodCall | OptionalFieldAccess | SimpleNameReference;
  fieldName: SimpleNameReference;
  optionalChainingToken: OptionalChainingToken;
  source: string;
}

export interface OptionalTypeDesc extends STNode {
  questionMarkToken: QuestionMarkToken;
  source: string;
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
  source: string;
}

export interface ParameterName extends STNode {
  isToken: boolean;
  value: string;
}

export interface ParameterizedTypeDesc extends STNode {
  parameterizedType: FutureKeyword | MapKeyword;
  source: string;
  typeParameter: TypeParameter;
}

export interface ParenthesisedTypeDesc extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  source: string;
  typedesc: FunctionTypeDesc | StringTypeDesc | UnionTypeDesc;
}

export interface ParenthesizedArgList extends STNode {
  arguments: (CommaToken | NamedArg | PositionalArg)[];
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  source: string;
}

export interface PercentToken extends STNode {
  isToken: boolean;
  value: string;
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
  | ListConstructor
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
  | XmlTemplateExpression;
  source: string;
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
  source: string;
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
  source: string;
}

export interface RecordField extends STNode {
  fieldName: IdentifierToken;
  questionMarkToken?: QuestionMarkToken;
  readonlyKeyword?: ReadonlyKeyword;
  semicolonToken: SemicolonToken;
  source: string;
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
  source: string;
  typeName: BooleanTypeDesc | FloatTypeDesc | IntTypeDesc | StringTypeDesc;
}

export interface RecordKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface RecordRestType extends STNode {
  ellipsisToken: EllipsisToken;
  semicolonToken: SemicolonToken;
  source: string;
  typeName: StringTypeDesc;
}

export interface RecordTypeDesc extends STNode {
  bodyEndDelimiter: CloseBracePipeToken | CloseBraceToken;
  bodyStartDelimiter: OpenBracePipeToken | OpenBraceToken;
  fields: (RecordField | RecordFieldWithDefaultValue)[];
  recordKeyword: RecordKeyword;
  recordRestDescriptor?: RecordRestType;
  source: string;
}

export interface RemoteMethodCallAction extends STNode {
  arguments: (CommaToken | NamedArg | PositionalArg)[];
  closeParenToken: CloseParenToken;
  expression: SimpleNameReference;
  methodName: SimpleNameReference;
  openParenToken: OpenParenToken;
  rightArrowToken: RightArrowToken;
  source: string;
}

export interface RequiredParam extends STNode {
  annotations: any;
  paramName?: IdentifierToken;
  source: string;
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

export interface ResourceKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface RestArg extends STNode {
  ellipsis: EllipsisToken;
  expression: SimpleNameReference;
  source: string;
}

export interface RestBindingPattern extends STNode {
  ellipsisToken: EllipsisToken;
  source: string;
  variableName: SimpleNameReference;
}

export interface RestParam extends STNode {
  annotations: any;
  ellipsisToken: EllipsisToken;
  paramName: IdentifierToken;
  source: string;
  typeName: ArrayTypeDesc | StringTypeDesc | UnionTypeDesc;
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
  | CheckExpression
  | ExplicitAnonymousFunctionExpression
  | ExplicitNewExpression
  | FieldAccess
  | FunctionCall
  | ListConstructor
  | MethodCall
  | NilLiteral
  | NumericLiteral
  | QualifiedNameReference
  | SimpleNameReference
  | StringLiteral
  | StringTemplateExpression
  | TypeCastExpression;
  returnKeyword: ReturnKeyword;
  semicolonToken: SemicolonToken;
  source: string;
}

export interface ReturnTypeDescriptor extends STNode {
  annotations: Annotation[];
  returnsKeyword: ReturnsKeyword;
  source: string;
  type:
  | AnyTypeDesc
  | ArrayTypeDesc
  | BooleanTypeDesc
  | ErrorTypeDesc
  | FloatTypeDesc
  | IntTypeDesc
  | NeverTypeDesc
  | ObjectTypeDesc
  | OptionalTypeDesc
  | ParenthesisedTypeDesc
  | QualifiedNameReference
  | SimpleNameReference
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
  source: string;
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
  source: string;
}

export interface ServiceConstructorExpression extends STNode {
  annotations: Annotation[];
  serviceBody: ServiceBody;
  serviceKeyword: ServiceKeyword;
  source: string;
}

export interface ServiceDeclaration extends STNode {
  expressions: (ExplicitNewExpression | SimpleNameReference)[];
  metadata?: Metadata;
  onKeyword: OnKeyword;
  serviceBody: ServiceBody;
  serviceKeyword: ServiceKeyword;
  serviceName: IdentifierToken;
  source: string;
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
  source: string;
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
  source: string;
  typeData?: any;
  valueExpr?:
  | BinaryExpression
  | BooleanLiteral
  | FieldAccess
  | IndexedExpression
  | ListConstructor
  | MappingConstructor
  | NilLiteral
  | NullLiteral
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
  source: string;
  valueExpr: SimpleNameReference;
}

export interface StartAction extends STNode {
  annotations: any;
  expression: FunctionCall;
  source: string;
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
  source: string;
  streamKeywordToken: StreamKeyword;
  streamTypeParamsNode: StreamTypeParams;
}

export interface StreamTypeParams extends STNode {
  commaToken?: CommaToken;
  gtToken: GtToken;
  leftTypeDescNode: RecordTypeDesc | SimpleNameReference | StringTypeDesc;
  ltToken: LtToken;
  rightTypeDescNode?: ErrorTypeDesc | QualifiedNameReference;
  source: string;
}

export interface StringKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface StringLiteral extends STNode {
  literalToken: StringLiteralToken;
  source: string;
}

export interface StringLiteralToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface StringTemplateExpression extends STNode {
  content: Interpolation | TemplateString[];
  endBacktick: BacktickToken;
  source: string;
  startBacktick: BacktickToken;
  type: StringKeyword;
}

export interface StringTypeDesc extends STNode {
  name: StringKeyword;
  source: string;
}

export interface ModulePart extends STNode {
  eofToken: EofToken;
  imports: ImportDeclaration[];
  members:
  (| ClassDefinition
    | ConstDeclaration
    | EnumDeclaration
    | FunctionDefinition
    | ListenerDeclaration
    | ModuleVarDecl
    | ServiceDeclaration
    | TypeDefinition)[];
  source: string;
}

export interface TableConstructor extends STNode {
  closeBracket: CloseBracketToken;
  openBracket: OpenBracketToken;
  rows: (CommaToken | MappingConstructor)[];
  source: string;
  tableKeyword: TableKeyword;
}

export interface TableKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface TableTypeDesc extends STNode {
  keyConstraintNode?: KeySpecifier | KeyTypeConstraint;
  rowTypeParameterNode: TypeParameter;
  source: string;
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
  source: string;
  transactionKeyword: TransactionKeyword;
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
  memberTypeDesc:
  (| ArrayTypeDesc
    | BooleanTypeDesc
    | CommaToken
    | FloatTypeDesc
    | IntTypeDesc
    | QualifiedNameReference
    | StringTypeDesc
    | UnionTypeDesc)[];
  openBracketToken: OpenBracketToken;
  source: string;
}

export interface TypeCastExpression extends STNode {
  expression:
  | BracedExpression
  | CheckAction
  | CheckExpression
  | FieldAccess
  | FunctionCall
  | IndexedExpression
  | MethodCall
  | SimpleNameReference
  | TypeCastExpression;
  gtToken: GtToken;
  ltToken: LtToken;
  source: string;
  typeCastParam: TypeCastParam;
}

export interface TypeCastParam extends STNode {
  annotations: Annotation[];
  source: string;
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
  source: string;
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
  source: string;
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
  source: string;
  typeName: QualifiedNameReference | SimpleNameReference;
}

export interface TypeTestExpression extends STNode {
  expression: SimpleNameReference;
  isKeyword: IsKeyword;
  source: string;
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
  | StringTypeDesc
  | TableTypeDesc
  | XmlTypeDesc;
}

export interface TypedBindingPattern extends STNode {
  bindingPattern:
  | CaptureBindingPattern
  | ListBindingPattern
  | MappingBindingPattern;
  source: string;
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
  source: string;
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
  | StringTypeDesc;
  pipeToken: PipeToken;
  rightTypeDesc:
  | ErrorTypeDesc
  | IntTypeDesc
  | OptionalTypeDesc
  | ParenthesisedTypeDesc
  | QualifiedNameReference
  | SimpleNameReference
  | StringTypeDesc
  | UnionTypeDesc;
  source: string;
}

export interface VarKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface VarTypeDesc extends STNode {
  name: VarKeyword;
  source: string;
}

export interface WaitAction extends STNode {
  source: string;
  waitFutureExpr: BinaryExpression | SimpleNameReference | WaitFieldsList;
  waitKeyword: WaitKeyword;
}

export interface WaitField extends STNode {
  colon: ColonToken;
  fieldName: SimpleNameReference;
  source: string;
  waitFutureExpr: SimpleNameReference;
}

export interface WaitFieldsList extends STNode {
  closeBrace: CloseBraceToken;
  openBrace: OpenBraceToken;
  source: string;
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
  condition: BracedExpression;
  source: string;
  whileBody: BlockStatement;
  whileKeyword: WhileKeyword;
}

export interface WildcardBindingPattern extends STNode {
  source: string;
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
  content: XmlComment | XmlElement | XmlText[];
  endTag: XmlElementEndTag;
  source: string;
  startTag: XmlElementStartTag;
}

export interface XmlElementEndTag extends STNode {
  getToken: GtToken;
  ltToken: LtToken;
  name: XmlQualifiedName | XmlSimpleName;
  slashToken: SlashToken;
  source: string;
}

export interface XmlElementStartTag extends STNode {
  attributes: XmlAttribute[];
  getToken: GtToken;
  ltToken: LtToken;
  name: XmlQualifiedName | XmlSimpleName;
  source: string;
}

export interface XmlKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface XmlNamePatternChain extends STNode {
  gtToken: GtToken;
  source: string;
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
  source: string;
}

export interface XmlStepExpression extends STNode {
  expression: SimpleNameReference;
  source: string;
  xmlStepStart: XmlNamePatternChain;
}

export interface XmlTemplateExpression extends STNode {
  content: XmlElement[];
  endBacktick: BacktickToken;
  source: string;
  startBacktick: BacktickToken;
  type: XmlKeyword;
}

export interface XmlText extends STNode {
  content: XmlTextContent;
  source: string;
}

export interface XmlTextContent extends STNode {
  isToken: boolean;
  value: string;
}

export interface XmlTypeDesc extends STNode {
  source: string;
  xmlKeywordToken: XmlKeyword;
  xmlTypeParamsNode?: TypeParameter;
}

// tslint:enable:ban-types
