
這邊我幫你整理 React 中常用的 `useXXX` Hook（不包含你自己寫的自定義 hook），並搭配簡單範例，讓你快速掌握用法與用途。

## ✅ 常用的 React `useXXX` Hooks 整理

| Hook 名稱       | 功能                    | 常見用途              | 範例說明      |
| ------------- | --------------------- | ----------------- | --------- |
| `useState`    | 狀態管理                  | 記錄表單、勾選、數值        | 點按鈕改變文字   |
| `useEffect`   | 處理副作用                 | 發送 API、監聽變數變化     | 頁面加載時抓資料  |
| `useMemo`     | 記住計算結果                | 減少重算次數（例如 filter） | 清單資料過濾    |
| `useCallback` | 記住函式參照                | 避免 function 重新建立  | 傳入子元件的函式  |
| `useRef`      | 保存值不重 render / 操作 DOM | 記錄上次值、聚焦 input    | 點按鈕聚焦輸入框  |


🧪 每個 Hook 的簡單範例

### 🟢 1. `useState`

``` tsx
const [count, setCount] = useState(0);
<button onClick={() => setCount(count + 1)}>+1</button>
```

---

### 🟡 2. `useEffect`

``` tsx
useEffect(() => {
  fetchData(); // 載入時發送 API
}, []);
```

---

### 🔵 3. `useMemo`

``` tsx
const filteredList = useMemo(() => {
  return list.filter((item) => item.includes(keyword));
}, [list, keyword]);
```

---

### 🔴 4. `useCallback`

``` tsx
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

---

### 🟣 5. `useRef`

``` tsx
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />
<button onClick={() => inputRef.current?.focus()}>聚焦</button>

```