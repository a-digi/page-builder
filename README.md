# React PageBuilder

A component-based PageBuilder built on top of React. The system provides core components and can be extended with custom components. Configuration is done via TypeScript and npm.

## Features

- Drag & Drop PageBuilder
- Extendable with custom components
- Core components for layout and content
- Settings for columns, spacing, colors, etc.

## Installation

```bash
npm install
```

## Start Development

```bash
npm run start
```

## Build Production Version

```bash
npm run build
```

## Makefile Commands

The project includes a `Makefile` with the following commands:

| Command                | Description                                                                |
|------------------------|----------------------------------------------------------------------------|
| **make all**           | Builds the plugin (default target).                                        |
| **make release-patch** | Increases the patch version, pushes and publishes the package.              |
| **make release-minor** | Increases the minor version, pushes and publishes the package.              |
| **make release-major** | Increases the major version, pushes and publishes the package.              |
| **make publish**       | Authenticates and publishes the package to GitHub Packages.                 |
| **make login**         | Creates a local `.npmrc` for authentication with GitHub Packages.           |

**Note:** For authentication with GitHub Packages, a `GITHUB_TOKEN` is required in a `.env` file.

### Example for Release and Publish

```bash
make release-patch
make publish
```

## License

MIT

---
As of: 04.12.2025
