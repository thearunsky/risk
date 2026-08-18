const http = require('http');

const PORT = 4000;

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Trading Analyzer - Multi-Day, Drawdown & 2% Risk Engine</title>
  <style>
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --primary: #2563eb;
      --success: #16a34a;
      --danger: #dc2626;
      --warning: #d97706;
      --purple: #7c3aed;
      --purple-bg: #f5f3ff;
      --purple-border: #ddd6fe;
    }
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      max-width: 1100px; 
      margin: 30px auto; 
      padding: 0 20px; 
      color: var(--text-main); 
      background: var(--bg);
      line-height: 1.5;
    }
    h1 { margin-bottom: 4px; font-size: 26px; text-align: center; }
    .subtitle { color: var(--text-muted); margin-top: 0; margin-bottom: 20px; text-align: center; font-size: 14px; }

    .config-wrapper {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .config-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .config-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 8px;
    }
    .input-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }
    .input-group {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
    }
    input[type="number"], select {
      padding: 6px 10px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 13px;
      outline: none;
    }

    .drop-zone { 
      border: 2px dashed #94a3b8; 
      padding: 30px 20px; 
      text-align: center; 
      border-radius: 10px; 
      cursor: pointer; 
      background: var(--card-bg); 
      display: block; 
      transition: all 0.2s ease-in-out; 
    }
    .drop-zone:hover { border-color: var(--primary); background: #eff6ff; }
    input[type="file"] { display: none; }
    .icon { font-size: 32px; margin-bottom: 4px; display: block; }
    .status-msg { margin-top: 12px; font-size: 14px; font-weight: 600; text-align: center; }

    #dashboard { display: none; margin-top: 25px; }
    .section-title { font-size: 17px; font-weight: 700; margin: 20px 0 10px 0; display: flex; justify-content: space-between; align-items: center; }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      margin-bottom: 20px;
    }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .metric-card.highlight {
      border: 2px solid var(--primary);
      background: #eff6ff;
    }
    .metric-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
    .metric-value { font-size: 20px; font-weight: 700; margin-top: 4px; }
    .metric-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
    
    .val-green { color: var(--success); }
    .val-red { color: var(--danger); }
    .val-primary { color: var(--primary); }

    .breach-alert-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 20px;
      display: none;
    }
    .breach-alert-box h4 { margin: 0 0 8px 0; color: var(--danger); font-size: 15px; }
    .breach-item { font-size: 13px; color: #991b1b; margin-bottom: 4px; }

    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow-x: auto;
      margin-bottom: 20px;
      max-height: 480px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      padding: 9px 12px;
      font-weight: 600;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 1;
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid var(--border);
    }
    tr:last-child td { border-bottom: none; }
    
    .overnight-highlight-row td {
      background: var(--purple-bg);
      border-top: 1px dashed var(--purple-border);
      border-bottom: 1px dashed var(--purple-border);
      padding: 10px 14px;
    }
    .overnight-card {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #5b21b6;
    }
    .overnight-tag {
      background: #7c3aed;
      color: white;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 11px;
      letter-spacing: 0.5px;
    }

    /* Cluster breakdown styling */
    .cluster-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-left: 4px solid var(--danger);
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .cluster-header {
      background: #fff5f5;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      border-bottom: 1px solid #fee2e2;
    }
    .cluster-title {
      font-weight: 700;
      color: #991b1b;
      font-size: 14px;
    }
    .cluster-badges {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
    }
    .badge-overnight { background: #ede9fe; color: var(--purple); }
    .badge-warn { background: #fef3c7; color: #92400e; }
    .badge-pass { background: #dcfce7; color: var(--success); }
    .badge-fail { background: #fee2e2; color: var(--danger); }
  </style>
</head>
<body>
  <h1>Trading CSV/JSON & Risk Engine</h1>
  <p class="subtitle">Multi-Day Trades, Daily Drawdowns, Consistency & 2% Single Idea Risk Checks (10m cluster).</p>

  <div class="config-wrapper">
    <div class="config-card">
      <div class="config-title">Account & Drawdowns</div>
      <div class="input-row">
        <div class="input-group">
          <label>Size: $</label>
          <input type="number" id="accountSize" value="25000" step="1000" style="width: 80px;" />
        </div>
        <div class="input-group">
          <label>Daily DD:</label>
          <input type="number" id="dailyDDPct" value="4.0" step="0.5" style="width: 50px;" />%
        </div>
        <div class="input-group">
          <label>Max DD:</label>
          <input type="number" id="maxDDPct" value="9.0" step="0.5" style="width: 50px;" />%
        </div>
      </div>
    </div>

    <div class="config-card">
      <div class="config-title">Single Trade Idea Risk Limit (10m)</div>
      <div class="input-row">
        <div class="input-group">
          <label>Max Risk / Idea:</label>
          <input type="number" id="riskLimitPct" value="2.0" step="0.5" style="width: 55px;" />%
        </div>
        <span style="font-size: 12px; color: var(--text-muted);">(Clusters same pair/dir within 10 min)</span>
      </div>
    </div>

    <div class="config-card">
      <div class="config-title">CSV Time Offset (open/close)</div>
      <div class="input-row">
        <select id="offsetAction">
          <option value="add" selected>Add (+)</option>
          <option value="sub">Subtract (-)</option>
        </select>
        <input type="number" id="offsetHours" min="0" max="72" step="any" value="3" style="width: 55px;" />
        <span style="font-size: 13px; color: var(--text-muted);">Hours</span>
      </div>
    </div>
  </div>

  <label class="drop-zone" id="dropZone">
    <span class="icon">📁</span>
    <span id="labelTxt"><strong>Click to select</strong> or drag and drop <code>.csv</code> or <code>.json</code> here</span>
    <input type="file" id="fileInput" accept=".csv,.json,.txt,.tsv">
  </label>

  <div id="statusMsg" class="status-msg"></div>

  <div id="dashboard">
    <div id="breachAlertBox" class="breach-alert-box">
      <h4>Drawdown & Risk Violations Detected</h4>
      <div id="breachItemsContainer"></div>
    </div>

    <div class="section-title">Account Performance & Consistency</div>
    <div class="metrics-grid">
      <div class="metric-card highlight">
        <div class="metric-label">Consistency Score</div>
        <div class="metric-value val-primary" id="mConsistency">0.00%</div>
        <div class="metric-sub" id="calcBreakdownText">Highest Day / PnL</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Highest Day Profit</div>
        <div class="metric-value val-green" id="mHighestDay">$0.00</div>
        <div class="metric-sub" id="mBestDayDate">N/A</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Net PnL</div>
        <div class="metric-value" id="mTotalNet">$0.00</div>
        <div class="metric-sub" id="mAccountReturn">0.00% Return</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Max DD Floor Limit</div>
        <div class="metric-value" id="mMaxDDFloor">$0.00</div>
        <div class="metric-sub" id="mMaxDDBadge">PASS</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">2% Risk Breaches</div>
        <div class="metric-value" id="mRiskBreachCount" style="color:var(--danger);">0</div>
        <div class="metric-sub">Single Pair &lt;10m</div>
      </div>
    </div>

    <!-- 2% Single Idea Risk Breaches Detailed Cluster View -->
    <div class="section-title">
      Single Idea Risk Breaches (&gt; <span id="riskLimitLabel">2</span>% / 10m Cluster)
      <span id="riskBreachBadge" class="badge badge-pass">0 Breaches</span>
    </div>
    <div id="riskClustersContainer"></div>

    <!-- Daily Balance Flow with Multi-Day Highlights -->
    <div class="section-title">
      Daily Balance Flow & Inter-Day Trades
      <span style="font-size:12px; font-weight:normal; color:var(--purple);">🟣 Shaded rows = Multi-day trades spanning across days</span>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Date / Period</th>
            <th>Trades</th>
            <th>Start Balance</th>
            <th>Realized Net PnL</th>
            <th>End Balance</th>
            <th>Daily Loss Limit</th>
            <th>DD Threshold</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="dailyBalanceTableBody"></tbody>
      </table>
    </div>

    <!-- Under 2 Minutes Table -->
    <div class="section-title">
      Trades Held Under 2 Minutes (&le; 120s)
      <span id="under2MinCount" class="badge-warn">0 Trades</span>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Trade ID</th>
            <th>Profit / Loss</th>
            <th>Commission</th>
            <th>Net PnL</th>
            <th>Hold Time</th>
            <th>Open Time</th>
            <th>Close Time</th>
          </tr>
        </thead>
        <tbody id="under2MinTableBody"></tbody>
      </table>
    </div>
  </div>

  <script>
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const labelTxt = document.getElementById('labelTxt');
    const statusMsg = document.getElementById('statusMsg');
    const offsetAction = document.getElementById('offsetAction');
    const offsetHours = document.getElementById('offsetHours');
    const accountSizeInput = document.getElementById('accountSize');
    const dailyDDPctInput = document.getElementById('dailyDDPct');
    const maxDDPctInput = document.getElementById('maxDDPct');
    const riskLimitPctInput = document.getElementById('riskLimitPct');
    const dashboard = document.getElementById('dashboard');

    let currentLoadedTrades = null;

    function extractNumericName(fileName) {
      const match = fileName.match(/\\d+/);
      if (match) return match[0] + '.json';
      const clean = fileName.replace(/\\.[^/.]+$/, '').replace(/^trades_/i, '');
      return (clean || 'output') + '.json';
    }

    function detectDelimiter(line) {
      const delimiters = [';', ',', '\\t', '|'];
      let maxCount = 0;
      let chosen = ';';
      delimiters.forEach(d => {
        const count = line.split(d).length - 1;
        if (count > maxCount) {
          maxCount = count;
          chosen = d;
        }
      });
      return chosen;
    }

    function shiftTime(timeStr, hoursToAdd) {
      if (!timeStr || typeof timeStr !== 'string') return timeStr;
      const parts = timeStr.trim().match(/^(\\d{4})-(\\d{2})-(\\d{2})[ T](\\d{2}):(\\d{2}):(\\d{2})/);
      if (!parts) return timeStr;

      const [, year, month, day, hour, min, sec] = parts.map(Number);
      const utcMs = Date.UTC(year, month - 1, day, hour, min, sec);
      const shifted = new Date(utcMs + (hoursToAdd * 60 * 60 * 1000));

      const pad = (n) => String(n).padStart(2, '0');
      return \`\${shifted.getUTCFullYear()}-\${pad(shifted.getUTCMonth() + 1)}-\${pad(shifted.getUTCDate())} \${pad(shifted.getUTCHours())}:\${pad(shifted.getUTCMinutes())}:\${pad(shifted.getUTCSeconds())}\`;
    }

    function parseCSVWithTimeShift(text, hoursShift) {
      if (!text || !text.trim()) return [];

      const rawLines = text.split(/\\r\\n|\\n|\\r/);
      const firstLine = rawLines.find(l => l.trim().length > 0) || '';
      const delimiter = detectDelimiter(firstLine);

      const rows = [];
      let currentRow = [];
      let entry = '';
      let inQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            entry += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          currentRow.push(entry.trim());
          entry = '';
        } else if ((char === '\\r' || char === '\\n') && !inQuotes) {
          if (char === '\\r' && nextChar === '\\n') i++;
          currentRow.push(entry.trim());
          if (currentRow.some(val => val !== '')) rows.push(currentRow);
          currentRow = [];
          entry = '';
        } else {
          entry += char;
        }
      }

      if (entry.length > 0 || currentRow.length > 0) {
        currentRow.push(entry.trim());
        if (currentRow.some(val => val !== '')) rows.push(currentRow);
      }

      if (rows.length < 2) return [];

      const headers = rows[0].map(h => h.replace(/^"|"$/g, '').trim());

      return rows.slice(1).map(values => {
        const obj = {};
        headers.forEach((header, index) => {
          if (!header) return;
          let val = values[index] !== undefined ? values[index] : '';
          val = String(val.replace(/^"|"$/g, '').trim());

          if ((header === 'open_time' || header === 'close_time') && hoursShift !== 0) {
            val = shiftTime(val, hoursShift);
          }
          obj[header] = val;
        });
        return obj;
      });
    }

    function formatDuration(seconds) {
      if (isNaN(seconds) || seconds <= 0) return '0s';
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      if (days > 0) return \`\${days}d \${hours}h \${mins}m\`;
      if (hours > 0) return \`\${hours}h \${mins}m\`;
      return \`\${mins}m \${secs}s\`;
    }

    function safeSetText(id, text) {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    }

    function safeSetHTML(id, html) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    }

    // Clusters losing trades of same symbol/direction within temporal 10-minute bounds
    function evaluateRiskPerIdea(trades, accountBalance, riskLimitPct) {
      const WINDOW_SECONDS = 600;

      const losingTrades = trades
        .map(t => {
          const profit = parseFloat(t.profit) || 0;
          const commission = parseFloat(t.commission) || 0;
          const totalNet = profit + commission;
          const openT = t.open_time ? new Date(t.open_time.replace(" ", "T")).getTime() : 0;
          const closeT = t.close_time ? new Date(t.close_time.replace(" ", "T")).getTime() : 0;

          let holdSec = parseFloat(t.hold_seconds);
          if (isNaN(holdSec) && openT && closeT) {
            holdSec = (closeT - openT) / 1000;
          }

          return {
            id: t.trade_id || t.id || "-",
            symbol: t.symbol ? t.symbol.toUpperCase() : "UNKNOWN",
            direction: t.direction ? t.direction.toUpperCase() : "UNKNOWN",
            volume: t.volume_lots || t.volume || "-",
            profit,
            commission,
            netLoss: totalNet < 0 ? Math.abs(totalNet) : 0,
            openTime: openT,
            closeTime: closeT,
            openTimeStr: t.open_time || t.openTimeStr || "-",
            closeTimeStr: t.close_time || t.closeTimeStr || "-",
            holdSeconds: holdSec
          };
        })
        .filter(t => t.netLoss > 0 && t.openTime > 0)
        .sort((a, b) => a.openTime - b.openTime);

      const visited = new Set();
      const breachedClusters = [];

      for (let i = 0; i < losingTrades.length; i++) {
        const baseTrade = losingTrades[i];
        if (visited.has(baseTrade.id)) continue;

        const currentCluster = [baseTrade];
        visited.add(baseTrade.id);

        for (let j = i + 1; j < losingTrades.length; j++) {
          const targetTrade = losingTrades[j];
          if (visited.has(targetTrade.id)) continue;

          if (baseTrade.symbol === targetTrade.symbol && baseTrade.direction === targetTrade.direction) {
            const isRelated = currentCluster.some(member => {
              const openDiffSec = Math.abs(targetTrade.openTime - member.openTime) / 1000;
              const openWithin10Min = openDiffSec <= WINDOW_SECONDS;

              const closeDiffSec = Math.abs(targetTrade.closeTime - member.closeTime) / 1000;
              const closeWithin10Min = closeDiffSec <= WINDOW_SECONDS;

              const overlaps = targetTrade.openTime < member.closeTime && targetTrade.closeTime > member.openTime;

              const reopenDiffSec = (targetTrade.openTime - member.closeTime) / 1000;
              const reopenedWithin10Min = reopenDiffSec >= 0 && reopenDiffSec <= WINDOW_SECONDS;

              return openWithin10Min || closeWithin10Min || overlaps || reopenedWithin10Min;
            });

            if (isRelated) {
              currentCluster.push(targetTrade);
              visited.add(targetTrade.id);
            }
          }
        }

        const totalLoss = currentCluster.reduce((sum, t) => sum + t.netLoss, 0);
        const riskPercentage = (totalLoss / accountBalance) * 100;

        if (riskPercentage > riskLimitPct) {
          breachedClusters.push({
            cluster: currentCluster,
            totalLoss,
            riskPercentage
          });
        }
      }

      return breachedClusters;
    }

    function runTradingAnalysis(data) {
      if (!Array.isArray(data) || data.length === 0) return;
      currentLoadedTrades = data;

      const initialAccountSize = parseFloat(accountSizeInput.value) || 25000;
      const dailyDDPct = parseFloat(dailyDDPctInput.value) || 4.0;
      const maxDDPct = parseFloat(maxDDPctInput.value) || 9.0;
      const riskLimitPct = parseFloat(riskLimitPctInput.value) || 2.0;
      const maxDDFloorPrice = initialAccountSize * (1 - maxDDPct / 100);

      safeSetText('riskLimitLabel', riskLimitPct);

      let totalProfit = 0;
      let totalCommission = 0;
      let totalNet = 0;

      const dailySummary = {};
      const under2MinTrades = [];
      const multiDayTrades = [];

      const parsedTrades = data.map(t => {
        const profit = parseFloat(t.profit) || 0;
        const commission = parseFloat(t.commission) || 0;
        const netPnL = profit + commission;

        const openDay = t.open_time ? t.open_time.split(" ")[0] : "Unknown";
        const closeDay = t.close_time ? t.close_time.split(" ")[0] : "Unknown";
        const isMultiDay = openDay !== "Unknown" && closeDay !== "Unknown" && openDay !== closeDay;

        let holdSec = parseFloat(t.hold_seconds);
        if (isNaN(holdSec) && t.open_time && t.close_time) {
          const o = new Date(t.open_time.replace(" ", "T"));
          const c = new Date(t.close_time.replace(" ", "T"));
          holdSec = (c - o) / 1000;
        }

        return {
          id: t.trade_id || "-",
          symbol: t.symbol ? t.symbol.toUpperCase() : "UNKNOWN",
          direction: t.direction ? t.direction.toUpperCase() : "UNKNOWN",
          volume: t.volume_lots || "-",
          profit,
          commission,
          netPnL,
          openTimeStr: t.open_time || "-",
          closeTimeStr: t.close_time || "-",
          openDay,
          closeDay,
          holdSeconds: holdSec,
          isMultiDay
        };
      })
      .filter(t => t.closeDay !== "Unknown")
      .sort((a, b) => (a.closeTimeStr > b.closeTimeStr ? 1 : -1));

      parsedTrades.forEach(t => {
        totalProfit += t.profit;
        totalCommission += t.commission;
        totalNet += t.netPnL;

        const date = t.closeDay;
        if (!dailySummary[date]) {
          dailySummary[date] = {
            netPnL: 0,
            grossProfit: 0,
            commission: 0,
            tradesCount: 0,
            closedMultiDayTrades: []
          };
        }

        dailySummary[date].netPnL += t.netPnL;
        dailySummary[date].grossProfit += t.profit;
        dailySummary[date].commission += t.commission;
        dailySummary[date].tradesCount += 1;

        if (t.isMultiDay) {
          dailySummary[date].closedMultiDayTrades.push(t);
          multiDayTrades.push(t);
        }

        if (!isNaN(t.holdSeconds) && t.holdSeconds <= 120) {
          under2MinTrades.push(t);
        }
      });

      const sortedCloseDates = Object.keys(dailySummary).sort();
      let currentBalance = initialAccountSize;
      const breaches = [];
      let highestDayProfit = 0;
      let bestTradingDay = "N/A";

      const dailyFlowRows = sortedCloseDates.map(date => {
        const dayData = dailySummary[date];
        const startOfDayBalance = currentBalance;
        const dailyPnL = dayData.netPnL;

        if (dailyPnL > highestDayProfit) {
          highestDayProfit = dailyPnL;
          bestTradingDay = date;
        }

        const maxDailyAllowedLoss = startOfDayBalance * (dailyDDPct / 100);
        const dailyLossLimitThreshold = startOfDayBalance - maxDailyAllowedLoss;
        const endOfDayBalance = startOfDayBalance + dailyPnL;
        currentBalance = endOfDayBalance;

        let breachedDaily = false;
        let breachedMax = false;

        if (dailyPnL < 0 && Math.abs(dailyPnL) > maxDailyAllowedLoss) {
          breachedDaily = true;
          breaches.push(\`\${date}: Daily loss -\$\${Math.abs(dailyPnL).toFixed(2)} exceeded allowed limit -\$\${maxDailyAllowedLoss.toFixed(2)} (\${dailyDDPct}%)\`);
        }

        if (endOfDayBalance < maxDDFloorPrice) {
          breachedMax = true;
          breaches.push(\`\${date}: Ending balance \$\${endOfDayBalance.toFixed(2)} fell below Max DD floor \$\${maxDDFloorPrice.toFixed(2)}\`);
        }

        return {
          date,
          tradesCount: dayData.tradesCount,
          startOfDayBalance,
          dailyPnL,
          endOfDayBalance,
          maxDailyAllowedLoss,
          dailyLossLimitThreshold,
          breachedDaily,
          breachedMax,
          closedMultiDayTrades: dayData.closedMultiDayTrades
        };
      });

      // 2% Single Idea Risk Evaluation
      const riskBreaches = evaluateRiskPerIdea(data, initialAccountSize, riskLimitPct);
      riskBreaches.forEach((rb, idx) => {
        breaches.push(\`Risk Violation #\${idx + 1}: \${rb.cluster[0].symbol} (\${rb.cluster[0].direction}) lost -\$\${rb.totalLoss.toFixed(2)} (\${rb.riskPercentage.toFixed(2)}%) across \${rb.cluster.length} clustered trade(s)\`);
      });

      const breachBox = document.getElementById('breachAlertBox');
      const breachContainer = document.getElementById('breachItemsContainer');
      if (breaches.length > 0 && breachBox && breachContainer) {
        breachBox.style.display = 'block';
        breachContainer.innerHTML = breaches.map(b => \`<div class="breach-item">• \${b}</div>\`).join('');
      } else if (breachBox) {
        breachBox.style.display = 'none';
      }

      let consistencyScore = 0;
      if (totalNet > 0 && highestDayProfit > 0) {
        consistencyScore = (highestDayProfit / totalNet) * 100;
      }

      safeSetText('mConsistency', consistencyScore.toFixed(2) + '%');
      safeSetHTML('calcBreakdownText', \`(\$\${highestDayProfit.toFixed(2)} / \$\${totalNet.toFixed(2)}) &times; 100\`);

      const pEl = document.getElementById('mTotalProfit');
      if (pEl) {
        pEl.innerText = (totalProfit >= 0 ? '+$' : '-$') + Math.abs(totalProfit).toFixed(2);
        pEl.className = 'metric-value ' + (totalProfit >= 0 ? 'val-green' : 'val-red');
      }

      safeSetText('mTotalCommission', '$' + totalCommission.toFixed(2));

      const netEl = document.getElementById('mTotalNet');
      if (netEl) {
        netEl.innerText = (totalNet >= 0 ? '+$' : '-$') + Math.abs(totalNet).toFixed(2);
        netEl.className = 'metric-value ' + (totalNet >= 0 ? 'val-green' : 'val-red');
      }

      const returnPct = ((totalNet / initialAccountSize) * 100).toFixed(2);
      safeSetText('mAccountReturn', \`\${returnPct >= 0 ? '+' : ''}\${returnPct}% on $\${initialAccountSize.toLocaleString()}\`);

      safeSetText('mHighestDay', '$' + highestDayProfit.toFixed(2));
      safeSetText('mBestDayDate', 'Best Day: ' + bestTradingDay);
      safeSetText('mMaxDDFloor', '$' + maxDDFloorPrice.toFixed(2));

      const maxPass = currentBalance >= maxDDFloorPrice;
      safeSetHTML('mMaxDDBadge', \`<span class="badge \${maxPass ? 'badge-pass' : 'badge-fail'}">\${maxPass ? 'PASSED' : 'BREACHED'}</span>\`);
      safeSetText('mRiskBreachCount', riskBreaches.length);

      // Render Individual Cluster Breakdown Cards with Each Trade
      const riskBadge = document.getElementById('riskBreachBadge');
      if (riskBadge) {
        riskBadge.innerText = riskBreaches.length + ' Breaches';
        riskBadge.className = 'badge ' + (riskBreaches.length > 0 ? 'badge-fail' : 'badge-pass');
      }

      const clustersContainer = document.getElementById('riskClustersContainer');
      if (clustersContainer) {
        if (riskBreaches.length === 0) {
          clustersContainer.innerHTML = \`<div style="background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; padding:14px 18px; border-radius:8px; font-weight:500; text-align:center; margin-bottom:20px;">
            ✓ No single idea risk breaches detected (&le; \${riskLimitPct}%)
          </div>\`;
        } else {
          clustersContainer.innerHTML = riskBreaches.map((rb, idx) => {
            const sym = rb.cluster[0].symbol;
            const dir = rb.cluster[0].direction;

            const tradesTableRows = rb.cluster.map(t => {
              const holdTxt = formatDuration(t.holdSeconds);
              return \`<tr>
                <td><strong>#\${t.id}</strong></td>
                <td>\${t.volume} Lots</td>
                <td>\${t.openTimeStr}</td>
                <td>\${t.closeTimeStr}</td>
                <td><strong>\${holdTxt}</strong></td>
                <td style="color:#64748b;">$\${t.profit.toFixed(2)}</td>
                <td style="color:#64748b;">$\${t.commission.toFixed(2)}</td>
                <td class="val-red"><strong>-\$\${t.netLoss.toFixed(2)}</strong></td>
              </tr>\`;
            }).join('');

            return \`<div class="cluster-card">
              <div class="cluster-header">
                <span class="cluster-title">⚠️ Breach Cluster #\${idx + 1}: \${sym} (\${dir})</span>
                <div class="cluster-badges">
                  <span class="badge badge-fail">\${rb.cluster.length} Trades Clustered</span>
                  <span class="badge badge-fail">Total Loss: -\$\${rb.totalLoss.toFixed(2)}</span>
                  <span class="badge badge-fail">Risk: \${rb.riskPercentage.toFixed(2)}% of Balance</span>
                </div>
              </div>
              <div class="table-container" style="margin-bottom:0; max-height:none;">
                <table>
                  <thead>
                    <tr>
                      <th>Trade ID</th>
                      <th>Volume</th>
                      <th>Opening Time</th>
                      <th>Closing Time</th>
                      <th>Hold Duration</th>
                      <th>Profit/Loss</th>
                      <th>Commission</th>
                      <th>Net Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${tradesTableRows}
                  </tbody>
                </table>
              </div>
            </div>\`;
          }).join('');
        }
      }

      // Render Daily Balance Flow Table
      const dailyBody = document.getElementById('dailyBalanceTableBody');
      if (dailyBody) {
        let tableHTML = '';
        dailyFlowRows.forEach((row) => {
          const netColor = row.dailyPnL >= 0 ? 'val-green' : 'val-red';
          const statusBadge = (row.breachedDaily || row.breachedMax) 
            ? '<span class="badge badge-fail">FAILED</span>' 
            : '<span class="badge badge-pass">PASS</span>';
          
          tableHTML += \`<tr>
            <td><strong>\${row.date}</strong></td>
            <td>\${row.tradesCount}</td>
            <td>$\${row.startOfDayBalance.toFixed(2)}</td>
            <td class="\${netColor}"><strong>\${row.dailyPnL >= 0 ? '+' : ''}\${row.dailyPnL.toFixed(2)}</strong></td>
            <td><strong>$\${row.endOfDayBalance.toFixed(2)}</strong></td>
            <td style="color:var(--danger);">-\$\${row.maxDailyAllowedLoss.toFixed(2)}</td>
            <td>$\${row.dailyLossLimitThreshold.toFixed(2)}</td>
            <td>\${statusBadge}</td>
          </tr>\`;

          if (row.closedMultiDayTrades && row.closedMultiDayTrades.length > 0) {
            row.closedMultiDayTrades.forEach(t => {
              const pnlColor = t.netPnL >= 0 ? 'var(--success)' : 'var(--danger)';
              const durationTxt = formatDuration(t.holdSeconds);
              tableHTML += \`<tr class="overnight-highlight-row">
                <td colspan="8">
                  <div class="overnight-card">
                    <span class="overnight-tag">MULTI-DAY TRADE SPAN</span>
                    <span><strong>#\${t.id}</strong> (\${t.symbol} \${t.direction}, \${t.volume} Lots)</span>
                    <span>📅 <strong>Opened:</strong> \${t.openTimeStr}</span>
                    <span>➜ <strong>Closed:</strong> \${t.closeTimeStr}</span>
                    <span>⏱️ <strong>Duration:</strong> \${durationTxt}</span>
                    <span>💰 <strong>Net PnL:</strong> <strong style="color:\${pnlColor};">\${t.netPnL >= 0 ? '+' : ''}\$\${t.netPnL.toFixed(2)}</strong></span>
                  </div>
                </td>
              </tr>\`;
            });
          }
        });
        dailyBody.innerHTML = tableHTML;
      }

      safeSetText('under2MinCount', under2MinTrades.length + ' Trades');
      const under2MinBody = document.getElementById('under2MinTableBody');
      if (under2MinBody) {
        if (under2MinTrades.length === 0) {
          under2MinBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#64748b;">No trades found with hold time &le; 120s</td></tr>';
        } else {
          under2MinBody.innerHTML = under2MinTrades.map(t => {
            const colorClass = t.netPnL >= 0 ? 'val-green' : 'val-red';
            return \`<tr>
              <td><strong>\${t.id}</strong></td>
              <td>\${t.profit.toFixed(2)}</td>
              <td>\${t.commission.toFixed(2)}</td>
              <td class="\${colorClass}"><strong>\${t.netPnL >= 0 ? '+' : ''}\${t.netPnL.toFixed(2)}</strong></td>
              <td><strong>\${t.holdSeconds}s</strong></td>
              <td>\${t.openTimeStr}</td>
              <td>\${t.closeTimeStr}</td>
            </tr>\`;
          }).join('');
        }
      }

      if (dashboard) dashboard.style.display = 'block';
    }

    [accountSizeInput, dailyDDPctInput, maxDDPctInput, riskLimitPctInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          if (currentLoadedTrades) runTradingAnalysis(currentLoadedTrades);
        });
      }
    });

    function triggerDownload(content, filename) {
      const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 150);
    }

    function handleUploadedFile(file) {
      if (!file) return;

      const isJSON = file.name.toLowerCase().endsWith('.json');
      labelTxt.innerHTML = 'Processing: <strong>' + file.name + '</strong>';

      const numHours = parseFloat(offsetHours.value) || 0;
      const isSub = offsetAction.value === 'sub';
      const effectiveHours = isSub ? -numHours : numHours;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rawText = e.target.result;
          let trades = [];

          if (isJSON) {
            trades = JSON.parse(rawText);
            runTradingAnalysis(trades);
            statusMsg.style.color = '#16a34a';
            statusMsg.innerText = \`✓ Analyzed \${file.name} (\${trades.length} trades loaded from JSON)\`;
          } else {
            trades = parseCSVWithTimeShift(rawText, effectiveHours);
            const downloadFileName = extractNumericName(file.name);
            const jsonString = JSON.stringify(trades, null, 2);
            
            triggerDownload(jsonString, downloadFileName);
            runTradingAnalysis(trades);

            const sign = effectiveHours >= 0 ? '+' : '';
            statusMsg.style.color = '#16a34a';
            statusMsg.innerText = \`✓ Downloaded \${downloadFileName} (\${trades.length} trades, \${sign}\${effectiveHours}h shift) & Analyzed\`;
          }

          labelTxt.innerHTML = '<strong>Click to select</strong> or drag and drop another file';
        } catch (err) {
          statusMsg.style.color = '#dc2626';
          statusMsg.innerText = 'Error processing file: ' + err.message;
        }
      };
      reader.readAsText(file);
    }

    fileInput.addEventListener('change', (e) => {
      handleUploadedFile(e.target.files[0]);
      fileInput.value = '';
    });

    dropZone.addEventListener('dragover', (e) => { 
      e.preventDefault(); 
      dropZone.style.borderColor = '#2563eb'; 
    });
    dropZone.addEventListener('dragleave', () => { 
      dropZone.style.borderColor = '#94a3b8'; 
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#94a3b8';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleUploadedFile(e.dataTransfer.files[0]);
      }
    });
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  });
  res.end(htmlContent);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});