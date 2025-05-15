window.loadKnapsack = function () {
    const randListSize = document.getElementById('randListSize');
    const sizeWarningMessage = document.getElementById('sizeWarningMessage');
    const randomizeButton = document.getElementById('randomizeButton');
    const inputElement = document.getElementById('customInput');
    const customInputToggle = document.getElementById('customInputToggle');
    const progressBar = document.getElementById("progressBar");
    const progressFill = document.getElementById("progressFill");
    const speedSlider = document.getElementById("speedSlider");
    const graphCanvas = document.getElementById('graphCanvas');
    const boxListCanvas = document.getElementById('boxListCanvas');
    const stepLog = document.getElementById('stepLog');

    // Add a new panel to display the output list
    const middlePanels = document.querySelector('.middle-panels');
    const outputArrayPanel = document.createElement('div');
    outputArrayPanel.style.border = '0.125em solid #ccc';
    outputArrayPanel.style.borderStyle = 'solid';
    outputArrayPanel.style.paddingBottom = '1%';
    outputArrayPanel.classList.add('panel');
    outputArrayPanel.id = 'outputArrayPanel';
    const outputArrayCanvas = document.createElement('canvas');
    outputArrayCanvas.id = 'outputArrayCanvas';
    outputArrayPanel.appendChild(outputArrayCanvas);

    middlePanels.insertBefore(outputArrayPanel, stepLog);

    graphCanvas.width = graphCanvas.parentElement.clientWidth;
    graphCanvas.height = graphCanvas.parentElement.clientHeight + 60;
    boxListCanvas.width = boxListCanvas.parentElement.clientWidth;
    boxListCanvas.height = boxListCanvas.parentElement.clientHeight / 2;
    outputArrayCanvas.width = outputArrayCanvas.parentElement.clientWidth;
    outputArrayCanvas.height = outputArrayCanvas.parentElement.clientHeight / 2;

    const graphCtx = graphCanvas.getContext('2d');
    const boxListCtx = boxListCanvas.getContext('2d');
    const outputArrayCtx = outputArrayCanvas.getContext('2d');

    let currentItemsCount = Math.floor(Math.random() * (10 - 2 + 1) + 2);
    let currentWeights = generateRandomList(currentItemsCount);
    let currentValues = generateRandomList(currentItemsCount);
    let currentCapacity = Math.floor(Math.random() * (15 - 11 + 1) + 11);
    let currentTable = createTable(currentItemsCount + 1, currentCapacity + 1);
    let frames = [];
    let currentFrame = 0;
    let isPlaying = false;
    let currentTableIndex = -1;
    let currentWeightValueIndex = -1;
    let pickIndex = -1;
    let notPickIndex = -1;
    let offsetX = 0;
    let offsetY = 0;
    let panX = 0, panY = 0, zoom = 1;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
 
    const VERTICAL_PADDING = 60; // Minimum spacing of graph bars from top and bottom of container

    function drawFrame(frame) {
        if (!frame) return;
        ({ currentTable, currentTableIndex, currentWeightValueIndex, pickIndex, notPickIndex } = frame);
        drawData();
        updateProgressBar();
        updateStepLog();
    }

    function drawData() {
        graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        boxListCtx.clearRect(0, 0, boxListCanvas.width, boxListCanvas.height);
        outputArrayCtx.clearRect(0, 0, outputArrayCanvas.width, outputArrayCanvas.height);
        drawWeightsArrayVisualization();
        drawValuesArrayVisualization();
        drawTableVisualization();
    }

    function drawTableVisualization(){
        graphCtx.save();
        graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        graphCtx.translate(panX, panY);
        graphCtx.scale(zoom, zoom);

        const numRows = currentTable.length;
        const numColumns = currentTable[0].length;
        const baseBoxSize = Math.min(graphCanvas.width / numColumns, graphCanvas.height / numRows);
        const boxSize = baseBoxSize * zoom;
        const totalWidth = numColumns * boxSize;
        const totalHeight = numRows * boxSize;

        // Centering the grid on the canvas
        const startX = (graphCanvas.width - totalWidth) / 2 + offsetX;
        const startY = (graphCanvas.height - totalHeight) / 2 + offsetY;
    
        // Set font size dynamically
        const fontSize = Math.max(12, boxSize * 0.3);
        graphCtx.font = `${fontSize}px Arial`;
        graphCtx.textAlign = 'center';
        graphCtx.textBaseline = 'middle';
    
        // Iterate over the 2D array (rows and columns)
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numColumns; col++) {
                const x = startX + col * boxSize;
                const y = startY + row * boxSize;
    
                graphCtx.fillStyle = getColorTable([row, col]);
                graphCtx.fillRect(x, y, boxSize, boxSize);
                graphCtx.strokeStyle = 'black';
                graphCtx.strokeRect(x, y, boxSize, boxSize); 
    
                // Centered text inside the box
                graphCtx.fillStyle = 'black';
                graphCtx.fillText(currentTable[row][col], x + boxSize / 2, y + boxSize / 2);
            }
        }

        graphCtx.restore();
    }

    function drawValuesArrayVisualization(){
        const numBoxes = currentValues.length;
        const boxSize = Math.min(outputArrayCanvas.width / numBoxes, outputArrayCanvas.height);
        const totalWidth = numBoxes * boxSize;
        const startX = (outputArrayCanvas.width - totalWidth) / 2;
        const y = (outputArrayCanvas.height - boxSize) / 2;

        const fontSize = Math.max(12, boxSize * 0.3);
        outputArrayCtx.font = `${fontSize}px Arial`;
        outputArrayCtx.textAlign = 'center';
        outputArrayCtx.textBaseline = 'middle';

        for (let i = 0; i < numBoxes; i++) {
            const x = startX + i * boxSize;
            outputArrayCtx.fillStyle = getColor(i);
            outputArrayCtx.fillRect(x, y, boxSize, boxSize);
            outputArrayCtx.strokeStyle = 'black';
            outputArrayCtx.strokeRect(x, y, boxSize, boxSize); // Full border

            // Centered text
            outputArrayCtx.fillStyle = 'black';
            outputArrayCtx.fillText(currentValues[i], x + boxSize / 2, y + boxSize / 2);
        }
    }

    function drawWeightsArrayVisualization() {
        const numBoxes = currentWeights.length;
        const boxSize = Math.min(boxListCanvas.width / numBoxes, boxListCanvas.height);
        const totalWidth = numBoxes * boxSize;
        const startX = (boxListCanvas.width - totalWidth) / 2;
        const y = (boxListCanvas.height - boxSize) / 2;

        const fontSize = Math.max(12, boxSize * 0.3);
        boxListCtx.font = `${fontSize}px Arial`;
        boxListCtx.textAlign = 'center';
        boxListCtx.textBaseline = 'middle';

        for (let i = 0; i < numBoxes; i++) {
            const x = startX + i * boxSize;
            boxListCtx.fillStyle = getColor(i);
            boxListCtx.fillRect(x, y, boxSize, boxSize);
            boxListCtx.strokeStyle = 'black';
            boxListCtx.strokeRect(x, y, boxSize, boxSize); // Full border

            // Centered text
            boxListCtx.fillStyle = 'black';
            boxListCtx.fillText(currentWeights[i], x + boxSize / 2, y + boxSize / 2);
        }
    }

    function getColorTable(index){
        if (JSON.stringify(index) == JSON.stringify(currentTableIndex)) return 'red';
        if (JSON.stringify(index) == JSON.stringify(pickIndex) || JSON.stringify(index) == JSON.stringify(notPickIndex)) return 'blue';
        return 'lightblue';
    }

    function getColor(index){
        if (index === currentWeightValueIndex) return 'red';
        return 'lightblue';
    }

    async function knapsack(table){
        for (let i = 0; i <= currentItemsCount; i++) {
            for (let j = 0; j <= currentCapacity; j++) {
                currentTableIndex = [i, j];
                pickIndex = -1;
                currentWeightValueIndex = -1;
                appendToExplanation("");
    
                if (i === 0 || j === 0)
                    table[i][j] = 0;
                else {
                    let pick = 0;
    
                    if (currentWeights[i - 1] <= j){
                        pickIndex = [i-1, j - currentWeights[i-1]];
                        currentWeightValueIndex = i - 1;
                        pick = currentValues[i - 1] + table[i - 1][j - currentWeights[i - 1]];
                    }
            
                    notPickIndex = [i-1, j];
    
                    let notPick = table[i - 1][j];
    
                    table[i][j] = Math.max(pick, notPick);  
                    
                    if (pick === 0){
                        appendToExplanation(`Used value at row ${i - 1} and column ${j} since no pick was available`);
                    }
                    else{
                        if (table[i][j] == pick){
                            appendToExplanation(`Pick item since it had greater value ${pick} than not pick with value ${notPick}`);
                        }
                        else{
                            appendToExplanation(`Not pick item since its value of ${notPick} was greater than pick with value ${pick}`);
                        }
                    }              
                }
            }
        }    
    }

    function recordFrame(explanation = "") {
        frames.push(JSON.parse(JSON.stringify({
            currentTable: copy2DArray(currentTable),
            currentTableIndex,
            currentWeightValueIndex,
            pickIndex,
            notPickIndex,
            explanation
        })));
    }

    // Adds new frame, step log explanation is given as text parameter
    function appendToExplanation(text) {
        recordFrame(text);
    }

    function updateProgressBar() {
        const progress = (currentFrame / (frames.length - 1)) * 100;
        progressFill.style.width = `${progress}%`;
    }

    
    function updateStepLog() {
        stepLog.innerHTML = ""; // Reset log
        stepLog.innerHTML += `Knapsack Capacity: ${currentCapacity}<br>`; // Initial list
        stepLog.innerHTML += `Total Number of Items: ${currentItemsCount}<br>`; // Initial list

        for (let i = 1; i <= currentFrame; i++) {
            if (frames[i].explanation) {
                stepLog.innerHTML += frames[i].explanation + "<br>";
            }
        }

        if (currentFrame === frames.length - 1) {
            stepLog.innerHTML += `Best possible value is: ${currentTable[currentTable.length-1][currentTable[0].length -1]}<br>`; // Initial list
        }

        stepLog.scrollTop = stepLog.scrollHeight;
    }

    function playAnimation() {
        if (isPlaying) return;
        isPlaying = true;

        // Sets animation play speed based on speedSlider value
        function getAnimationSpeed() {
            const fastestSpeed = 20;  // (ms)
            const slowestSpeed = 2000; // (ms)
            return slowestSpeed - (speedSlider.value / 100) * (slowestSpeed - fastestSpeed);
        }

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
        const rect = progressBar.getBoundingClientRect(); // Get position & size
        const clickX = event.clientX - rect.left; // Click position within bar
        const progressPercent = clickX / rect.width; // Convert to percentage
        currentFrame = Math.round(progressPercent * (frames.length - 1)); // Map to frame
        drawFrame(frames[currentFrame]); // Update animation state
    }

    async function loadAnimation() {
        frames = [];
        currentFrame = 0;

        // First frame: initial array, no highlights
        frames.push({
            currentTable: copy2DArray(currentTable),
            currentWeights: [...currentWeights],
            currentValues: [...currentValues],
            currentTableIndex: -1,
            currentWeightValueIndex: -1,
            pickIndex: -1,
            notPickIndex: -1,
            explanation: ""
        });

        // Middle frames: has highlights
        await knapsack(currentTable);

        // Last frame: final sorted array, no highlights
        frames.push({
            currentTable: copy2DArray(currentTable),
            currentWeights: [...currentWeights],
            currentValues: [...currentValues],
            currentTableIndex: -1,
            currentWeightValueIndex: -1,
            pickIndex: -1,
            notPickIndex: -1,
            explanation: ""
        });

        drawFrame(frames[currentFrame]);
    }

    function loadControlBar() {
        randListSize.disabled = false;
        randomizeButton.disabled = false;
        inputElement.disabled = true;
        customInputToggle.disabled = true;
        progressBar.disabled = false;
        speedSlider.disabled = false;
    }

    function resetAnimation() {
        pauseAnimation();
        currentFrame = 0;
        drawFrame(frames[currentFrame]);
    }

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
                currentItemsCount = inputList[0];
                currentWeights = generateRandomList(currentItemsCount);
                currentValues = generateRandomList(currentItemsCount);
                currentCapacity = Math.floor(Math.random() * (15 - 11 + 1) + 11);
                currentTable = createTable(currentItemsCount + 1, currentCapacity + 1);
                loadAnimation();
            }
        }
    }

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
            sizeWarningMessage.textContent = "Error: Enter only 1 integer";
            sizeWarningMessage.style.color = "red";
            return false;
        }
        if (inputList[0] < 2 || inputList[0] > 10) {
            sizeWarningMessage.textContent = "Error: Enter an integer between 2-10";
            sizeWarningMessage.style.color = "red";
            return false;
        }
        sizeWarningMessage.textContent = "---";
        sizeWarningMessage.style.color = "#f4f4f4";
        return true;
    }

    // Returns true if all the elements in the given list are whole numbers, else it returns false
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
        let arr = new Array(size);
        for (let i = 0; i < size; i++){
            arr[i] = Math.floor(Math.random() * (8 - 1 + 1) + 1);
        }
        arr = arr.sort()

        return arr;
    }

    function createTable(rows, columns){
        const arr = new Array(rows);

        for (let i = 0; i < rows; i++){
            arr[i] = new Array(columns);
        }

        for (let i = 0; i < rows; i++){
            for (let j = 0; j < columns; j++){
                arr[i][j] = 0;
            }
        }

        return arr;
    }

    function copy2DArray(arr) {
        return arr.map(row => [...row]);
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

    window.activeController = new AnimationController(loadAnimation, loadControlBar, playAnimation, pauseAnimation, stepForward, stepBackward, 
        moveToFrame, resetAnimation, randomizeInput);
    
};

