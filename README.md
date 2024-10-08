
# GraphIR-Toolchain

<p align="center">
    <a href="https://github.com/AdiHarif/GraphIR-Toolchain/actions/">
        <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/AdiHarif/GraphIR-Toolchain/ci-tests.yml?style=flat-square&label=CI%3A%20main&link=https%3A%2F%2Fgithub.com%2FAdiHarif%2FGraphIR-Toolchain%2Factions%2F">
    </a>
    <a href="https://github.com/AdiHarif/GraphIR-Toolchain/actions/">
        <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/AdiHarif/GraphIR-Toolchain/ci-tests.yml?branch=dev&style=flat-square&label=CI%3A%20dev&link=https%3A%2F%2Fgithub.com%2FAdiHarif%2FGraphIR-Toolchain%2Factions%2F">
    </a>
</p>


This repository contains the source code for managing the GraphIR toolchain, which is a set of tools for the extraction, analysis and transformation of GraphIR. GraphIR is a graph-based, single static assignment (SSA) intermediate representation (IR) for analysis and optimization of gradually typed languages.

## GraphIR Related Repositories

- [GraphIR](https://github.com/AdiHarif/GraphIR) - TS class definitions for representing GraphIR.
- [TS-Graph-Extracor](https://github.com/AdiHarif/TS-Graph-Extractor) - Parses TS code into GraphIR objects. Essentially toolchain's frontend.
- [GraphIR-Static-Analysis](https://github.com/AdiHarif/GraphIR-Static-Analysis) - Inference and reasoning over GraphIR, implemented in Souffle Datalog.
- [GraphIR-Backend](https://github.com/AdiHarif/GraphIR-Backend) - Emit c++ code corresponding to GraphIR objects.


## Installation and usage

### Install
After cloning the repository, run the following command to install the dependencies:
```bash
git submodule update --init --recursive
npm i
```

### Build
```bash
npm run build
```

### Run
```bash
npm start -- -i <input-file> -o <output-file>
```