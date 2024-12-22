const graph = {};
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const resultPath = document.getElementById('resultPath');

const positions = {};
let steps = [];
let stepIndex = 0;
let intervalId = null;

// Random positions for cities
function randomPosition() {
    return { x: Math.random() * 700 + 50, y: Math.random() * 500 + 50 };
}

// Add edge to graph and initialize nodes
function addEdge(from, to, cost) {
    if (!graph[from]) graph[from] = [];
    if (!positions[from]) positions[from] = randomPosition();
    if (!positions[to]) positions[to] = randomPosition();

    graph[from].push({ node: to, cost });
    drawGraph();
}

// Draw graph and nodes (Fix for Text Display)
function drawGraph(path = [], highlightCost = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw edges
    for (const from in graph) {
        for (const edge of graph[from]) {
            const start = positions[from];
            const end = positions[edge.node];

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = path.includes(edge.node) ? '#FFD700' : '#ccc';
            ctx.stroke();

            // Display cost at midpoint
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.strokeText(edge.cost, midX, midY);
            ctx.fillText(edge.cost, midX, midY);
        }
    }

    // Draw nodes with names
    for (const node in positions) {
        const { x, y } = positions[node];
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.fillStyle = path.includes(node) ? '#4caf50' : 'white';
        ctx.fill();
        ctx.stroke();
        
        // Node label (City Name)
        ctx.fillStyle = 'black';
        ctx.font = 'bold 18px Arial';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.strokeText(node, x, y);
        ctx.fillText(node, x, y);
    }
}

// BFS Algorithm
function bfs(start, goal) {
    const queue = [[start]];
    const visited = new Set();
    while (queue.length > 0) {
        const path = queue.shift();
        const node = path[path.length - 1];
        if (node === goal) return path;
        if (!visited.has(node)) {
            visited.add(node);
            for (const neighbor of graph[node] || []) {
                queue.push([...path, neighbor.node]);
            }
        }
    }
    return null;
}

// UCS Algorithm (Tracks Total Cost)
function ucs(start, goal) {
    const queue = [{ path: [start], cost: 0 }];
    while (queue.length > 0) {
        queue.sort((a, b) => a.cost - b.cost);
        const { path, cost } = queue.shift();
        const node = path[path.length - 1];
        if (node === goal) {
            resultPath.textContent = `Path: ${path.join(' -> ')} | Total Cost: ${cost}`;
            return path;
        }
        for (const neighbor of graph[node] || []) {
            queue.push({ path: [...path, neighbor.node], cost: cost + neighbor.cost });
        }
    }
    return null;
}

// Event Listeners
document.getElementById('addEdgeForm').onsubmit = (e) => {
    e.preventDefault();
    const from = document.getElementById('fromNode').value.toUpperCase();
    const to = document.getElementById('toNode').value.toUpperCase();
    const cost = parseInt(document.getElementById('cost').value, 10);
    addEdge(from, to, cost);
};

document.getElementById('bfsButton').onclick = () => runAlgorithm(bfs);
document.getElementById('ucsButton').onclick = () => runAlgorithm(ucs);

function runAlgorithm(algorithm) {
    const start = prompt('Enter Start City').toUpperCase();
    const goal = prompt('Enter Goal City').toUpperCase();
    const path = algorithm(start, goal);
    drawGraph(path || []);
    resultPath.textContent = path ? `Path: ${path.join(' -> ')}` : 'No path found';
}
