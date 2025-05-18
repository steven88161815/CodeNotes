
**CloseQuoteDialogTable.tsx**
``` tsx
// React 函式型元件、型別系統
import React, { FC, useMemo } from "react";

// TSMC 封裝過的 ag-grid 元件（外層容器 + 表格主體）
import { AgGrid, AgGridWrapper } from "@tsmcui2/ag-grid";

// 傳入的 props 型別：目前只有 isSelectedAll: boolean
import { CloseQuoteDialogTableProp } from "./closeQuoteDialogTable.type";

// 自訂的 hook：負責表格資料、gridApi 等邏輯
import { useCloseQuoteDialogTable } from "./useCloseQuoteDialogTable";

// 欄位定義（表格欄位資料）
import { COLUMN_DEFINITION } from "./closeQuoteDialogTableData";

// 宣告元件並套用 FC 泛型定義 props
const CloseQuoteDialogTable: FC<CloseQuoteDialogTableProp> = ({
    isSelectedAll, // 是否要預設全選
}) => {
    console.log(isSelectedAll); // 除錯用途，可觀察來自父層的控制值

    // 使用自定 hook 拿到 rowData 資料與 onGridReady（初始化 grid 時用）
    const { rowData, onGridReady } = useCloseQuoteDialogTable({
        isSelectedAll,
    });

    return (
        // 外層樣式容器（TSMC 樣式封裝元件）
        <AgGridWrapper
            cellDivider // 顯示儲存格分隔線
            className="remove-table-col-pr pagination-container" // 額外 class 控制樣式
            style={{ height: "350px", width: "100%" }} // 固定表格區塊大小
            theme="bordered" // 套用預設 bordered 主題樣式
        >
            <AgGrid
                columnDefs={COLUMN_DEFINITION} // 表格欄位設定

                // context：傳進欄位 callback 使用（例如控制是否顯示 checkbox）
                context={{ isHeaderCheckboxSelectable: !isSelectedAll }}

                // 每一欄的預設設定（除非欄位個別覆蓋）
                defaultColDef={{
                    resizable: true, // 欄位可拉寬
                    sortable: true, // 欄位可排序
                    menuTabs: ["filterMenuTab"], // 右上選單只保留 filter
                }}

                enableCellTextSelection // 允許使用者反白複製 cell 文字
                ensureDomOrder // DOM 渲染順序一致，有助於測試與無障礙支援

                onGridReady={onGridReady} // 當表格初始化完成時，儲存 gridApi、設定資料等

                rowData={rowData} // 表格要顯示的資料（由 hook 提供）
                rowSelection="multiple" // 開啟「多選模式」

                // 決定哪些 row 可以被選取（status !== 'Closed' 才能選）
                isRowSelectable={({ data }) => data?.status !== "Closed"}
            />
        </AgGridWrapper>
    );
};

// 匯出元件
export default CloseQuoteDialogTable;

```

**useCloseQuoteDialogTable.ts**
``` ts
// React 常用 Hook
import { useEffect, useState, useMemo } from 'react';

// Redux 相關：dispatch action + 讀取 store 狀態
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { fetchCloseQuoteInfos } from '@/redux/slice/quote/maintainQuote/maintainQuoteService';

// API 回傳型別定義
import { CloseQuoteInfo } from '@/type/pqo/quote/CloseQuoteInfo';

// 工具庫：判斷物件是否為空
import { isEmpty } from 'lodash';

// Ag-Grid 的型別
import { GridApi, GridReadyEvent } from 'ag-grid-community';


// 🧩 宣告這是一個自定義 Hook，傳入 isSelectedAll（布林值）
export const useCloseQuoteDialogTable = ({
  isSelectedAll,
}: {
  isSelectedAll: boolean;
}): {
  rowData: any[];
  onGridReady: (e: GridReadyEvent) => void;
} => {
  // Redux hooks：發 action / 取得 store 中的 quote 資訊
  const dispatch = useAppDispatch();
  const quoteInfo = useAppSelector((state) => state.maintainQuoteState);

  // 本地狀態：儲存 grid API 實例（之後要用它操作表格）
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  // 表格要顯示的資料（目前是用假資料）
  const [rowData, setRowData] = useState([]);

  // 🧪 假資料，模擬 API 回傳資料
  const data = [
    {
      manual: 'Y',
      businessModel: 'CyberShuttle1',
      productClass: 'Technology',
      productName: '65nm 123456',
      geometry: '65nm',
      status: 'Closed',
    },
    {
      manual: 'N',
      businessModel: 'CyberShuttle2',
      productClass: 'XXX',
      productName: '20nm 654321',
      geometry: '20nm',
      status: 'Approved',
    },
  ];

  // 🚫 原本打 API 的邏輯：根據 quoteId 拿資料（目前註解掉）
  /*
  useEffect(() => {
    if (!isEmpty(quoteInfo?.quote?.quoteId)) {
      dispatch(fetchCloseQuoteInfos(quoteInfo?.quote?.quoteId)).then(({ meta, payload }) => {
        if (meta.requestStatus === 'fulfilled') {
          const result = payload as CloseQuoteInfo[];
          setRowData(result); // 設定資料進入表格
        }
      });
    }
  }, [dispatch, quoteInfo?.quote?.quoteId]);
  */

  // ✅ 當 Grid 載入完成時執行
  const onGridReady = (e: GridReadyEvent): void => {
    setRowData(data); // 設定資料來源（這裡是 mock data）
    setGridApi(e.api); // 儲存 Ag-Grid 的實例，後續可操作 grid 行為
  };

  // ✅ Auto Select：依據 isSelectedAll，自動勾選所有「可選列」
  useEffect(() => {
    // 條件：當需要全選 + gridApi 已初始化才執行
    if (!isSelectedAll || isEmpty(gridApi)) {
      return;
    }

    // ✅ 全選動作：遍歷每一列，設定勾選狀態
    gridApi.forEachNode((node) => {
      node.setSelected(true); // 這裡會受限於 isRowSelectable 的條件（如 status !== "Closed"）
    });
  }, [gridApi, isSelectedAll]); // ➜ 依賴：gridApi 被 set、或 isSelectedAll 改變，就會執行一次

  // ✅ 回傳給外部元件使用的值（AgGrid 要用的）
  return {
    rowData,       // 表格資料
    onGridReady,   // 表格初始化時要做的事（設定 api 與資料）
  };
};

```

**closeQuoteDialogTableData.ts**
``` ts
import {
  CheckboxSelectionCallbackParams,
  ColDef,
  HeaderCheckboxSelectionCallbackParams,
} from 'ag-grid-community';

// 表格欄位設定：每個物件代表一個欄位的定義
const COLUMN_DEFINITION: ColDef[] = [
  // ✅ 第一欄：控制勾選（checkbox）欄位
  {
    field: 'rowSelection', // 實際上沒用到這個欄位，只是佔位名稱

    type: 'rowSelection',  // 可用於自定義樣式（你們 UI 可能有客製 type 支援）

    // 決定 header 勾選框是否出現（用來全選）
    headerCheckboxSelection: ({
      context: { isHeaderCheckboxSelectable },
    }: HeaderCheckboxSelectionCallbackParams) => isHeaderCheckboxSelectable,

    // 若該列不能選，也要顯示灰色（不可點）的勾選框
    showDisabledCheckboxes: true,

    // 決定每列是否顯示勾選框
    checkboxSelection: ({
      context: { isHeaderCheckboxSelectable },
    }: CheckboxSelectionCallbackParams) => isHeaderCheckboxSelectable,

    pinned: 'left', // 把這一欄固定在最左邊

    sortable: false, // 不允許這一欄排序（避免 user 點錯）
  },

  // ✅ 第二欄：流水號（列號）
  {
    headerName: 'No.', // 欄位名稱顯示為 "No."
    valueGetter: 'node.rowIndex + 1', // 顯示為 row index + 1（從 1 開始）
    sortable: false,
  },

  // ✅ 第三欄：Manual
  {
    headerName: 'Manual',
    field: 'manual', // 對應 rowData.manual
    type: 'textFilter', // 可使用文字過濾器（如搜尋）
    sortable: false,
  },

  // ✅ 第四欄：Business Model
  {
    headerName: 'Business Model',
    field: 'businessModel',
    type: 'textFilter',
    sortable: false,
  },

  // ✅ 第五欄：Product Class
  {
    headerName: 'Product Class',
    field: 'productClass',
    sortable: false,
  },

  // ✅ 第六欄：Product Name
  {
    headerName: 'Product Name',
    field: 'productName',
    sortable: false,
  },

  // ✅ 第七欄：Geometry
  {
    headerName: 'Geometry',
    field: 'geometry',
    sortable: false,
  },

  // ✅ 第八欄：Status
  {
    headerName: 'Status',
    field: 'status',
    sortable: false,
  },
];

export { COLUMN_DEFINITION };

```

---

### 📄 `CloseQuoteDialogTable.tsx`

``` tsx
import React, { FC, useEffect } from 'react';
import { AgGrid, AgGridWrapper } from '@tsmcui2/ag-grid';
import { CloseQuoteDialogTableProp } from './closeQuoteDialogTable.type';
import { useCloseQuoteDialogTable } from './useCloseQuoteDialogTable';
import { COLUMN_DEFINITION } from './closeQuoteDialogTableData';

const CloseQuoteDialogTable: FC<CloseQuoteDialogTableProp> = ({
  isSelectedAll,
  onSelectionChange, // ✅ 新增
  onDataLoaded,      // ✅ 新增
}) => {
  const { rowData, onGridReady, gridApi } = useCloseQuoteDialogTable({ isSelectedAll });

  // ✅ 新增：資料載入後通知父元件
  useEffect(() => {
    onDataLoaded?.(rowData);
  }, [rowData]);

  return (
    <AgGridWrapper
      cellDivider
      className="remove-table-col-pr pagination-container"
      style={{ height: '350px', width: '100%' }}
      theme="bordered"
    >
      <AgGrid
        columnDefs={COLUMN_DEFINITION}
        context={{ isHeaderCheckboxSelectable: !isSelectedAll }}
        defaultColDef={{
          resizable: true,
          sortable: true,
          menuTabs: ['filterMenuTab'],
        }}
        enableCellTextSelection
        ensureDomOrder
        onGridReady={onGridReady}
        rowData={rowData}
        rowSelection="multiple"
        isRowSelectable={({ data }) => data?.status !== 'Closed'}
        onSelectionChanged={() => {
          // ✅ 新增：勾選狀態改變時通知父元件
          const selectedCount = gridApi?.getSelectedNodes().length ?? 0;
          onSelectionChange?.(selectedCount);
        }}
      />
    </AgGridWrapper>
  );
};

export default CloseQuoteDialogTable;
```

---

### 📄 `closeQuoteDialogTable.type.ts`

``` ts
type CloseQuoteDialogTableProp = {
  isSelectedAll: boolean;
  onSelectionChange?: (selectedCount: number) => void; // ✅ 新增
  onDataLoaded?: (data: any[]) => void;                // ✅ 新增
};

export type { CloseQuoteDialogTableProp };
```
---

### 📄 `useCloseQuoteDialogTable.ts`

``` ts
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { isEmpty } from 'lodash';

export const useCloseQuoteDialogTable = ({
  isSelectedAll,
}: {
  isSelectedAll: boolean;
}) => {
  const dispatch = useAppDispatch();
  const quoteInfo = useAppSelector((state) => state.maintainQuoteState);

  const [gridApi, setGridApi] = useState<GridApi | null>(null); // ✅ 保留 gridApi 給外部使用
  const [rowData, setRowData] = useState([]);

  const data = [
    {
      manual: 'Y',
      businessModel: 'CyberShuttle1',
      productClass: 'Technology',
      productName: '65nm 123456',
      geometry: '65nm',
      status: 'Closed',
    },
    {
      manual: 'N',
      businessModel: 'CyberShuttle2',
      productClass: 'XXX',
      productName: '20nm 654321',
      geometry: '20nm',
      status: 'Approved',
    },
  ];

  const onGridReady = (e: GridReadyEvent): void => {
    setGridApi(e.api);         // ✅ 新增：儲存 gridApi
    setRowData(data);
  };

  useEffect(() => {
    if (!isSelectedAll || !gridApi) return;

    gridApi.forEachNode((node) => {
      node.setSelected(true);
    });
  }, [gridApi, isSelectedAll]);

  return {
    rowData,
    onGridReady,
    gridApi, // ✅ 新增：提供 gridApi 給外部監聽勾選數
  };
};
```

---

### 📄 `CloseQuoteDialog.tsx`（父元件）

``` tsx
import React, { useState } from 'react';
import CloseQuoteDialogTable from './CloseQuoteDialogTable';

const CloseQuoteDialog = () => {
  const [radio, setRadio] = useState<'all' | 'selected'>('all');
  const [selectedCount, setSelectedCount] = useState(0);       // ✅ 新增
  const [tableData, setTableData] = useState<any[]>([]);       // ✅ 新增

  // ✅ 新增：控制 Save 是否 disable
  const isSaveDisabled = radio === 'selected' && selectedCount === 0;

  return (
    <div>
      {/* ✅ Radio Group */}
      <div>
        <label>
          <input
            type="radio"
            value="all"
            checked={radio === 'all'}
            onChange={() => setRadio('all')}
          />
          All
        </label>
        <label>
          <input
            type="radio"
            value="selected"
            checked={radio === 'selected'}
            onChange={() => setRadio('selected')}
          />
          Selected
        </label>
      </div>

      {/* ✅ 表格元件 */}
      <CloseQuoteDialogTable
        isSelectedAll={radio === 'all'}
        onSelectionChange={(count) => setSelectedCount(count)} // ✅ 新增
        onDataLoaded={(data) => setTableData(data)}             // ✅ 新增
      />

      {/* ✅ Show Data Button */}
      <button onClick={() => console.log(tableData)}>Show Data</button>

      {/* ✅ Save Button */}
      <button disabled={isSaveDisabled}>Save</button>
    </div>
  );
};

export default CloseQuoteDialog;
```

---

### 📄 `closeQuoteDialogTableData.ts`（無需更動）

✅ 無需修改，仍保持原有 `COLUMN_DEFINITION`。

---

### 📄 `index.ts`（無需更動）

✅ 無需修改，保持原有 re-export。

---

### ✅ 總結：哪些地方我新增／調整？

|檔案|新增重點說明|
|---|---|
|`CloseQuoteDialogTable.tsx`|新增 `onSelectionChange`, `onDataLoaded` 兩個 props 並在適當時機觸發|
|`closeQuoteDialogTable.type.ts`|新增 props 的型別定義|
|`useCloseQuoteDialogTable.ts`|暴露 `gridApi`，以便計算勾選列數|
|`CloseQuoteDialog.tsx`|管理選取列數與表格資料，根據條件控制按鈕狀態與列印資料|

### 🔍 完整解析：

``` tsx
onSelectionChanged={() => {
  // ✅ 新增：勾選狀態改變時通知父元件
  const selectedCount = gridApi?.getSelectedNodes().length ?? 0;
  onSelectionChange?.(selectedCount);
}}
```

### 👇 一行一行說明

#### `onSelectionChanged={() => { ... }}`

- 這是 Ag-Grid 的事件處理器。
    
- **每當使用者勾選或取消勾選一筆 row 時會觸發這個函式**。
    

#### `const selectedCount = gridApi?.getSelectedNodes().length ?? 0;`

- `gridApi?.getSelectedNodes()`：
    
    - 從 Ag-Grid 的 API 中取得「目前被勾選的所有 row node」。
        
    - 傳回的是一個陣列，每個元素是 `RowNode`。
        
- `.length`：
    
    - 就是目前被勾選的總數。
        
- `?? 0`：
    
    - 如果 `gridApi` 尚未準備好（例如畫面尚未 onGridReady），則保險地預設為 `0`。
        

#### `onSelectionChange?.(selectedCount);`

- 這是呼叫從**父元件傳進來的 callback 函式**。
    
- `?.` 表示這是可選的（optional chaining），如果沒有傳這個 prop 就不會呼叫。
    
- 傳入 `selectedCount` 作為參數，讓父元件知道目前的勾選列數是多少。
    

### 🔁 整體作用是什麼？

> 當使用者在表格中點勾選框時，自動計算目前被選取幾列，並**通知父元件**，讓父元件可以依此更新 `Save` 按鈕的 `disabled` 狀態。


如果你願意在父元件 console.log 顯示 `selectedCount`，你會發現它會隨勾選行數變化：

``` tsx
onSelectionChange={(count) => {
  console.log('目前勾選筆數:', count);
  setSelectedCount(count);
}}
```

這就是 React 常見的「**狀態提升 + callback 溝通**」模式。

### 🧠 一句話總結：

> **狀態提升 = 把需要「被多個元件共享或控制」的 state 搬到父層統一管理。**

這是 React 最重要的設計理念之一，搭配 props 和 callback，就能實現元件間資料同步。

如果你熟悉之後，會發現 Redux 或 context API 其實也是「狀態提升的延伸做法」。

### 🔍 逐行解析這段程式碼：

``` tsx
// ✅ 新增：資料載入後通知父元件
useEffect(() => {
  onDataLoaded?.(rowData);
}, [rowData]);
```

### 1️⃣ `useEffect(() => { ... }, [rowData])`

- React 的 `useEffect` 是在**畫面 render 完成後**，用來做「副作用（side effects）」的操作。
    
- `[]` 內的 `rowData` 是這個 effect 的**依賴陣列**，意思是：
    
    > **只要 `rowData` 改變，就會重新執行這段程式碼**
    

---

### 2️⃣ `onDataLoaded?.(rowData);`

- 這是在呼叫父元件傳進來的 callback 函式 `onDataLoaded`。
    
- `?.` 是 **optional chaining**，避免沒傳時爆錯（例如父元件忘記提供這個函式）。
    
- `rowData` 是表格目前顯示的全部資料，會傳給父元件儲存或印出。

### 📦 為什麼這段程式碼重要？

這就是「子元件告訴父元件：**我現在已經有資料了**，你要用的話自己拿去」的做法。

### 👉 你的實際例子中用途：

``` tsx
<CloseQuoteDialogTable
  isSelectedAll={...}
  onDataLoaded={(data) => setTableData(data)} // 父元件這樣接住
/>
```

- 父元件收到資料後可以存進 `useState`，等按下 `Show Data` 按鈕時再印出。


---

### ✅ 小結：

|項目|說明|
|---|---|
|`rowData`|傳遞的是「完整資料（全欄位）」|
|`COLUMN_DEFINITION`|決定「哪些欄位顯示在畫面上」|
|傳回資料|不受限於顯示欄位，會保留全部內容|

這樣你在做「Show Data」或「送出後端」的時候，就可以自由使用所有欄位，不怕資料遺失。

---

### ✅ `onSelectionChanged` 是什麼？

`onSelectionChanged` 是 **Ag-Grid 表格元件本身的一個事件 props**，它：

- ✅ 只能放在 `<AgGrid />` 元件上。
    
- ❌ **不能放在 `COLUMN_DEFINITION` 欄位定義內**。
    

---

### 🔍 用法與觸發時機

``` tsx
<AgGrid
  rowSelection="multiple"
  onSelectionChanged={() => {
    const selectedNodes = gridApi.getSelectedNodes();
    console.log(selectedNodes);
  }}
/>
```

#### 🔹 意思是：

> 每當使用者勾選或取消勾選一列時，就會觸發這個事件。

---

### ❌ 為什麼不能放在 `COLUMN_DEFINITION` 裡？

`COLUMN_DEFINITION` 是設定每一欄的樣式、功能、值來源用的。它會包含：

- `field`, `headerName`, `valueGetter`
    
- `checkboxSelection`, `cellRenderer`
    
- `sortable`, `filter`, `editable` 等
    

**但它不是事件監聽器的位置。**

Ag-Grid 的事件（如 `onSelectionChanged`, `onCellClicked`, `onRowClicked`）只能加在 `<AgGrid />` 或 `<AgGridReact />` 本體上。


### 🧠 類比說法：

你可以把它想成：

- `COLUMN_DEFINITION` 是欄位的「樣式和行為設定」
    
- `onSelectionChanged` 是整張表格的「事件監聽器」
    

### ✅ 如果你想對單欄的「點擊、變更」等事件做事？

這些是**可以放在欄位定義中的欄位事件**，像是：

|欄位事件名稱|放哪裡？|用法範例|
|---|---|---|
|`onCellClicked`|✅ 可放在 `columnDefs` 的某一欄|`onCellClicked: (params) => { ... }`|
|`cellRenderer`|✅ 可放在某一欄|自定義顯示方式|
|`valueGetter`|✅ 可放在某一欄|計算該欄的顯示值|

### 範例（欄位內事件）：

``` ts
{
  field: 'price',
  onCellClicked: (params) => {
    console.log('你點了價格欄：', params.value);
  }
}
```

## ✅ 小結整理

|名稱|用途|可以放哪裡？|
|---|---|---|
|`onSelectionChanged`|監聽整張表格勾選變化|✅ 只能放在 `<AgGrid />` 上|
|`onCellClicked`, `cellRenderer`|針對單一欄位設定事件或樣式|✅ 放在 `columnDefs` 裡的欄位物件中|

### 🔸 1. `onSelectionChanged`

#### ✅ 觸發時機：

- ✅ **當列被勾選或取消勾選時**（使用 checkbox 或點選可選取列時）
    

#### ✅ 可用位置：

- 只能掛在 `<AgGrid />` 上。
    

#### ✅ 傳入參數：

- 是 `GridReadyEvent` 的型別，**可用 `gridApi.getSelectedNodes()` 或 `.getSelectedRows()` 拿到選取列**。
    

#### ✅ 範例：

``` tsx
<AgGrid
  rowSelection="multiple"
  onSelectionChanged={() => {
    const selected = gridApi.getSelectedRows();
    console.log('選到的資料：', selected);
  }}
/>
```

#### ✅ 典型用途：

- 控制「Save」按鈕啟用與否
    
- 計算選取列的總價、總數等
    

---

### 🔸 2. `onCellClicked`

#### ✅ 觸發時機：

- ✅ **當使用者點擊任意 cell（儲存格）時**觸發
    
- 可以**限制某個欄位的點擊邏輯**
    

#### ✅ 可用位置：

- 可以掛在 `<AgGrid />` 或特定欄位的 `columnDefs` 中。
    

#### ✅ 傳入參數：

- `CellClickedEvent`，包含 row 資料、欄位名稱、cell value 等資訊。
    

#### ✅ 範例（全表）：

``` tsx
<AgGrid
  onCellClicked={(params) => {
    console.log('你點了欄位', params.colDef.field, '值為', params.value);
  }}
/>
```

#### ✅ 範例（特定欄）：

``` ts
{
  field: 'productName',
  onCellClicked: (params) => {
    alert('你點了產品：' + params.value);
  }
}
```

#### ✅ 典型用途：

- 點 cell 彈出編輯區、跳轉畫面、顯示詳情
    
- 僅某欄有點擊事件時推薦用欄位級別寫法
    

---

### 🔸 3. `onRowClicked`

#### ✅ 觸發時機：

- ✅ **當使用者點擊一整列（row）時**觸發，包含點到任一 cell
    

#### ✅ 可用位置：

- 僅能掛在 `<AgGrid />` 上
    

#### ✅ 傳入參數：

- `RowClickedEvent`，包含整列資料、rowIndex、rowNode 等
    

#### ✅ 範例：

``` tsx
<AgGrid
  onRowClicked={(params) => {
    console.log('你點了整列：', params.data);
  }}
/>
```

#### ✅ 典型用途：

- 點 row 時選取、打開明細、導頁等
    
- UI 上「整列可點」的互動設計很適合用這個
    

---

## ✅ 總結比較表

|事件名稱|觸發時機|傳入資料|位置|典型用途|
|---|---|---|---|---|
|`onSelectionChanged`|✅ 勾選/取消勾選 row|選中的 rows/nodes|`<AgGrid />`|控制選取行為（如 Save）|
|`onCellClicked`|✅ 點擊任一儲存格（cell）|該 cell 的資料|`<AgGrid />` 或欄位|單欄位點擊操作、編輯|
|`onRowClicked`|✅ 點擊整列（任一欄位都會觸發）|該 row 的完整資料|`<AgGrid />`|點整列打開詳情|

若你希望的是：

- 僅處理勾選變化 ➜ `onSelectionChanged`
    
- 想知道點了哪個 cell ➜ `onCellClicked`
    
- 想讓整列都能點 ➜ `onRowClicked`

---

### 🔍 `gridApi.getSelectedNodes()` 是什麼？

這是 Ag-Grid 提供的 API，用來取得目前**被勾選的所有 row node**。

### ✅ 回傳型別是：`RowNode[]`

每一個 `RowNode` 是一個物件，**代表一整列的資訊**，除了資料本身（`node.data`），還包含額外的 metadata。

### 📦 `RowNode` 常見屬性：

|屬性|說明|
|---|---|
|`data`|✅ 當列的原始資料物件（你的 rowData 中那一筆）|
|`id`|每一列的唯一 ID（由 grid 自動生成）|
|`rowIndex`|該列在畫面中的 index|
|`selected`|是否被選取（布林值）|
|`setSelected(bool)`|用來程式上選取或取消選取該列|
|`isSelected()`|回傳該列是否被選中|
|`group`, `childrenAfterGroup`|若有群組資料，這些屬性會有值|

### 🧪 範例：印出所有選取列的內容

``` ts
const selectedNodes = gridApi.getSelectedNodes();

selectedNodes.forEach((node) => {
  console.log('勾選的資料:', node.data);          // 原始 rowData 資料
  console.log('該列 index:', node.rowIndex);     // 可對應畫面位置
  console.log('是否選中:', node.isSelected());   // 通常都是 true
});
```

### ❓什麼時候用 `getSelectedNodes()`，什麼時候用 `getSelectedRows()`？

|方法|回傳內容|差別說明|
|---|---|---|
|`getSelectedNodes()`|✅ `RowNode[]`|資料＋metadata|
|`getSelectedRows()`|✅ `data[]`（純資料）|只拿你原本傳進去的資料物件|

---

### ✅ 建議使用情境：

- **只想要純資料送後端 ➜ 用 `getSelectedRows()`**
    
- **想操作選取狀態或欄位 metadata ➜ 用 `getSelectedNodes()`**