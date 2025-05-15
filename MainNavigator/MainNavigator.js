// --- GLOBAL ANIMATION CONTROLLER ---
class AnimationController {
    constructor(loadAnimation, loadControlBar, playAnimation, pauseAnimation, stepForward, stepBackward, moveToFrame, 
    resetAnimation, randomizeInput, toggleCustomInput) {
        this.loadAlgorithmAnimation = loadAnimation ?? this.emptyFunction;
        this.loadAlgorithmControlBar = loadControlBar ?? this.emptyFunction;
        this.playAlgorithmAnimation = playAnimation ?? this.emptyFunction;
        this.pauseAlgorithmAnimation = pauseAnimation ?? this.emptyFunction;
        this.stepForwardOneFrame = stepForward ?? this.emptyFunction;
        this.stepBackwardOneFrame = stepBackward ?? this.emptyFunction;
        this.moveToAlgorithmFrame = moveToFrame ?? this.emptyFunction;
        this.resetAlgorithmAnimation = resetAnimation ?? this.emptyFunction;
        this.randomizeAlgorithmInput = randomizeInput ?? this.emptyFunction;
        this.toggleCustomAlgorithmInput = toggleCustomInput ?? this.emptyFunction;
    }

    emptyFunction() {}

    loadAnimation() {
        this.loadAlgorithmAnimation();
    }

    loadControlBar() {
        this.loadAlgorithmControlBar();
    }

    playAnimation() {
        this.playAlgorithmAnimation();
    }

    pauseAnimation() {
        this.pauseAlgorithmAnimation();
    }

    stepForward() {
        this.stepForwardOneFrame();
    }

    stepBackward() {
        this.stepBackwardOneFrame();
    }

    moveToFrame(event) {
        this.moveToAlgorithmFrame(event);
    }

    resetAnimation() {
        this.resetAlgorithmAnimation();
    }

    randomizeInput() {
        this.randomizeAlgorithmInput();
    }

    toggleCustomInput() {
        this.toggleCustomAlgorithmInput();
    }
}

// --- GLOBAL CONTROLLER INSTANCE ---
window.activeController;

let previousAlgorithm;

// --- HOME PAGE OPEN BY DEFAULT ---
document.addEventListener("DOMContentLoaded", function () {
    // initialize activeController & open to home page
    window.loadHomePage();
    selectAlgorithm('HomePage');
    // --- TOP CONTROLLER BAR FUNCTIONALITIES ---
    document.getElementById("randomizeButton").addEventListener("click", () => window.activeController.randomizeInput());
    document.getElementById("customInputToggle").addEventListener("change", () => window.activeController.toggleCustomInput());
    document.getElementById("playButton").addEventListener("click", () => window.activeController.playAnimation());
    document.getElementById("pauseButton").addEventListener("click", () => window.activeController.pauseAnimation());
    document.getElementById("resetButton").addEventListener("click", () => window.activeController.resetAnimation());
    document.getElementById("rightArrow").addEventListener("click", () => window.activeController.stepForward());
    document.getElementById("leftArrow").addEventListener("click", () => window.activeController.stepBackward());
    document.getElementById("progressBar").addEventListener("click", (event) => window.activeController.moveToFrame(event));
    // --- TOP PANEL ZOOM FUNCTIONALITIES ---
});

const options = [
    { name: 'Bubble Sort', algorithmName: 'BubbleSort'},
    { name: 'Breadth First Search', algorithmName: 'BFS'},
    { name: 'Depth First Search', algorithmName: 'DFS'},
    { name: 'Insertion Sort', algorithmName: 'InsertionSort'},
    { name: 'Selection Sort', algorithmName: 'SelectionSort'},
    { name: 'Heapsort', algorithmName: 'Heapsort'},
    { name: 'Binary Tree Traversal', algorithmName: 'BinaryTree'}, 
    { name: 'Counting Sort', algorithmName: 'CountingSort'},
    { name: 'Merge Sort', algorithmName: 'MergeSort'},
    { name: 'Bucket Sort', algorithmName: 'BucketSort'},
    { name: 'Page Rank', algorithmName: 'PageRank'},
    { name: 'Quicksort', algorithmName: 'Quicksort'},
    { name: 'Radix Sort', algorithmName: 'RadixSort'},
    { name: 'Fibonacci Sequence', algorithmName: 'Fibonacci'},
    { name: "Floyd Warshall's Shortest Path", algorithmName: 'FlyodPath'},
    { name: 'Knapsack', algorithmName: 'Knapsack'},
    { name: 'Sliding Window', algorithmName: 'SlidingWindow'},
    { name: "Dijkstra's Shortest Path", algorithmName: 'DijkstraPath'},
    { name: "Prim's Minimum Spanning Tree", algorithmName: 'PrimMinTree'},
    { name: 'Maximum Sum Path', algorithmName: 'MaxSumPath'}
];

// --- LEFT NAVIGATOR DROPDOWN SELECTING/OPENING & SEARCH FUNCTIONALITY ---
window.onload = function () {
    // dropdown functionality
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            let content = header.nextElementSibling;
            if (content && content.classList.contains('accordion-content')) {
                content.style.display = content.style.display === "block" ? "none" : "block";
            }
        });
    });
}

// Search Bar Functionality
function filterSearchInput(){
    const input = document.getElementById('searchInput').value.toLowerCase();
    const dropdown =  document.getElementById('dropdown');
    dropdown.innerHTML = '';
    const filtered = options.filter(option => option.name.toLowerCase().includes(input));
    if (filtered.length > 0 && input !== "") {
        dropdown.style.display = "block";
        filtered.forEach(option => {
            const div = document.createElement("div");
            div.textContent = option.name;
            div.onclick = () => {
                window.selectAlgorithm(option.algorithmName);
                dropdown.style.display = 'none';
            };
            dropdown.appendChild(div);
        });
    } else {
        dropdown.style.display = "none";
    }
}

// --- RIGHT INFO PANEL TAB SWITCHING  ---
function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    // let elementChosen = document.getElementById(tabName);
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function checkPanels(){
    const divCount = middlePanels.children.length;
    if (divCount === 4){
        outputArrayPanel = document.getElementById('outputArrayPanel');
        middlePanels.removeChild(outputArrayPanel);
    }
    if (divCount === 2){
        addBoxList();    
    }
    if (divCount === 1){
        addStepLog();
        addBoxList();
        addGraphCanvas();
    }
}

function addBoxList(){
    const boxListVisual = document.createElement('div');
    const boxListCanvas = document.createElement('canvas');
    boxListVisual.classList.add('panel');
    boxListVisual.id = 'boxListVisual';
    boxListCanvas.id = 'boxListCanvas';
    boxListVisual.appendChild(boxListCanvas);
    middlePanels.insertBefore(boxListVisual, stepLog);
}

function addStepLog(){
    const stepLog = document.createElement('div');
    stepLog.classList.add('panel-log');
    stepLog.id = 'stepLog';
    middlePanels.appendChild(stepLog);
}

function addGraphCanvas(){
    const graphVisual = document.getElementById('graphVisual');
    const graphCanvas = document.createElement('canvas');
    graphCanvas.id = 'graphCanvas';
    graphVisual.appendChild(graphCanvas);
}

function isChildElement(parentElement, childId){
    const children = parentElement.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.id && child.id === childId){
            return true;
        }
    }

    return false;
}

function addButton(parentElement, className, onClick, name, idName){
    if (isChildElement(parentElement, idName) === false){
        const newButton = document.createElement('button');
        newButton.class = className;
        newButton.onclick = onClick;
        newButton.textContent = name;
        newButton.id = idName;
        parentElement.appendChild(newButton);
    }
}

function addDiv(parentElement, idName, className){
    if (isChildElement(parentElement, idName) === false){
        const newDiv = document.createElement('div');
        newDiv.id = idName;
        newDiv.class = className;
        parentElement.appendChild(newDiv);
    }
}

function removeElement(parentElement, elementId){
    if (isChildElement(parentElement, elementId) === true){
        const elementToRemove = document.getElementById(elementId);
        parentElement.removeChild(elementToRemove);
    }
}

function removeZoomFunctionality() {
    const graphCanvas = document.getElementById("graphCanvas");
    graphCanvas.removeEventListener("wheel", window.mouseZoom);
    graphCanvas.removeEventListener("mousedown", window.mouseHold);
    graphCanvas.removeEventListener("mousemove", window.mouseDrag);
    graphCanvas.removeEventListener("mouseup", window.mouseRelease);
    graphCanvas.removeEventListener("mouseleave", window.mouseRelease);
}



// --- ALGORITHM SELECTOR (cleans up previous content, loads current algorithm content) ---
function selectAlgorithm(algorithmName) {  
    // Stop playing previous animation
    window.activeController.pauseAnimation();

    if (graphVisual.innerHTML.trim().startsWith('<div')){
        graphVisual.innerHTML = '';
    }
    checkPanels();
    removeZoomFunctionality();

    const graphCanvas = document.getElementById("graphCanvas");
    const boxListCanvas = document.getElementById("boxListCanvas");
    [graphCanvas, boxListCanvas].forEach(canvas => {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    });
    // Reset text content for step log
    document.getElementById("stepLog").textContent = ``;

    // Clear previous algorithm right info panel content
    document.getElementById('description').innerHTML = '';
    document.getElementById('pseudocode').innerHTML = '';
    document.getElementById('references').innerHTML = '';
    
    // Clear & Reset top control bar 
    document.getElementById('randListSize').value = NaN;
    document.getElementById('randListSize').disabled = true;
    document.getElementById('randomizeButton').disabled = true;
    document.getElementById('sizeWarningMessage').textContent = "-";
    document.getElementById('sizeWarningMessage').style.color = "#f4f4f4";
    document.getElementById('customInput').value = "";
    document.getElementById('customInput').placeholder = "Disabled";
    document.getElementById('customInput').disabled = true;
    document.getElementById('customInputToggle').checked = false;
    document.getElementById('customInputToggle').disabled = true;
    document.getElementById('inputWarningMessage').textContent= "-";
    document.getElementById('inputWarningMessage').style.color = "#f4f4f4";
    document.getElementById("progressBar").disabled = true;
    document.getElementById("progressFill").style.width = "0%";
    document.getElementById("speedSlider").disabled = true;
    document.getElementById("speedSlider").value = 50;

    const descriptionButton = document.getElementById('descriptionButton');
    const pseudocodeButton = document.getElementById('pseudocodeButton');
    const referencesButton = document.getElementById('referencesButton');
    descriptionButton.textContent = "Description";
    pseudocodeButton.textContent = "Pseudocode";
    referencesButton.textContent = "References";

    // Tie top control bar, middle display panels, and right info panel to current algorithm
    // activeController is tied to current algorithm too
    var algorithmPath;
    switch(algorithmName) {
        // ** Home Page ** //
        case "HomePage":
            algorithmPath = '../HomePage/HomePage.html';
            descriptionButton.textContent = "User Guide";
            pseudocodeButton.textContent = "Setup";
            referencesButton.textContent = "Information";
            window.loadHomePage();            
            break;
        // ** Brute Force ** //
        case "BinaryTree":
            algorithmPath = '../AlgorithmPages/BruteForce/BinaryTreeTraversal/' + algorithmName + 'Info.html';
            window.loadBinaryTree();
            break;
        case "BFS":
            algorithmPath = '../AlgorithmPages/BruteForce/BreadthFirstSearch/' + algorithmName + 'Info.html';
            window.loadBFS();
            break;
        case "BubbleSort":
            algorithmPath = '../AlgorithmPages/BruteForce/BubbleSort/' + algorithmName + 'Info.html';
            window.loadBubbleSort();
            break;
        case "DFS":
            algorithmPath = '../AlgorithmPages/BruteForce/DepthFirstSearch/' + algorithmName + 'Info.html';
            window.loadDFS();
            break;
        case "Heapsort":
            algorithmPath = '../AlgorithmPages/BruteForce/Heapsort/' + algorithmName + 'Info.html';
            window.loadHeapsort();
            break;
        case "InsertionSort":
            algorithmPath = '../AlgorithmPages/BruteForce/InsertionSort/' + algorithmName + 'Info.html';
            window.loadInsertionSort();
            break;
        case "PageRank":
            algorithmPath = '../AlgorithmPages/BruteForce/PageRank/' + algorithmName + 'Info.html';
            window.loadPageRank();
            break;
        case "SelectionSort":
            algorithmPath = '../AlgorithmPages/BruteForce/SelectionSort/' + algorithmName + 'Info.html';
            window.loadSelectionSort();
            break;
        // ** Divide and Conquer ** // 
        case "BucketSort":
            algorithmPath = '../AlgorithmPages/DivideAndConquer/BucketSort/' + algorithmName + 'Info.html';
            window.loadBucketSort();
            break;
        case "CountingSort":
            algorithmPath = '../AlgorithmPages/DivideAndConquer/CountingSort/' + algorithmName + 'Info.html';
            window.loadCountingSort();
            break;
        case "MergeSort":
            algorithmPath = '../AlgorithmPages/DivideAndConquer/MergeSort/' + algorithmName + 'Info.html';
            window.loadMergeSort();
            break;
        case "Quicksort":
            algorithmPath = '../AlgorithmPages/DivideAndConquer/Quicksort/' + algorithmName + 'Info.html';
            window.loadQuicksort();
            break;
        case "RadixSort":
            algorithmPath = '../AlgorithmPages/DivideAndConquer/RadixSort/' + algorithmName + 'Info.html';
            window.loadRadixSort();
            break;
        // ** Dynamic Programming ** //
        case "Fibonacci":
            algorithmPath = '../AlgorithmPages/DynamicProgramming/FibonacciSequence/' + algorithmName + 'Info.html';
            window.loadFibonacci();
            break;
        case "FloydPath":
            algorithmPath = '../AlgorithmPages/DynamicProgramming/FloydWarshallShortestPath/' + algorithmName + 'Info.html';
            window.loadFloydPath();
            break;
        case "Knapsack":
            algorithmPath = '../AlgorithmPages/DynamicProgramming/KnapsackProblem/' + algorithmName + 'Info.html';
            window.loadKnapsack();
            break;
        case "MaxSumPath":
            algorithmPath = '../AlgorithmPages/DynamicProgramming/MaximumSumPath/' + algorithmName + 'Info.html';
            window.loadMaxSumPath();
            break;
        case "SlidingWindow":
            algorithmPath = '../AlgorithmPages/DynamicProgramming/SlidingWindow/' + algorithmName + 'Info.html';
            window.loadSlidingWindow();
            break;
        // ** Greedy ** //
        case "DijkstraPath":
            algorithmPath = '../AlgorithmPages/Greedy/DijkstraShortestPath/' + algorithmName + 'Info.html';
            window.loadDijkstraPath();
            break;
        case "PrimMinTree":
            algorithmPath = '../AlgorithmPages/Greedy/PrimMinimumSpanningTree/' + algorithmName + 'Info.html';
            window.loadPrimMinTree();
            break;
        default:
            algorithmPath = '../HomePage/HomePage.html';
            window.loadHomePage();
            console.error(`Error - Unknown Algorithm: ${algorithmName}`);
    }

    // Load middle display panels content for current algorithm
    window.activeController.loadAnimation();

    // Load top control bar for current algorithm
    window.activeController.loadControlBar();

    // Load right info panel content for current algorithm
    fetch(algorithmPath)
        .then(response => response.text())
        .then(html => {
            // Create a temporary div to hold the fetched HTML content
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            // Extract the specific sections (description, references, pseudocode) from the fetched HTML
            var descriptionContent = tempDiv.querySelector('#description');
            var pseudocodeContent = tempDiv.querySelector('#pseudocode');
            var referencesContent = tempDiv.querySelector('#references');

            // Populate the content into the appropriate tabs
            document.getElementById('description').appendChild(descriptionContent);
            document.getElementById('references').appendChild(referencesContent);
            document.getElementById('pseudocode').appendChild(pseudocodeContent);

            // Open first tab by default (description tab)
            document.querySelector(".tablinks").click();
        })
        .catch(error => {
            console.error('Error fetching right panel content:', error);
        });
}