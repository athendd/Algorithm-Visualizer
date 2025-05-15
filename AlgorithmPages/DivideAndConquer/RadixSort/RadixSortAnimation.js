// Middle Display Panels Animation - Radix Sort
window.loadRadixSort = function () {
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

    // Add a new panel to display the [0-9] bucket list
    const middlePanels = document.querySelector('.middle-panels');
    const bucketPanel = document.createElement('div');
    bucketPanel.classList.add('panel');
    bucketPanel.id = 'outputArrayPanel';
    const bucketCanvas = document.createElement('canvas');
    bucketCanvas.id = 'outputArrayCanvas';
    bucketPanel.appendChild(bucketCanvas);
    middlePanels.insertBefore(bucketPanel, stepLog);

    // Set canvas dimensions dynamically to fit their parent containers
    [graphCanvas, boxListCanvas, bucketCanvas].forEach(canvas => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    });

    // Get 2D drawing contexts for rendering animations
    const graphCtx = graphCanvas.getContext('2d');
    const boxListCtx = boxListCanvas.getContext('2d');
    const bucketCtx = bucketCanvas.getContext('2d');

    // Initialize data for visualization
    let defaultData = generateRandomList(Math.round(Math.random() * 15 + 5)); // Generates random list of at least size 5
    let currentData = [...defaultData];
    let frames = [];
    let currentFrame = 0;
    let isPlaying = false;
    let currentIndex = -1;
    let buckets = [];

    const VERTICAL_PADDING = 40; // Minimum spacing of graph bars from top and bottom of container

    // Draws current animation frame based on stored frame data
    function drawFrame(frame) {
        if (!frame) return;
        ({ data, currentIndex, buckets } = frame);
        drawData();
        updateProgressBar();
        updateStepLog();
    }

    // Clears and redraws both visualization canvases
    function drawData() {
        graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        boxListCtx.clearRect(0, 0, boxListCanvas.width, boxListCanvas.height);
        bucketCtx.clearRect(0, 0, bucketCanvas.width, bucketCanvas.height);
        drawGraphVisualization();
        drawBoxListVisualization();
        drawBuckets();
    }

    function drawGraphVisualization() {
        const barWidth = graphCanvas.width / data.length;
        const fontSize = Math.min(24, Math.max(12, barWidth * 0.3));
        graphCtx.font = `${fontSize}px Arial`;
        graphCtx.textAlign = 'center';
        graphCtx.textBaseline = 'middle';
    
        const maxValue = Math.max(...data);
        const availableHeight = graphCanvas.height - VERTICAL_PADDING; // Full height minus bottom padding
    
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const barHeight = (value / maxValue) * availableHeight;
            const x = i * barWidth;
            const y = graphCanvas.height - barHeight; // Start at the bottom and go up
    
            graphCtx.fillStyle = getColor(i);
            graphCtx.fillRect(x, y, barWidth, barHeight);
    
            graphCtx.strokeStyle = 'black';
            graphCtx.strokeRect(x, y, barWidth, barHeight);
    
            graphCtx.fillStyle = 'black';
            const numberY = y - fontSize * 0.6;
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
            boxListCtx.strokeRect(x, y, boxSize, boxSize);
            boxListCtx.fillStyle = 'black';
            boxListCtx.fillText(data[i], x + boxSize / 2, y + boxSize / 2);
        }
    }

    // Draws the [0-9] digit buckets that the data elements are sorted into
    function drawBuckets() {
        const bucketCount = 10;
        const bucketWidth = bucketCanvas.width / bucketCount;
        const bucketHeight = bucketCanvas.height;
        const fontSize = 14;

        bucketCtx.textAlign = 'center';
        bucketCtx.textBaseline = 'top';

        for (let i = 0; i < bucketCount; i++) {
            bucketCtx.font = `bold ${fontSize}px Arial`;
            const x = i * bucketWidth;
            const y = 0;

            bucketCtx.fillStyle = '#f0f0f0';
            bucketCtx.fillRect(x, y, bucketWidth, bucketHeight);
            bucketCtx.strokeStyle = 'black';
            bucketCtx.strokeRect(x, y, bucketWidth, bucketHeight);
            bucketCtx.fillStyle = 'black';
            bucketCtx.fillText(i.toString(), x + bucketWidth / 2, y + 2);

            bucketCtx.font = `${fontSize}px Arial`;
            if (buckets[i]) {
                for (let j = 0; j < buckets[i].length; j++) {
                    bucketCtx.fillText(
                        buckets[i][j],
                        x + bucketWidth / 2,
                        y + 20 + j * (fontSize + 4)
                    );
                }
            }
        }
    }

    // Determines the color of elements in the visualization
    function getColor(index) {
        if (currentIndex === -1) return 'red';
        if (index === currentIndex) return 'blue';
        return 'lightblue';
    }

    // Controls the execution of the Radix Sort algorithm
    async function radixSort(arr) {
        const maxNum = Math.max(...arr);
        let exp = 1;
    
        while (Math.floor(maxNum / exp) > 0) {
            const output = new Array(arr.length).fill(0);
            const count = new Array(10).fill(0);
            const bucketSnapshot = Array.from({ length: 10 }, () => []);
    
            // Count digit occurrences
            for (let i = 0; i < arr.length; i++) {
                const digit = Math.floor(arr[i] / exp) % 10;
                count[digit]++;
            }
    
            // Accumulate count
            for (let i = 1; i < 10; i++) {
                count[i] += count[i - 1];
            }
    
            // Place elements into output array (back to front),
            // but animate each element being added to a bucket
            for (let i = arr.length - 1; i >= 0; i--) {
                const digit = Math.floor(arr[i] / exp) % 10;
                const value = arr[i];
                const bucketIndex = count[digit] - 1;
    
                // Visual effect: highlight current element being added
                currentIndex = i;
                const tempSnapshot = JSON.parse(JSON.stringify(bucketSnapshot));
                tempSnapshot[digit].push(value); // simulate addition to bucket
                recordFrame(`Adding ${value} to bucket ${digit} (based on ${exp}'s place)`, tempSnapshot);
    
                output[bucketIndex] = value;
                bucketSnapshot[digit].push(value);
                count[digit]--;
            }
    
            // Apply sorted order in one step (all turn red)
            for (let i = 0; i < arr.length; i++) {
                arr[i] = output[i];
            }
    
            currentIndex = -1;
            recordFrame(`Sorted based on ${exp}'s place`, JSON.parse(JSON.stringify(bucketSnapshot)));
    
            exp *= 10;
        }
    }

    // Records a snapshot of the current sorting step, adds frame to animation
    function recordFrame(explanation = "", bucketSnapshot = []) {
        frames.push({
            data: [...data],
            currentIndex,
            buckets: bucketSnapshot,
            explanation
        });
    }

    // Increases or decreases fill of progress bar based on how far into animation the user is
    function updateProgressBar() {
        const progress = (currentFrame / (frames.length - 1)) * 100;
        progressFill.style.width = `${progress}%`;
    }

    // Adds, into step log, all steps up to current frame (clears before adding)
    function updateStepLog() {
        stepLog.innerHTML = `Initial List: ${data.join(", ")}<br>`;
        for (let i = 1; i <= currentFrame; i++) {
            if (frames[i].explanation) {
                stepLog.innerHTML += frames[i].explanation + "<br>";
            }
        }
        if (currentFrame === frames.length - 1) {
            stepLog.innerHTML += `Sorted List: ${data.join(", ")}`;
        }
        stepLog.scrollTop = stepLog.scrollHeight;
    }

    // Initializes and starts animation playback
    function playAnimation() {
        if (isPlaying) return;
        isPlaying = true;

        // Sets animation play speed based on speedSlider value
        function getAnimationSpeed() {
            const fast = 50;  // (ms)
            const slow = 3000;  // (ms)
            return slow - (speedSlider.value / 100) * (slow - fast);
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

        // First frame: initial array
        frames.push({
            data: [...data],
            currentIndex: -2, // signifies no highlights
            buckets: [],
            explanation: ""
        });

        // Middle frames: has highlights
        await radixSort(data);

        // Last frame: final sorted array
        frames.push({
            data: [...data],
            currentIndex: -2, // signifies no highlights
            buckets: [],
            explanation: ""
        });

        drawFrame(frames[currentFrame]);
    }

    // Enables and contextualizes parts of top control bar relevant to Radix Sort
    function loadControlBar() {
        randListSize.disabled = false;
        randomizeButton.disabled = false;
        inputElement.placeholder = "Enter a list of 2-20 integers between 0 & 200 (e.g. 170 0 45 75 200)";
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
                inputWarningMessage.textContent = "Error: Enter an input";
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
            inputWarningMessage.textContent = "Error: Enter integer values between 0 and 200 only";
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

    // Returns true if all the elements in the given list are between 0 & 200, else returns false
    function checkInputValues(inputList) {
        for (let i = 0; i < inputList.length; i++) {
            if (inputList[i] > 200 || inputList[i] < 0) {
                return false;
            }
        }
        return true;
    }

    // Generates random list of given size
    function generateRandomList(size) {
        let randomArray = new Array(size);
        for (let i = 0; i < size; i++) {
            randomArray[i] = Math.round(Math.random() * 200);
        }
        return randomArray;
    }

    window.activeController = new AnimationController(loadAnimation, loadControlBar, playAnimation, pauseAnimation, stepForward, stepBackward, 
        moveToFrame, resetAnimation, randomizeInput, toggleCustomInput);
}
