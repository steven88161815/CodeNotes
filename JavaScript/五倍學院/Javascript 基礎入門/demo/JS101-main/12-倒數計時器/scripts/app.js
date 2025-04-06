// 程式碼寫這裡
const timer = document.querySelector('.timer');
console.log(timer);
const defaultSeconds = 20;
let totalSeconds = 0;
let running = false;
let paused = false;
let timerID;

function updateTimer(seconds) {
    let mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    let secs = String(seconds % 60).padStart(2, '0'); // 缺位數補0

    timer.textContent = `${mins}:${secs}`;

    if (seconds === 0) {
        timer.classList.add('times-Up');
    } else {
        timer.classList.remove('times-Up');
    }
}

function timesUp() {
    clearInterval(timerID);
    running = false;
    playSound();
}

function playSound() {
    const sound = new Audio('sounds/news.mp3');
    sound.play();
}

function initTimer() {
    running = true;
    totalSeconds = defaultSeconds;
    updateTimer(totalSeconds); // 開始倒數前先讓起始值設定成我們要的

    setupTimer(); // 開始倒數
};

function setupTimer() {
    // setInterval:每隔一段時間一直做
    // setTimeout:隔一段時間做一次
    timerID = setInterval(() => { // setInterval會給一個ID的回傳值，用於辨別不同的setInterval
        if (totalSeconds > 0) {
            totalSeconds--;
            updateTimer(totalSeconds);
        } else {
            timesUp();
        }
        
    }, 1000);
}

function pauseTimer() {
    paused = true;
    console.log('pause');
    clearInterval(timerID);
}

function resumeTimer() {
    paused = false;
    console.log('resume');

    setupTimer();
}

document.addEventListener('keyup', (e) => {
    console.log(e.key);

    switch (e.key) {
        case 'Enter':
            if (!running) {
                initTimer();
            }
            break;
        case ' ':
            if (running) {
                if (paused) {
                    resumeTimer();
                } else {
                    pauseTimer();
                }
            }
            break;
    }
})