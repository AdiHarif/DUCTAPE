
import fs from 'fs';
import { execSync } from 'child_process';


import { exportIrToRelations } from "graphir";
import * as ir from 'graphir';
import { extractFromPath } from 'ts-graph-extractor';
import { generateCpp, generateGlobalsStruct } from 'graphir-compiler';

import { getCliOptions } from "./options.js";
import { generateContext } from './context_manager.js';
import { hydrateTypesFromFiles, typeNameToType } from './type_hydration.js';
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

    const lines = fs.readFileSync('out/global_variable.csv').toString().split('\n');
    const fields: Array<[string, ir.Type]> = lines.filter(line => line != '')
        .map(line => line.split('\t'))
        .map(line => [line[0], typeNameToType(line[1])]);

    const globalsStruct = generateGlobalsStruct(fields);
    fs.writeFileSync(cppFile, globalsStruct, { flag: 'a' });

    transformGraph(graph, 'out/graph_transformation.csv');

    const code = generateCpp(graph);
    fs.appendFileSync(cppFile, code, { flag: 'a' });

    execSync(`clang++ -O3 -std=c++17 -o ${options['output-file']} -Inode_modules/graphir-compiler/lib ${cppFile}`);
}

main();
