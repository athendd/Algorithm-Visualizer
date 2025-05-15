// Middle Display Panels Animation - Bubble Sort 
window.loadBFS = function () {
    // Get references to various DOM elements used for user input, warnings, and animation rendering
    const randListSize = document.getElementById('randListSize');
    const sizeWarningMessage = document.getElementById('sizeWarningMessage');
    const randomizeButton = document.getElementById('randomizeButton');
    const inputElement = document.getElementById('customInput');
    const customInputToggle = document.getElementById('customInputToggle');
    const progressBar = document.getElementById("progressBar");
    const progressFill = document.getElementById("progressFill");
    const speedSlider = document.getElementById("speedSlider");
    const graphVisual = document.getElementById('graphVisual');
    const graphCanvas = document.getElementById('graphCanvas');
    const stepLog = document.getElementById("stepLog");

    const boxListVisual = document.getElementById('boxListVisual');
    const middlePanel = document.querySelector('.middle-panels');

    middlePanel.removeChild(boxListVisual);

    // Set canvas dimensions dynamically to fit their parent containers
    graphCanvas.width = graphCanvas.parentElement.clientWidth;
    graphCanvas.height = graphCanvas.parentElement.clientHeight;

    // Get 2D drawing contexts for rendering animations
    const graphCtx = graphCanvas.getContext('2d');

    // Initialize data for visualization
    let currentData = generateRandomList(Math.floor(Math.random() * (10 - 3 + 1) + 3)); 
    let currentEdges = createEdges(currentData);
    let startingNode = selectStartingNode(currentData.length);
    let outputList = new Array();
    let frames = []; // Stores animation frames for step-by-step playback
    let currentFrame = 0;
    let isPlaying = false;
    let searchedIndices = [];
    let coloredEdges = [];

    const VERTICAL_PADDING = 60; // Minimum spacing of graph bars from top and bottom of container

    // Draws current animation frame based on stored frame data
    function drawFrame(frame) {
        if (!frame) return;
        ({ searchedIndices, coloredEdges } = frame);
        drawData();
        updateProgressBar();
        updateStepLog();
    }

    // Clears and redraws both visualization canvases
    function drawData() {
        graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        drawGraphVisualization();
    }

    // Draws the bar-graph representation of the data array
    function drawGraphVisualization() {
        const numNodes = currentData.length;
        // Size of each circle
        const radius = 20;
        const centerX = graphCanvas.width / 2;
        const centerY = graphCanvas.height / 2;
        const graphRadius = Math.min(graphCanvas.width, graphCanvas.height) / 2 - radius * 2;

        const nodePositions = [];

        const fontSize = Math.min(24, Math.max(12, radius * 0.3));
        graphCtx.font = `${fontSize}px Arial`;
        graphCtx.textAlign = 'center';
        graphCtx.textBaseline = 'middle';

        for (let i = 0; i < numNodes; i++) {
            const angle = (i / currentData.length) * (2 * Math.PI);
            const x = centerX + graphRadius * Math.cos(angle);
            const y = centerY + graphRadius * Math.sin(angle);
            nodePositions.push({x, y});
        }

        let drawnEdges = new Set();

        for (let i = 0; i < currentEdges.length; i++){
            let nodeA = i;
            for (let j = 0; j < currentEdges[i].length; j++){
                
                let nodeB = currentEdges[i][j];

                let edgeKey = nodeA < nodeB ? `${nodeA}-${nodeB}` : `${nodeB}-${nodeA}`;

                if (!drawnEdges.has(edgeKey)){
                    drawnEdges.add(edgeKey);
                    let startNode = nodePositions[nodeA];
                    let endNode = nodePositions[nodeB];
                    graphCtx.beginPath();
                    graphCtx.moveTo(startNode.x, startNode.y);
                    graphCtx.lineTo(endNode.x, endNode.y);
                    graphCtx.strokeStyle = getColorEdges(nodeA, nodeB);
                    graphCtx.stroke();
                    graphCtx.font = "14px Arial"; 
                }
            }
        }

        // Draw the nodes
        for (let i = 0; i < currentData.length; i++){
            const {x, y} = nodePositions[i];

            graphCtx.fillStyle = getColor(i);
            graphCtx.beginPath();
            graphCtx.arc(x, y, radius, 0, 2 * Math.PI);
            graphCtx.fill();
            graphCtx.strokeStyle = 'black'; 
            graphCtx.stroke();

            graphCtx.fillStyle = 'black';
            graphCtx.fillText(currentData[i], x, y);
        }
    }

    // Determines the color of elements in the visualization
    function getColor(index) {
        if (searchedIndices.includes(index)) return 'red';
        return 'lightblue';
    }

    function getColorEdges(node1, node2) {
        let targetEdge = [node1, node2];
        let reversedTargetEdge = [node2, node1];

        if ((searchedIndices.includes(targetEdge[0]) && searchedIndices.includes(targetEdge[1])) || 
        (searchedIndices.includes(reversedTargetEdge[0]) && searchedIndices.includes(reversedTargetEdge[1]))){
            for (edge of coloredEdges){
                if ((edge[0] === targetEdge[0] && edge[1] === targetEdge[1]) || (edge[0] === reversedTargetEdge[0] && edge[1] === reversedTargetEdge[1])) {
                    return 'red';
                }
            }
        }

        return 'black';
    }

    async function bfs(adj_matrix, startingNode){
        let res = [];

        let vertices = adj_matrix.length;

        let q = [];

        let visited = new Array(vertices).fill(false);

        visited[startingNode] = true;
        q.push(startingNode);

        while (q.length > 0){
            let curr = q.shift();

            res.push(curr);

            searchedIndices.push(curr);

            if (curr != startingNode)
            {
                appendToExplanation(`Going to node ${curr}`);
            }
            else{
                appendToExplanation("");
            }

            for (let x of adj_matrix[curr]){
                if (!visited[x]){
                    visited[x] = true;
                    q.push(x);
                    let edge = [curr, x];
                    coloredEdges.push(edge);
                }
            }
        }
        return res;
    }

    // Records a snapshot of the current sorting step, adds frame to animation
    function recordFrame(explanation = "") {
        frames.push(JSON.parse(JSON.stringify({
            currentData: [...currentData],
            currentEdges: [...currentEdges],
            searchedIndices: [...searchedIndices],
            coloredEdges: [...coloredEdges],
            explanation
        })));
    }

    // Adds a new frame to animation with given step log explanation
    function appendToExplanation(text) {
        recordFrame(text);
    }

    // Increases or decreases fill of progress bar based on how far into animation the user is
    function updateProgressBar() {
        const progress = (currentFrame / (frames.length - 1)) * 100;
        progressFill.style.width = `${progress}%`;
    }

    // Adds, into step log, all steps up to current frame (clears before adding)
    function updateStepLog() {
        stepLog.innerHTML = ""; // Reset log
        stepLog.innerHTML += `Starting at node: ${String(startingNode)}<br>`; // Initial list

        for (let i = 1; i <= currentFrame; i++) {
            if (frames[i].explanation) {
                stepLog.innerHTML += frames[i].explanation + "<br>";
            }
        }

        if (currentFrame === frames.length - 1) {
            stepLog.innerHTML += `Searched List: ${outputList}`; // Final list
        }

        stepLog.scrollTop = stepLog.scrollHeight;
    }

    // Initializes and starts animation playback
    function playAnimation() {
        if (isPlaying) return;
        isPlaying = true;

        // Sets animation play speed based on speedSlider value
        function getAnimationSpeed() {
            const fastestSpeed = 50;  // (ms)
            const slowestSpeed = 3000; // (ms)
            return slowestSpeed - (speedSlider.value / 100) * (slowestSpeed - fastestSpeed);
        }
        
        // Replaces current frame with the next frame at a set speed
        function step() {
            if (!isPlaying || currentFrame >= frames.length - 1) {
                isPlaying = false;
                return;
            }
            currentFrame++;
            drawFrame(frames[currentFrame]);
            setTimeout(step, getAnimationSpeed()); // Recursively calls step function
        }
        step();
    }

    // Pauses animation
    function pauseAnimation() {
        isPlaying = false;
    }

     // Moves forward 1 frame
    function stepForward() {
        if (currentFrame < frames.length - 1) {
            currentFrame++;
            drawFrame(frames[currentFrame]);
        }
    }

    // Moves backward 1 frame
    function stepBackward() {
        if (currentFrame > 0) {
            currentFrame--;
            drawFrame(frames[currentFrame]);
        }
    }

    // Moves to specific frame based on where in the progress bar the user clicks
    function moveToFrame(event) {
        const rect = progressBar.getBoundingClientRect(); // Get progress bar dimensions
        const clickX = event.clientX - rect.left; // Click-position within progress bar
        const progressPercent = clickX / rect.width; // Determine how far in the progress bar the user clicked
        currentFrame = Math.round(progressPercent * (frames.length - 1)); // Determine which frame to move to
        drawFrame(frames[currentFrame]); // Move to frame
    }

    // Creates animation and displays first frame
    async function loadAnimation() {
        frames = [];
        currentFrame = 0;
        currentData = [...currentData];
        currentEdges = [...currentEdges];

        // First frame: initial array, no highlights
        frames.push({
            currentData: [...currentData],
            currentEdges: [...currentEdges],
            searchedIndices: [],
            coloredEdges: [],
            explanation: ""
        });

        // Middle frames: has highlights
        outputList = await bfs(currentEdges, startingNode);

        // Last frame: final sorted array, no highlights
        frames.push({
            currentData: [...currentData],
            currentEdges: [...currentEdges],
            searchedIndices: [],
            coloredEdges: [],
            explanation: ""
        });

        drawFrame(frames[currentFrame]);
    }

    // Enables and contextualizes parts of top control bar relevant to Bubble Sort
    function loadControlBar() {
        randListSize.disabled = false;
        randomizeButton.disabled = false;
        inputElement.disabled = true;
        customInputToggle.disabled = true;
        progressBar.disabled = false;
        speedSlider.disabled = false;
    }

    // Pauses animation and goes back to frame 1
    function resetAnimation() {
        pauseAnimation();
        currentFrame = 0;
        drawFrame(frames[currentFrame]);
    }

    // Generates new list with user given size, loads animation for new random list
    function randomizeInput() {
        if (!randListSize.value) {
            sizeWarningMessage.textContent = "Error: Enter an integer";
            sizeWarningMessage.style.color = "red";
        }
        else {
            let inputList = randListSize.value.trim().split(/\s+/); // turns input into a string list
            inputList = inputList.map(Number); // turns string list into a number list
            if (checkRandomizeInput(inputList)) {
                pauseAnimation();
                currentData = generateRandomList(inputList[0]);
                currentEdges = createEdges(currentData);
                startingNode = selectStartingNode(currentData.length);
                searchedIndices = [];
                coloredEdges = [];
                loadAnimation();
            }
        }
    }

    // Validates user input for random list size
    function checkRandomizeInput(inputList) {
        if (inputList == "") {
            sizeWarningMessage.textContent = "Error: Enter an integer";
            sizeWarningMessage.style.color = "red";
            return false;
        }
        if (!isWholeNumbers(inputList)) {
            sizeWarningMessage.textContent = "Error: Enter integers only";
            sizeWarningMessage.style.color = "red";
            return false;
        }
        if (inputList.length > 1) {
            sizeWarningMessage.textContent = "Error: Enter 1 integer only";
            sizeWarningMessage.style.color = "red";
            return false;
        }
        if (inputList[0] < 3 || inputList[0] > 10) {
            sizeWarningMessage.textContent = "Error: Enter an integer between 3-10";
            sizeWarningMessage.style.color = "red";
            return false;
        }
        sizeWarningMessage.textContent = "---";
        sizeWarningMessage.style.color = "#f4f4f4";
        return true;
    }

    // Returns true if all the elements in the given list are whole numbers, else returns false
    function isWholeNumbers(list) {
        for (let i = 0; i < list.length; i++) {
            if (list[i] == NaN || !Number.isInteger(list[i])) {
                return false;
            }
        }
        return true;     
    }

    // Randomizes the size and values of the default input list on initialization of the webpage
    function generateRandomList(size){
        let defaultArray = new Array(size);
        for (let i = 0; i < size; i++){
            defaultArray[i] = i;
        }

        return defaultArray
    }

    // Creates a list of edges between the nodes
    function createEdges(Nodes){
        //const edges = new Array();
        const n = Nodes.length;
        let adj = new Array();

        for (let i = 0; i < n; i++){
            adj[i] = [];
        }

        for (let i = 0; i < n; i++){
            for (let j = i + 1; j < n; j++){
                // let edgeWeight = Math.floor(Math.random() * (30 - 2 + 1) + 2);
                if (Math.random () > 0.5){
                    adj[i].push(j);
                    adj[j].push(i);
                }
            }
        }
        return adj;
    }

    // Selects a random node as the starting node
    function selectStartingNode(maxVal){
        return Math.floor(Math.random() * ((maxVal-1) - 0 + 1) + 0);
    }

    // Ties Bubble Sort animation functionality to main page
    window.activeController = new AnimationController(loadAnimation, loadControlBar, playAnimation, pauseAnimation, stepForward, stepBackward, 
        moveToFrame, resetAnimation, randomizeInput);
    
};