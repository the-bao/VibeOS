# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**VibeOS** is a conceptual framework for a declarative coding control plane. The core philosophy is "Intent-based Engineering" - users define desired states through natural language specs, and the system continuously reconciles actual code to match the desired state through automated loops.

### Core Metaphor: Kubernetes for Code

The system mirrors Kubernetes architecture:
- **Pod** → Feature/Component (minimum deployment unit)
- **Kubelet** → AI Micro-Agents (execute specific tasks)
- **Controller Manager** → Tech Lead Agent (orchestration and decisions)
- **Etcd** → Semantic State Store (codebase + vector memory)
- **YAML Spec** → Vibe Manifest (natural language converted to structured spec)

## Key Architectural Concepts

### The Vibe Manifest (CRD)
The central specification format that defines:
- **Intent**: Semantic description of requirements
- **Constraints**: Tech stack constraints (framework, styling, state management)
- **Visual Spec**: Reference images and CSS attributes
- **Functional Spec**: Inputs, states, and expected behaviors

### Reconciliation Loop
The core mechanism consisting of three phases:

1. **Specifier Operator** (TDD-first): Generates tests and probes BEFORE any code is written. Tests must initially FAIL.

2. **Coder Operator**: Analyzes test failures and generates/fixes code.

3. **Auditor Controller**: Runs tests, renders components in headless browsers, and performs AI vision checks against visual specs.

If Diff > 0, trigger another loop iteration.

### Micro-Agents (Mixture of Experts)
- **Tech Lead**: Task breakdown, dependency management, loop control (requires strong reasoning)
- **Coder (FE/BE)**: Code writing and refactoring (requires strong coding ability)
- **QA Bot**: Test generation and security scanning
- **UX Artist**: Visual review and accessibility checks (requires multimodal vision capabilities)

### Safety Mechanisms
- **MaxLoops**: Default maximum 10 fix attempts per component
- **TokenBudget**: Per-change token consumption limits
- **CrashLoopBackOff**: After 5 consecutive failed loops, pause and request human intervention with diagnostic report

## Language and Documentation

This repository's primary documentation (`VibeOS.md`) is in **Chinese**. When working with this codebase:
- Design concepts and architectural discussions may be in Chinese
- Technical terms and code should remain in English
- Consider bilingual context when referencing design decisions

## Development State

This is currently a **concept/design repository**. There is no implementation code yet - only the architectural specification document.
