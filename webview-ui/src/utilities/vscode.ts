import type { WebviewApi } from "vscode-webview";

/**
 * A utility wrapper around the vscode.postMessage() API.
 * This function handles the type safety of the VS Code API.
 */
class VSCodeAPIWrapper {
  private readonly vsCodeApi: WebviewApi<unknown> | undefined;

  constructor() {
    // Check if the acquireVsCodeApi function exists in the current window object
    if (typeof acquireVsCodeApi === "function") {
      this.vsCodeApi = acquireVsCodeApi();
    }
  }

  /**
   * Post a message to the extension context.
   *
   * @param message The message to send to the extension context.
   */
  public postMessage(message: unknown) {
    if (this.vsCodeApi) {
      this.vsCodeApi.postMessage(message);
    } else {
      console.log(message);
    }
  }
}

// Exports an instance of the VSCodeAPIWrapper class
export const vscode = new VSCodeAPIWrapper();