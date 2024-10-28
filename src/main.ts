
import fs from 'fs';
import { execSync } from 'child_process';


import { exportIrToRelations } from "graphir";
import { extractFromPath } from 'ts-graph-extractor';
import { generateCpp } from 'graphir-compiler';

import { getCliOptions } from "./options.js";
import { generateContext } from './context_manager.js';
import { hydrateTypesFromFiles } from './type_hydration.js';
import { emitTransformedFile } from './ts_transformations.js';

import { Graph } from 'graphir';

const options = getCliOptions();

function generatePartialCpp(graph: Graph) {
    if (graph.jsDocTags['ductape'] === 'compile') {
        return generateCpp(graph);
    }
    else {
        let code = '';
        for (let g of graph.subgraphs) {
            code += generatePartialCpp(g);
            code += '\n';
        }
        return code;
    }
}

async function main() {
    const graph = extractFromPath(options['input-file']);
    await exportIrToRelations(graph, 'out');

    execSync(`souffle -D../../out -F../../out src/main.dl`, { cwd: "submodules/GraphIR-Static-Analysis" });
    hydrateTypesFromFiles(graph, 'out/full_type.csv');

    const cppFile = 'out/tmp.cpp';
    fs.writeFileSync(cppFile, '');

    const contextManager = generateContext(graph);
    contextManager.dump(cppFile);

    let code;
    let clangFlags = `-O3 -std=c++17 -o ${options['output-file']} -Inode_modules/graphir-compiler/lib`;
    if (options.compilationMode === 'gradual') {
        code = generatePartialCpp(graph);
        clangFlags += ' --shared -fPIC';

        const functionTypeMap = getFunctionTypeMap(graph);
        emitTransformedFile(options['input-file'], functionTypeMap);
    }
    else {
        code = generateCpp(graph);
    }

    fs.appendFileSync(cppFile, code);
    execSync(`clang++ ${clangFlags} ${cppFile}`);
}

main();
