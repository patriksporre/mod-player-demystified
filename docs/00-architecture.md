Architecture Overview

This project is structured around a strict separation of concerns.

engine/
Contains the actual MOD player library.
This code is intended to be portable and free from browser or UI assumptions.

host/
Contains demo infrastructure only.
The runner provides a simple animation loop and lifecycle hooks.

demos/
Each demo demonstrates and verifies one step of the implementation.
Demos are intentionally simple and disposable.

Why this matters:
- Engine code stays clean and focused.
- Demos act as visual unit tests.
- The project can be developed in short, focused sessions.
- The result is easy to understand, port, and extend.

Guiding principle:
If something belongs to the MOD player itself, it goes in engine/.
If it exists only to show or test behaviour, it goes in demos/.