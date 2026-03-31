# 1. 任務描述（Objective）

本次任務目標為將既有 `PQO-PDMEtl` 系統中的 ETL 流程， 
由「應用程式導向（Spring Batch）」  轉型為「排程導向（Airflow DAG）」，
以解決現有系統在**維護成本、可觀測性與架構複雜度**上的問題。

---

本次任務範圍包含以下三個 ETL：

- `TI_PROC_OPT`
- `TI_RAW_WAFER_QUES`
- `TI_WF_OPT_CATG`

資料來源為 **PDM API**，並同步至 **Oracle DB**。

---

## 1.1 ETL 流程概念

```
PDM API → Transform → Oracle DB
```

---

# 2. 原有系統設計（Spring Batch）

## 2.1 架構概覽

本系統採用 **Spring Boot + Spring Batch** 作為 ETL 執行框架，  
並透過 Kubernetes CronJob 進行排程觸發。

整體架構如下：

```text
Spring Boot Application
  ├── Reader (呼叫 PDM API)
  ├── Processor (資料轉換)
  ├── Writer (寫入 Oracle DB)
  ├── Job / Step（流程控制）
  └── Kubernetes CronJob（排程觸發）
```

---

## 2.2 架構圖

```
flowchart LR  
A[Kubernetes CronJob] --> B[Spring Boot App]  
  
B --> C[Spring Batch Job]  
C --> D[Reader<br/>Call PDM API]  
C --> E[Processor<br/>Transform Data]  
C --> F[Writer<br/>JPA / SQL]  
  
D --> G[PDM API]  
F --> H[Oracle DB]  
  
B --> I[Application Logs]
```

![[mermaid-diagram 1.png]]

---

## 2.3 執行流程說明

系統的實際執行流程如下：

1. Kubernetes CronJob 依排程觸發
    
2. 啟動 Spring Boot Application
    
3. 執行對應的 Spring Batch Job
    
4. Job 內部透過 Reader / Processor / Writer 完成 ETL
    
5. 任務完成後結束應用程式
    

---

## 2.4 Spring Batch 執行模型

Spring Batch 採用 Job / Step / Chunk 的分層設計：

- **Job**：代表一個完整 ETL 任務
    
- **Step**：Job 中的處理階段
    
- **Chunk**：批次處理單位（例如每 N 筆 commit 一次）
    

---

### 處理流程

```text
Reader → Processor → Writer → Commit（依 chunk）
```

---

### 特性

- 支援 chunk-based transaction
    
- 支援 retry / skip 機制
    
- 適合大批量資料處理
    

---

### 本專案使用情境

本專案每次處理資料量小於 100 筆，  
實際上未使用 chunk / parallel / retry 等進階功能。

---

## 2.5 本專案實作方式

在本系統中，每個 ETL 任務會對應一組：

- Reader：負責呼叫 PDM API
    
- Processor：負責資料轉換
    
- Writer：負責寫入 Oracle DB
    

並透過 BatchConfig 組裝為 Job 與 Step。

---

### 特點

- 每個 ETL 為獨立 Job
    
- 採用同步處理（synchronous execution）
    
- 無 parallel / partition 設計
    

---

## 2.6 技術組成

- Spring Boot
    
- Spring Batch
    
- JPA / JDBC
    
- Oracle DB
    
- Kubernetes CronJob
    

---

## 2.7 現有問題

在目前架構下，存在以下幾項主要問題：

---

### (1) Log 冗餘

Spring Batch 會產生大量框架層 log（如 JobExecution、StepExecution），  
同時應用層也會產生業務 log。

👉 導致：

- log 混雜難以閱讀
    
- 錯誤訊息不易定位
    
- debug 成本提高
    

---

### (2) 維護成本高

系統依賴 Spring Boot 生態系，包含多個相依套件：

- Spring Batch
    
- JPA
    
- JDBC Driver
    

👉 導致：

- dependency 管理複雜
    
- 升版容易影響 CI pipeline
    
- 發生相依衝突時排查成本高
    

---

### (3) 架構過度設計

Spring Batch 提供 Reader / Processor / Writer abstraction，  
但對於本專案簡單的 ETL 流程：

```text
Call API → Transform → Insert DB
```

👉 顯得過於複雜：

- 一個流程需拆成多個 class
    
- 邏輯分散
    
- 可讀性與維護性降低
    

---

### (4) 排程與業務邏輯分離

目前架構中：

- 排程定義於 Kubernetes CronJob
    
- ETL 邏輯實作於 Spring Boot
    

👉 導致：

- 部署需同時管理多個元件
    
- 排程與程式版本可能不同步
    
- debug 與問題追蹤較困難
    


---

# 3. 重構動機與目標  
  
## 3.1 核心問題  
  
在現有 Spring Batch 架構下，系統面臨以下結構性問題：  
  
### (1) 架構與需求不匹配  
  
本專案 ETL 流程為：  

Call API → Transform → Insert DB

  
但 Spring Batch 提供的是一套為「大型批次處理」設計的框架（chunk / partition / retry / skip）。  
  
👉 導致：  
  
- 使用成本高於實際需求  
- 開發需拆分多個 class（Reader / Processor / Writer）  
- 增加理解與維護負擔  
  
---  
  
### (2) 維護成本與技術負擔  
  
系統依賴 Spring Boot 生態：  
  
- 多套 dependency（Spring Batch / JPA / JDBC）  
- 升版需處理相依衝突  
- CI pipeline 維護成本高  
  
👉 問題本質：  
  
> ETL 任務被包在「應用程式框架」中  
  
---  
  
### (3) 可觀測性不足  
  
- log 分散於 application log + framework log  
- 缺乏統一監控介面  
- debug 需依賴 log tracing  
  
👉 導致 troubleshooting 成本高  
  
---  
  
### (4) 排程與邏輯分離  
  
- 排程：Kubernetes CronJob  
- 邏輯：Spring Boot application  
  
👉 導致：  
  
- 部署需跨多個元件  
- 排程與版本不同步風險  
- 問題追蹤困難  
  
---  
  
## 3.2 重構核心思維  
  
本次重構的核心並非「技術替換」，而是：  
  
> 將 ETL 從 Application-centric    
> 轉為 Orchestration-centric  
  
---  
  
### Before（舊模型）  

CronJob → Spring Boot → Batch → DB

  
👉 ETL 是「應用程式的一部分」  
  
---  
  
### After（新模型）  

Airflow DAG → Task → DB

  
👉 ETL 是「排程系統中的任務」  
  
---  
  
## 3.3 改動目標  
  
| 目標 | 說明 |  
|------|------|  
| 降低維護成本 | 移除 Spring Boot 生態依賴 |  
| 提升可觀測性 | Airflow UI + 統一 log |  
| 簡化架構 | 移除過度 abstraction |  
| 統一排程 | 集中至 Airflow DAG |  
| 提升開發效率 | ETL 流程 function 化 |  
  
---  
  
## 3.4 為什麼選擇 Airflow  
  
Airflow 本質上是一個「workflow orchestration engine」，    
非常適合 ETL 類型任務：  
  
- DAG 天然對應 ETL flow  
- 內建 retry / scheduling / monitoring  
- UI 可直接觀察 execution 狀態  
- 與 batch 任務高度契合  
  
👉 相較於 Spring Batch：  
  
|能力|Spring Batch|Airflow|  
|---|---|---|  
|流程控制|應用內|DAG|  
|排程|外部（CronJob）|內建|  
|監控|log|UI + log|  
|擴展|需改 code|加 DAG|  
  
---  
  
## 3.5 關鍵轉變  
  
本次重構的本質：  
  
> 從「依賴框架的應用程式」    
> → 「由排程驅動的資料處理流程」
---

# 4. 新系統架構（Airflow DAG）

## 4.1 架構概覽

Airflow DAG  
  ├── PythonOperator  
  │     └── pdm_api_full_load_task()  
  │            ├── Extract (API)  
  │            ├── Transform (pandas)  
  │            ├── Load (Oracle)  
  │            └── Logging

---

## 4.2 架構圖

flowchart LR  
    A[Airflow Scheduler] --> B[DAG: ETL_PQO_*]  
  
    B --> C[PythonOperator]  
    C --> D[pdm_api_full_load_task]  
  
    D --> E[Extract<br/>Call PDM API]  
    D --> F[Transform<br/>Pandas]  
    D --> G[Load<br/>Oracle]  
  
    E --> H[PDM API]  
    G --> I[Oracle DB]  
  
    D --> J[Perf Log Table]  
    D --> K[Ctrl Log Table]

![[mermaid-diagram.png]]

---

## 4.3 專案結構

app/dags/  
  ├── etl_ti_proc_opt.py  
  ├── etl_ti_raw_wafer_ques.py  
  ├── etl_ti_wf_opt_catg.py  
  ├── pdm_api_etl_utils/  
  │     ├── pdm_api_full_load.py  
  │     └── sql_utils.py  
  ├── utils.py  
  └── schemas.py

---

## 4.4 ETL 執行流程

flowchart TD  
    A[Start ETL Task]  
  
    A --> B[Extract<br/>Call PDM API]  
    B --> C{Data Empty?}  
  
    C -->|Yes| D[Write Perf Log and Exit]  
    C -->|No| E[Transform Data]  
  
    E --> F[Generate SQL]  
  
    F --> G[BEGIN TRANSACTION]  
    G --> H[DELETE FROM Target Table]  
  
    H --> I{Delete Success?}  
    I -->|No| J[Rollback and Log Error]  
    I -->|Yes| K[Insert Data]  
  
    K --> L{Insert Fail?}  
    L -->|Yes| M[Rollback All]  
    L -->|No| N[Commit]  
  
    M --> O[Write Logs]  
    N --> O  
  
    O --> P[End]

![[mermaid-diagram (2).png]]

---

# 5. 核心設計亮點

## 5.1 通用 ETL Framework

透過 `pdm_api_full_load_task`，將 ETL 流程標準化：

- Extract
- Transform
- Load
- Logging
- Transaction Control

---

### 優點

- 提升重用性
- 降低重複開發
- 易於擴展新 ETL 任務

---

## 5.2 Transaction 一致性

採用：

DELETE + INSERT → 單一 transaction

確保：

- 不會發生部分寫入
- 任一錯誤即 rollback

---

## 5.3 Logging 機制

### Performance Log

- `PQO_SYS_ETL_PERF_LOG`
- 記錄總筆數與失敗數

### Control Log

- `PQO_SYS_ETL_CTRL_LOG`
- 記錄逐筆錯誤資訊

---

## 5.4 Retry 機制

透過 Airflow 提供：

- 自動 retry
- exponential backoff

---

## 5.5 DAG 設計

一個資料表對應一個 DAG

優點：

- 可獨立 rerun
- 影響範圍小
- 易於維護

---

## 5.6 模組解耦

- Transform 與 SQL generation 分離
- 提升可讀性與可維護性

---

# 6. 設計取捨（Trade-offs）

## 6.1 SQL Execution Strategy

目前採用：

逐筆 INSERT（row-by-row）

---

### 原因

- 單次資料量小於 100 筆
- 效能影響可忽略

---

### 風險

- 資料量增加時效能下降
- 需改為 batch insert（executemany）

---

## 6.2 Full Load 策略

目前採用：

DELETE FROM table

---

### 優點

- 支援 transaction rollback
- 確保資料一致性

---

### 取捨

- 效能較 TRUNCATE 差
- 但符合當前需求

---

# 7. 成效比較

|項目|Spring Batch|Airflow|
|---|---|---|
|架構複雜度|高|低|
|維護成本|高|低|
|可觀測性|低|高|
|排程管理|分散|集中|
|重跑能力|弱|強|
|擴展性|中|高|

---

# 8. 未來優化方向

## 8.1 Batch Insert

- 使用 executemany 提升效能

---

## 8.2 Data Volume 控制

- 加入資料量上限保護機制

---

## 8.3 Chunk / Streaming 處理

- 避免一次載入大量資料

---

## 8.4 DAG 拆分（進階）

Extract → Transform → Load

---

## 8.5 監控與通知

- 整合 Email / Slack Alert

---

# 9. 結論

本次重構成功將 ETL 系統由：

Spring Batch（重量級應用）  
→ Airflow DAG（輕量排程架構）

---

## 帶來的效益

- 降低維護成本
- 提升可觀測性
- 強化資料一致性
- 提升開發與擴展效率

---

# 10. Key Takeaway

將 ETL 從「框架導向」轉為「任務導向」，  
使系統更貼近實際需求並提升整體工程品質。