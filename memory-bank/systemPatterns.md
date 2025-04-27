# System Patterns

This file documents recurring patterns and standards used in the project.
2025-04-27 02:07:40 - Initial patterns documentation
2025-04-27 03:22:00 - Updated patterns reflecting Canvas feature

## Coding Patterns

### State Management

- Context-based global state management (`NotesContext`) for shared data like notes list, active note, user session.
- Real-time data synchronization with Supabase handled within the Context provider.
- Optimistic UI updates for actions like note creation/deletion, folder changes.
- Local state management within components for UI state (e.g., editor input, canvas interactions before saving).
- Debounced saving for user input (Markdown content, Canvas changes) to reduce database calls.
- Toast notifications (`sonner`) for user feedback on actions (save, delete, errors).

### Component Architecture

- Functional components with TypeScript for type safety.
- Custom hooks for reusable logic (e.g., `useNotes`, `useIsMobile`).
- Component composition using Shadcn UI / Radix UI primitives.
- Responsive design using TailwindCSS utility classes.
- **Conditional rendering:** Using the `note.type` field to render different views (e.g., Markdown editor vs. `CanvasView` within the `Editor` component).
- Specialized UI Libraries: Integrating libraries like `reactflow` for complex UI needs (Canvas) while maintaining overall app structure.

### Data Handling

- Type-safe database operations using generated Supabase types.
- Specific data structures based on note type (`content` for Markdown, `canvas_data` JSONB for Canvas).
- Context functions encapsulate Supabase calls (`createNote`, `updateNote`, etc.).
- Error handling within context functions with user feedback via toasts.
- Loading states management (e.g., during initial data fetch, potentially during saves).
- Real-time subscription patterns within `NotesContext` to keep local state synchronized.

## Architectural Patterns

### Authentication Flow

- Protected routes using `PrivateRoute` component wrapper.
- Session management handled by Supabase client library and tracked in React state.
- Automatic redirect to `/auth` for unauthenticated users attempting to access protected routes.

### Data Security

- Row Level Security (RLS) policies in Supabase ensure users can only access/modify their own notes and folders.
- User ID (`user_id`) is associated with every note and folder.
- Supabase client uses user's JWT for authenticated requests.

### State Updates & Synchronization

- **Centralized fetching:** Initial data fetch and real-time subscriptions managed in `NotesProvider`.
- **Local updates:** Components update local state for immediate feedback (e.g., typing in textarea, dragging nodes).
- **Debounced Persistence:** Changes are persisted to Supabase via `updateNote` after a delay to batch updates.
- **Real-time Propagation:** Supabase real-time pushes changes to other connected clients, triggering state updates via the context listener.

## Testing Patterns (Aspirational/Planned)

### Component Testing

- Unit tests for utility functions and potentially simple components.
- Integration tests focusing on context interactions and data flow (e.g., creating a note updates the list).
- Testing canvas interactions might require specialized tools or approaches (e.g., simulating drag events).

### Error Handling

- `try...catch` blocks in asynchronous operations (Supabase calls).
- User-friendly error messages via toasts.
- Consistent logging of errors to the console for debugging.

_2025-04-27 03:22:00 - Added patterns related to conditional rendering and handling different note types._
