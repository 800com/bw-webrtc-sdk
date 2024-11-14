# Changelog

- **14 Nov 2024**
  - Added a condition to check devices only in the browser.

  **Code Change**: Lines 1344-1351

  ```javascript
  _detectBrowser() {
    if (typeof document === "undefined") {
      this.browser = "other";
      this.browserName = "unknown";
      this.browserVersion = 0;
      return;
    }
  }

- **Init commit**
  - Added default exports

  ```javascript
    module.exports = {
      AudioCodesSession,
      AudioCodesUA,
    }