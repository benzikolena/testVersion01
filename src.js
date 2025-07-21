const digitsElem = {
    h1: document.querySelector('#t-h1'), h2: document.querySelector('#t-h2'), 
    m1: document.querySelector('#t-m1'), m2: document.querySelector('#t-m2'),
    s1: document.querySelector('#t-s1'), s2: document.querySelector('#t-s2'),
    ms: document.querySelector('#t-ms')
}
const btn_start = document.querySelector('#btn_start');
const btn_reset = document.querySelector('#btn_reset');

const colorStart = "#4AAE71";
const colorPause = "#EF6262";
const colorContinue = "#0090DD";
const colorReset = "#FCCA63";

let lastDisplayedDigits = {h1: "0", h2: "0", m1: "0", m2: "0", s1: "0", s2: "0", ms: "000"};

let timerState = "stopped";

let referenceTime = 0; 
let accumulatedTime = 0; 
let animationFrameId = null;

function padNumber(num, len = 2) {
    return String(num).padStart(len,"0");        
}

function updateDigitsAnimation(elem, newText, key) {
    if (lastDisplayedDigits[key] != newText) {
        elem.textContent = newText;
        lastDisplayedDigits[key] = newText;
        if (key !== 'ms') { // pulse animation only for hours, minutes, seconds
            elem.classList.remove('pulse-animate'); // Firstly,remove previous animation
            void elem.offsetWidth; // forsed reflow for re-launch animation
            elem.classList.add('pulse-animate');
        }
    }
    else if (elem.textContent !== newText) {  // in case, if DOM was unsynched (but probability of this case is too low) 
        elem.textContent = newText;
    }
}

function updateDigitsValues(totalMilliseconds) {
    let milliseconds = totalMilliseconds % 1000;
    let totalSeconds = Math.floor(totalMilliseconds / 1000);
    let seconds = totalSeconds % 60;
    let totalMinutes = Math.floor(totalSeconds / 60);
    let minutes = totalMinutes % 60;
    let hours = Math.floor(totalMinutes / 60);
    
    let hStr = padNumber(hours);
    let mStr = padNumber(minutes);
    let sStr = padNumber(seconds);
    let msStr = padNumber(milliseconds, 3);

    updateDigitsAnimation(digitsElem.h1, hStr[0], "h1");
    updateDigitsAnimation(digitsElem.h2, hStr[1], "h2");
    updateDigitsAnimation(digitsElem.m1, mStr[0], "m1");
    updateDigitsAnimation(digitsElem.m2, mStr[1], "m2");
    updateDigitsAnimation(digitsElem.s1, sStr[0], "s1");
    updateDigitsAnimation(digitsElem.s2, sStr[1], "s2");

    // milliseconds updates directly, without pulse animation:
    if (lastDisplayedDigits.ms !== msStr) {
        digitsElem.ms.textContent = msStr;
        lastDisplayedDigits.ms = msStr;
    }
}

function runTimerLoop() {
    if (timerState !== "running") {
        animationFrameId = null;
        return;
    }

    const currentTime = Date.now();
    const dif = currentTime - referenceTime + accumulatedTime;
    updateDigitsValues(dif);  
    
    animationFrameId = requestAnimationFrame(runTimerLoop);
}

function startTimer() {
    if (timerState === "running") return;

    if (timerState === "stopped") {
        accumulatedTime = 0;
        lastDisplayedDigits = {h1: "0", h2: "0", m1: "0", m2: "0", s1: "0", s2: "0", ms: "000"};
        updateDigitsValues(0);
        Object.values(digitsElem).forEach(elem => elem.classList.remove("pulse-animate"));
    }

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    referenceTime = Date.now();
    timerState = "running";
    runTimerLoop();
    updateButtonStates();        
}

function pauseTimer() {
    if (timerState !== "running") return;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    if (referenceTime > 0) {
        const currentTime = Date.now();
        accumulatedTime += currentTime - referenceTime;
    }
    timerState = "paused";
    referenceTime = 0;
    Object.values(digitsElem).forEach(elem => elem.classList.remove("pulse-animate")); 
    updateDigitsValues(accumulatedTime);
    updateButtonStates();
}

function resetTimer() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    timerState = "stopped";
    accumulatedTime = 0;
    referenceTime = 0;
    lastDisplayedDigits = { h1: '0', h2: '0', m1: '0', m2: '0', s1: '0', s2: '0', ms: '000' };
    Object.values(digitsElem).forEach(elem => elem.classList.remove("pulse-animate")); 
    updateDigitsValues(0); 
    updateButtonStates();
}

function updateButtonStates() {
    btn_start.disabled = false; 
    if (timerState === "stopped") {
        btn_start.textContent = "Start";
        btn_start.style.backgroundColor = colorStart;
        btn_reset.disabled = true; 
    } 
    else if (timerState === "running") {
        btn_start.textContent = "Pause";
        btn_start.style.backgroundColor = colorPause;
        btn_reset.disabled = false; 
        btn_reset.style.backgroundColor = colorReset;
    } 
    else if (timerState === "paused") {
        btn_start.textContent = "Continue";
        btn_start.style.backgroundColor = colorContinue;
        btn_reset.disabled = false; 
        btn_reset.style.backgroundColor = colorReset;
    }
}

function handleStartButtonClick() {
    if (timerState === "stopped" || timerState === "paused") startTimer();
    else if (timerState === "running") pauseTimer();
}

btn_start.addEventListener("click", handleStartButtonClick);
btn_reset.addEventListener("click", resetTimer);

resetTimer();