# 1. 任務描述（Objective）

本次任務目標為將既有 `PQO-PDMEtl` 系統中的 ETL 流程，  
由 **Spring Batch 架構** 遷移至 **Airflow DAG 架構（PQO-batch repository）**。

本次處理三個 ETL 任務：

- `TI_PROC_OPT`
- `TI_RAW_WAFER_QUES`
- `TI_WF_OPT_CATG`

資料來源為 **PDM API**，並同步至 **Oracle DB**。

---

## 1.1 ETL 流程概念

PDM API → Transform → Oracle DB

---

# 2. 原有系統設計（Spring Batch）

## 2.1 架構概覽

Spring Boot Application  
  ├── Reader (call PDM API)  
  ├── Processor (資料轉換)  
  ├── Writer (JPA / SQL)  
  ├── Job / Step  
  └── Kubernetes CronJob

---

## 2.2 架構圖

flowchart LR  
    A[Kubernetes CronJob] --> B[Spring Boot App]  
      
    B --> C[Spring Batch Job]  
    C --> D[Reader<br/>Call PDM API]  
    C --> E[Processor<br/>Transform Data]  
    C --> F[Writer<br/>JPA / SQL]  
  
    D --> G[PDM API]  
    F --> H[Oracle DB]  
  
    B --> I[Application Logs]

![[mermaid-diagram (1).png]]

---

## 2.3 技術組成

- Spring Boot
- Spring Batch
- JPA / JDBC
- Oracle DB
- Kubernetes CronJob

---

## 2.4 現有問題

### (1) Log 冗餘

- Spring Batch 與應用層 log 混雜
- 不利於問題診斷與追蹤

---

### (2) 維護成本高

- Spring Boot 升版影響 CI pipeline
- dependency 相依複雜

---

### (3) 架構過度設計

- 小型 ETL 使用完整 Batch framework
- Reader / Processor / Writer abstraction 過重

---

### (4) Release unit 分散

- 排程與業務邏輯分離
- 不利於統一管理與部署

---

# 3. 重構動機與目標

## 3.1 核心思考

將 ETL 從：

> Application-centric（應用程式導向）

轉為：

> Orchestration-centric（排程導向）

---

## 3.2 改動目標

| 目標     | 說明                       |
| ------ | ------------------------ |
| 降低維護成本 | 移除 Spring Boot 依賴        |
| 提升可觀測性 | 使用 Airflow UI            |
| 簡化架構   | 移除過度 abstraction         |
| 統一排程管理 | 集中至 PQO-batch repository |

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