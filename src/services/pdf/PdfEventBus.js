/**
 * @fileoverview Synchronous, ordered event bus for the PDF processing pipeline.
 *
 * Mirrors the Domain Events pattern:
 *  - Handlers are called synchronously in subscription order.
 *  - subscribe() returns an unsubscribe function.
 *  - Events are keyed by their class name — no magic strings.
 */

class PdfEventBus {
  /** @type {Map<string, Function[]>} */
  #handlers = new Map();

  /**
   * Subscribe a handler to an event type.
   *
   * @param {Function} EventClass - The event class constructor (key = EventClass.name)
   * @param {(event: object) => void} handler
   * @returns {() => void} Unsubscribe function
   */
  subscribe(EventClass, handler) {
    const key = EventClass.name;
    if (!this.#handlers.has(key)) {
      this.#handlers.set(key, []);
    }
    this.#handlers.get(key).push(handler);

    return () => {
      const list = this.#handlers.get(key);
      if (!list) return;
      const idx = list.indexOf(handler);
      if (idx !== -1) list.splice(idx, 1);
    };
  }

  /**
   * Dispatch an event synchronously to all subscribers in order.
   *
   * @param {object} event - Instance of an event class
   */
  dispatch(event) {
    const list = this.#handlers.get(event.constructor.name) ?? [];
    for (const handler of list) handler(event);
  }
}

/** Singleton bus shared across the entire PDF pipeline */
export const pdfEventBus = new PdfEventBus();
