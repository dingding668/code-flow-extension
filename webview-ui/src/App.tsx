import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { vscode } from './utilities/vscode';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const handleTestMessage = () => {
    vscode.postMessage({
      command: 'hello',
      text: 'Hello from React Flow!',
    });
  };

  useEffect(() => {
    // Notify extension that webview is ready
    vscode.postMessage({ command: 'webview-ready' });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log('Webview received message:', message); // Debug log

      if (message.command === 'update-graph') {
        const { nodes: rawNodes, edges: rawEdges } = message.data;
        
        console.log('Raw nodes:', rawNodes); // Debug log
        console.log('Raw edges:', rawEdges); // Debug log

        // Transform nodes to React Flow format
        const layoutedNodes = rawNodes.map((node: any, index: number) => ({
          ...node,
          // Use provided position or fallback to simple layout
          position: node.position || { x: 250, y: index * 100 + 50 },
          data: { label: node.label }
        }));

        console.log('Processed nodes:', layoutedNodes); // Debug log

        setNodes(layoutedNodes);
        setEdges(rawEdges);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid var(--vscode-widget-border)' }}>
         <VSCodeButton onClick={handleTestMessage}>Test Message</VSCodeButton>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;