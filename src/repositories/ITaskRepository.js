/**
 * @fileoverview ITaskRepository — Abstract interface for task data persistence.
 *
 * Concrete implementations (e.g. MockTaskRepository, ApiTaskRepository)
 * must extend this class and override every method.
 *
 * This follows the Repository Pattern, decoupling the application from any
 * specific storage backend (localStorage, REST API, Firebase, etc.).
 */

export class ITaskRepository {
  /**
   * @param {import('../domain/models/User').User} user - The currently authenticated user.
   */
  constructor(user) {
    if (!user || !user.id) {
      throw new Error('ITaskRepository requires a valid authenticated user.');
    }
    /** @type {import('../domain/models/User').User} */
    this.user = user;
  }

  // ─── Daily Tasks ────────────────────────────────────────────────────────────


  /**
   * Fetches all daily tasks for the current user.
   * @returns {Promise<import('../domain/models/DailyTask').DailyTask[]>}
   */
  async getDailyTasks() {
    throw new Error('ITaskRepository.getDailyTasks() must be implemented.');
  }

  /**
   * Persists a new daily task.
   * @param {import('../domain/models/DailyTask').DailyTask} task
   * @returns {Promise<import('../domain/models/DailyTask').DailyTask>} The saved task.
   */
  // eslint-disable-next-line no-unused-vars
  async addDailyTask(task) {
    throw new Error('ITaskRepository.addDailyTask() must be implemented.');
  }

  /**
   * Updates an existing daily task by ID.
   * @param {string} id
   * @param {Partial<import('../domain/models/DailyTask').DailyTask>} updates
   * @returns {Promise<import('../domain/models/DailyTask').DailyTask>}
   */
  // eslint-disable-next-line no-unused-vars
  async updateDailyTask(id, updates) {
    throw new Error('ITaskRepository.updateDailyTask() must be implemented.');
  }

  /**
   * Marks a specific day as complete for a daily task in a given week.
   * @param {string} taskId
   * @param {string} weekId   - Week identifier, e.g. "2024-W12".
   * @param {number} day      - ISO day number (1=Mon … 7=Sun).
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async completeDailyTask(taskId, weekId, day) {
    throw new Error('ITaskRepository.completeDailyTask() must be implemented.');
  }

  /**
   * Unmarks a specific day completion for a daily task.
   * @param {string} taskId
   * @param {string} weekId
   * @param {number} day
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async uncompleteDailyTask(taskId, weekId, day) {
    throw new Error('ITaskRepository.uncompleteDailyTask() must be implemented.');
  }

  // ─── Weekly Tasks ───────────────────────────────────────────────────────────

  /**
   * Fetches all weekly tasks for the current user.
   * @returns {Promise<import('../domain/models/WeeklyTask').WeeklyTask[]>}
   */
  async getWeeklyTasks() {
    throw new Error('ITaskRepository.getWeeklyTasks() must be implemented.');
  }

  /**
   * Persists a new weekly task.
   * @param {import('../domain/models/WeeklyTask').WeeklyTask} task
   * @returns {Promise<import('../domain/models/WeeklyTask').WeeklyTask>}
   */
  // eslint-disable-next-line no-unused-vars
  async addWeeklyTask(task) {
    throw new Error('ITaskRepository.addWeeklyTask() must be implemented.');
  }

  /**
   * Updates an existing weekly task by ID.
   * @param {string} id
   * @param {Partial<import('../domain/models/WeeklyTask').WeeklyTask>} updates
   * @returns {Promise<import('../domain/models/WeeklyTask').WeeklyTask>}
   */
  // eslint-disable-next-line no-unused-vars
  async updateWeeklyTask(id, updates) {
    throw new Error('ITaskRepository.updateWeeklyTask() must be implemented.');
  }

  /**
   * Increments the completion counter for a weekly task in a given week.
   * @param {string} taskId
   * @param {string} weekId
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async completeWeeklyTask(taskId, weekId) {
    throw new Error('ITaskRepository.completeWeeklyTask() must be implemented.');
  }

  /**
   * Decrements the completion counter for a weekly task (undo).
   * @param {string} taskId
   * @param {string} weekId
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async uncompleteWeeklyTask(taskId, weekId) {
    throw new Error('ITaskRepository.uncompleteWeeklyTask() must be implemented.');
  }

  // ─── Delete ─────────────────────────────────────────────────────────────────

  /**
   * Deletes a task (daily or weekly) by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async deleteTask(id) {
    throw new Error('ITaskRepository.deleteTask() must be implemented.');
  }

  // ─── History ────────────────────────────────────────────────────────────────

  /**
   * Retrieves the weekly history records, ordered from most recent to oldest.
   * @returns {Promise<import('../domain/models/WeekHistory').WeekHistory[]>}
   */
  async getWeekHistory() {
    throw new Error('ITaskRepository.getWeekHistory() must be implemented.');
  }

  /**
   * Persists (or updates) a weekly history snapshot.
   * @param {import('../domain/models/WeekHistory').WeekHistory} history
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async saveWeekHistory(history) {
    throw new Error('ITaskRepository.saveWeekHistory() must be implemented.');
  }

  async getBaulTasks(){
    throw new Error('ITaskRepository.getBaulTask() must be implemented.');
  }

  /**
   * Save a simplier task in a baul
   * @param {{ id?: string, title: string }} task
   */
  async upsertBaulTask(){
    throw new Error('ITaskRepository.upsertBaulTask() must be implemented.');
  }
  async deleteBaulTask(){
    throw new Error('ITaskRepository.deleteBaulTask() must be implemented.');
  }
}
