
import assert from 'assert';
import * as fs from 'fs';

import * as ir from 'graphir';

// import {} from 'graphir-compiler';

type TransformationKind = string;

function getTransformationsMap(transformationsFile: string): Map<number, TransformationKind> {
    const out = new Map<number, TransformationKind>();
    fs.readFileSync(transformationsFile, 'utf8')
        .split('\n')
        .map((line) => line.split('\t'))
        .forEach((line) => out.set(parseInt(line[1]), line[0]));
    return out;
}

export function transformGraph(graph: ir.Graph, transformationsFile: string): void {
    const transformations = getTransformationsMap(transformationsFile);
    for (const vertex of graph.vertices) {
        if (transformations.has(vertex.id)) {
            if (transformations.get(vertex.id) == 'string.substring') {
                assert(vertex instanceof ir.LoadVertex);
                vertex.property = new ir.StaticSymbolVertex('substr', undefined as any);
                const call = vertex.next;
                assert(call instanceof ir.CallVertex);
                const prevArg = call.args![1];
                const newArg = new ir.BinaryOperationVertex('-', undefined as any, call.args![0], prevArg);
                call.setArg(1, newArg);
                newArg.verifiedType = prevArg.verifiedType;
                graph.addVertex(newArg);
            }
            if (transformations.get(vertex.id) == 'string.length' || transformations.get(vertex.id) == 'Array.length') {
                assert(vertex instanceof ir.LoadVertex);
                const newProp = new ir.StaticSymbolVertex('size', undefined as any);
                vertex.property = newProp;
                graph.addVertex(vertex.property);
                const retType = vertex.verifiedType;
                vertex.verifiedType = new ir.FunctionType(retType!, []);
                const oldNext = vertex.next;
                const call = new ir.CallVertex(undefined as any, vertex, []);
                call.verifiedType = retType;
                graph.addVertex(call);
                vertex.next = call;
                call.next = oldNext;
                for (const edge of vertex.inEdges) {
                    if (edge.category == ir.EdgeCategory.Data) {
                        if (edge.source == call) {
                            continue;
                        }
                        edge.target = call;
                    }
                }
            }
        }
    }

    for (const subgraph of graph.subgraphs) {
        transformGraph(subgraph, transformationsFile);
    }
}
