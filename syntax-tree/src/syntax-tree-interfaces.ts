// This is an auto-generated file. Do not edit.
// Run 'BALLERINA_HOME="your/ballerina/home" npm run gen-models' to generate.
// tslint:disable:ban-types
export interface STNode {
  kind: string;
  value?: any;
  parent?: STNode;
  viewState?: any;
}

export interface ModulePart extends STNode {
  eofToken: EofToken;
  imports: STNode[];
  members: STNode[];
}

export interface AbstractKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ActionStatement extends STNode {
  expression:
    | AsyncSendAction
    | CheckAction
    | FailExpression
    | FlushAction
    | RemoteMethodCallAction
    | StartAction
    | SyncSendAction
    | WaitAction;
  semicolonToken: SemicolonToken;
}

export interface AnnotAccess extends STNode {
  annotChainingToken: AnnotChainingToken;
  annotTagReference: QualifiedNameReference | SimpleNameReference;
  expression: SimpleNameReference;
}

export interface AnnotChainingToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface Annotation extends STNode {
  annotReference:
    | IdentifierToken
    | QualifiedNameReference
    | SimpleNameReference;
  annotValue?: MappingConstructor;
  atToken: AtToken;
}

export interface AnnotationAttachPoint extends STNode {
  firstIdent:
    | AnnotationKeyword
    | ConstKeyword
    | ExternalKeyword
    | FieldKeyword
    | FunctionKeyword
    | ListenerKeyword
    | ObjectKeyword
    | ParameterKeyword
    | RecordKeyword
    | ResourceKeyword
    | ReturnKeyword
    | ServiceKeyword
    | TypeKeyword
    | VarKeyword
    | WorkerKeyword;
  secondIdent?: FieldKeyword | FunctionKeyword | TypeKeyword;
  sourceKeyword?: SourceKeyword;
}

export interface AnnotationDeclaration extends STNode {
  annotationKeyword: AnnotationKeyword;
  annotationTag: IdentifierToken;
  attachPoints: AnnotationAttachPoint | CommaToken[];
  constKeyword?: ConstKeyword;
  metadata?: Metadata;
  onKeyword?: OnKeyword;
  semicolonToken: SemicolonToken;
  typeDescriptor?:
    | ArrayTypeDesc
    | IntTypeDesc
    | ParameterizedTypeDesc
    | RecordTypeDesc
    | SimpleNameReference;
  visibilityQualifier?: PublicKeyword;
}

export interface AnnotationDocReferenceToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface AnnotationKeyword extends STNode {
  isToken: boolean;
  value: string;
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
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | JsonTypeDesc
    | NilTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | SimpleNameReference
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | XmlTypeDesc;
  openBracket: OpenBracketToken;
}

export interface AsKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface AscendingKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface AssignmentStatement extends STNode {
  equalsToken: EqualToken;
  expression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ByteArrayLiteral
    | CheckAction
    | CheckExpression
    | ConditionalExpression
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FailExpression
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
    | OptionalFieldAccess
    | QualifiedNameReference
    | RawTemplateExpression
    | ReceiveAction
    | RemoteMethodCallAction
    | ServiceConstructorExpression
    | SimpleNameReference
    | StartAction
    | StringLiteral
    | SyncSendAction
    | TableConstructor
    | TrapExpression
    | TypeCastExpression
    | TypeTestExpression
    | TypeofExpression
    | UnaryExpression
    | WaitAction
    | XmlTemplateExpression;
  semicolonToken: SemicolonToken;
  varRef:
    | FieldAccess
    | FunctionalBindingPattern
    | IndexedExpression
    | ListBindingPattern
    | MappingBindingPattern
    | QualifiedNameReference
    | SimpleNameReference;
}

export interface AsteriskLiteral extends STNode {
  literalToken: AsteriskToken;
}

export interface AsteriskToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface AsyncSendAction extends STNode {
  expression:
    | BinaryExpression
    | BracedExpression
    | IndexedExpression
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral;
  peerWorker: SimpleNameReference;
  rightArrowToken: RightArrowToken;
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
    | BooleanLiteral
    | BracedExpression
    | ByteArrayLiteral
    | CheckAction
    | CheckExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | OptionalFieldAccess
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression
    | TypeCastExpression
    | TypeReference
    | TypeTestExpression
    | UnaryExpression
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
    | ExplicitAnonymousFunctionExpression
    | FieldAccess
    | FlushAction
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | IndexedExpression
    | LetExpression
    | ListConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | QualifiedNameReference
    | RawTemplateExpression
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression
    | StringTypeDesc
    | TypeCastExpression
    | TypeTestExpression
    | UnaryExpression
    | XmlTemplateExpression;
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
  statements: (| ActionStatement
      | AssignmentStatement
      | BlockStatement
      | BreakStatement
      | CallStatement
      | CompoundAssignmentStatement
      | ContinueStatement
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
      | XmlNamespaceDeclaration)[];
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

export interface BracedAction extends STNode {
  closeParen: CloseParenToken;
  expression: WaitAction;
  openParen: OpenParenToken;
}

export interface BracedExpression extends STNode {
  closeParen: CloseParenToken;
  expression:
    | BinaryExpression
    | BooleanLiteral
    | BooleanTypeDesc
    | BracedExpression
    | ConditionalExpression
    | FieldAccess
    | FloatTypeDesc
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | IndexedExpression
    | LetExpression
    | MappingConstructor
    | MethodCall
    | NumericLiteral
    | QualifiedNameReference
    | QueryExpression
    | SimpleNameReference
    | StringLiteral
    | StringTypeDesc
    | TransactionalExpression
    | TypeCastExpression
    | TypeTestExpression
    | UnaryExpression
    | XmlFilterExpression
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

export interface ByKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ByteArrayLiteral extends STNode {
  content?: TemplateString;
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
  variableName: IdentifierToken | QualifiedNameReference | SimpleNameReference;
}

export interface CheckAction extends STNode {
  checkKeyword: CheckKeyword | CheckpanicKeyword;
  expression:
    | CommitAction
    | FlushAction
    | ReceiveAction
    | RemoteMethodCallAction
    | TrapAction;
}

export interface CheckExpression extends STNode {
  checkKeyword: CheckKeyword | CheckpanicKeyword;
  expression:
    | FieldAccess
    | FunctionCall
    | ImplicitNewExpression
    | LetExpression
    | MethodCall
    | OptionalFieldAccess
    | SimpleNameReference
    | TrapExpression
    | TypeCastExpression;
}

export interface CheckKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface CheckpanicKeyword extends STNode {
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
  lhsExpression: FieldAccess | IndexedExpression | SimpleNameReference;
  rhsExpression:
    | BinaryExpression
    | BracedExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | LetExpression
    | MethodCall
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | TypeCastExpression
    | WaitAction;
  semicolonToken: SemicolonToken;
}

export interface ComputedNameField extends STNode {
  closeBracket: CloseBracketToken;
  colonToken: ColonToken;
  fieldNameExpr:
    | BinaryExpression
    | BracedExpression
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference
    | StringTemplateExpression;
  openBracket: OpenBracketToken;
  valueExpr:
    | BooleanLiteral
    | FieldAccess
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
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
    | FunctionCall
    | IndexedExpression
    | MappingConstructor
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | TypeCastExpression
    | UnaryExpression
    | XmlTemplateExpression;
  lhsExpression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | MappingConstructor
    | SimpleNameReference
    | TypeCastExpression
    | TypeTestExpression;
  middleExpression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ConditionalExpression
    | FunctionCall
    | IndexedExpression
    | MappingConstructor
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | TypeCastExpression
    | UnaryExpression;
  questionMarkToken: QuestionMarkToken;
}

export interface ConflictKeyword extends STNode {
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
    | MappingConstructor
    | NilLiteral
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | UnaryExpression;
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  typeDescriptor?:
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | FloatTypeDesc
    | IntTypeDesc
    | JsonTypeDesc
    | NilTypeDesc
    | ParameterizedTypeDesc
    | SimpleNameReference
    | StringTypeDesc;
  variableName: IdentifierToken;
  visibilityQualifier?: PublicKeyword;
}

export interface ConstDocReferenceToken extends STNode {
  isToken: boolean;
  value: string;
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
}

export interface DefaultKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface DefaultableParam extends STNode {
  annotations: Annotation[];
  equalsToken: EqualToken;
  expression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FloatTypeDesc
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | IntTypeDesc
    | MappingConstructor
    | NilLiteral
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | StringTypeDesc
    | UnaryExpression
    | XmlTemplateExpression;
  paramName?: IdentifierToken;
  typeName:
    | AnyTypeDesc
    | BooleanTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | IntTypeDesc
    | JsonTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | QualifiedNameReference
    | SimpleNameReference
    | StringTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc;
  visibilityQualifier?: PublicKeyword;
}

export interface DeprecationLiteral extends STNode {
  isToken: boolean;
  value: string;
}

export interface DescendingKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface DistinctKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface DistinctTypeDesc extends STNode {
  distinctKeyword: DistinctKeyword;
  typeDescriptor:
    | ErrorTypeDesc
    | IntTypeDesc
    | QualifiedNameReference
    | SimpleNameReference
    | TypedescTypeDesc
    | UnionTypeDesc;
}

export interface DoKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface DocumentationDescription extends STNode {
  isToken: boolean;
  value: string;
}

export interface DocumentationReference extends STNode {
  backtickContent:
    | BacktickContent
    | FunctionCall
    | MethodCall
    | QualifiedNameReference
    | SimpleNameReference;
  endBacktick: BacktickToken;
  referenceType?:
    | AnnotationDocReferenceToken
    | ConstDocReferenceToken
    | FunctionDocReferenceToken
    | ParameterDocReferenceToken
    | ServiceDocReferenceToken
    | TypeDocReferenceToken
    | VarDocReferenceToken
    | VariableDocReferenceToken;
  startBacktick: BacktickToken;
}

export interface DotLtToken extends STNode {
  isToken: boolean;
  value: string;
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

export interface DoubleSlashDoubleAsteriskLtToken extends STNode {
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
  enumMemberList: CommaToken | EnumMember[];
  identifier: IdentifierToken;
  openBraceToken: OpenBraceToken;
  qualifier?: PublicKeyword;
}

export interface EnumKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface EnumMember extends STNode {
  constExprNode?:
    | BinaryExpression
    | BooleanLiteral
    | FunctionCall
    | NumericLiteral
    | StringLiteral;
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

export interface EqualsKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ErrorKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ErrorTypeDesc extends STNode {
  errorKeywordToken?: ErrorKeyword;
  errorTypeParamsNode?: ErrorTypeParams;
  name?: ErrorKeyword;
}

export interface ErrorTypeParams extends STNode {
  gtToken: GtToken;
  ltToken: LtToken;
  parameter:
    | AsteriskToken
    | BooleanTypeDesc
    | ParameterizedTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | StringTypeDesc;
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
}

export interface ExplicitNewExpression extends STNode {
  newKeyword: NewKeyword;
  parenthesizedArgList: ParenthesizedArgList;
  typeDescriptor: QualifiedNameReference | SimpleNameReference | StreamTypeDesc;
}

export interface ExpressionFunctionBody extends STNode {
  expression:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | CheckExpression
    | ExplicitAnonymousFunctionExpression
    | FieldAccess
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | IntTypeDesc
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | NilLiteral
    | NumericLiteral
    | ServiceConstructorExpression
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression
    | XmlTemplateExpression;
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

export interface FailExpression extends STNode {
  expression: FunctionCall | SimpleNameReference | TypeCastExpression;
  failKeyword: FailKeyword;
}

export interface FailKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface FalseKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface FieldAccess extends STNode {
  dotToken: DotToken;
  expression:
    | BracedExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | OptionalFieldAccess
    | SimpleNameReference
    | XmlStepExpression;
  fieldName: QualifiedNameReference | SimpleNameReference;
}

export interface FieldBindingPattern extends STNode {
  bindingPattern?:
    | CaptureBindingPattern
    | FunctionalBindingPattern
    | ListBindingPattern
    | MappingBindingPattern
    | WildcardBindingPattern;
  colon?: ColonToken;
  variableName: SimpleNameReference;
}

export interface FieldKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface FieldMatchPattern extends STNode {
  colonToken: ColonToken;
  fieldNameNode: IdentifierToken;
  matchPattern:
    | BooleanLiteral
    | ListMatchPattern
    | NumericLiteral
    | StringLiteral;
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

export interface FlushAction extends STNode {
  flushKeyword: FlushKeyword;
  peerWorker?: SimpleNameReference;
}

export interface FlushKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ForeachKeyword extends STNode {
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
    | WaitAction
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
  expression:
    | BracedExpression
    | FunctionCall
    | MethodCall
    | NumericLiteral
    | SimpleNameReference
    | TypeCastExpression
    | XmlStepExpression;
  fromKeyword: FromKeyword;
  inKeyword: InKeyword;
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
  statements: (| ActionStatement
      | AssignmentStatement
      | BlockStatement
      | BreakStatement
      | CallStatement
      | CompoundAssignmentStatement
      | ContinueStatement
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
      | XmlNamespaceDeclaration)[];
}

export interface FunctionCall extends STNode {
  arguments: CommaToken | NamedArg | PositionalArg | RestArg[];
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
  qualifierList: PublicKeyword | ResourceKeyword | TransactionalKeyword[];
}

export interface FunctionDocReferenceToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface FunctionKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface FunctionSignature extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  parameters: CommaToken | DefaultableParam | RequiredParam | RestParam[];
  returnTypeDesc?: ReturnTypeDescriptor;
}

export interface FunctionTypeDesc extends STNode {
  functionKeyword: FunctionKeyword;
  functionSignature: FunctionSignature;
}

export interface FunctionalBindingPattern extends STNode {
  argListBindingPatterns:
    | CaptureBindingPattern
    | CommaToken
    | MappingBindingPattern
    | NamedArgBindingPattern
    | RestBindingPattern
    | WildcardBindingPattern[];
  closeParenthesis: CloseParenToken;
  openParenthesis: OpenParenToken;
  typeReference: ErrorKeyword | ErrorTypeDesc | SimpleNameReference;
}

export interface FunctionalMatchPattern extends STNode {
  argListMatchPatternNode:
    | CommaToken
    | IdentifierToken
    | NamedArgMatchPattern
    | RestMatchPattern
    | StringLiteral
    | TypedBindingPattern[];
  closeParenthesisToken: CloseParenToken;
  openParenthesisToken: OpenParenToken;
  typeRef: ErrorKeyword | SimpleNameReference;
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

export interface HexFloatingPointLiteralToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface HexIntegerLiteralToken extends STNode {
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
    | BooleanLiteral
    | BracedExpression
    | FunctionCall
    | ListConstructor
    | NilLiteral
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | TransactionalExpression
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
  expression:
    | BinaryExpression
    | BooleanLiteral
    | ExplicitAnonymousFunctionExpression
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | IndexedExpression
    | ListConstructor
    | MethodCall
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | StringTemplateExpression
    | UnaryExpression;
  params: InferParamList | SimpleNameReference;
  rightDoubleArrow: RightDoubleArrowToken;
}

export interface ImplicitNewExpression extends STNode {
  newKeyword: NewKeyword;
  parenthesizedArgList?: ParenthesizedArgList;
}

export interface ImportDeclaration extends STNode {
  importKeyword: ImportKeyword;
  moduleName: DotToken | IdentifierToken[];
  orgName?: ImportOrgName;
  prefix?: ImportPrefix;
  semicolon: SemicolonToken;
  version?: ImportVersion;
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

export interface ImportVersion extends STNode {
  versionKeyword: VersionKeyword;
  versionNumber: DecimalIntegerLiteralToken | DotToken[];
}

export interface InKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface IndexedExpression extends STNode {
  closeBracket: CloseBracketToken;
  containerExpression:
    | BooleanTypeDesc
    | BracedExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | IntTypeDesc
    | MethodCall
    | OptionalFieldAccess
    | QualifiedNameReference
    | SimpleNameReference
    | StringTypeDesc
    | XmlFilterExpression
    | XmlStepExpression;
  keyExpression:
    | BinaryExpression
    | BooleanLiteral
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
  openBracket: OpenBracketToken;
}

export interface InferParamList extends STNode {
  closeParenToken: CloseParenToken;
  openParenToken: OpenParenToken;
  parameters: CommaToken | SimpleNameReference[];
}

export interface IntKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface IntTypeDesc extends STNode {
  name: IntKeyword;
}

export interface Interpolation extends STNode {
  expression:
    | BinaryExpression
    | ConditionalExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | NumericLiteral
    | SimpleNameReference
    | StartAction
    | StringLiteral
    | TypeCastExpression;
  interpolationEndToken: CloseBraceToken;
  interpolationStartToken: InterpolationStartToken;
}

export interface InterpolationStartToken extends STNode {
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
    | JsonTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | TableTypeDesc
    | TupleTypeDesc
    | XmlTypeDesc;
  rightTypeDesc:
    | ArrayTypeDesc
    | IntTypeDesc
    | JsonTypeDesc
    | ObjectTypeDesc
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | XmlTypeDesc;
}

export interface InvalidExpressionStatement extends STNode {
  expression:
    | BinaryExpression
    | BracedExpression
    | ExplicitAnonymousFunctionExpression
    | FieldAccess
    | ImplicitAnonymousFunctionExpression
    | ListConstructor
    | MappingConstructor
    | NilLiteral
    | XmlTemplateExpression;
  semicolonToken: SemicolonToken;
}

export interface IsKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface JoinClause extends STNode {
  expression: BracedExpression | MethodCall | SimpleNameReference;
  inKeyword: InKeyword;
  joinKeyword: JoinKeyword;
  onCondition: OnClause;
  outerKeyword?: OuterKeyword;
  typedBindingPattern: TypedBindingPattern;
}

export interface JoinKeyword extends STNode {
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
  fieldNames: CommaToken | IdentifierToken[];
  keyKeyword: KeyKeyword;
  openParenToken: OpenParenToken;
}

export interface KeyTypeConstraint extends STNode {
  keyKeywordToken: KeyKeyword;
  typeParameterNode: TypeParameter;
}

export interface LeftArrowToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface LetClause extends STNode {
  letKeyword: LetKeyword;
  letVarDeclarations: CommaToken | LetVarDecl[];
}

export interface LetExpression extends STNode {
  expression:
    | BinaryExpression
    | FieldAccess
    | FunctionCall
    | LetExpression
    | MethodCall
    | SimpleNameReference;
  inKeyword: InKeyword;
  letKeyword: LetKeyword;
  letVarDeclarations: CommaToken | LetVarDecl[];
}

export interface LetKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface LetVarDecl extends STNode {
  annotations: Annotation[];
  equalsToken: EqualToken;
  expression:
    | BinaryExpression
    | BracedExpression
    | FunctionCall
    | IndexedExpression
    | ListConstructor
    | MappingConstructor
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | TypeCastExpression;
  typedBindingPattern: TypedBindingPattern;
}

export interface LimitClause extends STNode {
  expression: FunctionCall | NumericLiteral | UnaryExpression;
  limitKeyword: LimitKeyword;
}

export interface LimitKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ListBindingPattern extends STNode {
  bindingPatterns:
    | CaptureBindingPattern
    | CommaToken
    | FunctionalBindingPattern
    | ListBindingPattern
    | MappingBindingPattern
    | NumericLiteral
    | WildcardBindingPattern[];
  closeBracket: CloseBracketToken;
  openBracket: OpenBracketToken;
  restBindingPattern?: RestBindingPattern;
}

export interface ListConstructor extends STNode {
  closeBracket: CloseBracketToken;
  expressions:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | CheckExpression
    | CommaToken
    | ConditionalExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | ImplicitNewExpression
    | IndexedExpression
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | StringTypeDesc
    | TypeCastExpression
    | TypeTestExpression
    | TypeofExpression
    | UnaryExpression
    | XmlStepExpression
    | XmlTemplateExpression[];
  openBracket: OpenBracketToken;
}

export interface ListMatchPattern extends STNode {
  closeBracket: CloseBracketToken;
  matchPatterns:
    | BooleanLiteral
    | CommaToken
    | MappingMatchPattern
    | NumericLiteral
    | StringLiteral[];
  openBracket: OpenBracketToken;
}

export interface ListenerDeclaration extends STNode {
  equalsToken: EqualToken;
  initializer:
    | ExplicitNewExpression
    | ImplicitNewExpression
    | NumericLiteral
    | SimpleNameReference;
  listenerKeyword: ListenerKeyword;
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  typeDescriptor?:
    | FunctionTypeDesc
    | ObjectTypeDesc
    | QualifiedNameReference
    | SimpleNameReference;
  variableName: IdentifierToken;
  visibilityQualifier?: PublicKeyword;
}

export interface ListenerKeyword extends STNode {
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
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FailExpression
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
    | OptionalFieldAccess
    | QualifiedNameReference
    | QueryAction
    | QueryExpression
    | RawTemplateExpression
    | ReceiveAction
    | RemoteMethodCallAction
    | ServiceConstructorExpression
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
    | XmlTemplateExpression
    | XmlTypeDesc;
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
  fieldBindingPatterns: CommaToken | FieldBindingPattern[];
  openBrace: OpenBraceToken;
  restBindingPattern?: RestBindingPattern;
}

export interface MappingConstructor extends STNode {
  closeBrace: CloseBraceToken;
  fields: CommaToken | ComputedNameField | SpecificField | SpreadField[];
  openBrace: OpenBraceToken;
}

export interface MappingMatchPattern extends STNode {
  closeBraceToken: CloseBraceToken;
  fieldMatchPatterns: CommaToken | FieldMatchPattern[];
  openBraceToken: OpenBraceToken;
}

export interface MarkdownDeprecationDocumentationLine extends STNode {
  documentElements: DeprecationLiteral | DocumentationDescription[];
  hashToken: HashToken;
}

export interface MarkdownDocumentation extends STNode {
  documentationLines:
    | MarkdownDeprecationDocumentationLine
    | MarkdownDocumentationLine
    | MarkdownParameterDocumentationLine
    | MarkdownReferenceDocumentationLine
    | MarkdownReturnParameterDocumentationLine[];
}

export interface MarkdownDocumentationLine extends STNode {
  documentElements: DocumentationDescription[];
  hashToken: HashToken;
}

export interface MarkdownParameterDocumentationLine extends STNode {
  documentElements: DocumentationDescription | DocumentationReference[];
  hashToken: HashToken;
  minusToken: MinusToken;
  parameterName: ParameterName;
  plusToken: PlusToken;
}

export interface MarkdownReferenceDocumentationLine extends STNode {
  documentElements: DocumentationDescription | DocumentationReference[];
  hashToken: HashToken;
}

export interface MarkdownReturnParameterDocumentationLine extends STNode {
  documentElements: DocumentationDescription | DocumentationReference[];
  hashToken: HashToken;
  minusToken: MinusToken;
  parameterName: ReturnKeyword;
  plusToken: PlusToken;
}

export interface MatchClause extends STNode {
  blockStatement: BlockStatement;
  matchGuard?: MatchGuard;
  matchPatterns:
    | BooleanLiteral
    | FunctionalMatchPattern
    | ListMatchPattern
    | MappingMatchPattern
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | PipeToken
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | TypedBindingPattern[];
  rightDoubleArrow: RightDoubleArrowToken;
}

export interface MatchGuard extends STNode {
  expression:
    | BinaryExpression
    | BracedExpression
    | MappingConstructor
    | SimpleNameReference
    | TypeTestExpression;
  ifKeyword: IfKeyword;
}

export interface MatchKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface MatchStatement extends STNode {
  closeBrace: CloseBraceToken;
  condition: BracedExpression | LetExpression | SimpleNameReference;
  matchClauses: MatchClause[];
  matchKeyword: MatchKeyword;
  openBrace: OpenBraceToken;
}

export interface Metadata extends STNode {
  annotations: Annotation[];
  documentationString?: MarkdownDocumentation;
}

export interface MethodCall extends STNode {
  arguments: CommaToken | NamedArg | PositionalArg | RestArg[];
  closeParenToken: CloseParenToken;
  dotToken: DotToken;
  expression:
    | BracedExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | IntTypeDesc
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
}

export interface MethodDeclaration extends STNode {
  functionKeyword: FunctionKeyword;
  metadata?: Metadata;
  methodName: IdentifierToken;
  methodSignature: FunctionSignature;
  qualifierList: PrivateKeyword | PublicKeyword | RemoteKeyword[];
  semicolon: SemicolonToken;
}

export interface MinusToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface ModuleVarDecl extends STNode {
  equalsToken?: EqualToken;
  finalKeyword?: FinalKeyword;
  initializer?:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ByteArrayLiteral
    | CheckExpression
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
    | QualifiedNameReference
    | RemoteMethodCallAction
    | ServiceConstructorExpression
    | SimpleNameReference
    | StartAction
    | StringLiteral
    | TableConstructor
    | TypeCastExpression
    | TypeofExpression
    | UnaryExpression
    | XmlTemplateExpression;
  metadata?: Metadata;
  semicolonToken: SemicolonToken;
  typedBindingPattern: TypedBindingPattern;
}

export interface ModuleXmlNamespaceDeclaration extends STNode {
  asKeyword?: AsKeyword;
  namespacePrefix?: IdentifierToken;
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
    | ExplicitNewExpression
    | FieldAccess
    | FloatTypeDesc
    | FunctionCall
    | ImplicitNewExpression
    | IndexedExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NumericLiteral
    | QualifiedNameReference
    | RemoteMethodCallAction
    | SimpleNameReference
    | StringLiteral
    | StringTypeDesc
    | TypeCastExpression;
}

export interface NamedArgBindingPattern extends STNode {
  argName: SimpleNameReference;
  bindingPattern:
    | CaptureBindingPattern
    | FunctionalBindingPattern
    | WildcardBindingPattern;
  equalsToken: EqualToken;
}

export interface NamedArgMatchPattern extends STNode {
  equalToken: EqualToken;
  identifier: IdentifierToken;
  matchPattern: SimpleNameReference;
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
  workerInitStatements:
    | ActionStatement
    | AssignmentStatement
    | CallStatement
    | ForkStatement
    | IfElseStatement
    | LocalVarDecl[];
}

export interface NegationToken extends STNode {
  isToken: boolean;
  value: string;
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
}

export interface NumericLiteral extends STNode {
  literalToken:
    | DecimalFloatingPointLiteralToken
    | DecimalIntegerLiteralToken
    | HexFloatingPointLiteralToken
    | HexIntegerLiteralToken;
}

export interface ObjectField extends STNode {
  equalsToken?: EqualToken;
  expression?:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ByteArrayLiteral
    | ExplicitNewExpression
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | RemoteMethodCallAction
    | SimpleNameReference
    | StringLiteral
    | UnaryExpression
    | XmlTemplateExpression;
  fieldName: IdentifierToken;
  metadata?: Metadata;
  readonlyKeyword?: ReadonlyKeyword;
  semicolonToken: SemicolonToken;
  typeName:
    | AnyTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | SimpleNameReference
    | StringTypeDesc
    | TupleTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
  visibilityQualifier?: PrivateKeyword | PublicKeyword;
}

export interface ObjectKeyword extends STNode {
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
  qualifierList:
    | PrivateKeyword
    | PublicKeyword
    | RemoteKeyword
    | TransactionalKeyword[];
}

export interface ObjectTypeDesc extends STNode {
  closeBrace: CloseBraceToken;
  members:
    | MethodDeclaration
    | ObjectField
    | ObjectMethodDefinition
    | TypeReference[];
  objectKeyword: ObjectKeyword;
  objectTypeQualifiers: AbstractKeyword | ClientKeyword | ReadonlyKeyword[];
  openBrace: OpenBraceToken;
}

export interface OnClause extends STNode {
  equalsKeyword: EqualsKeyword;
  lhsExpression: FieldAccess | FunctionCall | SimpleNameReference;
  onKeyword: OnKeyword;
  rhsExpression: FieldAccess | FunctionCall | SimpleNameReference;
}

export interface OnConflictClause extends STNode {
  conflictKeyword: ConflictKeyword;
  expression: FunctionCall | SimpleNameReference;
  onKeyword: OnKeyword;
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
  expression:
    | AnnotAccess
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | OptionalFieldAccess
    | SimpleNameReference;
  fieldName: QualifiedNameReference | SimpleNameReference;
  optionalChainingToken: OptionalChainingToken;
}

export interface OptionalTypeDesc extends STNode {
  questionMarkToken: QuestionMarkToken;
  typeDescriptor:
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | ByteTypeDesc
    | DecimalTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | JsonTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | XmlTypeDesc;
}

export interface OrderByClause extends STNode {
  byKeyword: ByKeyword;
  orderKey: CommaToken | OrderKey[];
  orderKeyword: OrderKeyword;
}

export interface OrderKey extends STNode {
  expression:
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | SimpleNameReference;
  orderDirection?: AscendingKeyword | DescendingKeyword;
}

export interface OrderKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface OuterKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface PanicKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface PanicStatement extends STNode {
  expression:
    | FieldAccess
    | FunctionCall
    | SimpleNameReference
    | TypeCastExpression;
  panicKeyword: PanicKeyword;
  semicolonToken: SemicolonToken;
}

export interface ParameterDocReferenceToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface ParameterKeyword extends STNode {
  isToken: boolean;
  value: string;
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
    | NeverTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ServiceTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StringLiteral
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
    | AnnotAccess
    | AnyTypeDesc
    | AnydataTypeDesc
    | BinaryExpression
    | BooleanLiteral
    | BooleanTypeDesc
    | BracedExpression
    | CheckExpression
    | ConditionalExpression
    | DecimalTypeDesc
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
    | OptionalFieldAccess
    | QualifiedNameReference
    | ReceiveAction
    | RemoteMethodCallAction
    | SimpleNameReference
    | StartAction
    | StringLiteral
    | StringTemplateExpression
    | StringTypeDesc
    | TrapAction
    | TrapExpression
    | TypeCastExpression
    | TypeTestExpression
    | TypeofExpression
    | UnaryExpression
    | XmlFilterExpression
    | XmlStepExpression
    | XmlTemplateExpression
    | XmlTypeDesc;
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
  limitClause?: LimitClause;
  queryPipeline: QueryPipeline;
}

export interface QueryConstructType extends STNode {
  keySpecifier?: KeySpecifier;
  keyword: StreamKeyword | TableKeyword;
}

export interface QueryExpression extends STNode {
  limitClause?: LimitClause;
  onConflictClause?: OnConflictClause;
  queryConstructType?: QueryConstructType;
  queryPipeline: QueryPipeline;
  selectClause: SelectClause;
}

export interface QueryPipeline extends STNode {
  fromClause: FromClause;
  intermediateClauses:
    | FromClause
    | JoinClause
    | LetClause
    | OrderByClause
    | WhereClause[];
}

export interface QuestionMarkToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface RawTemplateExpression extends STNode {
  content: Interpolation | TemplateString[];
  endBacktick: BacktickToken;
  startBacktick: BacktickToken;
}

export interface ReadonlyKeyword extends STNode {
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
    | IntersectionTypeDesc
    | JsonTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | ServiceTypeDesc
    | SimpleNameReference
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
    | FunctionCall
    | ImplicitAnonymousFunctionExpression
    | ImplicitNewExpression
    | LetExpression
    | ListConstructor
    | MappingConstructor
    | NilLiteral
    | NullLiteral
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | UnaryExpression;
  fieldName: IdentifierToken;
  readonlyKeyword?: ReadonlyKeyword;
  semicolonToken: SemicolonToken;
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
    | JsonTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | SimpleNameReference
    | StringTypeDesc
    | UnionTypeDesc;
}

export interface RecordKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface RecordRestType extends STNode {
  ellipsisToken: EllipsisToken;
  semicolonToken: SemicolonToken;
  typeName:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | DecimalTypeDesc
    | ErrorTypeDesc
    | FloatTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | StringTypeDesc
    | TupleTypeDesc
    | UnionTypeDesc;
}

export interface RecordTypeDesc extends STNode {
  bodyEndDelimiter: CloseBracePipeToken | CloseBraceToken;
  bodyStartDelimiter: OpenBracePipeToken | OpenBraceToken;
  fields: RecordField | RecordFieldWithDefaultValue | TypeReference[];
  recordKeyword: RecordKeyword;
  recordRestDescriptor?: RecordRestType;
}

export interface RemoteKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface RemoteMethodCallAction extends STNode {
  arguments: CommaToken | NamedArg | PositionalArg | RestArg[];
  closeParenToken: CloseParenToken;
  expression:
    | CheckExpression
    | FieldAccess
    | NumericLiteral
    | SimpleNameReference;
  methodName: SimpleNameReference;
  openParenToken: OpenParenToken;
  rightArrowToken: RightArrowToken;
}

export interface RequiredParam extends STNode {
  annotations: Annotation[];
  paramName?: IdentifierToken;
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
    | HandleTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | ServiceTypeDesc
    | SimpleNameReference
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
  visibilityQualifier?: PublicKeyword;
}

export interface ResourceKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface RestArg extends STNode {
  ellipsis: EllipsisToken;
  expression:
    | FunctionCall
    | ListConstructor
    | MethodCall
    | SimpleNameReference
    | TypeCastExpression;
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
  annotations: Annotation[];
  ellipsisToken: EllipsisToken;
  paramName?: IdentifierToken;
  typeName:
    | AnyTypeDesc
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | FloatTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | OptionalTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | SimpleNameReference
    | StringTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc;
}

export interface RestType extends STNode {
  ellipsisToken: EllipsisToken;
  typeDescriptor:
    | AnydataTypeDesc
    | ArrayTypeDesc
    | BooleanTypeDesc
    | IntTypeDesc
    | JsonTypeDesc
    | NilTypeDesc
    | ParenthesisedTypeDesc
    | SimpleNameReference
    | StringTypeDesc
    | UnionTypeDesc;
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
    | AnnotAccess
    | BinaryExpression
    | BooleanLiteral
    | BracedAction
    | BracedExpression
    | CheckExpression
    | ConditionalExpression
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FloatTypeDesc
    | FlushAction
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
    | OptionalFieldAccess
    | QualifiedNameReference
    | RemoteMethodCallAction
    | SimpleNameReference
    | StartAction
    | StringLiteral
    | StringTemplateExpression
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
}

export interface ReturnTypeDescriptor extends STNode {
  annotations: Annotation[];
  returnsKeyword: ReturnsKeyword;
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
    | HandleTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | ServiceTypeDesc
    | SimpleNameReference
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
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
  expression?: FunctionCall | SimpleNameReference;
  retryBody?: BlockStatement | TransactionStatement;
  retryKeyword?: RetryKeyword;
  rollbackKeyword?: RollbackKeyword;
  semicolon?: SemicolonToken;
  typeParameter?: TypeParameter;
}

export interface SelectClause extends STNode {
  expression:
    | BinaryExpression
    | FieldAccess
    | MappingConstructor
    | MethodCall
    | NumericLiteral
    | RawTemplateExpression
    | SimpleNameReference
    | TypeCastExpression;
  selectKeyword: SelectKeyword;
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
  expressions:
    | CommaToken
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | ImplicitNewExpression
    | QualifiedNameReference
    | SimpleNameReference[];
  metadata?: Metadata;
  onKeyword: OnKeyword;
  serviceBody: ServiceBody;
  serviceKeyword: ServiceKeyword;
  serviceName?: IdentifierToken;
}

export interface ServiceDocReferenceToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface ServiceKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface ServiceTypeDesc extends STNode {
  name: ServiceKeyword;
}

export interface SimpleNameReference extends STNode {
  name: DefaultKeyword | IdentifierToken;
}

export interface SingleQuoteToken extends STNode {
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
}

export interface SlashAsteriskToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface SlashLtToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface SlashToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface SourceKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface SpecificField extends STNode {
  colon?: ColonToken;
  fieldName: IdentifierToken | SimpleNameReference | StringLiteral;
  readonlyKeyword?: ReadonlyKeyword;
  valueExpr?:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | CheckExpression
    | ConditionalExpression
    | ExplicitAnonymousFunctionExpression
    | ExplicitNewExpression
    | FieldAccess
    | FunctionCall
    | IdentifierToken
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
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral
    | TableConstructor
    | TypeCastExpression
    | TypeofExpression
    | UnaryExpression
    | XmlTemplateExpression;
}

export interface SpreadField extends STNode {
  ellipsis: EllipsisToken;
  valueExpr:
    | BooleanLiteral
    | FunctionCall
    | MappingConstructor
    | NumericLiteral
    | SimpleNameReference;
}

export interface StartAction extends STNode {
  annotations: Annotation[];
  expression: FunctionCall | MethodCall | RemoteMethodCallAction;
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
  streamTypeParamsNode?: StreamTypeParams;
}

export interface StreamTypeParams extends STNode {
  commaToken?: CommaToken;
  gtToken: GtToken;
  leftTypeDescNode:
    | AnydataTypeDesc
    | BooleanTypeDesc
    | FloatTypeDesc
    | IntTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | StreamTypeDesc
    | StringTypeDesc
    | UnionTypeDesc;
  ltToken: LtToken;
  rightTypeDescNode?:
    | ErrorTypeDesc
    | NeverTypeDesc
    | QualifiedNameReference
    | SimpleNameReference;
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
  content: Interpolation | TemplateString[];
  endBacktick: BacktickToken;
  startBacktick: BacktickToken;
  type: StringKeyword;
}

export interface StringTypeDesc extends STNode {
  name: StringKeyword;
}

export interface SyncSendAction extends STNode {
  expression:
    | BinaryExpression
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral;
  peerWorker: SimpleNameReference;
  syncSendToken: SyncSendToken;
}

export interface SyncSendToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface SyntaxTree extends STNode {
  eofToken: EofToken;
  imports: ImportDeclaration[];
  members: (| AnnotationDeclaration
      | ConstDeclaration
      | EnumDeclaration
      | FunctionDefinition
      | ListenerDeclaration
      | ModuleVarDecl
      | ModuleXmlNamespaceDeclaration
      | ServiceDeclaration
      | TypeDefinition)[];
}

export interface TableConstructor extends STNode {
  closeBracket: CloseBracketToken;
  keySpecifier?: KeySpecifier;
  mappingConstructors: CommaToken | MappingConstructor[];
  openBracket: OpenBracketToken;
  tableKeyword: TableKeyword;
}

export interface TableKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface TableTypeDesc extends STNode {
  keyConstraintNode?: KeySpecifier | KeyTypeConstraint;
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
  transactionKeyword: TransactionKeyword;
}

export interface TransactionalExpression extends STNode {
  transactionalKeyword: TransactionalKeyword;
}

export interface TransactionalKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface TrapAction extends STNode {
  expression: CheckAction | ReceiveAction | StartAction | WaitAction;
  trapKeyword: TrapKeyword;
}

export interface TrapExpression extends STNode {
  expression:
    | ExplicitNewExpression
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | StringLiteral
    | TypeCastExpression;
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
  memberTypeDesc: (| AnyTypeDesc
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
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | RestType
    | ServiceTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StringTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc) [];
  openBracketToken: OpenBracketToken;
}

export interface TypeCastExpression extends STNode {
  expression:
    | BooleanLiteral
    | BracedExpression
    | CheckExpression
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | ListConstructor
    | MappingConstructor
    | MethodCall
    | NumericLiteral
    | OptionalFieldAccess
    | RemoteMethodCallAction
    | SimpleNameReference
    | StringLiteral
    | TrapAction
    | TrapExpression
    | TypeCastExpression
    | WaitAction
    | XmlTemplateExpression;
  gtToken: GtToken;
  ltToken: LtToken;
  typeCastParam: TypeCastParam;
}

export interface TypeCastParam extends STNode {
  annotations: Annotation[];
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
    | HandleTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
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
  typeDescriptor:
    | ArrayTypeDesc
    | ByteTypeDesc
    | DistinctTypeDesc
    | ErrorTypeDesc
    | FunctionTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | ParameterizedTypeDesc
    | QualifiedNameReference
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
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | RecordTypeDesc
    | ServiceTypeDesc
    | SimpleNameReference
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
}

export interface TypeReference extends STNode {
  asteriskToken?: AsteriskToken;
  name?: TypedescKeyword;
  semicolonToken?: SemicolonToken;
  typeName?: QualifiedNameReference | SimpleNameReference;
}

export interface TypeTestExpression extends STNode {
  expression:
    | AnnotAccess
    | FieldAccess
    | FunctionCall
    | IndexedExpression
    | MethodCall
    | OptionalFieldAccess
    | SimpleNameReference
    | TypeCastExpression;
  isKeyword: IsKeyword;
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
    | IntersectionTypeDesc
    | JsonTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | ServiceTypeDesc
    | SimpleNameReference
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
    | FunctionalBindingPattern
    | ListBindingPattern
    | MappingBindingPattern
    | WildcardBindingPattern;
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
    | IntersectionTypeDesc
    | JsonTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | ServiceTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StreamTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | VarKeyword
    | VarTypeDesc
    | XmlTypeDesc;
}

export interface TypedescKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface TypedescTypeDesc extends STNode {
  typedescKeywordToken: TypedescKeyword;
  typedescTypeParamsNode?: TypeParameter;
}

export interface TypeofExpression extends STNode {
  expression:
    | BooleanLiteral
    | BracedExpression
    | ListConstructor
    | NilLiteral
    | NumericLiteral
    | QualifiedNameReference
    | SimpleNameReference
    | StringLiteral;
  typeofKeyword: TypeofKeyword;
}

export interface TypeofKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface UnaryExpression extends STNode {
  expression:
    | BooleanLiteral
    | BracedExpression
    | FunctionCall
    | MethodCall
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral
    | TransactionalExpression
    | UnaryExpression;
  unaryOperator: ExclamationMarkToken | MinusToken | NegationToken | PlusToken;
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
    | HandleTypeDesc
    | IntTypeDesc
    | JsonTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
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
    | ErrorTypeDesc
    | FloatTypeDesc
    | FunctionTypeDesc
    | HandleTypeDesc
    | IntTypeDesc
    | IntersectionTypeDesc
    | JsonTypeDesc
    | NeverTypeDesc
    | NilTypeDesc
    | ObjectTypeDesc
    | OptionalTypeDesc
    | ParameterizedTypeDesc
    | ParenthesisedTypeDesc
    | QualifiedNameReference
    | ReadonlyTypeDesc
    | RecordTypeDesc
    | SimpleNameReference
    | SingletonTypeDesc
    | StringTypeDesc
    | TableTypeDesc
    | TupleTypeDesc
    | TypedescTypeDesc
    | UnionTypeDesc
    | XmlTypeDesc;
}

export interface VarDocReferenceToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface VarKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface VarTypeDesc extends STNode {
  name: VarKeyword;
}

export interface VariableDocReferenceToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface VersionKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface WaitAction extends STNode {
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
  waitFutureExpr: FunctionCall | SimpleNameReference;
}

export interface WaitFieldsList extends STNode {
  closeBrace: CloseBraceToken;
  openBrace: OpenBraceToken;
  waitFields: CommaToken | SimpleNameReference | WaitField[];
}

export interface WaitKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface WhereClause extends STNode {
  expression: BinaryExpression | BracedExpression | NumericLiteral;
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
  condition:
    | BinaryExpression
    | BooleanLiteral
    | BracedExpression
    | ListConstructor
    | NumericLiteral
    | SimpleNameReference
    | StringLiteral;
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

export interface XmlAtomicNamePattern extends STNode {
  colon: ColonToken;
  name: AsteriskToken | IdentifierToken;
  prefix: IdentifierToken;
}

export interface XmlAttribute extends STNode {
  attributeName: XmlQualifiedName | XmlSimpleName;
  equalToken: EqualToken;
  value: XmlAttributeValue;
}

export interface XmlAttributeValue extends STNode {
  endQuote: DoubleQuoteToken | SingleQuoteToken;
  startQuote: DoubleQuoteToken | SingleQuoteToken;
  value: Interpolation | XmlTextContent[];
}

export interface XmlComment extends STNode {
  commentEnd: XmlCommentEndToken;
  commentStart: XmlCommentStartToken;
  content: Interpolation | XmlTextContent[];
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
  content:
    | Interpolation
    | XmlComment
    | XmlElement
    | XmlEmptyElement
    | XmlPi
    | XmlText[];
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
  name: XmlQualifiedName | XmlSimpleName;
  slashToken: SlashToken;
}

export interface XmlFilterExpression extends STNode {
  expression: SimpleNameReference | XmlStepExpression;
  xmlPatternChain: XmlNamePatternChain;
}

export interface XmlKeyword extends STNode {
  isToken: boolean;
  value: string;
}

export interface XmlNamePatternChain extends STNode {
  gtToken: GtToken;
  startToken: DotLtToken | DoubleSlashDoubleAsteriskLtToken | SlashLtToken;
  xmlNamePattern:
    | AsteriskToken
    | PipeToken
    | SimpleNameReference
    | XmlAtomicNamePattern[];
}

export interface XmlNamespaceDeclaration extends STNode {
  asKeyword?: AsKeyword;
  namespacePrefix?: IdentifierToken;
  namespaceuri: StringLiteral;
  semicolonToken: SemicolonToken;
  xmlnsKeyword: XmlnsKeyword;
}

export interface XmlPi extends STNode {
  data: Interpolation | XmlTextContent[];
  piEnd: XmlPiEndToken;
  piStart: XmlPiStartToken;
  target: XmlSimpleName;
}

export interface XmlPiEndToken extends STNode {
  isToken: boolean;
  value: string;
}

export interface XmlPiStartToken extends STNode {
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
  expression:
    | BracedExpression
    | IndexedExpression
    | SimpleNameReference
    | XmlFilterExpression
    | XmlStepExpression;
  xmlStepStart: SlashAsteriskToken | XmlNamePatternChain;
}

export interface XmlTemplateExpression extends STNode {
  content:
    | Interpolation
    | XmlComment
    | XmlElement
    | XmlEmptyElement
    | XmlPi
    | XmlText[];
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
  name?: XmlKeyword;
  xmlKeywordToken?: XmlKeyword;
  xmlTypeParamsNode?: TypeParameter;
}

export interface XmlnsKeyword extends STNode {
  isToken: boolean;
  value: string;
}

// tslint:enable:ban-types
