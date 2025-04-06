// const api = 'https://jsonplaceholder.typicode.com/posts';
// const req = new XMLHttpRequest();
// req.addEventListener('load', () => { // api載入完成才做以下的事情
//     // JSON字串
//     console.log(req.responseText);
//     // JSON.parse()：JSON 變物件
//     const posts = JSON.parse(req.responseText);
//     // js物件
//     console.log(posts);
//     posts.forEach((post) => {
//         console.log(post.title);
//     });
// });
// console.log(123);
// req.open('Get', api);
// console.log(456);
// req.send();


// fetch得到的是promise物件
// const api = 'https://jsonplaceholder.typicode.com/posts';
// const a = fetch(api);
// console.log(a);


// const api = 'https://jsonplaceholder.typicode.com/posts';
// fetch(api).then((resp) => {
//     console.log(resp);
// });


// const api = 'https://jsonplaceholder.typicode.com/posts';
// fetch(api)
//     .then((resp) => {
//         console.log(resp);
//         return resp.json();
//     })
//     .then((data) => {
//         // js物件
//         console.log(data);
//         data.forEach((d) => {
//             console.log(d.title);
//             console.log(d.body);
//         });
//     });


// const api = 'https://jsonplaceholder.typicode.com/posts';
// async function getPost() {
//     const resp = await fetch(api);
//     console.log(resp);
//     const posts = await resp.json();
//     // js物件
//     console.log(posts);
    
//     posts.forEach((post) => {
//         console.log(post.title);
//     });
// }
// getPost();
// console.log('go!');


// const api = 'https://5xruby.com/';
// async function getPost() {
//     const resp = await fetch(api);
//     console.log(resp);
//     const posts = await resp.json();
//     // js物件
//     console.log(posts);
    
//     posts.forEach((post) => {
//         console.log(post.title);
//     });
// }
// getPost();
// console.log('go!');


// document.addEventListener('DOMContentLoaded', () => {
//     console.log($('#hero'));
//     $('#hero').html('hi');
// });


// 更快的寫法(用jquery取代DOMContentLoaded)
// $().ready(() => {
//     const hero = $('#hero');
//     hero.html('hi');
//     console.log(hero);
// })


// const url = 'https://jsonplaceholder.typicode.com/posts';
// $.ajax({url}).done((response) => {
//     console.log(123);
//     console.log(response);
// });


// const url = 'https://jsonplaceholder.typicode.com/posts';
// $.ajax({url}).done((posts) => {
//     posts.forEach((post) => {
//         console.log(post.title);
//     });
// });




