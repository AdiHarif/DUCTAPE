
import fs from 'fs';
import { execSync } from 'child_process';


import { exportIrToRelations } from "graphir";
import { extractFromPath } from 'ts-graph-extractor';
import { generateCpp } from 'graphir-compiler';

import { getCliOptions } from "./options.js";
import { generateContext } from './context_manager.js';
import { hydrateTypesFromFiles } from './type_hydration.js';
import { transformGraph } from './transformation.js';

const options = getCliOptions();

async function main() {
    const graph = extractFromPath(options['input-file']);
    await exportIrToRelations(graph, 'out');

    execSync(`souffle -D../../out -F../../out src/main.dl`, { cwd: "submodules/GraphIR-Static-Analysis" });
    hydrateTypesFromFiles(graph, 'out/full_type.csv');

    const cppFile = 'out/tmp.cpp';
    fs.writeFileSync(cppFile, '');

    const contextManager = generateContext(graph);
    contextManager.dump(cppFile);

    transformGraph(graph, 'out/graph_transformation.csv');

    const code = generateCpp(graph);
    fs.appendFileSync(cppFile, code);

    execSync(`clang++ -O3 -std=c++17 -o ${options['output-file']} -Inode_modules/graphir-compiler/lib ${cppFile}`);
}

main();
