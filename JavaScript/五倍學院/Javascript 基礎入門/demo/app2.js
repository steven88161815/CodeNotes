// 函數宣告
// function 報數() {
//     console.log(1);
//     console.log(2);
//     console.log(3);
//     console.log(4);
//     console.log(5);
// } 
// 報數();


// 函數運算式
// const 報數 = function () {
//     console.log(1);
//     console.log(2);
//     console.log(3);
//     console.log(4);
//     console.log(5);
// } 
// 報數();


// 函數宣告會優先載入
// 報數();
// function 報數() {
//     console.log(1);
//     console.log(2);
//     console.log(3);
//     console.log(4);
//     console.log(5);
// }


// 函數運算式執行到才會載入
// 報數();
// const 報數 = function () {
//     console.log(1);
//     console.log(2);
//     console.log(3);
//     console.log(4);
//     console.log(5);
// } 


// 箭頭函式
// const 報數 = () => {
//     console.log(1);
//     console.log(2);
//     console.log(3);
//     console.log(4);
//     console.log(5);
// }
// 報數();


// function  sayHelloTo(u1, u2, u3) {
//     console.log(u1, u2, u3);
// }
// sayHelloTo('A', 'B', 'C');
// sayHelloTo('A', 'B');
// sayHelloTo('A', 'B', 'C', 'D');


// function  sayHelloTo(u1, u2, u3 = 'HI') {
//     console.log(u1, u2, u3);
// }
// sayHelloTo('A', 'B', 'C');
// sayHelloTo('A', 'B');
// sayHelloTo('A', 'B', 'C', 'D');


// function isAdult(age) {
//     if (age >= 18) {
//         return true;
//     } else {
//         return false;
//     }
// }
// isAdult(20);


// function isAdult(age) {
//     if (age >= 18) {
//         return true;
//     } else {
//         return false;
//     }
// }
// console.log(isAdult(20));


// function isAdult(age) {
//     return age >= 18;
// }
// console.log(isAdult(20));


// var BMI = (height, weight) => {
//     return Math.round(weight / ((height / 100) ** 2) * 100) / 100;
// }
// console.log(BMI(164, 66));


// var BMI = (height, weight) => {
//     return (weight / ((height / 100) ** 2)).toFixed(2);
// }
// console.log(BMI(180, 80));


// var isLeapYear = (year) => {
//     if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
//         return true;
//     } else {
//         return false;
//     }
// }
// console.log(isLeapYear(2400));


// let a = [1, 2, 3];
// console.log(a.length);
// let b = [[1, 1, 87], 2, 3];
// console.log(b.length);
// let heroes = ['A', 'B', 'C', 'D', 'E'];
// console.log(heroes[heroes.length - 1]);


// let heroes = [1, 2, 3, 4, 5];
// console.log(heroes);
// heroes.push(6); // 從最後面新增一個元素
// console.log(heroes);
// heroes.unshift(0); // 從最前面新增一個元素
// console.log(heroes);
// const a = heroes.pop(); // 從陣列最後面取出一個元素
// console.log(heroes);
// const b = heroes.shift(); // 從陣列最前面取出一個元素
// console.log(heroes);
// console.log(a);
// console.log(b);


// let heroes = [1, 2, 3, 4, 5];
// // 在索引1處往後刪2個值
// const a = heroes.splice(1, 2);
// console.log(a);
// console.log(heroes);
// // 在索引1處往後刪1個值並補上87
// heroes.splice(1, 1, 87);
// console.log(heroes);
// heroes.splice(1, 0, 88);
// console.log(heroes);


// let H1 = [1, 2, 3];
// let H2 = [98, 99, 100];
// let AllH = H1.concat(H2);
// console.log(AllH);
// console.log(H1);


// let a = [97, 98, 99, 100];
// console.log(a.indexOf(1));
// console.log(a.indexOf(100));
// console.log(a.includes(97));
// console.log(a.includes(1));


// let heroes = [97, 98, 99, 100];
// // callback function
// heroes.forEach(function (h) {
//     console.log(h+1);
// })
// heroes.forEach((h) => {
//     console.log(h);
// })


// let heroes = [97, 98, 99, 100];
// // forEach也可以放兩個參數，第一個參數是value、第二個則是index
// heroes.forEach(function (a, b) {
//     console.log(a, b);
// })


// let heroes = ['AA', 'B', 'CCC', 'D'];
// // 回傳第一個符合條件的資料
// let user1 = heroes.find(function (hero) {
//     return hero.length >= 2;
// })
// console.log(user1);
// let user2 = heroes.find(function (hero) {
//     return hero.length >= 4;
// })
// console.log(user2);


// let heroes = ['A', 'B', 'C', 'D'];
// const result = [];
// heroes.forEach((h) => {
//     result.push(h.repeat(5));
// })
// console.log(result);


// let heroes = ['A', 'B', 'C', 'D'];
// // 對裡面的每個元素做完某件事後，自動收集成新的陣列
// let result = heroes.map((h) => {
//     return h.repeat(5);
// })
// console.log(result);


// let heroes = ['AAA', 'B', 'CC', 'DDD'];
// let result = heroes.filter((h) => {
//     return h.length >= 2;
// })
// console.log(result);


// let score = [2, 4, 8, 9, 10];
// let result = score.reduce((acc, currentValue) => {
//     return acc + currentValue;
// }, 2)
// console.log(result);


// let score = [2, 4, 8, 9, 10];
// let result = score.reduce((acc, currentValue) => {
//     console.log(acc, currentValue)
//     return acc + currentValue;
// }, 0)
// console.log(result);


// let score = [2, 4, 8, 9, 10];
// // 當沒有給預設值時，會用陣列第一個值當成acc，等於會少跑一圈
// let result = score.reduce((acc, currentValue) => {
//     console.log(acc, currentValue)
//     return acc + currentValue;
// })
// console.log(result);


// let a = ['A', 'B', 'C'];
// let b = a;
// console.log(a, b);
// a[0] = 'X';
// console.log(a, b);


// let biubiu = {
//     name: '阿肥',
//     age: 6,
//     attack: function () {
//         console.log('喵喵喵')
//     }
// }
// console.log(biubiu);
// console.log(biubiu.name);
// console.log(biubiu['name']);
// biubiu.attack();


// let biubiu = {
//     name: '阿肥',
//     age: 6,
//     attack: function () {
//         console.log('喵喵喵')
//     }
// }
// biubiu.color = '橘'; // 新增屬性
// delete biubiu.age; // 移除屬性
// console.log(biubiu);