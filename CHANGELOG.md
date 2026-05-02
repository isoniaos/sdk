# Changelog

All notable changes to `@isonia/sdk` are documented here.

`package.json.version` uses SemVer without a leading `v`. Git tags use the matching version with a leading `v`, and GitHub dependency refs may point at those tags.

## [Unreleased]

## [0.5.0-alpha.6]

### Added

- Added this changelog for release tracking and future release notes.

### Changed

- SDK TypeScript builds now resolve `@isonia/types` through the declared package dependency instead of a sibling repository path alias.
- Refreshed README install guidance for the v0.5 Developer Preview compatibility set.

## [0.5.0-alpha.5]

### Changed

- Updated package metadata for the v0.5 alpha SDK tag.

## [0.5.0-alpha.2]

### Added

- Typed Control Plane REST client and path helper coverage for diagnostics and organization policy list reads.
- GitHub-tag based package metadata for alpha installation.

## [0.1.0]

### Added

- Initial typed Control Plane REST client foundation.
- Endpoint path construction helpers.
- Shared response typing through `@isonia/types`.

[Unreleased]: https://github.com/isoniaos/sdk/compare/v0.5.0-alpha.6...HEAD
[0.5.0-alpha.6]: https://github.com/isoniaos/sdk/releases/tag/v0.5.0-alpha.6
[0.5.0-alpha.5]: https://github.com/isoniaos/sdk/releases/tag/v0.5.0-alpha.5
[0.5.0-alpha.2]: https://github.com/isoniaos/sdk/releases/tag/v0.5.0-alpha.2
[0.1.0]: https://github.com/isoniaos/sdk/releases/tag/v0.1.0
