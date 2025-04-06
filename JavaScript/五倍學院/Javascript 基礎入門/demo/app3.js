// const d1 = document.getElementById('doll1');
// // css選取器的撰寫方式，彈性較大(推薦)
// const d2 = document.querySelector('#doll1');
// console.log(d1);
// console.log(d2);

// const d1 = document.getElementsByClassName('doll'); // HTMLCollection
// console.log(d1);
// console.log(d1[0]);
// console.log(d1[1]);
// const d2 = document.querySelectorAll('.doll'); // NodeList
// console.log(d2);
// console.log(d2[0]);
// console.log(d2[1]);

// 很特殊的功能(HTML標籤的id屬性，在js可以當變數來用)，別這樣用！
// console.log(doll1);
// console.log(doll2);

// const d1 = document.querySelector('#doll1');
// d1.textContent = '悟空';

// const d1 = document.querySelector('#doll1');
// d1.innerHTML = '<h1>悟空<h1>';
// d1.style.color = 'red';

// const u1 = document.querySelector('#ul');
// console.log(u1.innerText);
// console.log(u1.textContent);
// console.log(u1.innerHTML);

// const btn1 = document.querySelector('#btn1');
// console.log(btn1);
// btn1.addEventListener('click', () => {
//     console.log('被按了');
// });

// const btn1 = document.querySelector('#btn1');
// console.log(btn1);
// const clickme = () => {
//     console.log('被按了');
// };
// btn1.addEventListener('click', clickme);

// DOM物件載入完成才做函數裡的事情
// document.addEventListener('DOMContentLoaded', () => {
//     const btn1 = document.querySelector('#btn1');
//     console.log(btn1);
//     btn1.addEventListener('click', () => {
//         console.log('被按了');
//     });
// });

// DOM物件載入完成才做函數裡的事情
// document.addEventListener('DOMContentLoaded', () => {
//     const btn1 = document.querySelector('#btn1');
//     console.log(btn1);
//     btn1.onclick = () => {
//         console.log('也被按了');
//     };
// });

// DOM物件載入完成才做函數裡的事情
// document.addEventListener('DOMContentLoaded', () => {
//     const btn1 = document.querySelector('#btn1');
//     // 會後蓋前
//     btn1.onclick = () => {
//         console.log('也被按了1');
//     };
//     btn1.onclick = () => {
//         console.log('也被按了2');
//     };
// });

// DOM物件載入完成才做函數裡的事情
// document.addEventListener('DOMContentLoaded', () => {
//     const btn1 = document.querySelector('#btn1');
//     // 可疊加
//     btn1.addEventListener('click', () => {
//         console.log('被按了1');
//     });
//     btn1.addEventListener('click', () => {
//         console.log('被按了2');
//     });
// });

// 因為超連結標籤本身會有預設行為(超連結)
// document.addEventListener('DOMContentLoaded', () => {
//     const link = document.querySelector('#link');
//     link.addEventListener('click', () => {
//         console.log('點了');
//     });
// });

// document.addEventListener('DOMContentLoaded', () => {
//     const link = document.querySelector('#link');
//     link.addEventListener('click', (e) => {
//         // 停掉超連結的預設行為
//         e.preventDefault();
//         console.log('點了');
//     });
// });

// function addNumber(a, b) {
//     return a + b;
// };
// console.log(addNumber(1, 2));

// const addNumber = function (a, b) {
//     return a + b;
// };
// console.log(addNumber(1, 2));

// const addNumber = (a, b) => {
//     return a + b;
// };
// console.log(addNumber(1, 2));

// const addNumber = (a, b) => a + b;
// console.log(addNumber(1, 2));

// let name = 'kk';
// let age = 18;
// let attack = () => console.log('使用大絕招');
// let cat = {
//     name: name,
//     age: age,
//     attack: attack
// };
// console.log(cat);
// cat.attack();

// 如果key跟變數名稱相同，可將物件簡寫成以下形式
// let name = 'kk';
// let age = 18;
// let attack = () => console.log('使用大絕招');
// let cat = {
//     name,
//     age,
//     attack
// };
// console.log(cat);
// cat.attack();

// const cat = {
//     name: 'kk',
//     age: 18,
//     like: 'fish'
// };
// let name = cat.name;
// let age = cat.age;
// console.log(name, age);

// const cat = {
//     name: 'kk',
//     age: 18,
//     like: 'fish'
// };
// // 解構
// let {name, age} = cat;
// console.log(name, age);

// function printUser(userData) {
//     const name = userData.name;
//     const age = userData.age;
//     console.log(name);
//     console.log(age);
// };
// const user = {
//     name: '悟空',
//     age: 18,
// };
// printUser(user);

// function printUser(userData) {
//     const {name, age} = userData;
//     console.log(name);
//     console.log(age);
// };
// const user = {
//     name: '悟空',
//     age: 18,
// };
// printUser(user);

// function printUser({name, age}) {
//     console.log(name);
//     console.log(age);
// }
// const user = {
//     name: '悟空',
//     age: 18,
// }
// printUser(user);

// let H1 = [1, 2, 3];
// let H2 = [98, 99, 100];
// let AllH = H1.concat(H2);
// console.log(AllH);

// 展開
// let H1 = [1, 2, 3];
// let H2 = [98, 99, 100];
// let AllH = [...H1, ...H2];
// console.log(AllH);

// const heroes = [1, 2, 3, 4];
// let [h1, h2] = heroes;
// console.log(h1, h2);

// 剩下的我全收了
// const heroes = [1, 2, 3, 4];
// let [h1, ...h2] = heroes;
// console.log(h1, h2);

// function sayHello(u1, u2) {
//     console.log(u1, u2);
// }
// sayHello('A');
// sayHello('A', 'B', 'C', 'D');

// function sayHello(u1, ...u2) {
//     console.log(u1, u2);
// }
// sayHello('A');
// sayHello('A', 'B', 'C', 'D');

// document.addEventListener('DOMContentLoaded', () => {
//     const hello = document.querySelector('#hello');
//     console.log(hello);
//     const h = document.createElement('h1');
//     h.textContent = 'hi';
//     const d = document.createElement('div');
//     d.textContent = 'I am div';
//     h.appendChild(d);
//     hello.appendChild(h);
// });

// document.addEventListener('DOMContentLoaded', () => {
//     const btn = document.querySelector('#removeBtn');
//     btn.addEventListener('click', () => {
//         const lastOne = document.querySelector('li:last-child');
//         console.log(lastOne);
//         if (lastOne) {
//             const ul = document.querySelector('ul');
//             console.log(ul);
//             ul.removeChild(lastOne);
//         }
//     });
// });

// document.addEventListener('DOMContentLoaded', () => {
//     const btn = document.querySelector('#removeBtn');
//     btn.addEventListener('click', () => {
//         const lastOne = document.querySelector('li:last-child');
//         console.log(lastOne);
//         if (lastOne) {
//             lastOne.remove();
//         }
//     });
// });

// document.addEventListener('DOMContentLoaded', () => {
//     const lastOne = document.querySelector('li:last-child');
//     console.log(lastOne.parentElement);
//     console.log(lastOne.parentNode);
// });

// document.addEventListener('DOMContentLoaded', () => {
//     const ul = document.querySelector('ul');
//     console.log(ul.childNodes);
//     console.log(ul.children);
// });

// document.addEventListener('DOMContentLoaded', () => {
//     const lastOne = document.querySelector('li:nth-child(2)');
//     console.log(lastOne.previousElementSibling);
//     console.log(lastOne.previousSibling);
//     console.log(lastOne.nextElementSibling);
//     console.log(lastOne.nextSibling);
// });

// document.addEventListener('DOMContentLoaded', () => {
//     const ul = document.querySelector('ul');
//     const li = document.createElement('li');
//     li.textContent = 'X';
//     ul.insertAdjacentElement('beforebegin', li);
// });

// document.addEventListener('DOMContentLoaded', () => {
//     const ul = document.querySelector('ul');
//     const li = document.createElement('li');
//     li.textContent = 'X';
//     ul.insertAdjacentElement('afterbegin', li);
// });

// document.addEventListener('DOMContentLoaded', () => {
//     const ul = document.querySelector('ul');
//     const li = document.createElement('li');
//     li.textContent = 'X';
//     ul.insertAdjacentElement('beforeend', li);
// });

// document.addEventListener('DOMContentLoaded', () => {
//     const ul = document.querySelector('ul');
//     const li = document.createElement('li');
//     li.textContent = 'X';
//     ul.insertAdjacentElement('afterend', li);
// });

// document.addEventListener('DOMContentLoaded', () => {
//     const ul = document.querySelector('ul');
//     const li = '<li>Z</li>'
//     ul.insertAdjacentHTML('afterbegin', li);
// });
