import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function UCSFrontend() {
    const [graph, setGraph] = useState({});
    const [positions, setPositions] = useState({});
    const [steps, setSteps] = useState([]);
    const [stepIndex, setStepIndex] = useState(0);
    const [interval, setIntervalState] = useState(null);
    const [startNode, setStartNode] = useState('');  // State for start node
    const [goalNode, setGoalNode] = useState('');    // State for goal node

    const canvasRef = React.useRef(null);

    // Draw the graph
    const drawGraph = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw edges
        for (const from in graph) {
            for (const edge of graph[from]) {
                const start = positions[from];
                const end = positions[edge.node];
                if (start && end) {
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.strokeStyle = '#ccc';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.closePath();

                    // Draw cost
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    ctx.fillStyle = 'black';
                    ctx.fillText(edge.cost, midX, midY);
                }
            }
        }

        // Draw nodes
        for (const node in positions) {
            const { x, y } = positions[node];
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
            ctx.fillStyle = 'black';
            ctx.fillText(node, x - 5, y + 5);
        }
    };

    // Add edge to the graph
    const addEdge = async (from, to, cost) => {
        try {
            const response = await axios.post('http://localhost:5000/addEdge', { from, to, cost });
            setGraph(response.data.graph);
            setPositions(response.data.positions);

            // Ensure positions are initialized for new nodes
            if (!positions[from]) {
                setPositions(prev => ({
                    ...prev,
                    [from]: { x: Math.random() * 800, y: Math.random() * 600 }
                }));
            }
            if (!positions[to]) {
                setPositions(prev => ({
                    ...prev,
                    [to]: { x: Math.random() * 800, y: Math.random() * 600 }
                }));
            }
        } catch (error) {
            console.error("Error adding edge:", error);
        }
    };

    // Start UCS search
    const startUCS = async () => {
        if (!startNode || !goalNode) {
            alert('Please enter both start and goal nodes.');
            return;
        }
        
        try {
            const response = await axios.post('http://localhost:5000/startUCS', { start: startNode, goal: goalNode });
            setSteps(response.data.steps);
            setStepIndex(0); // Reset the step index before starting the animation
            const intervalId = setInterval(() => visualizeStep(response.data.steps), 1000);
            setIntervalState(intervalId);
        } catch (error) {
            console.error("Error starting UCS:", error);
        }
    };

    // Visualize UCS step-by-step
    const visualizeStep = (steps) => {
        if (stepIndex < steps.length) {
            const step = steps[stepIndex];
            const nodePos = positions[step.node];
    
            // Check if the position exists
            if (nodePos) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.beginPath();
                ctx.arc(nodePos.x, nodePos.y, 20, 0, 2 * Math.PI);
                ctx.fillStyle = 'yellow';
                ctx.fill();
                ctx.closePath();
            } else {
                console.error(`Position for node ${step.node} is undefined`);
            }
    
            setStepIndex(prevIndex => prevIndex + 1);
        } else {
            clearInterval(interval);
        }
    };

    useEffect(() => {
        drawGraph();
    }, [graph, positions]);

    return (
        <div className="container">
            <h1 className="mt-4">Interactive UCS Visualization</h1>
            <canvas ref={canvasRef} width="800" height="600" className="border"></canvas>
            <div className="mt-4">
                <h2>Graph Editor</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const from = e.target.fromNode.value;
                    const to = e.target.toNode.value;
                    const cost = parseInt(e.target.cost.value, 10);
                    addEdge(from, to, cost);
                }} className="mb-4">
                    <div className="mb-3">
                        <input type="text" name="fromNode" placeholder="From Node" className="form-control" required />
                    </div>
                    <div className="mb-3">
                        <input type="text" name="toNode" placeholder="To Node" className="form-control" required />
                    </div>
                    <div className="mb-3">
                        <input type="number" name="cost" placeholder="Cost" className="form-control" required />
                    </div>
                    <button type="submit" className="btn btn-primary">Add Edge</button>
                </form>

                {/* Start and Goal Node Inputs */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Start Node"
                        className="form-control mb-2"
                        value={startNode}
                        onChange={(e) => setStartNode(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Goal Node"
                        className="form-control"
                        value={goalNode}
                        onChange={(e) => setGoalNode(e.target.value)}
                    />
                </div>

                <button onClick={startUCS} className="btn btn-success">Start UCS</button>
            </div>
        </div>
    );
}

export default UCSFrontend;
