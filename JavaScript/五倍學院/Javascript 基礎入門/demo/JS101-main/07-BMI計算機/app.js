// DOM物件載入完成才做函數裡的事情
document.addEventListener('DOMContentLoaded', () => {
    const bodyHeight = document.querySelector('#bodyHeight');
    const bodyWeight = document.querySelector('#bodyWeight');
    const resultText = document.querySelector('#resultText');
    const btn = document.querySelector('button');

    btn.addEventListener('click', () => {
        let height = Number(bodyHeight.value);
        let weight = Number(bodyWeight.value);
        let result = (weight / (height / 100) ** 2).toFixed(2);
        // resultText.innerHTML = result;
        resultText.innerText = result;
    });
    
})
