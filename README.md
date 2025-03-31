# Scrum

A lightweight, offline-first Scrum board application for managing issues. Built with modern web technologies and powered by a local database that runs directly in your browser.

## Features

- **Offline-First**: Works entirely in your browser using IndexedDB via PGlite
- **Drag and Drop**: Intuitive interface for moving issues between columns
- **Multiple Boards**: Create and manage multiple project boards
- **Customizable Columns**: Tailor your workflow with custom columns
- **Issue Tracking**: Create, organize, and prioritize issues
- **Filtering**: Easily find what you're looking for

## Technology Stack

- **Frontend**: React, React Router
- **Database**: PGlite (PostgreSQL in the browser via IndexedDB)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Primitives**: Radix UI

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js
  - Version: [.nvmrc](.nvmrc)
- PNPM
  - Version: [package.json#packageManager](package.json#L5)

### Installation

1. Clone the repository
   ```
   git clone ssh@github.com:ryuudotgg/scrum.git
   cd scrum
   ```

2. Install dependencies
   ```
   pnpm install
   ```

3. Start the development server
   ```
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Creating a Board

1. Navigate to the board list page
2. Click on "Create New Board"
3. Enter a title and optional description
4. Click "Create"

### Adding Columns

1. Open a board
2. Click "Add Column"
3. Enter a name for the column
4. Click "Add"

### Creating Issues

1. Navigate to a board
2. Find the column where you want to add an issue
3. Click "Add Issue" or the "+" button
4. Enter a title and description
5. Click "Create"

### Moving Issues

- Simply drag and drop issues between columns
- The order is automatically saved

## Development

### Database Schema

The application uses a relational database with the following main tables:
- `boards`: Stores information about each Scrum board
- `columns`: Represents the columns in each board (e.g., "To Do", "In Progress", "Done")
- `issues`: Contains the tasks/stories that are organized within columns

### Project Structure

- `/app`: Main application code
  - `/database`: Database configuration and schema
  - `/routes`: Application routes and page components
  - `/components`: Reusable UI components

## License

This project is licensed under an MIT license. See [LICENSE.md](LICENSE.md) for more details.

## Authors

- Ryuu ([@ryuudotgg](https://github.com/ryuudotgg))
