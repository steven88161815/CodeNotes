// 程式碼寫這裡
// tot: 場站總停車格、sbi: 場站目前車輛數量、bemp: 空位數量、act: 全站禁用狀態(0:禁用、1:啟用)。

// document.addEventListener("DOMContentLoaded", () => {
//     const ulTag = document.querySelector("ul");
//     const searchKeyword = document.querySelector("#searchKeyword");

//     const btn = document.querySelector("button");
//     const api = "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
    
//     const getPost = async () => {
//         ulTag.innerText = ''; // 查詢結果清空
//         const resp = await fetch(api);
//         console.log(resp);
//         const posts = await resp.json();
//         // js物件
//         console.log(posts);

//         const results = posts.filter((p) => {
//             return p.ar.includes(searchKeyword.value);
//         });
//         console.log(results);

//         results.forEach((r) => {
//             const li = `<li class="list-group-item fs-5"><i class="fas fa-bicycle"></i>${r.sna.substring(11, r.sna.length)} (${r.sbi})<br><small class="text-muted">${r.ar}</small></li>`;
//             ulTag.insertAdjacentHTML('afterbegin', li);
//         });

//         searchKeyword.value = ""; // 輸入欄位恢復空白
//         searchKeyword.focus(); // 關注輸入欄位(好用)
//     };

//     btn.addEventListener("click", (e) => {
//         e.preventDefault();
//         getPost();
//     });

//     searchKeyword.addEventListener("keypress", (e) => {
//         if (e.key == "Enter") {
//             e.preventDefault();
//             getPost();
//         }
//     });
// });


// document.addEventListener("DOMContentLoaded", () => {
//     const searchKeyword = document.querySelector("#searchKeyword");
//     const searchForm = document.querySelector("#searchForm");
//     const api = "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"

//     searchForm.addEventListener("submit", (e) => {
//         e.preventDefault();
//         const query = searchKeyword.value.trim();

//         if (query != '') {
//             fetch(api)
//                 .then((response) => {
//                     return response.json();
//                 })
//                 .then((sites) => {
//                     const ulTag = document.querySelector(".siteList");
//                     ulTag.innerHTML = ''; // 查詢結果清空
//                     searchKeyword.value = ''; // 查詢欄位清空
//                     searchKeyword.focus();

//                     sites.filter((site) => {
//                         return site.ar.includes(query);
//                     }).forEach((site) => {
//                         const li = `<li class="list-group-item fs-5"><i class="fas fa-bicycle"></i>${site.sna.replace('YouBike2.0_', '')} (${site.sbi})<br><small class="text-muted">${site.ar}</small></li>`;
//                         ulTag.insertAdjacentHTML('beforeend', li);
//                     })
//                 })
//         }       
//     });
// });


// 使用jQuery
$().ready(() => {
    const searchKeyword = $("#searchKeyword");
    console.log(searchKeyword);
    const api = "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";

    // $("#searchForm").on("submit", (e) => {
    //     e.preventDefault();
    //     const query = searchKeyword.val().trim();
    //     console.log(query);

    //     if (query != '') {
    //         $.ajax({url: api}).done((sites) => {
    //             const ulTag = $(".siteList");
    //             ulTag.html(''); // 查詢結果清空
    //             searchKeyword.value = ''; // 查詢欄位清空
    //             searchKeyword.focus();
                
    //             sites.filter((site) => {
    //                 return site.ar.includes(query);
    //             }).forEach((site) => {
    //                 const li = `<li class="list-group-item fs-5"><i class="fas fa-bicycle"></i>${site.sna.replace('YouBike2.0_', '')} (${site.sbi})<br><small class="text-muted">${site.ar}</small></li>`;
    //                 ulTag.append(li);
    //             })
    //         });
    //     }       
    // });

    $("#searchForm").submit((e) => {
        e.preventDefault();
        const query = searchKeyword.val(); // 底層已trim()過所以不必再寫
        console.log(query);

        if (query != '') {
            $.ajax({url : api}).done((sites) => {
                const ulTag = $(".siteList");
                ulTag.html(''); // 查詢結果清空
                searchKeyword.value = ''; // 查詢欄位清空
                searchKeyword.focus();
                
                sites.filter((site) => {
                    return site.ar.includes(query);
                }).forEach((site) => {
                    const li = `<li class="list-group-item fs-5"><i class="fas fa-bicycle"></i>${site.sna.replace('YouBike2.0_', '')} (${site.sbi})<br><small class="text-muted">${site.ar}</small></li>`;
                    ulTag.append(li);
                })
            });
        }       
    });
});
