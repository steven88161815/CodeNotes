// 程式碼寫這裡
// document.addEventListener('DOMContentLoaded', () => {
//     const ulTag = document.querySelector('ul');
//     const taskInput = document.querySelector('#taskInput');
    
//     const oriCloseTags = document.querySelectorAll('.closeBtn');
//     for (let i = 0; i < oriCloseTags.length; i++) {
//         oriCloseTags[i].addEventListener('click', (event) => {
//             const beClickedTarget = event.target;
//             ulTag.removeChild(beClickedTarget.parentElement);
//         });
//     };

//     const addBtn = document.querySelector('#addBtn');

//     const createItem = () => {
//         const liTag = document.createElement('li');
//         liTag.setAttribute('class', 'todo-item');

//         const spanTag = document.createElement('span');
//         spanTag.setAttribute('class', 'item');
//         spanTag.textContent = taskInput.value;
//         taskInput.value = ''; // 輸入欄位恢復空白
//         taskInput.focus(); // 關注輸入欄位(好用)

//         const closeTag = document.createElement('button');
//         closeTag.setAttribute('class', 'closeBtn');
//         closeTag.textContent = 'X';
//         closeTag.addEventListener('click', (event) => {
//             const beClickedTarget = event.target;
//             ulTag.removeChild(beClickedTarget.parentElement);
//         });

//         liTag.appendChild(spanTag);
//         liTag.appendChild(closeTag);

//         ulTag.insertAdjacentElement('afterbegin', liTag);
//     };
//     addBtn.addEventListener('click', createItem);

//     taskInput.addEventListener('keypress', (e) => {
//         if(e.key == 'Enter') {
//             createItem();
//         }
//     });

// });


//--------------------------------------------------------------------------------


// 偷懶寫法
document.addEventListener('DOMContentLoaded', () => {
    const ulTag = document.querySelector('ul');
    const taskInput = document.querySelector('#taskInput');
    
    const oriCloseTags = document.querySelectorAll('.closeBtn');
    for (let i = 0; i < oriCloseTags.length; i++) {
        oriCloseTags[i].addEventListener('click', (event) => {
            const beClickedTarget = event.target;
            ulTag.removeChild(beClickedTarget.parentElement);
        });
    };

    const addBtn = document.querySelector('#addBtn');

    const createItem = () => {
        const text = `<li class="todo-item"><span class="item">${taskInput.value}</span><button class="closeBtn">X</button></li>`;
        taskInput.value = ''; // 輸入欄位恢復空白
        taskInput.focus(); // 關注輸入欄位(好用)

        ulTag.insertAdjacentHTML('afterbegin', text);
    };
    
    addBtn.addEventListener('click', createItem);

    taskInput.addEventListener('keypress', (e) => {
        if(e.key == 'Enter') {
            createItem();
        }
    });

    ulTag.addEventListener('click', (e) => {
        if (e.target.nodeName === 'BUTTON') {
            // e.target.parentElement.remove();
            e.target.parentNode.remove();
        }
       
    })

});