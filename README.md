# React PageBuilder

Ein komponentenbasierter PageBuilder auf Basis von React. Das System bietet Kernkomponenten und kann durch eigene Komponenten erweitert werden. Die Konfiguration erfolgt über TypeScript und npm.

## Features

- Drag & Drop PageBuilder
- Erweiterbar mit eigenen Komponenten
- Kernkomponenten für Layout und Inhalt
- Einstellungen für Spalten, Abstände, Farben etc.

## Installation

```bash
npm install
```

## Entwicklung starten

```bash
npm run start
```

## Build erstellen

```bash
npm run build
```

## Makefile Kommandos

Das Projekt enthält eine `Makefile` mit folgenden Kommandos:

| Kommando            | Beschreibung                                                                 |
|---------------------|------------------------------------------------------------------------------|
| **make all**        | Erstellt das Plugin (Standardziel).                                          |
| **make release-patch** | Erhöht die Patch-Version, pusht und veröffentlicht das Paket.              |
| **make release-minor** | Erhöht die Minor-Version, pusht und veröffentlicht das Paket.              |
| **make release-major** | Erhöht die Major-Version, pusht und veröffentlicht das Paket.              |
| **make publish**    | Authentifiziert und veröffentlicht das Paket auf GitHub Packages.             |
| **make login**      | Erstellt eine lokale `.npmrc` für die Authentifizierung mit GitHub Packages.  |

**Hinweis:** Für die Authentifizierung mit GitHub Packages wird ein `GITHUB_TOKEN` in einer `.env` Datei benötigt.

### Beispiel für Release und Publish

```bash
make release-patch
make publish
```

## Lizenz

MIT

---
Stand: 04.12.2025
