import { Patcher } from "./patcher";
import { LitElement, html } from "lit";
import { property, state } from "lit/decorators";
import { LCCEvent, LCCEventListener } from "./event-bus";
import {
  CardConfig,
  HassElement,
  HomeAssistant,
  LCCConfigOptions,
  Visibility,
} from "./types";

export abstract class LocalConditionalCard extends LitElement {
  /** Patcher used for inter-element communication */
  protected abstract get HassPatcher(): Patcher;

  @property({ reflect: true })
  public default: Visibility = "show";

  @property({ reflect: true })
  public scope?: string;

  @state()
  protected _visible: boolean = false;

  @state()
  protected _card?: HassElement;

  private _hass?: HomeAssistant;

  private _subscribed?: [string, LCCEventListener];

  /**
   * Re-subscribe to events when element is attached to the DOM
   */
  connectedCallback() {
    super.connectedCallback();
    this._subscribe();
  }

  /**
   * Unsubscribe from events when element is removed from the DOM
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribe();
  }

  /**
   * Receive new config options from HASS
   *
   * @param config
   */
  setConfig(config: LCCConfigOptions) {
    if (!config.scope)
      throw new Error(
        "Card config is missing a `scope` property. This is required"
      );
    if (config.default && !["show", "hide"].includes(config.default))
      throw new Error("Config `default` must be either `show` or `hide`");

    this.scope = config.scope;
    this.default = config.default || "show";
    this._visible = this.default === "show";

    this._subscribe();
    this._createCard(config.card);
  }

  /**
   * Receive HASS API instance from HomeAssistant.
   * Make sure it's patched, and then pass it to the child card
   */
  set hass(hass: HomeAssistant) {
    this.HassPatcher.ensureHassIsPatched(hass);
    if (this._card) {
      this._card.hass = hass;
    }
  }

  getCardSize(): number {
    if (this._visible) {
      return this._card ? this._card.getCardSize() : 0;
    } else {
      return 0;
    }
  }

  render() {
    let visible = !!this._visible;
    if (this._card && this._card.localName === "hui-error-card") {
      visible = true;
    }
    this.style.setProperty("display", visible ? "" : "none");
    this.style.setProperty("margin", "0");

    if (visible) {
      return html`${this._card}`;
    }
    return html``;
  }

  /**
   * Create the child card from config
   *
   * @param {*} config
   */
  private _createCard(config: CardConfig): void {
    let tag = config.type;
    if (tag.startsWith("custom:")) tag = tag.substring("custom:".length);
    else tag = `hui-${tag}-card`;

    try {
      if (!customElements.get(tag)) {
        customElements.whenDefined(tag).then(() => {
          let element = createHassElement(tag);
          element.setConfig(config);
          element.hass = this._hass;
          this._card = element;
        });
      } else {
        let element = createHassElement(tag);
        element.setConfig(config);
        element.hass = this._hass;
        this._card = element;
      }
    } catch (err) {
      console.error(tag, err);
      this._createCard({
        type: "error",
        error: (err as Error).message,
        origConfig: config,
      });
    }
  }

  /**
   * Subscribe to patcher events
   */
  private _subscribe() {
    if (this._subscribed) {
      this._unsubscribe();
    }
    if (this.scope) {
      this.HassPatcher.subscribe(this.scope, this._eventBusListener);
      this._subscribed = [this.scope, this._eventBusListener];
    }
  }

  /**
   * Unsubscribe from patcher events
   */
  private _unsubscribe() {
    if (this._subscribed) {
      this.HassPatcher.unsubscribe(...this._subscribed);
      this._subscribed = undefined;
    }
  }

  /**
   * Handles events coming from the bus
   * @param event
   */
  private _eventBusListener: LCCEventListener = (event: LCCEvent) => {
    switch (event.action) {
      case "toggle":
        this._visible = !this._visible;
    }
  };
}

export function createHassElement(tag: string): HassElement {
  return document.createElement(tag) as HassElement;
}

/**
 * Creates a subclass of LocalConditionalCard that is bound to the patcher
 * instances passed as an argument
 *
 * @param patcher Patcher instance
 * @returns
 */
export function createPatcherBoundCard(patcher: Patcher): {
  new (): LocalConditionalCard;
} {
  class BoundCard extends LocalConditionalCard {
    protected get HassPatcher(): Patcher {
      return patcher;
    }
  }

  return BoundCard;
}
