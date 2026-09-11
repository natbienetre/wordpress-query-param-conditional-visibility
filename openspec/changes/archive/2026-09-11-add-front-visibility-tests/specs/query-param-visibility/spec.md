## Purpose

Defines how a block's stored query-parameter conditions determine whether it is shown or hidden on the front end, and how the page is cleaned up after a block is hidden.

## ADDED Requirements

### Requirement: A block is shown if any of its stored conditions matches the current URL
A block carries a set of query-parameter conditions (key/value pairs). On the front end, the system SHALL compare each condition's value against the current page URL's query string. The block SHALL be shown if at least one condition matches; it SHALL be hidden only if none of its conditions match.

#### Scenario: Single condition matches
- **WHEN** a block has one condition `key=value` and the current URL's query string contains `key=value`
- **THEN** the block is shown

#### Scenario: Single condition does not match a present, different value
- **WHEN** a block has one condition `key=value` and the current URL's query string contains `key=other`
- **THEN** the block is hidden

#### Scenario: Single condition's query parameter is absent
- **WHEN** a block has one condition `key=value` and the current URL's query string does not contain `key` at all
- **THEN** the block is hidden

#### Scenario: Any one of several conditions matching is enough to show the block
- **WHEN** a block has conditions `a=1` and `b=2`, and the current URL's query string contains `b=2` but not `a=1`
- **THEN** the block is shown

#### Scenario: None of several conditions match
- **WHEN** a block has conditions `a=1` and `b=2`, and the current URL's query string contains neither
- **THEN** the block is hidden

### Requirement: A shown block no longer carries its visibility marker
Once a block is determined to be shown, the system SHALL remove the marker that identifies it as having conditional visibility, so it is not reprocessed on subsequent passes and carries no leftover marker in the rendered page.

#### Scenario: Marker removed after a block is shown
- **WHEN** a block's conditions cause it to be shown
- **THEN** the block's conditional-visibility marker is removed from the rendered element

### Requirement: Hiding a block does not remove unrelated page content
When a block is hidden, the system SHALL remove ancestor elements that are left with no remaining content, so empty wrapper structure does not linger in the page. The system SHALL NOT remove an ancestor that still contains non-text content (for example, an image or embedded media) after the hidden block is removed, and SHALL NOT remove any element at or above the page's site root.

#### Scenario: An ancestor left with no content is removed
- **WHEN** a block is hidden and its immediate wrapper has no other content once the block is removed
- **THEN** that wrapper is also removed

#### Scenario: An ancestor with remaining non-text content is preserved
- **WHEN** a block is hidden and its wrapper contains other non-text content (for example, an image) once the block is removed
- **THEN** that wrapper and its non-text content are preserved

#### Scenario: Cleanup never reaches above the site root
- **WHEN** a block is hidden and every ancestor up to the page's site root ends up with no remaining content
- **THEN** the site root and everything above it (including the document body and root element) are preserved
