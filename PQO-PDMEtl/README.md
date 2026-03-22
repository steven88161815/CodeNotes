這是一份為你的專案量身打造的 **README.md** 文件。我整合了從 Java 原始碼、架構設計到 K8s 部署的所有細節，採用標準的技術文檔格式，方便你直接放入 Git 儲存庫中。

---

# PQO PDM ETL 系統

## 專案簡介

本專案為一個企業級的 ETL (Extract, Transform, Load) 工具，專門負責從遠端 **PDM (Product Data Management)** 系統透過 REST API 抓取資料，並同步至本地端 **PQO (Product Quality Optimization)** 資料庫。

系統基於 Spring Batch 框架建構，具備高可靠性、批次處理效能以及完善的稽核追蹤機制。

---

## 核心功能

* **多流水線同步**：支援 `TiRawWaferQues`、`TiWfOptCatg` 與 `TiProcOpt` 三大業務對象。
* **自動化資料清洗**：處理原始資料中的格式差異（如處理連字號 `-`）。
* **安全認證**：整合 `CommonEncryption` 組件，所有資料庫與 API 密碼均經由 Vault 動態注入並在運行時解密。
* **雲端原生部署**：完整支援 Kubernetes CronJob 排程運作與 Istio Sidecar 生命週期管理。

---

## 技術棧

* **核心框架**: Spring Boot 2.x, Spring Batch 4.x
* **資料存取**: Spring Data JPA, HikariCP
* **連線工具**: Spring WebClient (Reactive)
* **開發輔助**: Lombok, Apache Commons Codec
* **基礎設施**: Kubernetes, HashiCorp Vault, Istio

---

## 專案結構

```text
src/main/java/com/tsmc/pqo/etl
├── PqoPdmEtlApplication.java      # 啟動類別
├── PDMConfig.java                 # 遠端 API 連線配置
├── PQOConfig.java                 # 業務資料庫 JPA 配置
└── cis/                           # CIS 業務領域模組
    ├── batch/                     # Spring Batch 實作
    │   ├── BatchConfig.java       # Job/Step 配置
    │   ├── BatchDataSourceConfig.java # Batch 運行紀錄資料源
    │   ├── *Reader.java           # API 讀取組件
    │   ├── *Processor.java        # 資料清洗與轉換
    │   └── *Writer.java           # 資料庫寫入組件
    ├── model/                     # 資料模型
    │   ├── jpa/                   # Database Entities (與 DB 映射)
    │   └── to/                    # Transfer Objects (與 API 映射)
    └── repository/                # Data Access Objects (DAO 介面)

```

---

## 部署說明

專案部署於 K8s 環境，配置檔案位於 `deploy/` 目錄下：

1. **01-configmap.yaml**: 存放 `application.properties` 設定。
2. **02-vault.yaml**: 連結 HashiCorp Vault 取得加密金鑰。
3. **03-cronjob.yaml**: 定義定時排程與 Istio Sidecar 退出邏輯。

### 排程資訊

目前正式環境排程設定為：`45 1-23/2 * * *` (凌晨 01:45 起，每兩小時執行一次)。

---

## 運作邏輯

1. **啟動前置**: Pod 啟動時透過 `until curl` 等待 Istio Sidecar 準備就緒。
2. **清除舊料**: 每個 Step 執行時，若 API 回傳有值，會先清空本地端對應的資料表。
3. **批次寫入**: 每處理 **20 筆** 資料執行一次 `saveAll`，並紀錄寫入日誌。
4. **優雅退出**: 任務完成後，發送 `quitquitquit` 給 Sidecar 確保 Pod 能正常結束。

---

## 維護者

* **Deployer**: CCJUANGF
* **Developer**: CCJUANGF
* **Site Sponsor**: HUANGSYE

---

這份 README 應該能完美展現你這份專案的專業度。**最後一項我可以幫你的：如果你想把這些程式碼全部打包成一個真正的 `.zip` 檔案下載，或是需要我幫你寫一段「如何新增一個同步對象」的開發手冊，請告訴我！**