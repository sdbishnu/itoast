# @itoast/core

Framework-independent core runtime for ITOAST.

## Responsibility

The Core package provides the foundational runtime layer used by ITOAST adapters, engines, and plugins.

## Architectural Boundary

The Core package must remain independent of UI frameworks and framework-specific rendering systems.

## Core Areas

- Runtime lifecycle
- Runtime context
- Runtime configuration
- Event Bus
- Feature Registry
- Property Resolution System
- Plugin Manager

## Package Rule

Framework-specific behavior belongs in adapters. Core must not depend on React, Vue, Angular, Svelte, Next.js, or other UI frameworks.
