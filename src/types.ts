import type { Action } from "./constants";
import { PATCHED_FLAG } from "./patcher";

/**
 * Dummy typing for the HomeAssistant API instance
 */
export interface HomeAssistant {
  callService(domain: string, service: string, serviceData: any): void;
  [PATCHED_FLAG]?: boolean;
}

/**
 * Dummy typing for the HomeAssistant DOM element
 */
export interface HomeAssistantElement extends Element {
  hassChanged(hass: HomeAssistant, hass2: HomeAssistant): void;
}

/**
 * Callback used to notify when a hass instance has been patched
 */
export type OnHassPatchedCallback = (hass: HomeAssistant) => void;

export type Visibility = "show" | "hide";

export interface CardConfig {
  type: string;
  error?: string;
  origConfig?: CardConfig;
}

export interface LCCConfigOptions {
  scope: string;
  default?: Visibility;
  card: any;
}

export interface HassElement extends HTMLElement {
  set hass(hass: HomeAssistant | undefined);
  setConfig(config: CardConfig): void;
  getCardSize(): number;
  localName: string;
}
