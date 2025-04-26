# Open Obsi Notes Nexus

Open Obsi Notes Nexus is a modern note-taking application designed to help users organize their thoughts, ideas, and tasks efficiently. Built with a focus on simplicity and performance, it leverages cutting-edge technologies to deliver a seamless user experience.

## Features

- **Rich Text Editing**: Create and format notes with ease using a powerful markdown editor.
- **Folder Organization**: Organize notes into folders for better categorization.
- **Search Functionality**: Quickly find notes with an intuitive search feature.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Supabase Integration**: Securely store and manage notes in the cloud.

## Technologies Used

This project is built using:

- **Vite**: A fast and modern build tool.
- **TypeScript**: Ensures type safety and better developer experience.
- **React**: A library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **Supabase**: A backend-as-a-service for authentication and database management.

## How It Works

1. **Folder and Note Management**:

   - Users can create folders to organize their notes.
   - Notes can be added, edited, and deleted within folders.

2. **Markdown Rendering**:

   - Notes are written in markdown and rendered into rich text for better readability.

3. **Cloud Storage**:

   - Notes and folders are stored in a Supabase database, ensuring data persistence and accessibility.

4. **Search and Navigation**:
   - A sidebar allows users to navigate between folders and notes.
   - A search bar helps users quickly locate specific notes.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

Follow these steps to set up the project locally:

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd open-obsi-notes-nexus

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

- **src/components**: Contains reusable UI components.
- **src/pages**: Includes the main application pages.
- **src/context**: Manages global state and context for the application.
- **src/hooks**: Custom hooks for specific functionalities.
- **src/integrations**: Handles external integrations like Supabase.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Support

For any questions or issues, please contact the project maintainers.
