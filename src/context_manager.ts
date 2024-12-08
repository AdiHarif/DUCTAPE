
import fs from "fs";
import assert from "assert";

import * as ir from "graphir";


class CppContextManager {
    private stdLibIncludes: Set<string> = new Set();
    private externalIncludes: Set<string> = new Set();

    private static supportedExternalLibs = [
        'console',
        'Math',
        'fs'
    ];

    private static defaultExternalLibs = [
        'global',
        'process',
    ];

    constructor() {
        for (const lib of CppContextManager.defaultExternalLibs) {
            this.externalIncludes.add(lib);
        }
    }

    public registerType(type: ir.Type): void {
        if (type instanceof ir.IntegerType) {
            this.stdLibIncludes.add("cstdint");
        }
        if (type instanceof ir.StaticArrayType || type instanceof ir.DynamicArrayType) {
            this.stdLibIncludes.add("memory");
        }
        if (type instanceof ir.DynamicArrayType) {
            this.externalIncludes.add("DynamicArray");
        }
        if (type instanceof ir.FunctionType) {
            this.stdLibIncludes.add("functional");
        }

        if (type instanceof ir.UnionType) {
            this.externalIncludes.add("union");
        }
    }

    public registerStaticString(id: number, value: string): void {}

    public registerSymbol(vertex: ir.StaticSymbolVertex): void {
        if (CppContextManager.supportedExternalLibs.includes(vertex.name)) {
            this.externalIncludes.add(vertex.name);
        }
    }

    public dump(outFile?: fs.PathOrFileDescriptor): void {
        let dumpFunction;
        if (outFile) {
            dumpFunction = (s: string) => fs.appendFileSync(outFile, s + '\n');
        }
        else {
            dumpFunction = console.log;
        }
        dumpFunction('');

        for (const libInclude of this.stdLibIncludes) {
            dumpFunction(`#include <${libInclude}>`);
        }
        dumpFunction('');

        for (const externalInclude of this.externalIncludes) {
            dumpFunction(`#include "${externalInclude}.h"`);
        }
        dumpFunction('');
    }
}

export function generateContext(graph: ir.Graph): CppContextManager {

    const contextManager = new CppContextManager();

    function registerUsedNonPrimitiveTypes(graph: ir.Graph): void {
        const usedTypes = new Array<ir.Type>();
        for (const subgraph of graph.subgraphs) {
            registerUsedNonPrimitiveTypes(subgraph);
        }
        for (const vertex of graph.vertices) {
            if (vertex instanceof ir.StaticSymbolVertex) {
                contextManager.registerSymbol(vertex);
                continue;
            }
            if (vertex instanceof ir.DataVertex || vertex instanceof ir.CompoundVertex) {
                assert(vertex.verifiedType);
                contextManager.registerType(vertex.verifiedType);
            }
        }
    }

    function registerStaticStrings(graph: ir.Graph): void {
        for (const subgraph of graph.subgraphs) {
            registerStaticStrings(subgraph);
        }
        for (const vertex of graph.vertices) {
            if (vertex instanceof ir.LiteralVertex && typeof vertex.value === 'string') {
                contextManager.registerStaticString(vertex.id, vertex.value);
            }
        }
    }

    registerUsedNonPrimitiveTypes(graph);
    registerStaticStrings(graph);

    return contextManager;
}
