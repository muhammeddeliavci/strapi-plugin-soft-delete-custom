# Contributing to Strapi Soft Delete Plugin

Thank you for your interest in contributing! We welcome pull requests, bug reports, and feature requests.

## Development Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/strapi-plugin-soft-delete-custom.git
    cd strapi-plugin-soft-delete-custom
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Building

To build the plugin:
```bash
npm run build
```

This will generate the `dist/` directory.

## Testing

Currently, we rely on manual testing within a Strapi application.
1.  Link the plugin to a test Strapi project.
2.  Verify functionality (soft delete, restore, permanent delete).

## Pull Request Process

1.  Fork the repository.
2.  Create a new branch for your feature or fix.
3.  Commit your changes with clear messages.
4.  Push to your fork and submit a Pull Request.
5.  Ensure your code follows the existing style (TypeScript, Prettier).

## Code Style

-   Use TypeScript for all new code.
-   Follow the existing directory structure.
-   Ensure no linting errors (if linting is set up).
