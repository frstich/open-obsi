# Product Context

This file provides a high-level overview of the project and the expected product that will be created.

2025-04-27 02:07:22 - Initial project analysis
2025-04-27 03:20:00 - Updated context to include Canvas feature

## Project Goal

Open-Obsi is a web-based note-taking and knowledge management application built with modern web technologies, inspired by Obsidian. Its primary goals are:

- Provide a clean, user-friendly interface for managing diverse content types.
- Support markdown-based note editing with real-time preview.
- **Offer a freeform canvas/whiteboard for visual thinking and organization.**
- Enable secure multi-user support with authentication.
- Offer folder organization for better content management.

## Key Features

- **Authentication System:**
  - User signup/login via Supabase authentication.
  - Protected routes and private content.
- **Notes Management (Markdown):**
  - Create, read, update, and delete notes.
  - Markdown support with real-time preview (`react-markdown`).
  - Automatic note saving (debounced).
  - Note organization within folders.
- **Canvas/Whiteboard Feature:**
  - Create, read, update, and delete canvas notes.
  - Add, move, and connect visual cards (nodes) on an infinite canvas (`reactflow`).
  - Basic node customization.
  - Automatic saving of canvas layout (debounced).
  - Organization within folders alongside Markdown notes.
- **Folder System:**
  - Create and manage folders.
  - Move notes (Markdown or Canvas) between folders via drag-and-drop.
  - Hierarchical organization view in the sidebar.
- **Real-time Updates:**
  - Live synchronization using Supabase real-time subscriptions.
  - Instant UI updates on data changes (e.g., note creation/deletion).
- **Command Palette:** Quick access to actions like creating notes/canvases and searching.

## Overall Architecture

1.  **Frontend Framework & Libraries:**
    - React + TypeScript
    - Vite as build tool
    - TailwindCSS for styling (with custom Obsidian theme)
    - Shadcn UI / Radix UI for accessible components
    - `reactflow` for Canvas feature implementation
    - `react-markdown` and `remark-gfm` for Markdown rendering
2.  **State Management:**
    - React Context (`NotesContext`) for global state (notes list, active note).
    - Local component state (e.g., editor content, canvas nodes/edges).
    - TanStack Query (potential future use for more complex data fetching/caching).
    - Real-time subscriptions managed within `NotesContext`.
3.  **Backend/Database:**
    - Supabase for backend services (Auth, Database, Realtime).
    - PostgreSQL database.
    - Row Level Security (RLS) for data protection.
4.  **Key Components:**
    - `NotesProvider`: Global state and data fetching logic.
    - `Editor`: Container component rendering either Markdown editor or Canvas view.
    - `MarkdownRenderer`: Displays formatted Markdown.
    - `CanvasView`: Renders the interactive `reactflow` canvas.
    - `CustomNode`: Example node component for the canvas.
    - `Sidebar`: Navigation, folder structure, note list display.
    - `CommandPalette`: Quick action and search interface.

_2025-04-27 03:20:00 - Updated product context and architecture for Canvas feature._
