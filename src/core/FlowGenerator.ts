import * as ts from 'typescript';

interface FlowNode {
    id: string;
    label: string;
    type: 'input' | 'default' | 'output';
    position: { x: number; y: number };
}

interface FlowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
}

interface FlowGraph {
    nodes: FlowNode[];
    edges: FlowEdge[];
}

export class FlowGenerator {
    private sourceFile: ts.SourceFile;
    private nodes: FlowNode[] = [];
    private edges: FlowEdge[] = [];
    private nodeIdCounter = 0;
    private currentY = 0; // Simple layout tracker

    constructor(fileContent: string) {
        this.sourceFile = ts.createSourceFile(
            'temp.ts',
            fileContent,
            ts.ScriptTarget.Latest,
            true
        );
    }

    public generate(functionName?: string): FlowGraph {
        this.nodes = [];
        this.edges = [];
        this.nodeIdCounter = 0;
        this.currentY = 0;

        // Start Node
        const startId = this.createNode(functionName || 'Start', 'input');

        // Traverse AST
        this.visitNode(this.sourceFile, startId, functionName);

        return {
            nodes: this.nodes,
            edges: this.edges
        };
    }

    private visitNode(node: ts.Node, parentId: string, targetFunctionName?: string) {
        // If we are looking for a specific function, skip until we find it
        if (targetFunctionName) {
            if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
                const name = node.name?.getText();
                if (name === targetFunctionName) {
                    // Found the function, now traverse its body
                    if (node.body) {
                        this.visitBlock(node.body, parentId);
                    }
                    return;
                }
            }
            // Continue searching children
            ts.forEachChild(node, child => this.visitNode(child, parentId, targetFunctionName));
            return;
        }

        // If no target function specified (or already inside), process statements
        this.visitBlock(node, parentId);
    }

    private visitBlock(node: ts.Node, parentId: string) {
        let currentParentId = parentId;
        
        // Debug: Log number of children
        console.log(`CodeFlow: Visiting block, child count: ${node.getChildCount(this.sourceFile)}`);

        ts.forEachChild(node, child => {
            console.log(`CodeFlow: Node Kind: ${child.kind}, Text: "${child.getText(this.sourceFile).substring(0, 20)}..."`); 

            // Handle function declarations (enter them)
            if (ts.isFunctionDeclaration(child) && child.body) {
                console.log('Found function declaration:', child.name?.getText());
                // Create a node for the function definition itself
                const funcName = child.name?.getText() || 'Anonymous Function';
                const nodeId = this.createNode(`Def: ${funcName}`, 'input');
                // Don't connect parent to definition in this simple visualization, 
                // or maybe we want to? Let's just treat it as a new start point for now.
                
                // Traverse the function body
                this.visitBlock(child.body, nodeId);
            }
            else if (ts.isExpressionStatement(child)) {
                // Function calls: doSomething();
                if (ts.isCallExpression(child.expression)) {
                    const callExpr = child.expression;
                    const funcName = callExpr.expression.getText();
                    
                    const nodeId = this.createNode(funcName);
                    this.createEdge(currentParentId, nodeId);
                    currentParentId = nodeId; // Chain them sequentially for now
                }
            }
            // TODO: Handle IfStatement, ForStatement, etc.
            else if (ts.isBlock(child)) {
                this.visitBlock(child, currentParentId);
            }
        });
    }

    private createNode(label: string, type: 'input' | 'default' | 'output' = 'default'): string {
        const id = `n${this.nodeIdCounter++}`;
        // Simple vertical layout: increment Y for each new node
        this.nodes.push({ 
            id, 
            label, 
            type,
            position: { x: 100, y: this.currentY } 
        });
        this.currentY += 100; // Gap between nodes
        return id;
    }

    private createEdge(source: string, target: string, label?: string) {
        this.edges.push({
            id: `e${source}-${target}`,
            source,
            target,
            label
        });
    }
}