import { Action, Actions, DOMAIN } from "./constants";
import { EventBus } from "./event-bus";
import {
  HomeAssistant,
  HomeAssistantElement,
  OnHassPatchedCallback,
} from "./types";

export const PATCHED_FLAG = Symbol("local-conditional-card__PATCHED");

export interface Patcher {
  ensureHassIsPatched(hass: HomeAssistant): void;
  subscribe: EventBus["subscribe"];
  unsubscribe: EventBus["unsubscribe"];
}

/**
 * Checks if a HASS instance has already been patched
 *
 * @param hass HomeAssistant API instANCE
 * @returns
 */
export function is_hass_instance_patched(hass: HomeAssistant): boolean {
  return hass[PATCHED_FLAG] === true;
}

/**
 * Mark a HASS instance as patched
 *
 * @param hass HomeAssistant API instance
 */
export function mark_hass_instance_patched(hass: HomeAssistant): void {
  hass[PATCHED_FLAG] = true;
}

/**
 * Notify HomeAssistant that we've patched the HASS instance
 *
 * @param getElement Function that returns a HomeAssistantElement to be notified
 * @param hass Hass API instance
 */
export function notify_browser_of_hass_patch(
  getElement: () => HomeAssistantElement,
  hass: HomeAssistant
): void {
  getElement().hassChanged(hass, hass);
}

export function is_locally_consumable_service_call(
  domain: string,
  service: string,
  serviceData: any
): boolean {
  if (domain !== DOMAIN) return false;
  if (!Actions.includes(service)) return false;
  return true;
}

/**
 * Patch a HASS instance so that we can intercept service calls
 * Sets the PATCHED_FLAG to true once its been patched.
 *
 * @param hass HomeAssistant API instance
 */
export const patch_hass_instance = (
  hass: HomeAssistant,
  eventBus: EventBus
): void => {
  const originalCallService = hass.callService;
  hass.callService = (domain, service, serviceData) => {
    if (is_locally_consumable_service_call(domain, service, serviceData)) {
      eventBus.dispatchAction(service as Action, serviceData.ids);
    } else {
      originalCallService(domain, service, serviceData);
    }
  };
  mark_hass_instance_patched(hass);
};

/**
 * Patch a HASS instance if it hasn't already been patched and
 * if so call the passed notify function
 *
 * @param notifyPatched
 * @param hass
 */
export function ensure_hass_instance_patched(
  notifyPatched: OnHassPatchedCallback,
  eventBus: EventBus,
  hass: HomeAssistant
): void {
  if (!is_hass_instance_patched(hass)) {
    patch_hass_instance(hass, eventBus);
    notifyPatched(hass);
  }
}

/**
 * Create a patcher instance
 *
 * @param notifyPatched
 */
export const createPatcher = (
  eventBus: EventBus,
  notifyPatched: OnHassPatchedCallback
): Patcher => {
  return {
    ensureHassIsPatched: ensure_hass_instance_patched.bind(
      null,
      notifyPatched,
      eventBus
    ),
    subscribe: eventBus.subscribe.bind(eventBus),
    unsubscribe: eventBus.unsubscribe.bind(eventBus),
  };
};
