// 程式碼寫這裡
const carousel = document.querySelector('.carousel');
console.log(carousel);
const slides = carousel.querySelectorAll('.slide'); // 不要都用document.querySelector，避免抓到相同className的元素
console.log(slides);
const track = carousel.querySelector('.slide-track');
const prevBtn = carousel.querySelector('.prev-btn');
const nextBtn = carousel.querySelector('.next-btn');
const navigator = carousel.querySelector('.navigator');
const indicators = navigator.querySelectorAll('.indicator');

let currentIndex = 0;

// 初始
function  setUpSlides() {
    const w = track.clientWidth;
    console.log(w);
    slides.forEach((slide, i) => {
        slide.style.left = `${i * w}px`;
    });
    updateNavigatorButtons(currentIndex); // 初始情況下左邊按鈕要disabled
}

/*
在這段程式碼中，track.style.transform 設定了一個 translateX 的變形，而這個值使用了負號 -。
這是因為 translateX 用於定義水平方向上的平移，並且當值是正數時，元素會向右移動，而當值是負數時，元素會向左移動。
在輪播的情境下，通常我們希望將整個輪播區域向左移動，以顯示下一張幻燈片。因此，為了將元素向左移動，我們使用負的 translateX 值。
這樣可以根據輪播的設計，將輪播區域的內容向左平移，顯示下一張幻燈片。
簡而言之，這裡使用了負號是為了實現向左的平移效果。
*/
function moveSlide(index) {
    const w = track.clientWidth;
    track.style.transform = `translateX(-${index * w}px)`;
    updateNavigatorButtons(index);
    updateIndicator(index);
}

// 當在第一張或最後一張投影片時，按鈕需做相關設定
function updateNavigatorButtons(index) {
    if (index === 0) {
        console.log(prevBtn.classList);
        prevBtn.classList.add('hide');
        nextBtn.classList.remove('hide');
    } else if (index === slides.length - 1) {
        prevBtn.classList.remove('hide');
        nextBtn.classList.add('hide');
    } else {
        prevBtn.classList.remove('hide');
        nextBtn.classList.remove('hide');
    }
}

// 設置indicator按鈕active
function updateIndicator(index) {
    indicators.forEach(indicator => {
        if (Number(indicator.dataset.index) === index) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    })
}

nextBtn.addEventListener('click', () => {
    currentIndex++;
    moveSlide(currentIndex);
});

prevBtn.addEventListener('click', () => {
    currentIndex--;
    moveSlide(currentIndex);
});

navigator.addEventListener('click', (e) => {
    console.log(e.target);
    if (e.target.matches('button')) {
        const dot = e.target;
        console.log(dot.dataset);
        const dotIndex = dot.dataset.index // 如果HTML那邊寫的是data-qq 那這邊就要.qq
        console.log(dotIndex);
        moveSlide(Number(dotIndex));
    }
})

setUpSlides();