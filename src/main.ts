import { EventBus } from "./event-bus";
import { LocalConditionalCard, createPatcherBoundCard } from "./card";

import { createPatcher } from "./patcher";
import { ELEMENT_NAME } from "./constants";
import { HomeAssistantElement, OnHassPatchedCallback } from "./types";

/* Create a function that will notify HomeAssistant when we have patched HASS */
const notifyHomeAssistantOfHassPatch: OnHassPatchedCallback = (hass) => {
  const el = document.querySelector<HomeAssistantElement>("home-assistant");
  if (!el) throw new Error("Failed to find HomeASsistant UI");

  el.hassChanged(hass, hass);
};

/* Create EventBus for passing events between elements */
const eventBus = new EventBus();

/* Create the patcher instance that will be used by all element instances */
const patcher = createPatcher(eventBus, notifyHomeAssistantOfHassPatch);

/* Define our custom element bound to the patcher created above */
customElements.define(ELEMENT_NAME, createPatcherBoundCard(patcher));
