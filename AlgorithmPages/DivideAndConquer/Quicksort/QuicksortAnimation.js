// Middle Display Panels Animation - Quicksort 
window.loadQuicksort = function () {
    // Get references to various DOM elements used for user input, warnings, and animation rendering
    const randListSize = document.getElementById('randListSize');
    const sizeWarningMessage = document.getElementById('sizeWarningMessage');
    const randomizeButton = document.getElementById('randomizeButton');
    const inputElement = document.getElementById('customInput');
    const customInputToggle = document.getElementById('customInputToggle');
    const inputWarningMessage = document.getElementById('inputWarningMessage');
    const progressBar = document.getElementById("progressBar");
    const progressFill = document.getElementById("progressFill");
    const speedSlider = document.getElementById("speedSlider");
    const graphCanvas = document.getElementById('graphCanvas');
    const boxListCanvas = document.getElementById('boxListCanvas');
    const stepLog = document.getElementById("stepLog");

    // Set canvas dimensions dynamically to fit their parent containers
    graphCanvas.width = graphCanvas.parentElement.clientWidth;
    graphCanvas.height = graphCanvas.parentElement.clientHeight;
    boxListCanvas.width = boxListCanvas.parentElement.clientWidth;
    boxListCanvas.height = boxListCanvas.parentElement.clientHeight;

    // Get 2D drawing contexts for rendering animations
    const graphCtx = graphCanvas.getContext('2d');
    const boxListCtx = boxListCanvas.getContext('2d');

    // Initialize data for visualization
    let defaultData = generateRandomList(Math.round(Math.random() * 10 + 10)); // Generates random list of at least size 10
    let currentData = [...defaultData];
    let data = [...currentData];
    let frames = []; // Stores animation frames for step-by-step playback
    let currentFrame = 0;
    let isPlaying = false;
    let currentIndex = -1;
    let pivotIndex = -1;
    let swapIndices = [];

    const VERTICAL_PADDING = 60; // Minimum spacing of graph bars from top and bottom of container

    // Draws current animation frame based on stored frame data
    function drawFrame(frame) {
        if (!frame) return;
        ({ data, currentIndex, pivotIndex, swapIndices } = frame);
        drawData();
        updateProgressBar();
        updateStepLog();
    }

    // Clears and redraws both visualization canvases
    function drawData() {
        graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        boxListCtx.clearRect(0, 0, boxListCanvas.width, boxListCanvas.height);
        drawGraphVisualization();
        drawBoxListVisualization();
    }

    // Draws the bar-graph representation of the data array
    function drawGraphVisualization() {
        const barWidth = graphCanvas.width / data.length;
        const fontSize = Math.min(24, Math.max(12, barWidth * 0.3));
        graphCtx.font = `${fontSize}px Arial`;
        graphCtx.textAlign = 'center';
        graphCtx.textBaseline = 'middle';

        const maxAbsValue = Math.max(...data.map(Math.abs));
        const centerY = graphCanvas.height / 2;
        const graphHeight = graphCanvas.height - VERTICAL_PADDING;

        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const barHeight = (value / maxAbsValue) * (graphHeight / 2);
            const x = i * barWidth;
            const y = barHeight >= 0 ? centerY - barHeight : centerY;

            graphCtx.fillStyle = getColor(i);
            graphCtx.fillRect(x, y, barWidth, Math.abs(barHeight));

            // Draw bar outline (skip bottom edge)
            graphCtx.strokeStyle = 'black';
            graphCtx.beginPath();
            graphCtx.moveTo(x, y);
            graphCtx.lineTo(x + barWidth, y);
            graphCtx.lineTo(x + barWidth, y + Math.abs(barHeight));
            graphCtx.lineTo(x, y + Math.abs(barHeight));
            graphCtx.closePath();
            graphCtx.stroke();

            // Draw number slightly outside the bar (with buffer)
            graphCtx.fillStyle = 'black';
            const numberOffset = fontSize * 0.6; // Extra buffer for clarity
            const numberY = barHeight >= 0 ? y - numberOffset : y + Math.abs(barHeight) + numberOffset;
            graphCtx.fillText(value, x + barWidth / 2, numberY);
        }
    }

    // Draws the box-list representation of the data array
    function drawBoxListVisualization() {
        const numBoxes = data.length;
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
            boxListCtx.fillText(data[i], x + boxSize / 2, y + boxSize / 2);
        }
    }

    // Determines the color of elements in the visualization
    function getColor(index) {
        if (swapIndices.includes(index)) return 'red';
        if (index === currentIndex || index === pivotIndex) return 'blue';
        return 'lightblue';
    }

    // Controls the execution of the Quicksort algorithm
    async function quickSort(arr, left, right) {
        if (left < right) {
            let partitionIndex = await partition(arr, left, right);
            await quickSort(arr, left, partitionIndex - 1);
            await quickSort(arr, partitionIndex + 1, right);
        }
    }

    // Partitions the array and records sorting steps for visualization
    async function partition(arr, left, right) {
        let pivot = arr[right];
        pivotIndex = right;
        appendToExplanation(`Choosing pivot: ${pivot}`);
        let i = left - 1;
        for (let j = left; j < right; j++) {
            currentIndex = j;
            recordFrame();
            if (arr[j] < pivot) {
                i++;
                swapIndices = [i, j];
                [arr[i], arr[j]] = [arr[j], arr[i]];
                appendToExplanation(`Swapped ${arr[i]} and ${arr[j]}`);
                swapIndices = [];
            }
        }
        swapIndices = [i + 1, right];
        [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
        appendToExplanation(`Swapped ${arr[i + 1]} and ${arr[right]} (pivot to correct position)`);
        swapIndices = [];
        return i + 1;
    }

    // Records a snapshot of the current sorting step, adds frame to animation
    function recordFrame(explanation = "") {
        frames.push(JSON.parse(JSON.stringify({
            data: [...data],
            currentIndex,
            pivotIndex,
            swapIndices: [...swapIndices],
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
        stepLog.innerHTML += `Initial List: ${currentData.join(", ")}<br>`; // Initial list

        for (let i = 1; i <= currentFrame; i++) {
            if (frames[i].explanation) {
                stepLog.innerHTML += frames[i].explanation + "<br>";
            }
        }

        if (currentFrame === frames.length - 1) {
            stepLog.innerHTML += `Sorted List: ${data.join(", ")}`; // Final list
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
        data = [...currentData];

        // First frame: initial array, no highlights
        frames.push({
            data: [...data],
            currentIndex: -1,
            pivotIndex: -1,
            swapIndices: [],
            explanation: ""
        });

        // Middle frames: has highlights
        await quickSort(data, 0, data.length - 1);

        // Last frame: final sorted array, no highlights
        frames.push({
            data: [...data],
            currentIndex: -1,
            pivotIndex: -1,
            swapIndices: [],
            explanation: ""
        });

        drawFrame(frames[currentFrame]);
    }

    // Enables and contextualizes parts of top control bar relevant to Quicksort
    function loadControlBar() {
        randListSize.disabled = false;
        randomizeButton.disabled = false;
        inputElement.placeholder = "Enter a list of 2-20 integers between -200 & 200 (ex. 184 -23 14 -75 198)";
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
            let inputList = randListSize.value.trim().split(/\s+/); // turns input into a string list
            inputList = inputList.map(Number); // turns string list into a number list
            if (checkRandomizeInput(inputList)) {
                pauseAnimation();
                defaultData = generateRandomList(inputList[0]);
                currentData = [...defaultData];
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
                    currentData = inputList;
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
        if (inputList[0] < 2 || inputList[0] > 20) {
            sizeWarningMessage.textContent = "Error: Enter an integer between 2-20";
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
        if (inputList.length > 20 || inputList.length < 2) {
            inputWarningMessage.textContent = "Error: Enter 2 to 20 integers only";
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

    // Returns true if all the elements in the given list are between -200 & 200, else returns false
    function checkInputValues(inputList) {
        for (let i = 0; i < inputList.length; i++) {
            if (inputList[i] > 200 || inputList[i] < -200) {
                return false;
            }
        }
        return true;
    }

    // Generates random list of given size
    function generateRandomList(size) {
        let randomArray = new Array(size);
        for (let i = 0; i < size; i++) {
            const randomSeed = 0.5 - Math.random(); // used to generate random signage
            randomArray[i] = Math.round(randomSeed / Math.abs(randomSeed) * Math.random() * 200);
        }
        return randomArray;
    }

    // Ties Quicksort animation functionality to main page
    window.activeController = new AnimationController(loadAnimation, loadControlBar, playAnimation, pauseAnimation, stepForward, stepBackward, 
        moveToFrame, resetAnimation, randomizeInput, toggleCustomInput);
    
};