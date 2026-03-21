/**
 * @fileoverview IAuthRepository — Abstract interface for authentication.
 *
 * Concrete implementations (e.g. MockAuthRepository, SupabaseAuthRepository)
 * must extend this class and override every method.
 *
 * This follows the Repository Pattern, decoupling business logic from the
 * underlying auth provider (local mock, Firebase, Supabase, etc.).
 */

export class IAuthRepository {
  /**
   * Authenticates a user with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<import('../domain/models/User').User>}
   * @throws {Error} If credentials are invalid.
   */
  // eslint-disable-next-line no-unused-vars
  async login(email, password) {
    throw new Error('IAuthRepository.login() must be implemented.');
  }

  /**
   * Registers a new user account.
   * @param {string} email
   * @param {string} password
   * @param {string} displayName - Human-readable name for the new account.
   * @returns {Promise<import('../domain/models/User').User>}
   * @throws {Error} If registration fails (e.g. email already in use).
   */
  // eslint-disable-next-line no-unused-vars
  async register(email, password, displayName) {
    throw new Error('IAuthRepository.register() must be implemented.');
  }

  /**
   * Signs the current user out of the application.
   * @returns {Promise<void>}
   */
  async logout() {
    throw new Error('IAuthRepository.logout() must be implemented.');
  }

  /**
   * Returns the currently authenticated user, or null if none.
   * @returns {Promise<import('../domain/models/User').User | null>}
   */
  async getCurrentUser() {
    throw new Error('IAuthRepository.getCurrentUser() must be implemented.');
  }
}
