// Minimal frontend for balances
// Initial load only. If 404 -> waiting message.

const balancesDiv = document.getElementById('balances');
const tsDiv = document.getElementById('timestamp');

// Safely escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Format numbers for display
function formatNumber(num) {
  if (typeof num !== 'number' || !Number.isFinite(num)) return '—';
  return num.toLocaleString();
}

// Format timestamp for display
function formatTimestamp(timestamp) {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'invalid date';
    return date.toLocaleString();
  } catch {
    return 'invalid date';
  }
}

async function load() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const res = await fetch('/api/balances', { 
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (res.status === 404) {
      balancesDiv.innerHTML = `
        <div class="balance-row">
          <span class="resource">DIEM</span>
          <span class="amount">—</span>
        </div>
        <div class="balance-row">
          <span class="resource">VCU</span>
          <span class="amount">—</span>
        </div>
      `;
      balancesDiv.classList.remove('loading');
      tsDiv.textContent = 'waiting for first update';
      return;
    }
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
    // Validate response structure
    if (!data.balances || typeof data.balances !== 'object') {
      throw new Error('Invalid response format');
    }
    
    const diemValue = formatNumber(data.balances.DIEM);
    const vcuValue = formatNumber(data.balances.VCU);
    
    balancesDiv.innerHTML = `
      <div class="balance-row">
        <span class="resource">DIEM</span>
        <span class="amount">${escapeHtml(diemValue)}</span>
      </div>
      <div class="balance-row">
        <span class="resource">VCU</span>
        <span class="amount">${escapeHtml(vcuValue)}</span>
      </div>
    `;
    balancesDiv.classList.remove('loading');
    
    const timestampText = data.timestamp ? 
      `last updated: ${formatTimestamp(data.timestamp)}` : 
      'no timestamp available';
    tsDiv.textContent = timestampText;
    
  } catch (e) {
    console.error('Load error:', e);
    balancesDiv.classList.remove('loading');
    balancesDiv.classList.add('error');
    
    let errorMessage = 'connection error';
    if (e.name === 'AbortError') {
      errorMessage = 'request timeout';
    } else if (e.message) {
      errorMessage = e.message.toLowerCase().includes('fetch') ? 'network error' : 'data error';
    }
    
    balancesDiv.innerHTML = `<div style="text-align: center; color: var(--warn);">${escapeHtml(errorMessage)}</div>`;
    tsDiv.textContent = 'error occurred';
  }
}

// Initial load only - no polling
load();
