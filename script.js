const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let drawing = false;
let currentMode = 'draw';
let color = '#000000';
let textObjects = [];
let undoStack = [];
let redoStack = [];
let selectedText = null;
let isDragging = false;
let startX, startY;

// Undo and Redo Buttons
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);

// Tool Buttons
document.getElementById('draw').addEventListener('click', () => {
    currentMode = 'draw';
});
document.getElementById('text').addEventListener('click', () => {
    currentMode = 'text';
});

// Color Picker
document.getElementById('color-picker').addEventListener('input', (e) => {
    color = e.target.value;
});

// Clear Button
document.getElementById('clear').addEventListener('click', clearCanvas);

// Drawing on the canvas
canvas.addEventListener('mousedown', (e) => {
    const mousePos = getMousePos(e);

    if (currentMode === 'draw') {
        drawing = true;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(mousePos.x, mousePos.y);
        saveState();
    } else if (currentMode === 'text') {
        const text = prompt("Type your text:");
        if (text) {
            addText(mousePos.x, mousePos.y, text, color);
            saveState();
        }
    } else if (selectedText && isTextClicked(mousePos)) {
        startX = mousePos.x;
        startY = mousePos.y;
        isDragging = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        const mousePos = getMousePos(e);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
    } else if (isDragging && selectedText) {
        const mousePos = getMousePos(e);
        const dx = mousePos.x - startX;
        const dy = mousePos.y - startY;

        selectedText.x += dx;
        selectedText.y += dy;
        startX = mousePos.x;
        startY = mousePos.y;
        redrawCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    if (drawing) {
        drawing = false;
    }
    isDragging = false;
});

// Add Text
function addText(x, y, text, color) {
    textObjects.push({ x, y, text, color });
    redrawCanvas();
}

// Check if text was clicked
canvas.addEventListener('click', (e) => {
    const mousePos = getMousePos(e);
    selectedText = textObjects.find(t => isTextClicked(mousePos, t));
});

// Check if mouse click is within text boundary
function isTextClicked(pos, textObj) {
    ctx.font = '16px Arial';
    const width = ctx.measureText(textObj?.text).width;
    const height = 16; // approximate text height
    return pos.x >= textObj.x && pos.x <= textObj.x + width &&
           pos.y <= textObj.y && pos.y >= textObj.y - height;
}

// Redraw everything on the canvas
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    textObjects.forEach(textObj => {
        ctx.fillStyle = textObj.color;
        ctx.fillText(textObj.text, textObj.x, textObj.y);
    });
}

// Save the current state of the canvas for undo/redo
function saveState() {
    undoStack.push(JSON.stringify(textObjects));
    redoStack = [];
}

// Undo functionality
function undo() {
    if (undoStack.length > 0) {
        redoStack.push(JSON.stringify(textObjects));
        textObjects = JSON.parse(undoStack.pop());
        redrawCanvas();
    }
}

// Redo functionality
function redo() {
    if (redoStack.length > 0) {
        undoStack.push(JSON.stringify(textObjects));
        textObjects = JSON.parse(redoStack.pop());
        redrawCanvas();
    }
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    textObjects = [];
    saveState();
}

// Get mouse position relative to canvas
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}
