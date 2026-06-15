document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("guideButton").addEventListener("click", openGuide);
  document.getElementById("syncCurrentButton").addEventListener("click", syncCurrentRecruit);

  const activeTab = await getActiveTab();
  await rememberSourceTab(activeTab);
  await renderPopup(activeTab);
});

async function renderPopup(activeTab) {
  const state = await sendRuntimeMessage({ type: "GET_POPUP_STATE" });

  if (!state || !state.ok) {
    setMessage((state && state.error) || "설정 상태를 확인하지 못했어요.", true);
    return;
  }

  if (!state.configured) {
    await openGuide();
    window.close();
    return;
  }

  const isRecruitDetail = activeTab && /^https:\/\/(www\.)?jasoseol\.com\/recruit\/\d+/.test(activeTab.url || "");
  const status = document.getElementById("configStatus");
  const syncButton = document.getElementById("syncCurrentButton");
  const summary = document.getElementById("summary");

  status.textContent = state.hasParentId ? "설정 완료" : "DB ID 필요";
  status.className = state.hasParentId ? "ready" : "missing";
  summary.textContent = state.hasParentId
    ? "토큰이 저장되어 있어요. 가이드는 버튼을 눌렀을 때만 열립니다."
    : "토큰은 있지만 Notion Parent ID가 비어 있어요. 가이드에서 DB ID를 입력해 주세요.";
  syncButton.disabled = !isRecruitDetail || !state.hasParentId;

  renderLogs(state.logs || []);
}

async function syncCurrentRecruit() {
  setMessage("현재 공고를 동기화하는 중...");
  const activeTab = await getActiveTab();

  if (!activeTab || !activeTab.id) {
    setMessage("현재 탭을 찾지 못했어요.", true);
    return;
  }

  chrome.tabs.sendMessage(activeTab.id, { type: "SYNC_CURRENT_RECRUIT" }, async (response) => {
    const error = chrome.runtime.lastError;
    if (error) {
      setMessage("자소설 공고 상세 페이지에서만 수동 동기화할 수 있어요.", true);
      return;
    }

    if (!response || !response.ok) {
      setMessage((response && response.error) || "동기화에 실패했어요.", true);
      return;
    }

    setMessage(response.skipped ? response.message || "이미 동기화된 공고예요." : "동기화 완료!");
    await renderPopup(activeTab);
  });
}

async function openGuide() {
  const activeTab = await getActiveTab();
  await rememberSourceTab(activeTab);
  await sendRuntimeMessage({ type: "OPEN_GUIDE" });
}

async function rememberSourceTab(tab) {
  if (!tab || typeof tab.id !== "number") return;
  await sendRuntimeMessage({
    type: "REMEMBER_SOURCE_TAB",
    tab: {
      id: tab.id,
      url: tab.url || "",
      title: tab.title || ""
    }
  });
}

function renderLogs(logs) {
  const list = document.getElementById("logList");
  list.textContent = "";

  if (!logs.length) {
    const empty = document.createElement("li");
    empty.textContent = "아직 동기화 기록이 없어요.";
    list.appendChild(empty);
    return;
  }

  for (const log of logs.slice(0, 4)) {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = `${labelForLevel(log.level)} · ${formatTime(log.at)}`;
    const body = document.createElement("span");
    body.textContent = log.message || "";
    item.append(title, body);
    list.appendChild(item);
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(response);
    });
  });
}

function setMessage(message, isError) {
  const node = document.getElementById("message");
  node.textContent = message;
  node.className = isError ? "error" : "";
}

function labelForLevel(level) {
  if (level === "success") return "성공";
  if (level === "error") return "오류";
  return "정보";
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
