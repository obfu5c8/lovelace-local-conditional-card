const {
  is_hass_instance_patched,
  PATCHED_FLAG,
  mark_hass_instance_patched,
  notify_browser_of_hass_patch,
} = require("../src/patcher");

describe("is_hass_instance_patched()", () => {
  it("returns true  if PATCHED_FLAG is set", () => {
    const mockHass = {
      [PATCHED_FLAG]: true,
    };
    const result = is_hass_instance_patched(mockHass);
    expect(result).toBe(true);
  });

  it("returns false if PATCHED_FLAG is not set", () => {
    const mockHass = {
      // [PATCHED_FLAG]: true
    };
    const result = is_hass_instance_patched(mockHass);
    expect(result).toBe(false);
  });

  it("returns false if PATCHED_FLAG is set to anything but `true`", () => {
    const mockHass = {
      [PATCHED_FLAG]: "definitively not true",
    };
    const result = is_hass_instance_patched(mockHass);
    expect(result).toBe(false);
  });
});

describe("mark_hass_instance_patched()", () => {
  it("sets the PATCHED_FLAG correctly on the passed object", () => {
    const mockObj = {};

    mark_hass_instance_patched(mockObj);

    expect(mockObj[PATCHED_FLAG]).toBeDefined();
    expect(mockObj[PATCHED_FLAG]).toBe(true);
  });
});

describe("notify_browser_of_hass_patch", () => {
  it("correctly retrieves the element from the factory and calls hassChanged() on it", () => {
    const hassChanged = jest.fn();
    const mockFactory = () => {
      return {
        hassChanged,
      };
    };
    const mockHass = {};

    notify_browser_of_hass_patch(mockFactory, mockHass);

    expect(hassChanged.mock.calls.length).toBe(1);
    expect(hassChanged.mock.calls[0][0]).toBe(mockHass);
  });
});

describe("patch_hass_instance", () => {});
