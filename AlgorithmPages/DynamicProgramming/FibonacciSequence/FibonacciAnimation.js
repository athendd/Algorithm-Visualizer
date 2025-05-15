window.loadFibonacci = function () {
    const progressBar = document.getElementById("progressBar");
    const progressFill = document.getElementById("progressFill");
    const speedSlider = document.getElementById("speedSlider");
    const graphCanvas = document.getElementById('graphCanvas');
    const boxListCanvas = document.getElementById('boxListCanvas');
    const stepLog = document.getElementById("stepLog");

    graphCanvas.width = graphCanvas.parentElement.clientWidth;
    graphCanvas.height = graphCanvas.parentElement.clientHeight;
    boxListCanvas.width = boxListCanvas.parentElement.clientWidth;
    boxListCanvas.height = boxListCanvas.parentElement.clientHeight;

    const graphCtx = graphCanvas.getContext('2d');
    const boxListCtx = boxListCanvas.getContext('2d');


    let defaultData = [0,1];
    let currentData = [...defaultData];
    let data = [...currentData];
    let n = 15;
    let currentFrame = 0;
    let isPlaying = false;
    let frames = [];

    const VERTICAL_PADDING = 30;

    function drawFrame(frame) {
        if (!frame) return;
        ({data} = frame);
        drawData();
        updateProgressBar();
        updateStepLog();
    }

    function drawData() {
        graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        boxListCtx.clearRect(0, 0, boxListCanvas.width, boxListCanvas.height);
        drawGraphVisualization();
        drawBoxListVisualization();
    }

    function drawGraphVisualization() {
        const barWidth = graphCanvas.width / data.length;
        const fontSize = Math.min(24, Math.max(12, barWidth * 0.3));
        graphCtx.font = `${fontSize}px Arial`;
        graphCtx.textAlign = 'center';
        graphCtx.textBaseline = 'middle';
    
        const maxAbsValue = Math.max(...data.map(Math.abs));
        const graphHeight = graphCanvas.height - VERTICAL_PADDING * 2;
        const baseY = graphCanvas.height - VERTICAL_PADDING; // Bottom anchor for bars
    
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const barHeight = (value / maxAbsValue) * graphHeight;
            const x = i * barWidth;
            const y = baseY - barHeight; // Bar grows upward from the bottom
    
            graphCtx.fillStyle = getColor(i);
            graphCtx.fillRect(x, y, barWidth, barHeight);
    
            // Draw bar outline (skip bottom edge)
            graphCtx.strokeStyle = 'black';
            graphCtx.beginPath();
            graphCtx.moveTo(x, y);
            graphCtx.lineTo(x + barWidth, y);
            graphCtx.lineTo(x + barWidth, y + barHeight);
            graphCtx.lineTo(x, y + barHeight);
            graphCtx.closePath();
            graphCtx.stroke();
    
            // Draw number slightly above the bar (with buffer)
            graphCtx.fillStyle = 'black';
            const numberOffset = fontSize * 0.6;
            const numberY = y - numberOffset;
            graphCtx.fillText(value, x + barWidth / 2, numberY);
        }
    }    

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

    function getColor(index) {
            if (index === frames[currentFrame].n1 || index === frames[currentFrame].n2)
                    return 'red';
            else 
                    return 'lightblue';

    }

    function fibonacci(number) {   

        let n1 = 0, n2 = 1, nextTerm;

        
        for (let i = 2; i <= number; i++) {
            nextTerm = data[i-2] + data[i-1];
            data.push(nextTerm);
            appendToExplanation(`${n1} plus ${n2} equals ${nextTerm}`, i-2, i-1);
            n1 = n2;
            n2 = nextTerm;
            recordFrame()
            
        }
        return data;
        
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
            stepLog.innerHTML += `Final sequence: ${data.join(", ")}`; // Final list
        }

        stepLog.scrollTop = stepLog.scrollHeight;
    }

    function playAnimation() {
        if (isPlaying) return;
        isPlaying = true;

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
            setTimeout(step, getAnimationSpeed());
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

        // First frame: initial array
        frames.push({
            data: [...data],
            explanation: "The fibonacci sequence begins with the numbers 0 and 1."
        });

        // Middle frames: has highlights
        await fibonacci(n);
            

        // Last frame: final sorted array, no highlights
        frames.push({
            data: [...data],
            explanation: "End of fibonacci sequence."
        });

        drawFrame(frames[currentFrame]);
    }

    function loadControlBar() {
        progressBar.disabled = false;
        speedSlider.disabled = false;
    }

    function recordFrame(explanation = "", n1,n2) {
        frames.push(JSON.parse(JSON.stringify({
            data: [...data],
            explanation,
            n1,
            n2
        })));
    }

    function appendToExplanation(text,n1,n2) {
        recordFrame(text,n1,n2);
    }

    function loadControlBar() {
        progressBar.disabled = false;
        speedSlider.disabled = false;
    }

    function resetAnimation() {
        pauseAnimation();
        currentFrame = 0;
        drawFrame(frames[currentFrame]);
    }

    window.activeController = new AnimationController(loadAnimation, loadControlBar, playAnimation, pauseAnimation, stepForward, stepBackward, moveToFrame,
        resetAnimation, null, null);
}
