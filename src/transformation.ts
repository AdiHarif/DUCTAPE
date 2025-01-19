
import assert from 'assert';
import * as fs from 'fs';

import * as ir from 'graphir';

interface GraphTransformer {
    transform(graph: ir.Graph, rootVertex: ir.Vertex): void;
}

class GetterToMethodTransformer implements GraphTransformer {
    constructor(private methodName: string) {}

    transform(graph: ir.Graph, vertex: ir.LoadVertex): void {
        const newProp = new ir.StaticSymbolVertex(this.methodName, undefined as any);
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

class StringSubstringTransformer implements GraphTransformer {
    transform(graph: ir.Graph, vertex: ir.LoadVertex): void {
        vertex.property = new ir.StaticSymbolVertex('substr', undefined as any);
        const call = vertex.next;
        assert(call instanceof ir.CallVertex);
        const prevArg = call.args![1];
        const newArg = new ir.BinaryOperationVertex('-', undefined as any, call.args![0], prevArg);
        call.setArg(1, newArg);
        newArg.verifiedType = prevArg.verifiedType;
        graph.addVertex(newArg);
    }
}

class StringCharCodeAtTransformer implements GraphTransformer {
    transform(graph: ir.Graph, vertex: ir.LoadVertex): void {
        const objVertex = vertex.object!;
        vertex.object = new ir.StaticSymbolVertex('String', undefined as any);
        const call = vertex.next;
        assert(call instanceof ir.CallVertex);
        call.unshiftArg(objVertex);
    }
}

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
            let transformer: GraphTransformer;
            if (transformations.get(vertex.id) == 'string.substring') {
                assert(vertex instanceof ir.LoadVertex);
                transformer = new StringSubstringTransformer();
            }
            else if (transformations.get(vertex.id) == 'string.length' || transformations.get(vertex.id) == 'Array.length') {
                assert(vertex instanceof ir.LoadVertex);
                transformer = new GetterToMethodTransformer('size')
            }
            else if (transformations.get(vertex.id) == 'string.charCodeAt') {
                assert(vertex instanceof ir.LoadVertex);
                transformer = new StringCharCodeAtTransformer();
            }
            else {
                throw new Error(`Unknown transformation: ${transformations.get(vertex.id)}`);
            }
            transformer!.transform(graph, vertex);
        }
    }

    for (const subgraph of graph.subgraphs) {
        transformGraph(subgraph, transformationsFile);
    }
}
