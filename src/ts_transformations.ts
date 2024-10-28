
import * as tsm from 'ts-morph';

import * as ir from 'graphir'

export function emitTransformedFile(inputPath: string) {
    const project = new tsm.Project({
        tsConfigFilePath: "tsconfig.json"
    });
    const file = project.addSourceFileAtPath(inputPath);
    replaceCompiledFunctions(file);
    insertLoadingSharedLibrary(file, 'tmp.so');
    file.emit();
}

function insertLoadingSharedLibrary(file: tsm.SourceFile, soPath: string) {
    file.insertImportDeclaration(0, {
        moduleSpecifier: 'koffi',
        defaultImport: 'koffi'
    });
    file.insertVariableStatement(1, {
        declarationKind: tsm.VariableDeclarationKind.Const,
        declarations: [{
            name: 'lib',
            initializer: `koffi.load("./${soPath}")`
        }]
    })
}

function replaceCompiledFunctions(file: tsm.SourceFile) {
    const functions = file.getFunctions();
    for (let f of functions) {
        if (f.getJsDocs().find((doc) => doc.getTags().find((tag) => tag.getTagName() === 'ductape' && tag.getComment() === 'compile'))) {
            f.replaceWithText(`const ${f.getName()} = lib.func("${f.getName()}", "double", ["double"]);`);
        }
    }

}

export function getFunctionTypeMap(graph: ir.Graph) {
    const map = new Map();
    for (let subgraph in graph.subgraphs) {
        const functionName = subgraph.name;
    }
}