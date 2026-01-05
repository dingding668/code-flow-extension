import * as vscode from 'vscode';
import { CodeFlowPanel } from './panels/CodeFlowPanel';
import { FlowGenerator } from './core/FlowGenerator';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "code-flow-extension" is now active!');

    // Register the command defined in package.json
    let disposable = vscode.commands.registerCommand('code-flow.visualize', () => {
        vscode.window.showInformationMessage('CodeFlow: Starting visualization...'); // Visual confirmation
        CodeFlowPanel.render(context.extensionUri);

        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const fileContent = document.getText();
            vscode.window.showInformationMessage(`CodeFlow: File length ${fileContent.length}`); // Visual confirmation
            
            console.log('CodeFlow: Parsing file content length:', fileContent.length);
            
            // For MVP, we just try to find a function name near cursor or parse whole file
            // Let's parse the whole file for now and find the first function or use a placeholder
            const generator = new FlowGenerator(fileContent);
            const graph = generator.generate(); // Parse everything

            vscode.window.showInformationMessage(`CodeFlow: Generated ${graph.nodes.length} nodes`); // Visual confirmation
            console.log('CodeFlow: Generated graph:', JSON.stringify(graph, null, 2));

            if (CodeFlowPanel.currentPanel) {
                CodeFlowPanel.currentPanel.updateGraph(graph);
                
                // Temporary fix: Send again after a short delay to ensure Webview is ready
                setTimeout(() => {
                    if (CodeFlowPanel.currentPanel) {
                        console.log('CodeFlow: Resending graph data...');
                        CodeFlowPanel.currentPanel.updateGraph(graph);
                    }
                }, 1000);
            }
        } else {
            vscode.window.showErrorMessage('CodeFlow: No active editor found');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}