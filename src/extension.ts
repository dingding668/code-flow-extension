import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "code-flow-extension" is now active!');

    // Register the command defined in package.json
    let disposable = vscode.commands.registerCommand('code-flow.visualize', () => {
        vscode.window.showInformationMessage('CodeFlow AI: Visualization started! 🌊');
        // TODO: Open Webview Panel here
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}