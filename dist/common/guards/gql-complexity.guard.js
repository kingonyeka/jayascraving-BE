"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_COMPLEXITY = void 0;
exports.createComplexityPlugin = createComplexityPlugin;
const graphql_1 = require("graphql");
const graphql_2 = require("graphql");
exports.MAX_COMPLEXITY = 1000;
const SCALAR_FIELD_COST = 1;
const OBJECT_FIELD_COST = 2;
const DEFAULT_LIST_SIZE = 5;
function unwrapType(type) {
    let current = type;
    let isList = false;
    while ((0, graphql_2.isNonNullType)(current)) {
        current = current.ofType;
    }
    if ((0, graphql_2.isListType)(current)) {
        isList = true;
        current = current.ofType;
        while ((0, graphql_2.isNonNullType)(current)) {
            current = current.ofType;
        }
    }
    return { named: current, isList };
}
function extractLimit(field, variableValues) {
    if (!field.arguments?.length)
        return DEFAULT_LIST_SIZE;
    for (const arg of field.arguments) {
        if (arg.name.value === 'limit') {
            const value = (0, graphql_2.valueFromASTUntyped)(arg.value, variableValues);
            if (typeof value === 'number')
                return value;
        }
        if (arg.name.value === 'pagination') {
            const value = (0, graphql_2.valueFromASTUntyped)(arg.value, variableValues);
            if (value && typeof value.limit === 'number')
                return value.limit;
        }
    }
    return DEFAULT_LIST_SIZE;
}
function calculateComplexity(selectionSet, parentType, variableValues, fragments) {
    let total = 0;
    for (const selection of selectionSet.selections) {
        if (selection.kind === 'Field') {
            const fieldName = selection.name.value;
            if (fieldName.startsWith('__'))
                continue;
            const fieldDef = parentType.getFields?.()[fieldName];
            if (!fieldDef)
                continue;
            const { named: fieldType, isList } = unwrapType(fieldDef.type);
            const isScalarOrEnum = (0, graphql_2.isScalarType)(fieldType) || (0, graphql_2.isEnumType)(fieldType);
            let childCost = 0;
            if (selection.selectionSet &&
                ((0, graphql_2.isObjectType)(fieldType) || (0, graphql_2.isInterfaceType)(fieldType) || (0, graphql_2.isUnionType)(fieldType))) {
                childCost = calculateComplexity(selection.selectionSet, fieldType, variableValues, fragments);
            }
            const ownCost = isScalarOrEnum ? SCALAR_FIELD_COST : OBJECT_FIELD_COST;
            const fieldTotal = isList
                ? (childCost || ownCost) * extractLimit(selection, variableValues)
                : ownCost;
            total += fieldTotal;
        }
        else if (selection.kind === 'InlineFragment' && selection.selectionSet) {
            total += calculateComplexity(selection.selectionSet, parentType, variableValues, fragments);
        }
        else if (selection.kind === 'FragmentSpread') {
            const fragment = fragments[selection.name.value];
            if (fragment) {
                total += calculateComplexity(fragment.selectionSet, parentType, variableValues, fragments);
            }
        }
    }
    return total;
}
function collectFragments(document) {
    const fragments = {};
    for (const def of document.definitions) {
        if (def.kind === 'FragmentDefinition') {
            fragments[def.name.value] = def;
        }
    }
    return fragments;
}
function createComplexityPlugin(maxComplexity = exports.MAX_COMPLEXITY) {
    return {
        async requestDidStart() {
            return {
                async didResolveOperation({ document, schema, operationName, request }) {
                    const operation = document.definitions.find((def) => def.kind === 'OperationDefinition' &&
                        (!operationName || def.name?.value === operationName));
                    if (!operation)
                        return;
                    const rootType = operation.operation === 'query'
                        ? schema.getQueryType()
                        : operation.operation === 'mutation'
                            ? schema.getMutationType()
                            : schema.getSubscriptionType();
                    if (!rootType)
                        return;
                    const fragments = collectFragments(document);
                    const complexity = calculateComplexity(operation.selectionSet, rootType, request.variables ?? {}, fragments);
                    if (complexity > maxComplexity) {
                        throw new graphql_1.GraphQLError(`Query is too complex: ${complexity}. Maximum allowed complexity is ${maxComplexity}.`, {
                            extensions: {
                                code: 'QUERY_TOO_COMPLEX',
                                complexity,
                                maxComplexity,
                            },
                        });
                    }
                },
            };
        },
    };
}
//# sourceMappingURL=gql-complexity.guard.js.map