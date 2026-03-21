/**
 * @fileoverview User domain model.
 * Represents an authenticated user of the application.
 */

/**
 * @typedef {Object} User
 * @property {string} id           - Unique user identifier.
 * @property {string} email        - User's email address.
 * @property {string} displayName  - Name displayed in the UI (e.g. "Giomus").
 * @property {string} username     - Short handle shown in the header (e.g. "@giomus").
 * @property {string|null} avatarUrl - Optional URL for the user's profile picture.
 */

/**
 * Creates a User object from raw data.
 * @param {Partial<User>} data
 * @returns {User}
 */
export function createUser(data) {
  return {
    id: data.id ?? '',
    email: data.email ?? '',
    displayName: data.displayName ?? 'User',
    username: data.username ?? '@user',
    avatarUrl: data.avatarUrl ?? null,
  };
}
