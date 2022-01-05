import type { Action } from "./constants";

/**
 * Custom event class that allows us to pass an
 * action as a property of the event
 */
export class LCCEvent extends Event {
  readonly action: Action;

  constructor(type: string, action: Action) {
    super(type);
    this.action = action;
  }
}

export type LCCEventListener = (event: LCCEvent) => void;

/**
 * Custom Event bus for simple in-memory pub/sub
 */
export class EventBus extends EventTarget {
  subscribe(id: string, listener: LCCEventListener): void {
    super.addEventListener(id, listener as EventListener);
  }

  unsubscribe(id: string, listener: LCCEventListener): void {
    super.removeEventListener(id, listener as EventListener);
  }

  dispatchAction(action: Action, ids: string[]) {
    ids.forEach((id) => {
      this.dispatchEvent(new LCCEvent(id, action));
      console.log("Emit", id, action);
    });
  }
}
