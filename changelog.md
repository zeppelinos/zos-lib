# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New freezable implementation directory wrapper
- New base implementation directory wrapper
- Address getter function for custom contract wrappers

### Changed
- Refactor directory wrapper to represent the real implementation directories hierarchy
- Refactor package wrapper allowing to work with any directory type
- Refactor `App` and `Package` wrappers to work with new directory wrapper models
- Index event arguments to improve querying

### Removed
- Remove `Release` contract and wrapper
