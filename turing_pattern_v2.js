// Turing Pattern Reaction-Diffusion Model

const SIZE = 150;
const SCALE = 4;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = SIZE * SCALE;
canvas.height = SIZE * SCALE;

let reactionScale = 1;

let U = Array.from({ length: SIZE }, () => Array(SIZE).fill(1));
let V = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
let running = false;

// let Du = 0.2, Dv = 0.06, F = 0.04, k = 0.075;
let Du = 0.65, Dv = 0.25, F = 0.01, k = 0.045;
let tmax = 10000, dt = 1.0;
let t = 0;

function initializeGrid() {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            U[i][j] = 1 + 0.05 * (Math.random() - 0.5);
            V[i][j] = 0.05 * (Math.random() - 0.5);
        }
    }
    U[Math.floor(SIZE / 2)][Math.floor(SIZE / 2)] = 0.3;
    V[Math.floor(SIZE / 2)][Math.floor(SIZE / 2)] = 0.6;
    t = 0;
    updateProgressBar();
}

function renderPattern() {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            let colorVal = Math.max(0, Math.min(255, U[i][j] * 255));
            ctx.fillStyle = `rgb(${colorVal}, ${colorVal}, ${colorVal})`;
            ctx.fillRect(i * SCALE, j * SCALE, SCALE, SCALE);
        }
    }
}

function runSimulation() {
    if (!running || t >= tmax) return;
    
    let U_new = JSON.parse(JSON.stringify(U));
    let V_new = JSON.parse(JSON.stringify(V));
    let dx = 1.0;
    
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            let Lu, Lv;

        // Direct neighbors (weight 0.2)
        let up = i > 0 ? U[i-1][j] : U[i][j];
        let down = i < SIZE-1 ? U[i+1][j] : U[i][j];
        let left = j > 0 ? U[i][j-1] : U[i][j];
        let right = j < SIZE-1 ? U[i][j+1] : U[i][j];

        let upV = i > 0 ? V[i-1][j] : V[i][j];
        let downV = i < SIZE-1 ? V[i+1][j] : V[i][j];
        let leftV = j > 0 ? V[i][j-1] : V[i][j];
        let rightV = j < SIZE-1 ? V[i][j+1] : V[i][j];

        // Diagonal neighbors (weight 0.05)
        let upLeft = (i > 0 && j > 0) ? U[i-1][j-1] : U[i][j];
        let upRight = (i > 0 && j < SIZE-1) ? U[i-1][j+1] : U[i][j];
        let downLeft = (i < SIZE-1 && j > 0) ? U[i+1][j-1] : U[i][j];
        let downRight = (i < SIZE-1 && j < SIZE-1) ? U[i+1][j+1] : U[i][j];

        let upLeftV = (i > 0 && j > 0) ? V[i-1][j-1] : V[i][j];
        let upRightV = (i > 0 && j < SIZE-1) ? V[i-1][j+1] : V[i][j];
        let downLeftV = (i < SIZE-1 && j > 0) ? V[i+1][j-1] : V[i][j];
        let downRightV = (i < SIZE-1 && j < SIZE-1) ? V[i+1][j+1] : V[i][j];

        // Compute Laplacian using 5-point and 9-point stencil combination
        Lu = (
            0.2 * (up + down + left + right) + // Direct neighbors
            0.05 * (upLeft + upRight + downLeft + downRight) - // Diagonal neighbors
            1.0 * U[i][j] // Center
        ) / (dx * dx);

        Lv = (
            0.2 * (upV + downV + leftV + rightV) +
            0.05 * (upLeftV + upRightV + downLeftV + downRightV) -
            1.0 * V[i][j]
        ) / (dx * dx);
    
            U_new[i][j] = Math.max(0, U[i][j] + dt * (Du * Lu - reactionScale * U[i][j] * V[i][j] * V[i][j] + F * (1 - U[i][j])));
            V_new[i][j] = Math.max(0, V[i][j] + dt * (Dv * Lv + reactionScale * U[i][j] * V[i][j] * V[i][j] - (F + k) * V[i][j]));
        }
    }
    
    U = U_new;
    V = V_new;
    t += 1;
    updateProgressBar();
    renderPattern();
    requestAnimationFrame(runSimulation);
}

function updateProgressBar() {
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
        progressBar.value = (t / tmax) * 100;
    }
}

function startSimulation() {
    running = true;
    runSimulation();
}

function stopSimulation() {
    running = false;
}

function resetSimulation() {
    stopSimulation();
    initializeGrid();
    renderPattern();
    updateProgressBar();
}

// Add event listeners for sliders to update values dynamically
document.getElementById("duSlider").addEventListener("input", (e) => {
    Du = parseFloat(e.target.value);
    document.getElementById("duValue").textContent = Du.toFixed(3);
});

document.getElementById("dvSlider").addEventListener("input", (e) => {
    Dv = parseFloat(e.target.value);
    document.getElementById("dvValue").textContent = Dv.toFixed(3);
});

document.getElementById("fSlider").addEventListener("input", (e) => {
    F = parseFloat(e.target.value);
    document.getElementById("fValue").textContent = F.toFixed(3);
});

document.getElementById("kSlider").addEventListener("input", (e) => {
    k = parseFloat(e.target.value);
    document.getElementById("kValue").textContent = k.toFixed(3);
});

// Add event listeners for dt toggle buttons
document.querySelectorAll(".dt-button").forEach(button => {
    button.addEventListener("click", (e) => {
        dt = parseFloat(e.target.dataset.dt);
        document.getElementById("dtValue").textContent = dt;
    });
});

document.getElementById("startButton").addEventListener("click", startSimulation);
document.getElementById("stopButton").addEventListener("click", stopSimulation);
document.getElementById("resetButton").addEventListener("click", resetSimulation);

initializeGrid();
renderPattern();
