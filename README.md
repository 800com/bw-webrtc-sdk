# Custom Bandwidth WebRTC SDK

This repository is a custom integration of Bandwidth’s WebRTC SDK, optimized for compatibility across both React Native and web environments. The SDK directly uses the `AudioCodesUA` and `AudioCodesSession` classes, removing redundant wrappers and maintaining a cleaner, more modular setup.

### Why This Custom SDK?

The original `@bandwidth/bw-webrtc-sdk` package provided limited value, as it was essentially one large bundled file combining:
- **JsSIP**: A popular SIP library for JavaScript
- **AudioCodes SDK**: A proprietary WebRTC SDK

The Bandwidth package wrapped these components in additional classes (`BandwidthUA`, `BandwidthSession`), adding only minimal modifications (primarily logging adjustments, such as renaming "AC" to "BW" in logs). This created several issues:
- **Bundling Challenges**: The monolithic file was not modular, making it incompatible with Metro in React Native and difficult to integrate into modern web bundlers.
- **Incompatibility with React Native**: AudioCodes SDK, as bundled by Bandwidth, was not React Native-friendly by default.
- **No TypeScript Support**: The package lacked TypeScript definitions, complicating development.

This custom SDK resolves these issues by:
- Importing **JsSIP** as a separate dependency to leverage its modular design.
- Including a standalone version of the **AudioCodes SDK** as a separate file.
- Directly exporting `AudioCodesUA` and `AudioCodesSession` without additional wrappers, simplifying the SDK’s interface.
- Adding TypeScript definitions for better developer experience.

### Project Structure

1. **[JsSIP](https://www.npmjs.com/package/jssip)**  
   JsSIP is included as a dependency in `package.json` to leverage its modular structure for SIP handling in both React Native and web environments.

2. **AudioCodes SDK**  
   The AudioCodes WebRTC SDK, unavailable on npm, is included as a custom minified file with a note referencing its source.

3. **AudioCodesUA and AudioCodesSession Direct Export**  
   The SDK directly exposes `AudioCodesUA` and `AudioCodesSession`, providing a clean, simplified interface without unnecessary wrappers.

### Installation

1. Add this repository as a dependency in your project:
   ```sh
   npm install git@github.com:800com/bw-webrtc-sdk.git
   ```

2. Install additional dependencies as needed:
   ```sh
   npm install jssip
   ```

### Usage

For both React Native and web applications, import `AudioCodesUA` and `AudioCodesSession` directly:

```typescript
import { AudioCodesUA, AudioCodesSession } from '@800/bw-webrtc-sdk';
```

This approach eliminates unnecessary abstraction layers, reducing complexity and making the SDK clearer and easier to integrate.

### Repository Structure

- `src/index.js`: A standalone version of the AudioCodes SDK with our small adjustments
- `src/index.d.ts`: TypeScript definitions for AudioCodes classes.
- `CHANGELOG.md`: Changelog of our changes in AudioCodes SDK

### How `index.js` Was Created

The `index.js` file in this SDK was created by following these steps:
- The `@bandwidth/bw-webrtc-sdk` package’s original `index.js` file was formatted to reveal its contents.
- It was discovered that the file contained:
  - A bundled version of JsSIP
  - A bundled version of the AudioCodes SDK
  - Bandwidth’s classes that merely changed log names (e.g., from “AC” to “BW”) and provided no functional enhancements.
- The bundled JsSIP code was removed from the file and replaced with `require('jssip')` to leverage the latest version as a dependency.
- The bundled AudioCodes SDK was removed and replaced with a formatted version of the latest standalone file.
- Exports were updated to include only the `AudioCodesUA` and `AudioCodesSession` classes directly, without additional Bandwidth wrappers.

### Documentation and tutorials

- [AudioCodes WebRTC tutorial with examples](https://demo.webrtc.audiocodes.com/sdk/webrtc-api-base/examples/tutorial.html)
- [AudioCodes WebRTC API documentation](https://www.audiocodes.com/media/13433/webrtc-web-browser-client-sdk-api-reference-guide.pdf)
- [Bandwidth In-App Calling](https://dev.bandwidth.com/docs/voice/guides/inAppCallingUS/)

### License

Please adhere to the licensing terms of the original packages:
- [JsSIP License](https://www.npmjs.com/package/jssip)
- [Bandwidth WebRTC SDK License](https://www.bandwidth.com/)
- [AudioCodes Terms of Use](https://audiocodes.com/)