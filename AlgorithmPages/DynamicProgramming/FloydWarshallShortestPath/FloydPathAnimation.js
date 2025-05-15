window.loadFloydPath = function () {
    const randListSize = document.getElementById('randListSize');
    const sizeWarningMessage = document.getElementById('sizeWarningMessage');
    const randomizeButton = document.getElementById('randomizeButton');
    const progressBar = document.getElementById("progressBar");
    const progressFill = document.getElementById("progressFill");
    const speedSlider = document.getElementById("speedSlider");
    const graphCanvas = document.getElementById("graphCanvas");
    const stepLog = document.getElementById("stepLog");

    const boxListVisual = document.getElementById("boxListVisual");
    const middlePanel = document.querySelector(".middle-panels");
    middlePanel.removeChild(boxListVisual);

    graphCanvas.width = graphCanvas.parentElement.clientWidth;
    graphCanvas.height = graphCanvas.parentElement.clientHeight;
    const graphCtx = graphCanvas.getContext("2d");

    const radius = 30;
    let graphSize = Math.round(Math.random() * 4 + 3);
    let currentEdges = createWeightedEdges(graphSize);
    let dist = Array.from({ length: graphSize }, () => Array(graphSize).fill(Infinity));
    let next = Array.from({ length: graphSize }, () => Array(graphSize).fill(null));
    let frames = [];
    let currentFrame = 0;
    let isPlaying = false;

    let highlightedEdges = [];
    let highlightedNodes = [];
    let highlightMiddle = null;
    let nodePositions = [];

    function createWeightedEdges(n) {
        const adj = Array.from({ length: n }, () => []);
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (Math.random() > 0.5) {
                    const weight = Math.round(Math.random() * 10) + 1;
                    adj[i].push({ node: j, weight });
                    adj[j].push({ node: i, weight });
                }
            }
        }
        return adj;
    }

    function reconstructPath(from, to) {
        if (next[from][to] === null) return [];
        const path = [from];
        while (from !== to) {
            from = next[from][to];
            if (from === null) return [];
            path.push(from);
        }
        return path;
    }

    function getPathEdges(from, to, via) {
        const edges = [];
        const firstLeg = reconstructPath(from, via);
        const secondLeg = reconstructPath(via, to);

        for (let i = 0; i < firstLeg.length - 1; i++) {
            edges.push([firstLeg[i], firstLeg[i + 1]]);
        }
        for (let i = 0; i < secondLeg.length - 1; i++) {
            edges.push([secondLeg[i], secondLeg[i + 1]]);
        }

        return edges;
    }

    function drawGraphVisualization() {
        graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        const numNodes = graphSize;
        const centerX = graphCanvas.width / 2;
        const centerY = graphCanvas.height / 2;
        const graphRadius = Math.min(graphCanvas.width, graphCanvas.height) / 2 - radius * 2;

        nodePositions = [];
        graphCtx.font = "16px Arial";
        graphCtx.textAlign = "center";
        graphCtx.textBaseline = "middle";

        for (let i = 0; i < numNodes; i++) {
            const angle = (i / numNodes) * (2 * Math.PI);
            const x = centerX + graphRadius * Math.cos(angle);
            const y = centerY + graphRadius * Math.sin(angle);
            nodePositions.push({ x, y });
        }

        // Draw edges
        for (let i = 0; i < currentEdges.length; i++) {
            for (let { node: j, weight } of currentEdges[i]) {
                if (i < j) {
                    const start = nodePositions[i];
                    const end = nodePositions[j];
                    const edgeColor = highlightedEdges.some(
                        ([a, b]) =>
                            (a === i && b === j) || (a === j && b === i)
                    )
                        ? "red"
                        : "black";

                    graphCtx.beginPath();
                    graphCtx.moveTo(start.x, start.y);
                    graphCtx.lineTo(end.x, end.y);
                    graphCtx.strokeStyle = edgeColor;
                    graphCtx.stroke();

                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    graphCtx.fillStyle = "black";
                    graphCtx.fillText(weight, midX, midY);
                }
            }
        }

        // Draw nodes
        for (let i = 0; i < numNodes; i++) {
            const { x, y } = nodePositions[i];
            let color = "lightblue";
            if (highlightedNodes.includes(i)) {
                color = i === highlightMiddle ? "CornflowerBlue" : "red";
            }

            graphCtx.fillStyle = color;
            graphCtx.beginPath();
            graphCtx.arc(x, y, radius, 0, 2 * Math.PI);
            graphCtx.fill();
            graphCtx.strokeStyle = "black";
            graphCtx.stroke();

            // Label inside node
            graphCtx.fillStyle = "black";
            graphCtx.fillText(`${i}`, x, y);
        }
    }

    function recordFrame(explanation = "") {
        frames.push({
            dist: dist.map((row) => [...row]),
            next: next.map((row) => [...row]),
            explanation,
            highlightedEdges: [...highlightedEdges],
            highlightedNodes: [...highlightedNodes],
            highlightMiddle,
        });
    }

    function drawFrame(frame) {
        dist = frame.dist.map((row) => [...row]);
        next = frame.next.map((row) => [...row]);
        highlightedEdges = [...frame.highlightedEdges];
        highlightedNodes = [...frame.highlightedNodes];
        highlightMiddle = frame.highlightMiddle;

        drawGraphVisualization();
        updateStepLog();
        updateProgressBar();
    }

    function updateStepLog() {
        stepLog.innerHTML = "";
        for (let i = 1; i <= currentFrame; i++) {
            if (frames[i].explanation) {
                stepLog.innerHTML += frames[i].explanation + "<br>";
            }
        }

        if (currentFrame === frames.length - 1) {
            stepLog.innerHTML += "<strong>Shortest Path Between All Node Pairs:</strong><br>";
            for (let i = 0; i < graphSize; i++) {
                for (let j = 0; j < graphSize; j++) {
                    const val = dist[i][j] === Infinity ? "INF" : dist[i][j];
                    stepLog.innerHTML += `Node ${i} to Node ${j} = ${val}<br>`;
                }
            }
        }
        stepLog.scrollTop = stepLog.scrollHeight;
    }

    function updateProgressBar() {
        const progress = (currentFrame / (frames.length - 1)) * 100;
        progressFill.style.width = `${progress}%`;
    }

    async function floydWarshall() {
        // Initialize
        for (let i = 0; i < graphSize; i++) {
            dist[i][i] = 0;
            for (let { node: j, weight } of currentEdges[i]) {
                dist[i][j] = weight;
                next[i][j] = j;
            }
        }
        recordFrame("Initialized distance matrix");

        let space = ' ';
        for (let k = 0; k < graphSize; k++) {
            for (let i = 0; i < graphSize; i++) {
                for (let j = 0; j < graphSize; j++) {
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                        next[i][j] = next[i][k];

                        highlightedEdges = getPathEdges(i, j, k);
                        highlightedNodes = [i, j, k];
                        highlightMiddle = k;

                        recordFrame(`Shortest path between Node ${i} and Node ${j} using Node ${k} intermediate = ${dist[i][j]}`);
                    }
                }
            }
        }

        highlightedNodes = [];
        highlightedEdges = [];
        recordFrame("");
    }

    async function loadAnimation() {
        frames = [];
        currentFrame = 0;
        dist = Array.from({ length: graphSize }, () => Array(graphSize).fill(Infinity));
        next = Array.from({ length: graphSize }, () => Array(graphSize).fill(null));
        highlightedEdges = [];
        highlightedNodes = [];
        highlightMiddle = null;

        await floydWarshall();
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
        drawFrame(frames[currentFrame]);
    }

    function loadControlBar() {
        randListSize.disabled = false;
        randomizeButton.disabled = false;
        progressBar.disabled = false;
        speedSlider.disabled = false;
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
                graphSize = inputList[0];
                currentEdges = createWeightedEdges(graphSize);
                dist = Array.from({ length: graphSize }, () => Array(graphSize).fill(Infinity));
                next = Array.from({ length: graphSize }, () => Array(graphSize).fill(null));
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
        if (inputList[0] < 3 || inputList[0] > 7) {
            sizeWarningMessage.textContent = "Error: Enter an integer between 3-7";
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

    window.activeController = new AnimationController(
        loadAnimation,
        loadControlBar,
        playAnimation,
        pauseAnimation,
        stepForward,
        stepBackward,
        moveToFrame,
        resetAnimation,
        randomizeInput
    );
};