window.loadCountingSort = function () {
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
    graphCanvas.height = graphCanvas.parentElement.clientHeight / 2;
    boxListCanvas.width = boxListCanvas.parentElement.clientWidth;
    boxListCanvas.height = boxListCanvas.parentElement.clientHeight / 2;
    outputArrayCanvas.width = outputArrayCanvas.parentElement.clientWidth;
    outputArrayCanvas.height = outputArrayCanvas.parentElement.clientHeight / 2;

    const graphCtx = graphCanvas.getContext('2d');
    const boxListCtx = boxListCanvas.getContext('2d');
    const outputArrayCtx = outputArrayCanvas.getContext('2d');

    let defaultData = generateRandomList(Math.floor(Math.random() * (20 - 8 + 1) + 8));
    let currentData = [...defaultData];
    let defaultCountData = createCountingList();
    let currentCountData = [...defaultCountData];
    // Creates a copy of the count array
    let countData = [...currentCountData];
    let defaultOutputData = new Array(currentData.length).fill(0);
    let outputData = [...defaultOutputData];
    let frames = [];
    let currentFrame = 0;
    let isPlaying = false;
    let currentIndex = -1;
    let outputIndex = -1;
    let countIndex = -1;
    let prevCountIndex = -1;
 
    const VERTICAL_PADDING = 60; // Minimum spacing of graph bars from top and bottom of container

    /*
    Creates the counting array by finding the max value in the input list and setting
    the coutning array to be the same length as the max value then filling the array with all zeros
    */
    function createCountingList(){
        const n = currentData.length;
        let maxVal = 0;
        for (let i = 0; i < n; i++){
            maxVal = Math.max(maxVal, Math.abs(currentData[i]));
        }

        let initialArray = new Array(maxVal + 1).fill(0);

        return initialArray;
    }

    function drawFrame(frame) {
        if (!frame) return;
        ({ currentData, countData, outputData, currentIndex, outputIndex, countIndex, prevCountIndex } = frame);
        drawData();
        updateProgressBar();
        updateStepLog();
    }

    function drawData() {
        graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        boxListCtx.clearRect(0, 0, boxListCanvas.width, boxListCanvas.height);
        outputArrayCtx.clearRect(0, 0, outputArrayCanvas.width, outputArrayCanvas.height);
        drawGraphVisualization();
        drawBoxListVisualization();
        drawOutputArrayVisualization();
    }

    function drawGraphVisualization(){
        const numBoxes = countData.length;
        const boxSize = Math.min(graphCanvas.width / numBoxes, graphCanvas.height);
        const totalWidth = numBoxes * boxSize;
        const startX = (graphCanvas.width - totalWidth) / 2;
        const y = (graphCanvas.height - boxSize) / 2;

        const fontSize = Math.max(12, boxSize * 0.3);
        graphCtx.font = `${fontSize}px Arial`;
        graphCtx.textAlign = 'center';
        graphCtx.textBaseline = 'middle';

        for (let i = 0; i < numBoxes; i++) {
            const x = startX + i * boxSize;
            graphCtx.fillStyle = getColorCount(i);
            graphCtx.fillRect(x, y, boxSize, boxSize);
            graphCtx.strokeStyle = 'black';
            graphCtx.strokeRect(x, y, boxSize, boxSize); // Full border

            // Centered text
            graphCtx.fillStyle = 'black';
            graphCtx.fillText(countData[i], x + boxSize / 2, y + boxSize / 2);
        }
    }

    function drawOutputArrayVisualization(){
        const numBoxes = outputData.length;
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
            outputArrayCtx.fillStyle = getColorOutput(i);
            outputArrayCtx.fillRect(x, y, boxSize, boxSize);
            outputArrayCtx.strokeStyle = 'black';
            outputArrayCtx.strokeRect(x, y, boxSize, boxSize); // Full border

            // Centered text
            outputArrayCtx.fillStyle = 'black';
            outputArrayCtx.fillText(outputData[i], x + boxSize / 2, y + boxSize / 2);
        }
    }

    function drawBoxListVisualization() {
        const numBoxes = currentData.length;
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
            boxListCtx.fillText(currentData[i], x + boxSize / 2, y + boxSize / 2);
        }
    }

    function getColorCount(index){
        if (index === countIndex) return 'blue';
        if (index === prevCountIndex) return 'red';
        return 'lightblue';
    }

    function getColor(index) {
        if (index === currentIndex) return 'blue';
        return 'lightblue';
    }

    function getColorOutput(index){
        if (index === outputIndex) return 'blue';
        return 'lightblue';
    }

    async function countingSort(arr, countArray, finalArray){
        const n = arr.length;
        const M = countArray.length - 1;
        
        for (let i = 0; i < n; i++){
            countArray[arr[i]]++;
            currentIndex = i;
            countIndex = arr[i];
            appendToExplanation(`Mapped value ${arr[i]} to index equal to that value in counting array`);
        }

        currentIndex = -1;

        for (let i = 1; i < M + 1; i++){
            countArray[i] += countArray[i-1];
            countIndex = i;
            prevCountIndex = i - 1;
            appendToExplanation(`Added value from index ${i-1} to value in index ${i} in counting array`);
        }

        prevCountIndex = -1;

        for (let i = n - 1; i >=0; i--){
            outputIndex = countArray[arr[i] -1];
            countIndex = arr[i];
            currentIndex = i;
            finalArray[countArray[arr[i]] - 1] = arr[i];
            countArray[arr[i]]--;
            appendToExplanation(`Put the value ${arr[i]} to index ${arr[i] - 1} in the output array, and decrement the value's corresponding index in counting array`);
        }

        return countArray;
    }

    function recordFrame(explanation = "") {
        frames.push(JSON.parse(JSON.stringify({
            currentData: [...currentData],
            countData: [...countData],
            outputData: [...outputData],
            currentIndex, 
            countIndex, 
            prevCountIndex,
            outputIndex, 
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
        stepLog.innerHTML += `Initial List: ${currentData.join(", ")}<br>`; // Initial list
        stepLog.innerHTML += `Initial Count List: ${currentCountData.join(", ")}<br>`; // Initial list

        for (let i = 1; i <= currentFrame; i++) {
            if (frames[i].explanation) {
                stepLog.innerHTML += frames[i].explanation + "<br>";
            }
        }

        if (currentFrame === frames.length - 1) {
            stepLog.innerHTML += `Sorted List: ${outputData.join(", ")}<br>`; // Final list
            stepLog.innerHTML += `Final Count List: ${countData.join(", ")}`; // Final list

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
        currentData = [...currentData];
        countData = [...currentCountData];
        outputData = [...outputData];

        // First frame: initial array, no highlights
        frames.push({
            currentData: [...currentData],
            countData: [...countData],
            outputData: [...outputData],
            currentIndex: -1,
            outputIndex: -1,
            countIndex: -1,
            prevCountIndex: -1,
            explanation: ""
        });

        // Middle frames: has highlights
        await countingSort(currentData, countData, outputData);

        // Last frame: final sorted array, no highlights
        frames.push({
            currentData: [...currentData],
            countData: [...countData],
            outputData: [...outputData],
            currentIndex: -1,
            outputIndex: -1,
            countIndex: -1,
            prevCountIndex: -1,
            explanation: ""
        });

        drawFrame(frames[currentFrame]);
    }

    function loadControlBar() {
        randListSize.disabled = false;
        randomizeButton.disabled = false;
        inputElement.placeholder = "Enter a list of 2-20 integers between 0 & 30 (ex. 30 10 25 0 17)";
        inputElement.disabled = false;
        customInputToggle.disabled = false;
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
                defaultData = generateRandomList(inputList[0]);
                currentData = [...defaultData];
                defaultCountData = createCountingList();
                defaultOutputData = Array(currentData.length).fill(0);
                currentCountData = [...defaultCountData];
                outputData = [...defaultOutputData];
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
        if (inputList[0] < 2 || inputList[0] > 20) {
            sizeWarningMessage.textContent = "Error: Enter an integer between 2-20";
            sizeWarningMessage.style.color = "red";
            return false;
        }
        sizeWarningMessage.textContent = "---";
        sizeWarningMessage.style.color = "#f4f4f4";
        return true;
    }

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
                    currentCountData = createCountingList();
                    outputData = Array(currentData.length).fill(0);
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
            currentCountData = [...defaultCountData];
            outputData = [...defaultOutputData];
            loadAnimation();
            randListSize.disabled = false;
            randomizeButton.disabled = false;
            inputElement.disabled = false;
        }
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
    
    function checkInputValues(inputList) {
        for (let i = 0; i < inputList.length; i++) {
            if (inputList[i] > 30 || inputList[i] < 0)
            {
                return false;
            }
        }
        return true;
    }

    function checkCustomInput(inputList) {
        if (inputList == "") {
            inputWarningMessage.textContent = "Invalid Input: Enter an input";
            inputWarningMessage.style.color = "red";
            return false;
        }
        else if (inputList.length > 20 && isWholeNumbers(inputList)) {
            inputWarningMessage.textContent = "Invalid Input: Only accepts integers and max 20 total values";
            inputWarningMessage.style.color = "red";
            return false;
        }
        else if (inputList.length < 2 && !isWholeNumbers(inputList)) {
            inputWarningMessage.textContent = "Invalid Input: Only accepts integers and a minimum of 2 values";
            inputWarningMessage.style.color = "red";
            return false;
        }
        else if (inputList.length > 20) {
            inputWarningMessage.textContent = "Invalid Input: Only accepts a maximum of 20 values";
            inputWarningMessage.style.color = "red";
            return false;
        }
        else if (!isWholeNumbers(inputList)) {
            inputWarningMessage.textContent = "Invalid Input: Only accepts integers";
            inputWarningMessage.style.color = "red";
            return false;
        }
        else if (inputList.length < 2) {
            inputWarningMessage.textContent = "Invalid Input: Only accepts a minimum of 2 values";
            inputWarningMessage.style.color = "red";
            return false;
        }
        else {
            if (checkInputValues(inputList)) {
                inputWarningMessage.style.color = "#f4f4f4";
                return true;
            }
            else {
                inputWarningMessage.textContent = "Invalid Input: Only accepts integers between 0 and 30";
                inputWarningMessage.style.color = "red";
                return false;
            }
        }
    }

    // Randomizes the size and values of the default input list on initialization of the webpage
    function generateRandomList(size){
        let defaultArray = new Array(size);
        for (let i = 0; i < size; i++){
            defaultArray[i] = Math.floor(Math.random() * 30);
        }

        return defaultArray
    }

    window.activeController = new AnimationController(loadAnimation, loadControlBar, playAnimation, pauseAnimation, stepForward, stepBackward, 
        moveToFrame, resetAnimation, randomizeInput, toggleCustomInput);
    
};

