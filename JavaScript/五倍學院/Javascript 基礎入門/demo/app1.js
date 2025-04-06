// console.log("Hello 123456 world");


// 666
/*
這裡都是註解
 */
// console.log(123);


// var a = 1;
// var b = a;
// console.log(a);
// console.log(b);
// a = 2;
// console.log(a);
// console.log(b);


// var a;
// console.log(a);


// console.log(age);
// var age = 18;
// console.log(age);


// console.log(age);
// let age = 18;
// console.log(age);


// const age = 18;
// console.log(age);
// age = 18;


// const friends = ['a', 'b', 'c'];
// console.log(friends);
// friends[0] = 'x'
// console.log(friends);


// console.log(typeof 123);
// console.log(typeof 3.14);
// console.log(typeof 'hello');
// console.log(typeof true);
// console.log(typeof undefined);
// console.log(typeof Symbol('123'));
// console.log(typeof null);
// console.log(typeof function(){})


// let a = 1;
// a = a + 1;
// a += 1;
// a++;
// console.log(a);


// let a = 1;
// console.log(a++);
// console.log(a);
// let b = 1;
// console.log(++b);
// console.log(b);


// let name = `悟空`; // backtick(反引號)
// console.log(name);


// let n = 3.14;
// console.log(typeof n);
// let m = String(n);
// console.log(typeof m);
// let x = "1450";
// console.log(typeof x);
// let y = Number(x);
// console.log(typeof y);


// let aa = 'hello';
// let bb = Number(aa);
// console.log(bb);
// // NaN = Not A Number
// console.log(typeof bb);


// console.log(1 + 2);
// console.log(1 + '2');
// console.log('hello' + 123);
// console.log('hello' + true);
// console.log(123 + true);
// console.log(123 + false);


// console.log([] + []);
// console.log([] + {});
// console.log({} + []);
// console.log({} + {});
// console.log(typeof([] + []));
// console.log(typeof([] + {}));
// console.log(typeof({} + []));
// console.log(typeof({} + {}));


// var age = 20;
// if (age >= 18) console.log('已成年');


// var age = 18;
// if (age >= 18) {
//     console.log('成年人');
// } else {
//     console.log('未成年');
// }
// // 底下這行效果等同上面5行
// age >= 18 ? console.log('成年人') : console.log('未成年');


// var age = 16;
// age > 18 ? console.log('成年人') : age == 18 ? console.log('剛成年') : console.log('未成年');


// let age = 16;
// if (age = 18) {
//     console.log('已成年');
// } else {
//     console.log('未成年');
// }


// let age = 16;
// if (age = 0) {
//     console.log('已成年');
// } else {
//     console.log('未成年');
// }


// let gender = 0;
// switch (gender) {
//     case 1:
//         console.log('男');
//         break;
//     case 2:
//         console.log('女');
//         break;
//     default:
//         console.log('不想說');
// }


// 練習1
// let yr = prompt('請輸入年份');
// if (yr % 4 == 0) {
//     if (yr % 100 == 0 && yr % 400 != 0) {
//         console.log('為平年');
//     } else {
//         console.log('為閏年');
//     }
// } else {
//     console.log('為平年');
// }


// 練習1(better)
// let yr = prompt('請輸入年份');
// console.log(typeof yr);
// if ((yr % 4 == 0 && yr % 100 != 0) || (yr % 400 == 0)) {
//     console.log('為閏年');
// } else {
//     console.log('為平年');
// }


// for (var i = 0; i < 5; i++) {
//     console.log(i);
// }


// let a = 1;
// while (a < 10) {
//     console.log(a);
//     a = a + 1;
// }


// 練習2-1
// for (var i = 5; i >= 1; i = i - 2) {
//     console.log('你好' + i);
//     console.log(`你好${i}`);
// }


// 練習2-2
// for (var j = 1; j < 10; j++) {
//     for (var k = 1; k < 10; k++) {
//         console.log(j + ' * ' + k + ' = ' + j * k);
//         console.log(`${j} x ${k} = ${j * k}`);
//     }
// }


// 練習2-3-1
// for (var i = 1; i <= 5; i++) {
//     var star = '';
//     for (var j = 1; j <= i; j++) {
//         star += '*';
//     }
//     console.log(star);
// }


// 練習2-3-1(better)
// for (var i = 1; i <= 5; i++) {
//     console.log('*'.repeat(i));
// }


// 練習2-3-2
// for (var i = 1; i <= 5; i++) {
//     var star = '';
//     for (var j = 1; j <= 5 - i; j++) {
//         star += ' ';
//     }
//     for (var k = 1; k <= 2 * i - 1; k++) {
//         star += '*';
//     }
//     console.log(star);
// }


// 練習2-3-2(better)
// for (var i = 1; i <= 5; i++) {
//     console.log(' '.repeat(5 - i) + '*'.repeat(2 * i - 1));
    
// }