// DOM物件載入完成才做函數裡的事情
document.addEventListener('DOMContentLoaded', () => {
    const minusBtn = document.querySelector('#minus');
    const plusBtn = document.querySelector('#plus');
    const counter = document.querySelector('#counter');
    // console.log(counter.value);

    minusBtn.addEventListener('click', () => {
        if(counter.value > 0) {
            counter.value = counter.value - 1;
        }
    });
    plusBtn.addEventListener('click', () => {
        // counter.value = Number(counter.value) + 1;
        counter.value = parseInt(counter.value) + 1;
    });
})