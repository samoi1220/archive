# 書房 Shufang — 部署說明

這是一個純前端、單檔 HTML 的應用程式（無後端、無 build 步驟），任何靜態主機都能部署。最簡單的兩個選項：

---

## 方案 A：GitHub Pages（最快、免費、不需安裝）

1. 到 GitHub 建立一個新 repo，例如 `shufang`（可以選 Public 或 Private）。
2. 把 `index.html` 上傳（Add file → Upload files）。
3. Repo → **Settings** → 左側選 **Pages**。
4. **Source** 選擇「Deploy from a branch」，**Branch** 選 `main`（資料夾選 `/ root`），按 Save。
5. 約 1 分鐘後，網址會出現在頂端：
   ```
   https://<你的帳號>.github.io/shufang/
   ```
6. 之後修改只要重新上傳 `index.html`，幾十秒內就會更新。

> **資料儲存**：所有書籍／筆記資料存放在瀏覽器 localStorage，每個裝置／瀏覽器各自獨立。如果想讓手機與電腦共用同一份資料，需要再加雲端同步（見下方）。

---

## 方案 B：Firebase Hosting（適合之後想加雲端資料庫同步）

需要：Node.js、Google 帳號。

```bash
# 一次性安裝
npm install -g firebase-tools
firebase login

# 初始化（在 index.html 同層執行）
firebase init hosting
# - Use an existing project 或建立新的 project
# - Public directory: . （直接點 Enter）
# - Single-page app: No
# - Set up automatic builds with GitHub: No

# 部署
firebase deploy
```

完成後會給一個 `https://<project>.web.app/` 網址。

---

## 之後想加「雲端同步」

目前 `state.books` 與 `state.notes` 寫入 localStorage（key: `shufang_v2`）。要做跨裝置同步，最直接的做法是換成 Firebase Firestore：

1. Firebase Console → 建立 Firestore Database（Native mode）。
2. 在 `index.html` 加入 Firebase SDK：
   ```html
   <script type="module">
     import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.x/firebase-app.js';
     import { getFirestore, doc, setDoc, getDoc, onSnapshot }
       from 'https://www.gstatic.com/firebasejs/10.x/firebase-firestore.js';
     // ...
   </script>
   ```
3. 把 `save()` 改成同時寫 localStorage 與 Firestore；初始載入則優先從 Firestore 讀。

如果你之後決定要做這一步，再給我 Firebase 設定截圖，我把整合程式碼補上。

---

## 自訂網域（兩個方案都支援）

- GitHub Pages：repo → Settings → Pages → Custom domain。
- Firebase Hosting：Console → Hosting → Add custom domain。

DNS 端要設 CNAME（GitHub）或 A record（Firebase 給的 IP）。

---

## 快速檢核清單

- [ ] index.html 上傳到主機
- [ ] 用手機與電腦各自打開網址，確認版面
- [ ] 試著新增一本書、編輯閱讀內容、改變閱讀狀態，確認資料留存
- [ ] 用「列表 / 網格」切換按鈕測試書庫顯示
- [ ] 用內建 ISBN 看看封面有沒有自動抓到（OpenLibrary 對中文書命中率較低，可手動填封面網址）
