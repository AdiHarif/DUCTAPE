
import assert from 'assert';
import * as fs from 'fs';

import * as ir from 'graphir';

function extractInnerTypeName(typeName: string): string {
    const start = typeName.indexOf('<') + 1;
    const end = typeName.lastIndexOf('>');
    return typeName.slice(start, end);
}

function splitTypeNamesList(typeNames: string): Array<string> {
    const typeNamesList = [];
    let start = 0;
    let depth = 0;
    for (let i = 0; i < typeNames.length; i++) {
        if (typeNames[i] == '<') {
            depth++;
        }
        else if (typeNames[i] == '>') {
            depth--;
        }
        else if (typeNames[i] == ',' && depth == 0) {
            typeNamesList.push(typeNames.slice(start, i));
            start = i + 1;
        }
    }
    typeNamesList.push(typeNames.slice(start));
    return typeNamesList;
}

function typeNameToType(typeName: string): ir.Type {
    if (typeName == 'Number') {
        return new ir.NumberType();
    }
    else if (typeName == 'Void') {
        return new ir.VoidType();
    }
    else if (typeName.startsWith('Integer')) {
        const width = parseInt(typeName.slice(7));
        return new ir.IntegerType(width);
    }
    else if (typeName.startsWith('Float')) {
        const width = parseInt(typeName.slice(5));
        assert(width == 32 || width == 64);
        return new ir.FloatType(width);
    }
    else if (typeName.startsWith('Option')) {
        const innerTypeName = extractInnerTypeName(typeName);
        const innerType = typeNameToType(innerTypeName);
        return new ir.OptionType(innerType);
    }
    else if (typeName.indexOf('->') != -1) {
        const arrowIndex = typeName.indexOf('->');
        const returnTypeName = typeName.slice(arrowIndex + 2);
        const returnType = typeNameToType(returnTypeName);
        const argTypeNames = splitTypeNamesList(typeName.slice(1, arrowIndex - 1));
        let argTypes: ir.Type[];
        if (argTypeNames.length == 1 && argTypeNames[0] == '') {
            argTypes = [];
        }
        else {
            argTypes = argTypeNames.map(typeNameToType);
        }
        return new ir.FunctionType(returnType, argTypes);
    }
    else if (typeName.startsWith('StaticArray')) {
        const innerTypeNameWithLength = extractInnerTypeName(typeName);
        const [innerTypeName, lengthString]  = splitTypeNamesList(innerTypeNameWithLength);
        return new ir.StaticArrayType(typeNameToType(innerTypeName), parseInt(lengthString));
    }
    else if (typeName.startsWith('DynamicArray')) {
        const innerTypeName = extractInnerTypeName(typeName);
        return new ir.DynamicArrayType(typeNameToType(innerTypeName));
    }
    else if (typeName.startsWith('StaticString')) {
        return new ir.StaticStringType(0);
    }
    else if (typeName.startsWith('Union')) {
        const unionOptions = splitTypeNamesList(extractInnerTypeName(typeName))
            .map(name => typeNameToType(name));
        return new ir.UnionType(unionOptions)
    }
    else if (typeName.startsWith('Undefined')) {
        return new ir.UndefinedType();
    }
    throw new Error(`Unsupported typename: ${typeName}`);
}


function hydrateFunctionType(graph: ir.Graph, verticesTypes: Map<number, ir.Type>) {
    if (graph.getStartVertex().inEdges.length > 0) {
        assert(graph.getStartVertex().inEdges.length == 1);
        const symbolVertex = graph.getStartVertex().inEdges[0].source;
        assert(symbolVertex instanceof ir.StaticSymbolVertex);
        graph.verifiedType = symbolVertex.verifiedType! as ir.FunctionType;
    }
    else {
        graph.verifiedType = new ir.FunctionType(new ir.IntegerType(32), []);
    }
}

function hydrateTypes(graph: ir.Graph, verticesTypes: Map<number, ir.Type>) {
    for (const vertex of graph.vertices) {
        const irType = verticesTypes.get(vertex.id);
        if (irType) {
            (vertex as ir.DataVertex).verifiedType = irType;
        }
    }

    hydrateFunctionType(graph, verticesTypes);

    for (const subgraph of graph.subgraphs) {
        hydrateTypes(subgraph, verticesTypes);
    }
}

export function hydrateTypesFromFiles(graph: ir.Graph, verticesPath: string) {
    const verticesTypes = new Map<number, ir.Type>();
    const lines = fs.readFileSync(verticesPath).toString().split('\n');
    for (const line of lines) {
        if (line == '') {
            continue;
        }
        const [vertexId, typeName] = line.split('\t');
        verticesTypes.set(parseInt(vertexId), typeNameToType(typeName));
    }

    hydrateTypes(graph, verticesTypes);
}
