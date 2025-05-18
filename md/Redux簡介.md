
### 🔹 `reducer` 是什麼？

這是 slice 裡自己定義的 action。你用 `createSlice` 時寫的 `reducers` 是直接產生的 action：

``` ts
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      state.value += 1;
    },
  },
});
```

這邊的 `increment` 就會自動生成對應的 action creator 和 reducer，供你在元件中 `dispatch(increment())` 使用。

### 🔹 `extraReducers` 是什麼？

當你使用 `createAsyncThunk` 去做非同步操作（例如抓資料），這些 thunk 會自動產生三個 action：

- `pending`
    
- `fulfilled`
    
- `rejected`
    

這些不是你 slice 裡的 `reducers` 自己定義的 action，而是「外部」產生的，所以你要用 `extraReducers` 去接它們。

``` ts
const fetchUser = createAsyncThunk('user/fetchUser', async (id) => {
  const res = await fetch(`/api/user/${id}`);
  return await res.json();
});

const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.status = 'failed';
      });
  },
});
```

### ✅ 小總結

|類型|用途|常見在哪裡出現|
|---|---|---|
|`reducers`|自己定義的同步 action|處理簡單狀態更新，如 increment、setValue|
|`extraReducers`|接非同步 action 的狀態變化|用在 `createAsyncThunk` 結合 API 呼叫時|

### ✅ 1. `createAsyncThunk`（ `maintainQuoteService.ts`）

``` ts
export const fetchCloseQuoteInfos = createAsyncThunk(
  'maintainQuote/fetchCloseQuoteInfos',
  async (quoteId: string, thunkAPI) => {
    try {
      const result = await remoteQuoteService.getCloseQuoteInfos({ quoteId });
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
```

這段代表你定義了一個**非同步 action**，叫 `fetchCloseQuoteInfos`，它會自動產生三種 action：

- `fetchCloseQuoteInfos.pending`
    
- `fetchCloseQuoteInfos.fulfilled`
    
- `fetchCloseQuoteInfos.rejected`

### ✅ 2. `extraReducers`（ `maintainQuoteSlice.ts`）

這邊就是你 slice 去接那些自動產生的 action：

``` ts
builder.addCase(fetchCloseQuoteInfos.pending, (state) => {
  state.status.fetchCloseQuoteInfos = 'loading';
});

builder.addCase(fetchCloseQuoteInfos.fulfilled, (state) => {
  state.status.fetchCloseQuoteInfos = 'succeeded';
});

builder.addCase(fetchCloseQuoteInfos.rejected, (state, action) => {
  state.status.fetchCloseQuoteInfos = 'failed';
  state.error.fetchCloseQuoteInfos = action.payload;
});
```

這段代表：

- 呼叫時 → 設為 `loading`
    
- 成功時 → 設為 `succeeded`
    
- 失敗時 → 設為 `failed` 並存下錯誤內容

### 🧠 額外補充

你可以從這裡看出 `state` 結構大概長這樣：

``` ts
{
  status: {
    fetchCloseQuoteInfos: 'idle' | 'loading' | 'succeeded' | 'failed',
    // 其他 status 像 fetchAttachFiles 之類的
  },
  error: {
    fetchCloseQuoteInfos: any,
    // 其他 error
  },
  closeQuoteInfos: ...,  // 如果你有把 API 結果存在這裡
}
```

### 🧩 總結

| 元件                 | 負責什麼                                     |
| ------------------ | ---------------------------------------- |
| `createAsyncThunk` | 發非同步請求並產生 action                         |
| `extraReducers`    | 接住 action 結果改變 state（例如 loading 狀態、錯誤處理） |
| `reducers`         | 處理同步邏輯（像是 `setData`、`resetForm` 這種）      |

如果你之後想在 component 裡用：

``` ts
const dispatch = useAppDispatch(); // 自訂的 hook
dispatch(fetchCloseQuoteInfos("abc123"));
```

---
用一個「簡化版」的例子，完全仿照你貼的結構，但改成比較好理解的情境，**例如：根據使用者 ID 抓使用者資訊**。這樣你就能對 `createAsyncThunk`、`extraReducers`、state 結構的運作方式有直覺認識。

### 🧪 假設目標

我想要：

1. 根據 `userId` 抓使用者資料
    
2. 在不同階段（請求中 / 成功 / 失敗）顯示不同 UI 狀態
    
3. 把錯誤記錄起來

### ✅ 檔案一：userService.ts

``` ts
// 模擬 API 請求
export const getUserInfo = async (userId: string) => {
  const response = await fetch(`/api/user/${userId}`);
  if (!response.ok) throw new Error('Fetch failed');
  return await response.json();
};
```

### ✅ 檔案二：userSlice.ts

``` ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getUserInfo } from './userService';

export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (userId: string, thunkAPI) => {
    try {
      const result = await getUserInfo(userId);
      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const initialState = {
  userInfo: null,
  status: {
    fetchUserInfo: 'idle',  // 'loading' | 'succeeded' | 'failed'
  },
  error: {
    fetchUserInfo: null,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserInfo.pending, (state) => {
      state.status.fetchUserInfo = 'loading';
    });
    builder.addCase(fetchUserInfo.fulfilled, (state, action) => {
      state.status.fetchUserInfo = 'succeeded';
      state.userInfo = action.payload;
    });
    builder.addCase(fetchUserInfo.rejected, (state, action) => {
      state.status.fetchUserInfo = 'failed';
      state.error.fetchUserInfo = action.payload;
    });
  },
});

export default userSlice.reducer;
```

### ✅ 元件中這樣用

``` tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserInfo } from '../features/user/userSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);
  const status = useAppSelector((state) => state.user.status.fetchUserInfo);
  const error = useAppSelector((state) => state.user.error.fetchUserInfo);

  useEffect(() => {
    dispatch(fetchUserInfo('abc123'));
  }, []);

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'failed') return <p>Error: {error}</p>;
  if (status === 'succeeded') return <div>{user.name}</div>;
};
```

### 🧠 總整理（對應你的專案）

|你的原始專案|這個簡化例子|
|---|---|
|`fetchCloseQuoteInfos`|`fetchUserInfo`|
|`remoteQuoteService.getCloseQuoteInfos()`|`getUserInfo()`|
|`state.status.fetchCloseQuoteInfos`|`state.status.fetchUserInfo`|
|`state.error.fetchCloseQuoteInfos`|`state.error.fetchUserInfo`|

---

``` ts
export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (userId: string, thunkAPI) => {
    try {
      const result = await getUserInfo(userId);
      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);
```

### ✅ 每行解釋如下：

#### `export const fetchUserInfo = createAsyncThunk(...)`

這行是宣告一個 Redux 的「非同步 action」，叫做 `fetchUserInfo`。

這個 action 有三種自動生成的狀態：

- `fetchUserInfo.pending`：開始請求時（進入 loading 狀態）
    
- `fetchUserInfo.fulfilled`：請求成功時
    
- `fetchUserInfo.rejected`：請求失敗時
    

你之後會在 `extraReducers` 裡去對應處理這三種狀態。

#### `'user/fetchUserInfo'`

這是這個 action 的「識別名稱」，它會出現在 Redux DevTools 的 log 中，例如：

``` bash
user/fetchUserInfo/pending
user/fetchUserInfo/fulfilled
user/fetchUserInfo/rejected
```

方便你追蹤 action 來自哪個 slice、用途是什麼。

#### `async (userId: string, thunkAPI) => { ... }`

這是非同步邏輯的主體，等於你寫的 async function，有兩個參數：

- `userId`：是你 dispatch 這個 action 時自己傳進來的參數，例如 `dispatch(fetchUserInfo("abc123"))`
    
- `thunkAPI`：是 Redux Toolkit 自帶的工具物件，裡面有一些有用的函式，例如 `rejectWithValue()`、`getState()` 等
    

#### `const result = await getUserInfo(userId);`

這裡執行你定義的 API 請求函式（可能是 `fetch` 或 `axios`），去抓使用者資料。

#### `return result;`

如果成功，會把這個資料作為 `action.payload` 傳到 `fulfilled` 的那一 case 中。

#### `catch (err) { return thunkAPI.rejectWithValue(err.message); }`

如果 API 請求出錯，就回傳錯誤訊息到 `rejected` 的那一 case 中。

而 `rejectWithValue(...)` 的用途是：讓你在 `rejected` 裡的 `action.payload` 拿到自訂的錯誤內容。

### 🧠 簡化比喻

你可以把這段當作：

> 「定義一個叫 `fetchUserInfo` 的非同步任務，成功的話就把結果給我，失敗的話就把錯誤訊息記錄下來。」

---

``` tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserInfo } from '../features/user/userSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);
  const status = useAppSelector((state) => state.user.status.fetchUserInfo);
  const error = useAppSelector((state) => state.user.error.fetchUserInfo);

  useEffect(() => {
    dispatch(fetchUserInfo('abc123'));
  }, []);

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'failed') return <p>Error: {error}</p>;
  if (status === 'succeeded') return <div>{user.name}</div>;
};
```

這段是 React 元件 `MyComponent` 的實作，它示範了如何在畫面中「呼叫一個 Redux 的 async thunk」，並依據狀態變化顯示不同畫面。以下我會**逐行解釋**，並搭配直覺用語讓你了解整體流程。

### ✅ 🔍 程式碼說明

``` ts
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserInfo } from '../features/user/userSlice';
```

- 引入自訂的 Redux hooks（通常是包過 `useDispatch`、`useSelector`）以及 `fetchUserInfo` 這個非同步 action。
    

``` ts
const MyComponent = () => {
```

- 宣告一個 React 函式元件。
    

``` ts
  const dispatch = useAppDispatch();
```

- 拿到 `dispatch` 函式，等一下要用它來「觸發一個 action」。
    

``` ts
  const user = useAppSelector((state) => state.user.userInfo);
  const status = useAppSelector((state) => state.user.status.fetchUserInfo);
  const error = useAppSelector((state) => state.user.error.fetchUserInfo);
```

- 這三行從 Redux store 裡面抓出資料：
    
    - `user`：使用者資料（API 回傳結果）
        
    - `status`：目前請求的狀態（idle/loading/succeeded/failed）
        
    - `error`：如果有錯誤，會在這裡看到錯誤訊息
        

---

``` ts
  useEffect(() => {
    dispatch(fetchUserInfo('abc123'));
  }, []);
```

- 這是元件掛載（mount）時執行的副作用。
    
- 執行一次 `dispatch(fetchUserInfo('abc123'))`：這會觸發你剛剛定義的 thunk，並發送 API 請求抓 `abc123` 的 user 資料。
    

---

``` ts
  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'failed') return <p>Error: {error}</p>;
  if (status === 'succeeded') return <div>{user.name}</div>;
```

- 根據目前狀態來決定要渲染什麼畫面：
    
    - `loading`：顯示「Loading...」
        
    - `failed`：顯示錯誤訊息
        
    - `succeeded`：顯示 user 的名字（資料抓成功）

### 🧠 簡化流程圖（概念）

``` text
[component mount]
      ↓
dispatch(fetchUserInfo("abc123"))
      ↓
🔄 Redux 自動派出：
    - pending → 變成 loading
    - fulfilled → 成功、存資料
    - rejected → 失敗、存錯誤訊息
      ↓
React 根據狀態自動 re-render 畫面
```

|行為|發生在哪裡|做什麼|
|---|---|---|
|觸發 API|`dispatch(fetchUserInfo(...))`|發送請求抓資料|
|狀態轉變|`extraReducers`|設定 status/loading/error|
|顯示畫面|`useSelector` + JSX|根據狀態顯示資料或錯誤|

這四個狀態 `idle`, `loading`, `succeeded`, `failed` 是 **非同步請求的生命週期（狀態機）**，讓你可以清楚知道「請求進行到哪一階段」，並據此在畫面或邏輯上做出對應反應。

### ✅ 四種狀態意義與用途

|狀態名稱|中文意思|什麼時候會出現|常見用途|
|---|---|---|---|
|`idle`|閒置中、尚未開始|預設初始值，尚未發出請求|顯示「尚未搜尋」或空畫面|
|`loading`|請求中|剛剛呼叫 `dispatch(fetchSomething())` 時|顯示 loading spinner / 禁用按鈕|
|`succeeded`|成功|API 請求成功並回傳資料|顯示資料畫面，或跳轉頁面|
|`failed`|失敗|API 請求失敗（如 404、timeout）|顯示錯誤訊息、重試按鈕|

### 🧪 範例流程

假設你在畫面中呼叫 `fetchUserInfo('abc123')`：

1. 初始時是 `idle` → 畫面可能是空白
    
2. 執行請求後 → 狀態變成 `loading` → 顯示「載入中」
    
3. 請求成功 → 狀態變成 `succeeded` → 顯示資料
    
4. 如果出錯 → 狀態變成 `failed` → 顯示錯誤訊息

### 🔍 Redux Toolkit 的狀態變化流程

一個典型的 async thunk 狀態會這樣變動：

``` scss
初始 → idle
dispatch() → loading
成功   → succeeded
失敗   → failed
```

然後 **就停在 succeeded 或 failed，不會自動 reset 回 idle**。

### ✅ 為什麼不自動回 idle？

因為：

- 你可能要根據成功/失敗來顯示畫面
    
- Redux 不知道你何時「結束處理」這個請求
    
- 所以要回 idle 是你的責任（你知道何時可以「清場」）

### 🔧 什麼時候該設回 idle？

如果你要讓使用者**可以再次觸發請求**，或是**換畫面時清空狀態**，你會自己寫一個 reducer，例如：

``` ts
reducers: {
  resetFetchUserInfoState(state) {
    state.status.fetchUserInfo = 'idle';
    state.error.fetchUserInfo = null;
  }
}
```

然後在元件裡這樣用：

``` ts
dispatch(resetFetchUserInfoState());
```

