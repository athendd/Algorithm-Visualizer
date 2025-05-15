// Middle Display Panels Animation - Algorithm Name
window.loadBinaryTree = function () {
    // Get references to various DOM elements used for user input, warnings, and animation rendering
    const randListSize = document.getElementById('randListSize');
    const sizeWarningMessage = document.getElementById('sizeWarningMessage');
    const randomizeButton = document.getElementById('randomizeButton');
    const inputElement = document.getElementById('customInput');
    const customInputToggle = document.getElementById('customInputToggle');
    const progressBar = document.getElementById("progressBar");
    const inputWarningMessage = document.getElementById('inputWarningMessage');
    const progressFill = document.getElementById("progressFill");
    const speedSlider = document.getElementById("speedSlider");
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
    let defaultData = generateRandomList(Math.floor(Math.random() * (15 - 3 + 1) + 3)); 
    let currentData = [...defaultData]; 
    let currentEdges = [];
    let frames = []; // Stores animation frames for step-by-step playback
    let currentFrame = 0;
    let isPlaying = false;
    let coloredEdges = [];
    let searchedIndices = [];

    // Define a basic TreeNode structure
    class TreeNode {
        constructor(value) {
            this.value = value;
            this.left = null;
            this.right = null;
            this.x = 0; 
            this.y = 0; 
        }
    }

    let root = sortedArrayToBST(currentData);
    let outputList = [];

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
        drawGraphVisualization();
    }

    // Recursively assign positions to each node
    function assignPositions(node, depth = 0, xRange = { min: 0, max: graphCanvas.width }) {
        if (!node) return;
        const midX = (xRange.min + xRange.max) / 2;
        node.x = midX;
        node.y = 100 + depth * 80;

        assignPositions(node.left, depth + 1, { min: xRange.min, max: midX });
        assignPositions(node.right, depth + 1, { min: midX, max: xRange.max });
    }

    // Draw an arrow from parent to child
    function drawArrow(node1, node2) {
        const fromX = node1.x;
        const fromY = node1.y;
        const toX = node2.x;
        const toY = node2.y;
        const headlen = 10;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        graphCtx.beginPath();
        graphCtx.moveTo(fromX, fromY);
        graphCtx.lineTo(toX, toY);
        graphCtx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        graphCtx.moveTo(toX, toY);
        graphCtx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        graphCtx.strokeStyle = getColorEdges(node1, node2);
        graphCtx.stroke();
    }

    // Draw the tree recursively
    function drawTree(node) {
        if (!node) return;

        // Draw arrows first (left and right)
        if (node.left) {
            const itemToAppend = [node.value, node.left.value];
            currentEdges.push(itemToAppend);
            drawArrow(node, node.left);
            drawTree(node.left);
        }
        if (node.right) {
            const itemToAppend = [node.value, node.right.value];
            currentEdges.push(itemToAppend);
            drawArrow(node, node.right);
            drawTree(node.right);
        }

        // Draw the node
        graphCtx.fillStyle = getColor(node.value);
        graphCtx.beginPath();
        graphCtx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        graphCtx.fill();
        graphCtx.strokeStyle = 'black';
        graphCtx.stroke();

        // Text
        graphCtx.fillStyle = 'black';
        graphCtx.textAlign = 'center';
        graphCtx.textBaseline = 'middle';
        graphCtx.font = '16px Arial';
        graphCtx.fillText(node.value, node.x, node.y);
    }

    // Final draw function
    function drawGraphVisualization() {
        graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        assignPositions(root);
        drawTree(root);
    }

    // Determines the color of elements in the visualization
    function getColor(index) {
        if (searchedIndices.includes(index)) return 'red';
        return 'lightblue';
    }

    function getColorEdges(node1, node2) {
        if (checkEdges([node1.value, node2.value], coloredEdges)) return 'red';
        return 'black';
    }

    function checkEdges(givenEdge, edges){
        for (let edge of edges){
            if (edge[0] == givenEdge[0] && edge[1] === givenEdge[1]){
                return true;
            }
        }
        return false;
    }

    async function inorderTraversal(root){
        const result = [];

        function traverse(node) {
            searchedIndices.push(node.value);
            appendToExplanation(`Reached node: ${node.value}`);
            result.push(node.value);
            if (node.left){
                let newEdge = [node.value, node.left.value];
                coloredEdges.push(newEdge);
                traverse(node.left);
            }
            if (node.right){
                let newEdge = [node.value, node.right.value];
                coloredEdges.push(newEdge);
                traverse(node.right);
            }
            const indexToRemove = searchedIndices.indexOf(node.value);
            searchedIndices.splice(indexToRemove, 1);
            appendToExplanation(`Backtracked from node: ${node.value}`);
        }
        traverse(root);

        return result;
    }

    // Records a snapshot of the current sorting step, adds frame to animation
    function recordFrame(explanation = "") {
        frames.push(JSON.parse(JSON.stringify({
            currentData: [...currentData],
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
        stepLog.innerHTML += `Starting at node: ${String(root.value)}<br>`; // Initial list

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

        // First frame: initial array, no highlights
        frames.push({
            currentData: [...currentData],
            searchedIndices: [],
            coloredEdges: [],
            explanation: ""
        });

        // Middle frames: has highlights
        outputList = await inorderTraversal(root);

        // Last frame: final sorted array, no highlights
        frames.push({
            currentData: [...currentData],
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
        inputElement.placeholder = "Enter a list of 3-15 integers between 1 & 99 (ex. 99 1 24 59 34)";
        inputElement.disabled = false;
        customInputToggle.disabled = false;
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
            let inputList = randListSize.value.trim().split(/\s+/); 
            inputList = inputList.map(Number); 
            if (checkRandomizeInput(inputList)) {
                pauseAnimation();
                defaultData = generateRandomList(inputList[0]);
                currentData = [...defaultData];
                root = sortedArrayToBST(currentData);
                searchedIndices = [];
                coloredEdges = [];
                loadAnimation();
            }
        }
    }

    // Generates custom user-given list, loads animation for new custom list
    // Loads back animation for default list when toggled off
    function toggleCustomInput() {
        if (customInputToggle.checked) {  
            if (!inputElement.value) {
                inputWarningMessage.textContent = "Invalid Input: Enter an input";
                inputWarningMessage.style.color = "red";
                customInputToggle.checked = false;
            }
            else {
                let inputList = inputElement.value.trim().split(/\s+/);
                inputList = inputList.map(Number);
                if (checkCustomInput(inputList)) {
                    randListSize.disabled = true;
                    randomizeButton.disabled = true;
                    inputElement.disabled = true;
                    pauseAnimation();
                    currentData = inputList.sort();
                    root = sortedArrayToBST(currentData);
                    searchedIndices = [];
                    coloredEdges = [];
                    loadAnimation();
                }
                else {
                    customInputToggle.checked = false;
                }
            }
        }
        else {
            pauseAnimation();
            currentData = [...defaultData];
            root = sortedArrayToBST(currentData);
            searchedIndices = [];
            coloredEdges = [];
            loadAnimation();
            randListSize.disabled = false;
            randomizeButton.disabled = false;
            inputElement.disabled = false;
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
        if (inputList[0] < 3 || inputList[0] > 15) {
            sizeWarningMessage.textContent = "Error: Enter an integer between 3-15";
            sizeWarningMessage.style.color = "red";
            return false;
        }
        sizeWarningMessage.textContent = "---";
        sizeWarningMessage.style.color = "#f4f4f4";
        return true;
    }

    // Validates user input for custom list
    function checkCustomInput(inputList) {
        if (inputList == "") {
            inputWarningMessage.textContent = "Error: Enter an input";
            inputWarningMessage.style.color = "red";
            return false;
        }
        if (!isWholeNumbers(inputList)) {
            inputWarningMessage.textContent = "Error: Enter integers only";
            inputWarningMessage.style.color = "red";
            return false;
        }
        if (inputList.length > 15 || inputList.length < 3) {
            inputWarningMessage.textContent = "Error: Enter 3 to 15 integers only";
            inputWarningMessage.style.color = "red";
            return false;
        }
        if (isUnique(inputList) === false){
            console.log(isUnique(inputList));
            inputWarningMessage.textContent = "Error: only accepts each value once";
            inputWarningMessage.style.color = "red";
            return false;
        }
        if (checkInputValues(inputList)) {
            inputWarningMessage.style.color = "#f4f4f4";
            return true;
        } else {
            inputWarningMessage.textContent = "Error: Enter integer values between -200 and 200 only";
            inputWarningMessage.style.color = "red";
            return false;
        }
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

    function isUnique(arr){
        const arrSet = new Set(arr);
        if (arrSet.size === arr.length){
            return true;
        }

        return false;
    }

    // Returns true if all the elements in the given list are between 1 & 99, else returns false
    function checkInputValues(inputList) {
        for (let i = 0; i < inputList.length; i++) {
            if (inputList[i] > 99 || inputList[i] < 1) {
                return false;
            }
        }
        return true;
    }

    // Randomizes the size and values of the default input list on initialization of the webpage
    function generateRandomList(size){
        let defaultArray = new Array(size);
        for (let i = 0; i < size; i++){
            let defaultValue = 0;
            while (defaultValue === 0 || defaultArray.includes(defaultValue)){
                defaultValue = Math.floor(Math.random() * (99 - 1 + 1)) + 1;
            }
            defaultArray[i] = defaultValue;
        }

        const finalArray = defaultArray.sort((a, b) => a - b); 
        return finalArray;
    }

    // Builds a balanced BST from sorted array
    function sortedArrayToBST(arr, start = 0, end = arr.length - 1) {
        if (start > end) return null;
        const mid = Math.floor((start + end) / 2);
        const node = new TreeNode(arr[mid]);
        node.left = sortedArrayToBST(arr, start, mid - 1);
        node.right = sortedArrayToBST(arr, mid + 1, end);
        return node;
    }

    // Ties Bubble Sort animation functionality to main page
    window.activeController = new AnimationController(loadAnimation, loadControlBar, playAnimation, pauseAnimation, stepForward, stepBackward, 
        moveToFrame, resetAnimation, randomizeInput, toggleCustomInput);
        
};