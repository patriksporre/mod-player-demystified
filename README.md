MOD Player Demystified – A Reference Implementation

This project is a clean, well-documented reference implementation of a
ProTracker MOD player.

The goal is not cleverness or performance, but correctness, clarity,
and portability. Everything is built step by step and verified through
small, isolated demos.

Structure:
- source/engine  – the actual player library (format parsing, tracker logic, mixing)
- source/host    – browser/demo infrastructure (runner, timing)
- source/demos   – small verification programs, one per concept

Development approach:
- The engine is built incrementally.
- Each new capability is verified by a dedicated demo.
- Demos are not part of the library; they exist to prove correctness.

Getting started:
1. npm install
2. npm run build
3. npm run serve
4. Open the desired demo HTML file in the browser

Current state:
- Demo 00 verifies the demo runner and timing loop.