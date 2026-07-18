import { GraphQLError } from 'graphql';
import type { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import {
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  GraphQLObjectType,
  GraphQLOutputType,
  OperationDefinitionNode,
  SelectionSetNode,
  isEnumType,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  isUnionType,
  valueFromASTUntyped,
} from 'graphql';

/**
 * Maximum allowed complexity score for a single GraphQL operation.
 * Tune this based on your DB's capacity — see scoring rules below.
 */
export const MAX_COMPLEXITY = 1000;

const SCALAR_FIELD_COST = 1;
const OBJECT_FIELD_COST = 2;

/**
 * Assumed list size when a list field has no explicit `limit` /
 * `pagination.limit` argument (e.g. a nested relation returned in full).
 */
const DEFAULT_LIST_SIZE = 5;

type ComplexParentType = GraphQLObjectType | { getFields?: undefined };

/**
 * Unwraps NonNull/List wrappers to get the underlying named type,
 * and reports whether the field returns a list.
 */
function unwrapType(type: GraphQLOutputType): { named: GraphQLOutputType; isList: boolean } {
  let current: any = type;
  let isList = false;

  while (isNonNullType(current)) {
    current = current.ofType;
  }
  if (isListType(current)) {
    isList = true;
    current = current.ofType;
    while (isNonNullType(current)) {
      current = current.ofType;
    }
  }

  return { named: current, isList };
}

/**
 * Reads the `limit` for a field, supporting both `limit: Int` and
 * `pagination: { limit: Int }` argument shapes. Falls back to
 * DEFAULT_LIST_SIZE if no limit argument is present.
 */
function extractLimit(field: FieldNode, variableValues: Record<string, any>): number {
  if (!field.arguments?.length) return DEFAULT_LIST_SIZE;

  for (const arg of field.arguments) {
    if (arg.name.value === 'limit') {
      const value = valueFromASTUntyped(arg.value, variableValues);
      if (typeof value === 'number') return value;
    }
    if (arg.name.value === 'pagination') {
      const value = valueFromASTUntyped(arg.value, variableValues) as { limit?: number } | undefined;
      if (value && typeof value.limit === 'number') return value.limit;
    }
  }

  return DEFAULT_LIST_SIZE;
}

/**
 * Recursively scores a selection set against its parent GraphQL type.
 *
 * Scoring rules:
 *  - Scalar/enum field:                1 point
 *  - Object relation field (singular): 2 points (flat, regardless of nesting)
 *  - List field:                       (sum of its own subfield costs) * limit
 */
function calculateComplexity(
  selectionSet: SelectionSetNode,
  parentType: ComplexParentType,
  variableValues: Record<string, any>,
  fragments: Record<string, FragmentDefinitionNode>,
): number {
  let total = 0;

  for (const selection of selectionSet.selections) {
    if (selection.kind === 'Field') {
      const fieldName = selection.name.value;
      if (fieldName.startsWith('__')) continue; // skip introspection fields

      const fieldDef = (parentType as GraphQLObjectType).getFields?.()[fieldName];
      if (!fieldDef) continue;

      const { named: fieldType, isList } = unwrapType(fieldDef.type);
      const isScalarOrEnum = isScalarType(fieldType) || isEnumType(fieldType);

      let childCost = 0;
      if (
        selection.selectionSet &&
        (isObjectType(fieldType) || isInterfaceType(fieldType) || isUnionType(fieldType))
      ) {
        childCost = calculateComplexity(
          selection.selectionSet,
          fieldType as GraphQLObjectType,
          variableValues,
          fragments,
        );
      }

      const ownCost = isScalarOrEnum ? SCALAR_FIELD_COST : OBJECT_FIELD_COST;

      const fieldTotal = isList
        ? (childCost || ownCost) * extractLimit(selection, variableValues)
        : ownCost;

      total += fieldTotal;
    } else if (selection.kind === 'InlineFragment' && selection.selectionSet) {
      total += calculateComplexity(selection.selectionSet, parentType, variableValues, fragments);
    } else if (selection.kind === 'FragmentSpread') {
      const fragment = fragments[selection.name.value];
      if (fragment) {
        total += calculateComplexity(fragment.selectionSet, parentType, variableValues, fragments);
      }
    }
  }

  return total;
}

function collectFragments(document: DocumentNode): Record<string, FragmentDefinitionNode> {
  const fragments: Record<string, FragmentDefinitionNode> = {};
  for (const def of document.definitions) {
    if (def.kind === 'FragmentDefinition') {
      fragments[def.name.value] = def;
    }
  }
  return fragments;
}

/**
 * Creates an Apollo Server plugin that rejects operations exceeding
 * `maxComplexity` before they ever reach a resolver.
 *
 * Usage: add to GraphQLModule plugins in app.module.ts
 *   plugins: [createComplexityPlugin(MAX_COMPLEXITY)]
 */
export function createComplexityPlugin(maxComplexity: number = MAX_COMPLEXITY): ApolloServerPlugin {
  return {
    async requestDidStart(): Promise<GraphQLRequestListener<any>> {
      return {
        async didResolveOperation({ document, schema, operationName, request }) {
          const operation = document.definitions.find(
            (def): def is OperationDefinitionNode =>
              def.kind === 'OperationDefinition' &&
              (!operationName || def.name?.value === operationName),
          );
          if (!operation) return;

          const rootType =
            operation.operation === 'query'
              ? schema.getQueryType()
              : operation.operation === 'mutation'
                ? schema.getMutationType()
                : schema.getSubscriptionType();
          if (!rootType) return;

          const fragments = collectFragments(document);

          const complexity = calculateComplexity(
            operation.selectionSet,
            rootType,
            request.variables ?? {},
            fragments,
          );

          if (complexity > maxComplexity) {
            throw new GraphQLError(
              `Query is too complex: ${complexity}. Maximum allowed complexity is ${maxComplexity}.`,
              {
                extensions: {
                  code: 'QUERY_TOO_COMPLEX',
                  complexity,
                  maxComplexity,
                },
              },
            );
          }
        },
      };
    },
  };
}