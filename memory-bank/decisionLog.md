# Decision Log

This file records architectural and implementation decisions.
2025-04-27 02:08:15 - Initial decision log

## Technical Stack Decisions

### Frontend Framework Selection

- Decision: React with TypeScript
- Rationale:
  - Strong type safety with TypeScript
  - Large ecosystem and community support
  - Excellent developer tooling
- Implementation Details:
  - Using Vite for fast development and build
  - Implementing strict TypeScript checks
  - Using modern React patterns (hooks, context)

### UI Component Library

- Decision: Shdacne UI with TailwindCSS
- Rationale:
  - Utility-first CSS framework for rapid UI development
  - Highly customizable and responsive design
  - Built-in dark mode support
- Implementation Details:
  - Using Radix UI primitives for building custom components
  - TailwindCSS for utility-first styling approach
  - Custom theme configuration for consistent design

### Backend Service Selection

- Decision: Supabase
- Rationale:
  - Built-in authentication
  - Real-time capabilities
  - PostgreSQL database with RLS
- Implementation Details:
  - User authentication flow
  - Real-time subscriptions for notes
  - Row-level security policies

### Data Model Structure

- Decision: Notes and Folders tables
- Rationale:
  - Simple but flexible structure
  - Easy to extend in the future
  - Efficient querying capabilities
- Implementation Details:
  - Notes table with user_id and folder fields
  - Folders table with name uniqueness per user
  - RLS policies for data security

_2025-04-27 02:08:15 - Initial documentation of architectural decisions_
