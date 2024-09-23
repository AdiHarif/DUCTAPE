
# GraphIR-Toolchain

This repository contains the source code for managing the GraphIR toolchain, which is a set of tools for the extraction, analysis and transformation of GraphIR. GraphIR is a graph-based, single static assignment (SSA) intermediate representation (IR) for analysis and optimization of gradually typed languages.

## GraphIR Related Repositories

- [GraphIR](https://github.com/AdiHarif/GraphIR) - TS class definitions for representing GraphIR.
- [TS-Graph-Extracor](https://github.com/AdiHarif/TS-Graph-Extractor) - Parses TS code into GraphIR objects. Essentially toolchain's frontend.
- [GraphIR-Static-Analysis](https://github.com/AdiHarif/GraphIR-Static-Analysis) - Inference and reasoning over GraphIR, implemented in Souffle Datalog.
- [GraphIR-Backend](https://github.com/AdiHarif/GraphIR-Backend) - Emit c++ code corresponding to GraphIR objects.