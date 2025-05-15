window.loadMaxSumPath = function () {
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

    const boxListVisual = document.getElementById("boxListVisual");
    const middlePanel = document.querySelector(".middle-panels");
    if (boxListVisual) middlePanel.removeChild(boxListVisual);

    graphCanvas.width = graphCanvas.parentElement.clientWidth;
    graphCanvas.height = graphCanvas.parentElement.clientHeight;
    const graphCtx = graphCanvas.getContext("2d");

    class TreeNode {
        constructor(id, value) {
            this.id = id;
            this.value = value;
            this.left = null;
            this.right = null;
            this.x = 0;
            this.y = 0;
        }
    }
    
    // Function to create a binary tree from a list of integers
    function createTreeFromList(values = [], index = 0) {
        if (index >= values.length) return null;  // If index is out of bounds, stop recursion
    
        const node = new TreeNode(index, values[index]);
        
        // Recursively create left and right children
        node.left = createTreeFromList(values, index * 2 + 1);
        node.right = createTreeFromList(values, index * 2 + 2);
    
        return node;
    }
    
    function createTreeWithNumNodes(numNodes = 10) {
        if (numNodes <= 0) return null;
    
        let idCounter = 0;
        const root = new TreeNode(idCounter++, Math.floor(Math.random() * 40 - 10));
        const queue = [root];
    
        while (idCounter < numNodes) {
            const current = queue.shift();
    
            // Add left child if we haven't reached the node limit
            if (idCounter < numNodes) {
                const left = new TreeNode(idCounter++, Math.floor(Math.random() * 40 - 10));
                current.left = left;
                queue.push(left);
            }
    
            // Add right child if we still haven't reached the node limit
            if (idCounter < numNodes) {
                const right = new TreeNode(idCounter++, Math.floor(Math.random() * 40 - 10));
                current.right = right;
                queue.push(right);
            }
        }
    
        return root;
    }

    let frames = [];
    let currentFrame = 0;
    let isPlaying = false;

    let defaultTreeRoot = createTreeWithNumNodes(7);
    let treeRoot = new TreeNode(defaultTreeRoot.id, defaultTreeRoot.value);
    treeRoot.left = defaultTreeRoot.left;
    treeRoot.right = defaultTreeRoot.right;
    let highlightedNodes = [];
    let highlightedEdges = [];
    let maxSum = -Infinity;
    let panX = 318, panY = 50, zoom = .7;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    
    function setNodePositions(node, x, y, spacing) {
        if (!node) return;
        node.x = x;
        node.y = y;
        if (node.left) setNodePositions(node.left, x - spacing, y + 120, spacing / 1.8);
        if (node.right) setNodePositions(node.right, x + spacing, y + 120, spacing / 1.8);
    }

    function drawTree(node) {
        graphCtx.save();
        graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        graphCtx.translate(panX, panY);
        graphCtx.scale(zoom, zoom);

        graphCtx.font = "16px Arial";
        graphCtx.textAlign = "center";
        graphCtx.textBaseline = "middle";

        function drawEdges(n) {
            if (!n) return;
            if (n.left) {
                graphCtx.beginPath();
                graphCtx.moveTo(n.x, n.y);
                graphCtx.lineTo(n.left.x, n.left.y);
                graphCtx.strokeStyle = isEdgeHighlighted(n, n.left) ? "red" : "black";
                graphCtx.stroke();
                drawEdges(n.left);
            }
            if (n.right) {
                graphCtx.beginPath();
                graphCtx.moveTo(n.x, n.y);
                graphCtx.lineTo(n.right.x, n.right.y);
                graphCtx.strokeStyle = isEdgeHighlighted(n, n.right) ? "red" : "black";
                graphCtx.stroke();
                drawEdges(n.right);
            }
        }

        function drawNodes(n) {
            if (!n) return;
            graphCtx.beginPath();
            graphCtx.arc(n.x, n.y, 25, 0, 2 * Math.PI);
            graphCtx.fillStyle = highlightedNodes.includes(n.id) ? "red" : "lightblue";
            graphCtx.fill();
            graphCtx.strokeStyle = "black";
            graphCtx.stroke();

            graphCtx.fillStyle = "black";
            graphCtx.fillText(n.value, n.x, n.y); // inside node value
            graphCtx.fillText(`${n.id}`, n.x, n.y - 35); // label outside
            drawNodes(n.left);
            drawNodes(n.right);
        }

        function isEdgeHighlighted(parent, child) {
            return highlightedEdges.some(([a, b]) => (a === parent.id && b === child.id) || (a === child.id && b === parent.id));
        }

        drawEdges(node);
        drawNodes(node);

        graphCtx.restore();
    }

    function recordFrame(explanation) {
        frames.push({
            explanation,
            highlightedNodes: [...highlightedNodes],
            highlightedEdges: [...highlightedEdges],
        });
    }

    function drawFrame(frame) {
        highlightedNodes = frame.highlightedNodes;
        highlightedEdges = frame.highlightedEdges;
        drawTree(treeRoot);
        updateStepLog();
        updateProgressBar();
    }

    function updateStepLog() {
        stepLog.innerHTML = "";
        for (let i = 1; i <= currentFrame; i++) {
            stepLog.innerHTML += frames[i].explanation + "<br>";
        }
        if (currentFrame === frames.length - 1) {
            stepLog.innerHTML += `<strong>Maximum Path Sum: ${maxSum}</strong><br>`;
        }
        stepLog.scrollTop = stepLog.scrollHeight;
    }

    function updateProgressBar() {
        const percent = (currentFrame / (frames.length - 1)) * 100;
        progressFill.style.width = `${percent}%`;
    }

    function maxPathSumHelper(node, path = [], parentId = null) {
        if (!node) return 0;
    
        highlightedNodes = [node.id];
        recordFrame(`Visiting node ${node.id} (${node.value}), current path: [${[...path, node.id].join(" → ")}]`);
    
        path.push(node.id);
    
        const left = node.left ? (() => {
            highlightedEdges.push([node.id, node.left.id]);
            recordFrame(`Moving to left child of node ${node.id} → node ${node.left.id}`);
            return maxPathSumHelper(node.left, path, node.id);
        })() : 0;
    
        const right = node.right ? (() => {
            highlightedEdges.push([node.id, node.right.id]);
            recordFrame(`Moving to right child of node ${node.id} → node ${node.right.id}`);
            return maxPathSumHelper(node.right, path, node.id);
        })() : 0;
    
        const currentMax = node.value + Math.max(0, left) + Math.max(0, right);
        if (currentMax > maxSum) {
            maxSum = currentMax;
            recordFrame(`Updated Maximum Path Sum to ${maxSum} at node ${node.id}`);
        }
    
        path.pop();
    
        // Backtracking frame: highlight the parent node we're returning to
        if (parentId !== null) {
            highlightedNodes = [parentId];
        } else {
            highlightedNodes = [];
        }
        recordFrame(`Backtracking from node ${node.id}, returning to ${parentId !== null ? "node " + parentId : "null"}`);
    
        return node.value + Math.max(0, Math.max(left, right));
    }
    
    async function loadAnimation() {
        frames = [];
        currentFrame = 0;
        maxSum = -Infinity;
        highlightedNodes = [];
        highlightedEdges = [];

        setNodePositions(treeRoot, 0, 0, 220);
        
        recordFrame("Initialized binary tree");

        maxPathSumHelper(treeRoot);

        drawFrame(frames[0]);
    }

    function playAnimation() {
        if (isPlaying) return;
        isPlaying = true;

        const getSpeed = () => {
            const fastest = 50;
            const slowest = 3000;
            return slowest - (speedSlider.value / 100) * (slowest - fastest);
        };

        function step() {
            if (!isPlaying || currentFrame >= frames.length - 1) {
                isPlaying = false;
                return;
            }
            currentFrame++;
            drawFrame(frames[currentFrame]);
            setTimeout(step, getSpeed());
        }
        step();
    }

    function pauseAnimation() {
        isPlaying = false;
    }

    function stepForward() {
        if (currentFrame < frames.length - 1) {
            currentFrame++;
            drawFrame(frames[currentFrame]);
        }
    }

    function stepBackward() {
        if (currentFrame > 0) {
            currentFrame--;
            drawFrame(frames[currentFrame]);
        }
    }

    function moveToFrame(event) {
        const rect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percent = clickX / rect.width;
        currentFrame = Math.round(percent * (frames.length - 1));
        drawFrame(frames[currentFrame]);
    }

    function resetAnimation() {
        pauseAnimation();
        currentFrame = 0;
        drawFrame(frames[0]);
    }

    function loadControlBar() {
        randListSize.disabled = false;
        randomizeButton.disabled = false;
        inputElement.placeholder = "Enter a list of 3-15 integers between 1 & 99 (ex. 99 1 24 59 34)";
        inputElement.disabled = false;
        customInputToggle.disabled = false;
        progressBar.disabled = false;
        speedSlider.disabled = false;
    }

    // Mouse interactions for pan & zoom
    window.mouseZoom = function (e) {
        e.preventDefault();
        const zoomIntensity = 0.1;
        zoom += e.deltaY < 0 ? zoomIntensity : -zoomIntensity;
        zoom = Math.max(0.2, Math.min(3, zoom));
        drawFrame(frames[currentFrame]);
    };
    window.mouseHold = function (e) {
        isDragging = true;
        dragStart = { x: e.clientX - panX, y: e.clientY - panY };
    };
    window.mouseDrag = function (e) { 
        if (isDragging) {
            panX = e.clientX - dragStart.x;
            panY = e.clientY - dragStart.y;
            drawFrame(frames[currentFrame]);
        }
    };
    window.mouseRelease = function () {
        isDragging = false;
     };

    graphCanvas.addEventListener("wheel", window.mouseZoom);
    graphCanvas.addEventListener("mousedown", window.mouseHold);
    graphCanvas.addEventListener("mousemove", window.mouseDrag);
    graphCanvas.addEventListener("mouseup", window.mouseRelease);
    graphCanvas.addEventListener("mouseleave", window.mouseRelease);

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
                defaultTreeRoot = createTreeWithNumNodes(inputList[0]);
                treeRoot = new TreeNode(defaultTreeRoot.id, defaultTreeRoot.value);
                treeRoot.left = defaultTreeRoot.left;
                treeRoot.right = defaultTreeRoot.right;
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
                    treeRoot = createTreeFromList(inputList);
                    loadAnimation();
                }
                else {
                    customInputToggle.checked = false;
                }
            }
        }
        else {
            pauseAnimation();
            treeRoot = defaultTreeRoot;
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
        if (checkInputValues(inputList)) {
            inputWarningMessage.style.color = "#f4f4f4";
            return true;
        } else {
            inputWarningMessage.textContent = "Error: Enter integer values between 1 and 99 only";
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

    // Returns true if all the elements in the given list are between 1 & 99, else returns false
    function checkInputValues(inputList) {
        for (let i = 0; i < inputList.length; i++) {
            if (inputList[i] > 99 || inputList[i] < 1) {
                return false;
            }
        }
        return true;
    }

    window.activeController = new AnimationController(
        loadAnimation,
        loadControlBar,
        playAnimation,
        pauseAnimation,
        stepForward,
        stepBackward,
        moveToFrame,
        resetAnimation,
        randomizeInput,
        toggleCustomInput
    );
};
