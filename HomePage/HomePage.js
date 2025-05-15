// Middle Display Panels Animation - Home Page
window.loadHomePage = function () {

    const boxListVisual = document.getElementById('boxListVisual');
    const stepLog = document.getElementById('stepLog');
    const graphVisual = document.getElementById('graphVisual');
    const graphCanvas = document.getElementById('graphCanvas');
    const middlePanels = document.querySelector('.middle-panels');

    graphVisual.removeChild(graphCanvas);
    middlePanels.removeChild(boxListVisual);
    middlePanels.removeChild(stepLog);
    
    graphVisual.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 100%; width: 100%;">
        <h1 style="text-align: center; margin-top: 5%; margin-bottom: 5%;">Algorithm Visualizer</h1>
        <p style="padding-bottom: 5%; padding-left: 1%; padding-right: 1%;">
        Welcome to the <u>Algorithm Visualizer</u> web application. This application is an interactive tool that provides visual learning tools for algorithms
        in the form of interactive animations and detailed explanations. The premium feature of this application 
        is the ability of the user to enter their own custom input for each algorithm or give the algorithm a randomly generated input. Enjoy the learning!
        </p>

        <h2>Algorithm Example:</h2>

        <p style="padding-left: 1%; padding-top: 3%; color: darkslategray;">Quicksort's Page</p>
        <img src="../Pictures/Introduction Pictures/Quicksort Page.jpg" alt="Quicksort's Page" style="margin-left: 1%; margin-right: 1%; margin-bottom: 5%; width:98%; height: 100%;"> 
    </div>
    `;

    // All parameters are null because home page has no animation
    window.activeController = new AnimationController(null, null, null, null, null, null, null, null, null, null);
}
