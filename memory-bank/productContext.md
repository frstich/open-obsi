# Product Context

This file provides a high-level overview of the project and the expected product that will be created.

2025-04-27 02:07:22 - Initial project analysis

## Project Goal

Open-Obsi is a web-based note-taking application built with modern web technologies. Its primary goals are:

- Provide a clean, user-friendly interface for managing notes and folders
- Support markdown-based note editing with real-time preview
- Enable secure multi-user support with authentication
- Offer folder organization for better note management

## Key Features

- Authentication System
  - User signup/login via Supabase authentication
  - Protected routes and private content
- Notes Management
  - Create, read, update, and delete notes
  - Markdown support with real-time preview
  - Automatic note saving
  - Note organization with folders
- Folder System

  - Create and manage folders
  - Move notes between folders
  - Hierarchical organization

- Real-time Updates
  - Live synchronization using Supabase real-time subscriptions
  - Instant UI updates on data changes

## Overall Architecture

1. Frontend Framework

   - React + TypeScript
   - Vite as build tool
   - TailwindCSS for styling
   - Radix UI for accessible components

2. State Management

   - React Context for global state
   - TanStack Query for data fetching
   - Real-time subscriptions with Supabase

3. Backend/Database

   - Supabase for backend services
   - PostgreSQL database
   - Row Level Security (RLS) for data protection

4. Key Components
   - NotesProvider: Global state management
   - Editor: Note editing interface
   - Sidebar: Navigation and folder management

_2025-04-27 02:07:22 - Initial architecture documentation_
