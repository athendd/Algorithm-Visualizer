// Middle Display Panels Animation - BucketSort 
window.loadBucketSort = function () {
    console.log("loading bucket sort")
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
    const bucketSortCanvas = document.getElementById('boxListCanvas');
    const stepLog = document.getElementById("stepLog");

    graphCanvas.width = graphCanvas.parentElement.clientWidth;
    graphCanvas.height = graphCanvas.parentElement.clientHeight;
    bucketSortCanvas.width = bucketSortCanvas.parentElement.clientWidth;
    bucketSortCanvas.height = bucketSortCanvas.parentElement.clientHeight;

    const graphCtx = graphCanvas.getContext('2d');
    const bucketSortCtx = bucketSortCanvas.getContext('2d');

    let defaultData = generateRandomList(Math.round(Math.random() * 10 + 10)); // Generates random list of at least size 10
    let currentData = [...defaultData];
    let data = [...currentData];
    let frames = [];
    let currentFrame = 0;
    let isPlaying = false;
    let currentIndex = -1;
    let currentFrameIndex = 0;

    const VERTICAL_PADDING = 30; // Spacing from top and bottom

    function drawFrame(frame) {
        if (!frame) return;
        ({ data, currentIndex, pivotIndex, swapIndices, highlightColor } = frame);
    
        drawData(frame.buckets, data[currentIndex] ?? null, highlightColor, frame.sortedBuckets);
        updateProgressBar();
        updateStepLog();
    }

    function drawData(buckets, highlightValue = null, highlightColor = '', sortedBuckets = []) {
        graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        bucketSortCtx.clearRect(0, 0, bucketSortCanvas.width, bucketSortCanvas.height);
        drawGraphVisualization();
        drawBucketSortVisualization(buckets, highlightValue, highlightColor, sortedBuckets);
    }

    function drawGraphVisualization() {
        console.log("trying to draw graph")
        const barWidth = graphCanvas.width / data.length;
        const fontSize = Math.min(24, Math.max(12, barWidth * 0.3));
        graphCtx.font = `${fontSize}px Arial`;
        graphCtx.textAlign = 'center';
        graphCtx.textBaseline = 'middle';

        const maxAbsValue = Math.max(...data.map(Math.abs));
        const centerY = graphCanvas.height / 2;
        const graphHeight = graphCanvas.height - VERTICAL_PADDING * 2;

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

    function drawBucketSortVisualization(buckets, highlightValue = null, highlightColor = '', sortedBuckets = []) {
        if (!buckets) return;
        bucketSortCtx.clearRect(0, 0, bucketSortCanvas.width, bucketSortCanvas.height);
    
        const numBuckets = buckets.length;
        const bucketWidth = Math.floor(bucketSortCanvas.width / numBuckets);
        const bucketHeight = 30;
    
        sortedBuckets = frames[currentFrameIndex]?.sortedBuckets || [];
    
        let currentX = 0;
        for (let i = 0; i < numBuckets; i++) {
            const bucket = buckets[i];
    
            // Draw bucket boundary (rectangle)
            bucketSortCtx.strokeStyle = "gray";
            bucketSortCtx.lineWidth = 1;
            bucketSortCtx.strokeRect(currentX, 0, bucketWidth, bucketSortCanvas.height);
    
            // Draw bucket label at the top
            bucketSortCtx.font = "bold 14px Arial";
            bucketSortCtx.textAlign = "center";
            bucketSortCtx.textBaseline = "top";
            bucketSortCtx.fillStyle = "black";
            bucketSortCtx.fillText(`${i}`, currentX + bucketWidth / 2, 5);
    
            // Draw values in bucket
            for (let j = 0; j < bucket.length; j++) {
                const value = bucket[j];
                const boxX = currentX;
                const boxY = 25 + j * (bucketHeight + 5); // leave room for label
    
                // Draw just the value (no box)
                bucketSortCtx.font = "14px Arial";
                bucketSortCtx.textAlign = "center";
                bucketSortCtx.textBaseline = "middle";
                bucketSortCtx.fillStyle = (value === highlightValue && highlightColor === 'blue') ? 'blue'
                         : (sortedBuckets[i]?.includes(value)) ? 'red'
                         : 'black';
                bucketSortCtx.fillText(value, boxX + bucketWidth / 2, boxY + bucketHeight / 2);
            }
    
            currentX += bucketWidth; // No spacing
        }
    }    
    
    function getColor(index) {
        const frame = frames[currentFrameIndex];
        if (!frame) return 'lightblue';

        if (index === frame.currentIndex && frame.highlightColor === 'blue') return 'blue';
        if (index === frame.pivotIndex && frame.highlightColor === 'red') return 'red';

        return 'lightblue'; // default
    }

    async function bucketSort(arr) {
        const max = Math.max(...arr);
        const min = Math.min(...arr);
        const bucketRange = 20; // choose a reasonable range to control
        const bucketCount = Math.floor((max - min) / bucketRange) + 1;
    
        const buckets = Array.from({ length: bucketCount }, () => []);
        recordFrame("Initialized empty buckets", structuredClone(buckets));
    
        for (let i = 0; i < arr.length; i++) {
            const index = Math.floor((arr[i] - min) / bucketRange); // fixed: use bucketRange, not arr.length
            buckets[index].push(arr[i]);
            recordFrame(`Placed ${arr[i]} in bucket ${index}`, structuredClone(buckets), i, 'blue');
        }
    
        for (let i = 0; i < buckets.length; i++) {
            await insertionSort(buckets[i], i, buckets);
            recordFrame(`Sorted bucket ${i}`, structuredClone(buckets));
        }
    
        let index = 0;
        for (let i = 0; i < buckets.length; i++) {
            for (let j = 0; j < buckets[i].length; j++) {
                arr[index++] = buckets[i][j];
                recordFrame(`Placed ${buckets[i][j]} in position ${index - 1}`, structuredClone(buckets), index - 1, 'red');
            }
        }
    }
    
    async function insertionSort(bucket, bucketIndex, allBuckets) {
        for (let i = 1; i < bucket.length; i++) {
            const key = bucket[i];
            let j = i - 1;
    
            while (j >= 0 && bucket[j] > key) {
                bucket[j + 1] = bucket[j];
                j--;
                recordFrame(`${bucket[j + 1]} shifted to the right in bucket ${bucketIndex}`, structuredClone(allBuckets), -1, '', structuredClone(allBuckets));
            }
    
            bucket[j + 1] = key;
            recordFrame(`${key} inserted in the correct position in bucket ${bucketIndex}`, structuredClone(allBuckets), -1, '', structuredClone(allBuckets));
        }
    }
    
    function recordFrame(explanation = "", buckets = [], highlightIndex = -1, highlightColor = "", sortedBuckets = []) {
        frames.push(JSON.parse(JSON.stringify({
            data: [...data],  // Current data array
            currentIndex: highlightColor === 'blue' ? highlightIndex : -1,
            pivotIndex: highlightColor === 'red' ? highlightIndex : -1,
            swapIndices: [],
            buckets: buckets ? buckets.map(bucket => [...bucket]) : [],  // Deep copy of buckets
            sortedBuckets: sortedBuckets.map(bucket => [...bucket]),  // needed for coloring
            explanation
        })));
    }

    function updateProgressBar() {
        const progress = (currentFrame / (frames.length - 1)) * 100;
        progressFill.style.width = `${progress}%`;
    }

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

    // Moves to specific frame based on where in the progress bar the user clicks
    function moveToFrame(event) {
        const rect = progressBar.getBoundingClientRect(); // Get progress bar dimensions
        const clickX = event.clientX - rect.left; // Click-position within progress bar
        const progressPercent = clickX / rect.width; // Determine how far in the progress bar the user clicked
        currentFrame = Math.round(progressPercent * (frames.length - 1)); // Determine which frame to move to
        drawFrame(frames[currentFrame]); // Move to frame
    }

    async function loadAnimation() {
        frames = [];
        currentFrame = 0;
        data = [...currentData];
    
        // First frame: initial array, no highlights
        frames.push(JSON.parse(JSON.stringify({
            data: [...data],
            currentIndex: -1,
            pivotIndex: -1,
            swapIndices: [],
            buckets: [], 
            sortedBuckets: [],
            explanation: ""
        })));
    
        // Middle frames: has highlights
        await bucketSort(data);
    
        // Last frame: final sorted array, no highlights
        frames.push(JSON.parse(JSON.stringify({
            data: [...data],
            currentIndex: -1,
            pivotIndex: -1,
            swapIndices: [],
            buckets: [], 
            sortedBuckets: [],
            explanation: ""
        })));
    
        drawFrame(frames[currentFrame]); // Draw the first frame
    }

    function loadControlBar() {
        randListSize.disabled = false;
        randomizeButton.disabled = false;
        inputElement.placeholder = "Enter a list of 2-20 integers between -200 & 200 (ex. 184 -23 14 -75 198)";
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

    window.activeController = new AnimationController(loadAnimation, loadControlBar, playAnimation, pauseAnimation, stepForward, stepBackward, 
        moveToFrame, resetAnimation, randomizeInput, toggleCustomInput);

};