import { useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { vscode } from './utilities/vscode';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';

const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: 'Start: Order Checkout' },
    position: { x: 250, y: 5 },
    type: 'input',
  },
  {
    id: '2',
    data: { label: 'Validate User' },
    position: { x: 100, y: 100 },
  },
  {
    id: '3',
    data: { label: 'Check Inventory' },
    position: { x: 400, y: 100 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
];

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