
## `headerCheckboxSelection` 和 `checkboxSelection`用法


> ✅ **都可以吃 Boolean 或 Function（函式）**。

Ag-Grid 官方文件明確指出，這兩個屬性都支援 **兩種型別**：

| 屬性                        | 支援型別                              | 說明                        |
| ------------------------- | --------------------------------- | ------------------------- |
| `headerCheckboxSelection` | `boolean` 或 `(params) => boolean` | 決定 **是否顯示表頭的全選 checkbox** |
| `checkboxSelection`       | `boolean` 或 `(params) => boolean` | 決定 **每一列是否顯示 checkbox**   |

### 🔹 1. 使用 Boolean（最簡單）

``` ts
checkboxSelection: true, 
headerCheckboxSelection: true,
```

- ✅ 每一列都會顯示 checkbox
    
- ✅ 表頭會出現全選勾勾
    

這是最直觀的用法，**適合完全固定行為的情境**

### 🔹 2. 使用 Function（更靈活）


``` ts
checkboxSelection: ({ data }) => data.status !== 'Closed', headerCheckboxSelection: ({ context }) => context.allowHeaderCheckbox,
```


- ✅ 可以根據「該列的資料」或「外部狀態」動態決定是否要顯示 checkbox
    
- ⚠️ 如果回傳 `false`，該位置就不會畫出 checkbox
    

這種寫法適合：

- 只讓某些列可以勾選
    
- 根據權限、狀態、參數決定能不能勾

### ✨ Ag-Grid 為什麼這樣設計？

因為有些場景要動態決定行為：

例如：

``` ts
checkboxSelection: ({ data }) => data.userCanSelect,
```

或：

``` ts
headerCheckboxSelection: ({ context }) => context.currentUserRole === 'admin',
```

➡️ 這樣你可以根據資料內容、登入身分、甚至畫面狀態控制互動性。

---

### 🧠 小總結：

| 寫法                                         | 說明                 | 適用情境            |
| ------------------------------------------ | ------------------ | --------------- |
| `checkboxSelection: true`                  | 每列都能選              | 單純表格            |
| `checkboxSelection: (params) => ...`       | 根據每列內容動態判斷         | 權限、條件選取         |
| `headerCheckboxSelection: true`            | 永遠顯示全選             | 自由互動            |
| `headerCheckboxSelection: (params) => ...` | 根據 context 決定能不能全選 | 權限控制、自動全選後鎖定 UI |

---
## `params`介紹

### ✅ `params` 是什麼？

在 Ag-Grid 中，很多屬性（像 `checkboxSelection`、`valueGetter`、`cellRenderer` 等）都支援你傳入一個「callback function」。

這個 function 的第一個參數就是 `params`，它是一個包含各種 **當前格子或列的資訊** 的物件。

### 🧩 常見場景與 `params` 的差異整理

|用在哪裡|範例|常見的 `params` 屬性|
|---|---|---|
|`checkboxSelection`、`headerCheckboxSelection`|決定是否顯示勾選框|`context`, `data`, `node`, `colDef`|
|`valueGetter`|自訂欄位值來源|`data`, `node`, `colDef`, `column`, `getValue`|
|`cellRenderer`|自訂 cell 呈現方式|`value`, `data`, `rowIndex`, `context`, `node`|
|`isRowSelectable`|決定列是否可選|`data`, `node`, `context`|
### 📦 常見的 `params` 屬性說明

| 屬性名                 | 型別                      | 什麼時候會用到？                                       |
| ------------------- | ----------------------- | ---------------------------------------------- |
| `data`              | 該列資料（rowData 中的對應物件）    | 需要判斷這列的值時（例：`data.status === 'Closed'`）        |
| `context`           | `AgGrid` 傳入的 context 物件 | 當你需要依據外部條件判斷時（例：權限、控制參數）                       |
| `node`              | Ag-Grid 的 RowNode 物件    | 可以拿到 rowIndex、selected 狀態等                     |
| `colDef`            | 欄位定義（ColDef）            | 知道目前是哪一欄                                       |
| `column`            | 欄位的實體（Column 物件）        | 用來做欄位層級操作                                      |
| `rowIndex`          | 整數                      | 該 cell 在整體 row 中的 index（只有在 cellRenderer 等才會有） |
| `value`             | 該 cell 的值               | 多用於 valueFormatter、cellRenderer 中              |
| `api` / `columnApi` | Grid API                | 可以操作整張表格                                       |
### 🎯 範例彙整

#### ✅ 1. `checkboxSelection`


``` ts
checkboxSelection: (params) => {
  return params.context.isEditable && params.data.status !== 'Closed';
}
```

意思是：只有當 `context.isEditable = true` 且這列 `status !== 'Closed'`，才顯示 checkbox。

---

#### ✅ 2. `valueGetter`


``` ts
valueGetter: (params) => {
  return `${params.data.firstName} ${params.data.lastName}`;
}
```

自訂欄位值，根據 rowData 內容組合出來。

---

#### ✅ 3. `isRowSelectable`


``` ts
isRowSelectable: ({ data }) => data.status === 'Approved'
```

只有當某列 status 是 Approved 時，該列可以勾選。

---

#### ✅ 4. `cellRenderer`


``` ts
cellRenderer: ({ value, rowIndex }) => {
  return `<span>#${rowIndex + 1} - ${value}</span>`;
}
```

渲染自訂 HTML（只在 CellRenderer 中才會有 `value`, `rowIndex`）

### ✅ 總結重點表格

| 你常看到的寫法                | 實際上是從 `params` 解構出來 | 說明                             |
| ---------------------- | ------------------- | ------------------------------ |
| `({ data }) => ...`    | `params.data`       | 拿 row 資料判斷是否顯示、值是什麼            |
| `({ context }) => ...` | `params.context`    | 拿外部狀態（父元件傳進來的）控制邏輯             |
| `({ node }) => ...`    | `params.node`       | 拿到該 row 的狀態，例如是否已選取            |
| `({ value }) => ...`   | `params.value`      | 拿該 cell 的原始值（常用於 cellRenderer） |

---
## 多層解構賦值

看起來複雜但其實只是 JavaScript/TypeScript 語法糖的一種。我來一步一步拆給你看，你會馬上懂。

### 🎯 原始寫法：


``` ts
checkboxSelection: ({ context: { isHeaderCheckboxSelectable } }) =>
  isHeaderCheckboxSelectable
```

看起來像黑魔法，其實只是簡寫，對應的是：


``` ts
checkboxSelection: (params) => {
  const isHeaderCheckboxSelectable = params.context.isHeaderCheckboxSelectable;
  return isHeaderCheckboxSelectable;
}
```

### 🧠 拆解語法（解構的層次）


``` ts
({ context: { isHeaderCheckboxSelectable } })
```

這一行其實是：

1. **先從參數 `params` 物件中取出 `context`**
    
2. **再從 `context` 中取出 `isHeaderCheckboxSelectable`**


對應這樣的資料結構：

``` ts
params = {
  context: {
    isHeaderCheckboxSelectable: true,
  },
  ...其他欄位
}
```

### ✅ 可拆解版本（一步步來）


``` ts
checkboxSelection: (params) => {
  const context = params.context;
  const isHeaderCheckboxSelectable = context.isHeaderCheckboxSelectable;
  return isHeaderCheckboxSelectable;
}

```

或中間版本：

``` ts
checkboxSelection: ({ context }) => {
  return context.isHeaderCheckboxSelectable;
}
```

再簡化一層變成你看到的：

``` ts
checkboxSelection: ({ context: { isHeaderCheckboxSelectable } }) =>
  isHeaderCheckboxSelectable;
```

這樣寫很「短」，但也很「難讀」，所以不是必要時可以寫清楚一點沒關係。

### ✅ 你也可以選擇這樣寫（比較直觀）：


``` ts
checkboxSelection: (params) => params.context.isHeaderCheckboxSelectable
```

或簡化一點：

``` ts
checkboxSelection: ({ context }) => context.isHeaderCheckboxSelectable
```

### 🔚 小結

| 寫法                                                      | 等價寫法                                                    | 風格說明      |
| ------------------------------------------------------- | ------------------------------------------------------- | --------- |
| `({ context: { isHeaderCheckboxSelectable } }) => ...`  | `(params) => params.context.isHeaderCheckboxSelectable` | 多層解構，短但難讀 |
| `({ context }) => context.isHeaderCheckboxSelectable`   | 比較平衡，好讀好維護                                              |           |
| `(params) => params.context.isHeaderCheckboxSelectable` | 最直接，也最清楚                                                |           |


---
## Ag-Grid 元件屬性位置分辨小簡介


### ✅ 這些像 `checkboxSelection`, `valueGetter`, `cellRenderer`, `headerCheckboxSelection` 等屬性：

> **都是放在 `columnDefs` 裡的每一欄設定中。**


### 📦 結構示意（放在 `columnDefs` 中）：


``` tsx
<AgGrid
  columnDefs={[
    {
      headerName: '選取',
      field: 'rowSelection',
      checkboxSelection: (params) => true, // ✅ 放這裡
      headerCheckboxSelection: (params) => true, // ✅ 放這裡
      cellRenderer: (params) => 'Hello', // ✅ 放這裡
    },
    {
      headerName: '名稱',
      field: 'name',
      valueGetter: (params) => params.data.firstName + ' ' + params.data.lastName, // ✅ 放這裡
    },
  ]}
  ...
/>
```

### ❗ 那哪些屬性是放在 `AgGrid` 元件本身？

Ag-Grid 元件屬性會放一些全域行為，例如：

| 屬性                | 功能                   | 放的位置                                   |
| ----------------- | -------------------- | -------------------------------------- |
| `rowData`         | 表格資料來源               | `<AgGrid />`                           |
| `context`         | 傳給所有欄位 callback 用的資料 | `<AgGrid context={{ ... }} />`         |
| `onGridReady`     | 表格初始化完成時觸發的事件        | `<AgGrid onGridReady={...} />`         |
| `isRowSelectable` | 控制整列是否可選             | ✅ 雖然是 callback，但是放在 `<AgGrid />` 不是欄位中 |

### 🧠 小技巧區分方式

| callback 放哪裡？            | 怎麼知道？                     |
| ------------------------ | ------------------------- |
| 跟欄位有關（像是值、checkbox、cell） | 放在 `columnDefs` 的每個欄位裡    |
| 跟整個列或表格行為有關              | 放在 `<AgGrid />` 的 props 上 |

### ✅ 總結分類表

|功能|寫在哪|範例|
|---|---|---|
|`checkboxSelection`|`columnDefs` 裡的欄位設定|只控制該欄要不要 checkbox|
|`headerCheckboxSelection`|`columnDefs` 裡的欄位設定|控制 header 是否出現全選|
|`valueGetter` / `cellRenderer`|`columnDefs` 裡的欄位設定|控制 cell 要顯示什麼內容|
|`isRowSelectable`|`<AgGrid />` 元件屬性|控制哪幾列可以被選取|
|`context`|`<AgGrid context={...} />`|提供參數給所有 callback 用|
|`rowData`, `columnDefs`, `onGridReady`|`<AgGrid />` 元件屬性|表格基本結構與事件處理|

---
## gridapi 介紹

### ✅ 簡單定義

> `gridApi` 是 Ag-Grid 提供的「控制整張表格的 API 物件」，可以用來操作資料、選取列、重新整理、滾動等行為。

### 🔧 取得方式

你通常在 `onGridReady` 中取得它：

``` tsx
const [gridApi, setGridApi] = useState<GridApi | null>(null);

const onGridReady = (params: GridReadyEvent) => {
  setGridApi(params.api); // 👈 拿到 gridApi
};
```

### 📦 gridApi 能做什麼？（常見功能分類）

| 類別     | 方法                                            | 功能                       |
| ------ | --------------------------------------------- | ------------------------ |
| ✅ 選取控制 | `getSelectedRows()`                           | 取得目前所有勾選的 rowData        |
|        | `selectAll()` / `deselectAll()`               | 全選 / 全部取消勾選              |
|        | `forEachNode(node => node.setSelected(true))` | 自定條件勾選                   |
| ✅ 資料更新 | `setRowData(data)`                            | 重新載入資料                   |
|        | `refreshCells()`                              | 強制刷新畫面（例如顏色、樣式變更）        |
| ✅ 分頁控制 | `paginationGoToNextPage()`                    | 跳到下一頁                    |
|        | `paginationGoToPage(n)`                       | 跳到第 n 頁                  |
| ✅ 滾動控制 | `ensureIndexVisible(rowIndex)`                | 滾到第幾列                    |
| ✅ 快取操作 | `refreshInfiniteCache()`                      | 用在 infinite scroll 時重載資料 |
### 🎯 實用範例一：全選所有可選的列

``` ts
gridApi.forEachNode((node) => {
  if (node.selectable) node.setSelected(true);
});
```

> 常配合 `isRowSelectable` 使用，只選可勾選的列。

### 🎯 實用範例二：取得所有勾選的資料

``` ts
const selected = gridApi.getSelectedRows();
console.log(selected); // 陣列型態，裡面就是你選的 rowData
```

### 🎯 實用範例三：重新設資料

``` ts
gridApi.setRowData(newData); // 重載 rowData
```

> 不用整個 AgGrid 元件重 render，只改資料即可。

### 🧠 小結

| 特性           | 說明                                  |
| ------------ | ----------------------------------- |
| 什麼是 gridApi？ | 控制 Ag-Grid 表格的「遙控器」                 |
| 怎麼拿？         | 在 `onGridReady` 中透過 `params.api` 拿到 |
| 常見用途         | 全選、取消、刷新、跳頁、設定資料、滾動等                |
| 為什麼重要？       | 不透過 gridApi，你沒辦法在程式中「主動操作表格」        |

### 🧩 基本概念：`gridApi` vs `columnApi`

|API 名稱|控制什麼|拿來幹嘛|
|---|---|---|
|`gridApi`|**行（row）和整體表格行為**|勾選、分頁、資料更新、滾動、搜尋|
|`columnApi`|**欄位（column）的設定與狀態**|顯示/隱藏欄位、排序、欄寬、pin 欄|

你可以在 `onGridReady` 拿到：

``` ts
const onGridReady = (params: GridReadyEvent) => {
  const gridApi = params.api;
  const columnApi = params.columnApi;
};
```

### ✅ `gridApi` 常用方法分類整理

#### 📋 資料操作

| 方法                       | 功能              |
| ------------------------ | --------------- |
| `setRowData(data)`       | 設定/重設 rowData   |
| `getDisplayedRowCount()` | 取得目前顯示的列數       |
| `refreshCells()`         | 強制更新 Cell（樣式、值） |
#### ✅ 選取控制

| 方法                              | 功能                           |
| ------------------------------- | ---------------------------- |
| `getSelectedRows()`             | 取得目前選取的 row 資料（rowData）      |
| `selectAll()` / `deselectAll()` | 全選 / 全部取消選取                  |
| `forEachNode((node) => ...)`    | 遍歷所有列（包含未顯示）                 |
| `forEachNodeAfterFilter(...)`   | 遍歷過濾後的列                      |
| `getSelectedNodes()`            | 拿到包含 metadata 的選取 RowNode 陣列 |
#### 📑 分頁操作（前提：開啟分頁）

| 方法                             | 功能      |
| ------------------------------ | ------- |
| `paginationGoToNextPage()`     | 跳下一頁    |
| `paginationGoToPreviousPage()` | 上一頁     |
| `paginationGoToPage(n)`        | 跳到第 n 頁 |
| `paginationGetCurrentPage()`   | 取得當前頁碼  |
| `paginationGetTotalPages()`    | 取得總頁數   |
#### 🧭 滾動控制

| 方法                             | 功能           |
| ------------------------------ | ------------ |
| `ensureIndexVisible(rowIndex)` | 滾動到指定列 index |
| `ensureColumnVisible(colKey)`  | 滾動到指定欄       |
#### 🔍 快取與搜尋

| 方法                       | 功能                        |
| ------------------------ | ------------------------- |
| `setQuickFilter(string)` | 套用快速搜尋關鍵字                 |
| `refreshInfiniteCache()` | 用在 infinite scroll 重新載入資料 |

### ✅ `columnApi` 常用方法整理

#### 👀 顯示/隱藏欄位

| 方法                                  | 功能               |
| ----------------------------------- | ---------------- |
| `setColumnVisible(colKey, visible)` | 顯示/隱藏某欄          |
| `getAllColumns()`                   | 取得所有欄位 Column 物件 |
| `getColumn(colKey)`                 | 取得指定欄位物件         |
| `getAllDisplayedColumns()`          | 取得目前有顯示的欄位       |
#### ↔️ 欄位寬度與移動

|方法|功能|
|---|---|
|`autoSizeColumn(colKey)`|自動調整某欄寬度|
|`autoSizeAllColumns()`|所有欄位自動寬度|
|`moveColumn(colKey, newIndex)`|將某欄移動到新位置|
#### 📌 Pin 欄控制（釘左/釘右）

| 方法                              | 功能      |
| ------------------------------- | ------- |
| `setColumnPinned(colKey, 'left' | 'right' |
### ✅ 如何選擇用哪一個 API？

| 你想做的事     | 用哪個 API？    | 範例                                           |
| --------- | ----------- | -------------------------------------------- |
| 勾選/取消某些列  | `gridApi`   | `gridApi.forEachNode(...)`                   |
| 取得使用者勾選資料 | `gridApi`   | `gridApi.getSelectedRows()`                  |
| 顯示/隱藏某一欄  | `columnApi` | `columnApi.setColumnVisible('price', false)` |
| 自動調整欄寬    | `columnApi` | `columnApi.autoSizeAllColumns()`             |
| 滾到某一列     | `gridApi`   | `gridApi.ensureIndexVisible(5)`              |

### 🎁 實用組合範例

``` ts
// 顯示所有目前勾選列的資料
const selected = gridApi.getSelectedRows();
console.log('已選列：', selected);

// 隱藏一欄
columnApi.setColumnVisible('status', false);

// 滾動到第 10 列
gridApi.ensureIndexVisible(10);

// 自動調整欄寬
columnApi.autoSizeAllColumns();
```

### 🧠 小結

|名稱|管理什麼|常見用途|
|---|---|---|
|`gridApi`|整張表格、列、分頁、滾動、選取|forEachNode、getSelectedRows、paginationGoToPage|
|`columnApi`|欄位的顯示、寬度、排序、pin 狀態|setColumnVisible、autoSizeColumn、setColumnPinned|

---

