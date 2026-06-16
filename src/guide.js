const DEFAULT_SETTINGS = {
  autoSync: true,
  preventDuplicates: true,
  enableNotifications: true,
  notionParentType: "data_source_id",
  notionParentId: "",
  notionVersion: "2025-09-03",
  titleProperty: "이름",
  dateProperty: "일정일",
  deadlineDateProperty: "마감일",
  companyProperty: "",
  recruitTitleProperty: "",
  urlProperty: "",
  applyUrlProperty: "",
  startDateProperty: "시작일",
  sourceIdProperty: "",
  dutiesProperty: "",
  syncStartDateToCalendar: false
};

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);
let currentState = null;

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  await loadGuideState();
});

function bindEvents() {
  document.getElementById("settingsForm").addEventListener("submit", saveSettings);
  document.getElementById("resetButton").addEventListener("click", resetDefaults);
  document.getElementById("notionParentType").addEventListener("change", handleParentTypeChange);
  document.getElementById("syncSourceButton").addEventListener("click", syncSourceTab);
  document.getElementById("clearLogsButton").addEventListener("click", clearLogs);
}

async function loadGuideState() {
  const state = await sendRuntimeMessage({ type: "GET_GUIDE_STATE" });
  if (!state || !state.ok) {
    setStatus((state && state.error) || "가이드 상태를 불러오지 못했어요.", true);
    return;
  }

  currentState = state;
  renderSettings(state.settings || DEFAULT_SETTINGS);
  renderChecklist(state.settings || DEFAULT_SETTINGS);
  renderSourceTab(state.lastSourceTab);
  renderLogs(state.logs || []);
}

function renderSettings(settings) {
  for (const key of SETTING_KEYS) {
    const element = document.getElementById(key);
    if (!element) continue;

    if (element.type === "checkbox") {
      element.checked = Boolean(settings[key]);
    } else {
      element.value = settings[key] || "";
    }
  }

  document.getElementById("notionToken").value = settings.notionToken || "";
}

function renderChecklist(settings) {
  const checklist = document.getElementById("setupChecklist");
  checklist.textContent = "";

  const items = [
    ["Notion 토큰", Boolean(settings.notionToken)],
    ["Notion DB ID", Boolean(settings.notionParentId)],
    ["제목 칸 이름", Boolean(settings.titleProperty)],
    ["캘린더 표시일 칸 이름", Boolean(settings.dateProperty)],
    ["마감일 칸 이름", Boolean(settings.deadlineDateProperty)],
    ["시작일 칸 이름", Boolean(settings.startDateProperty)],
    ["자동 동기화", Boolean(settings.autoSync)]
  ];

  for (const [label, ready] of items) {
    const item = document.createElement("li");
    item.className = ready ? "ready" : "";
    item.textContent = ready ? `${label} 완료` : `${label} 필요`;
    checklist.appendChild(item);
  }
}

function renderSourceTab(tab) {
  const label = document.getElementById("sourceTabLabel");
  const button = document.getElementById("syncSourceButton");

  if (!tab || !tab.url) {
    label.textContent = "직전에 선택한 자소설 공고 탭이 아직 없습니다.";
    button.disabled = true;
    return;
  }

  const isRecruitDetail = /^https:\/\/(www\.)?jasoseol\.com\/recruit\/\d+/.test(tab.url);
  label.textContent = isRecruitDetail ? `대상 탭: ${tab.url}` : `직전 탭은 자소설 공고 상세 페이지가 아닙니다: ${tab.url}`;
  button.disabled = !isRecruitDetail;
}

function renderLogs(logs) {
  const list = document.getElementById("logList");
  list.textContent = "";

  if (!logs.length) {
    const empty = document.createElement("li");
    empty.textContent = "아직 동기화 기록이 없습니다.";
    list.appendChild(empty);
    return;
  }

  for (const log of logs.slice(0, 10)) {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = `${labelForLevel(log.level)} · ${formatTime(log.at)}`;
    const body = document.createElement("span");
    body.textContent = log.message || "";
    item.append(title, body);
    list.appendChild(item);
  }
}

async function saveSettings(event) {
  event.preventDefault();
  const settings = collectSettings();
  const result = await sendRuntimeMessage({ type: "SAVE_SETTINGS", settings });

  if (!result || !result.ok) {
    setStatus((result && result.error) || "설정 저장에 실패했어요.", true);
    return;
  }

  setStatus("설정을 저장했어요.");
  await loadGuideState();
}

async function resetDefaults() {
  const result = await sendRuntimeMessage({ type: "RESET_SETTINGS", preserveToken: true });
  if (!result || !result.ok) {
    setStatus((result && result.error) || "기본값 복원에 실패했어요.", true);
    return;
  }

  setStatus("기본값으로 복원했어요. 토큰과 Notion Data Source ID는 유지됩니다.");
  await loadGuideState();
}

async function syncSourceTab() {
  setStatus("직전 자소설 탭을 동기화하는 중...");
  const result = await sendRuntimeMessage({ type: "SYNC_LAST_SOURCE_TAB" });

  if (!result || !result.ok) {
    setStatus((result && result.error) || "수동 동기화에 실패했어요.", true);
    await loadGuideState();
    return;
  }

  setStatus(result.skipped ? result.message || "이미 동기화된 공고예요." : "수동 동기화가 완료됐어요.");
  await loadGuideState();
}

async function clearLogs() {
  const result = await sendRuntimeMessage({ type: "CLEAR_SYNC_LOGS" });
  if (!result || !result.ok) {
    setStatus((result && result.error) || "기록 삭제에 실패했어요.", true);
    return;
  }

  setStatus("동기화 기록을 지웠어요.");
  await loadGuideState();
}

function collectSettings() {
  const settings = {};

  for (const key of SETTING_KEYS) {
    const element = document.getElementById(key);
    if (!element) continue;
    settings[key] = element.type === "checkbox" ? element.checked : element.value.trim();
  }

  settings.notionToken = document.getElementById("notionToken").value.trim();

  if (!settings.notionVersion) {
    settings.notionVersion = defaultVersionForParent(settings.notionParentType);
  }

  return settings;
}

function handleParentTypeChange(event) {
  document.getElementById("notionVersion").value = defaultVersionForParent(event.target.value);
}

function defaultVersionForParent(parentType) {
  return parentType === "data_source_id" ? "2025-09-03" : "2022-06-28";
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

function setStatus(message, isError) {
  const status = document.getElementById("settingsStatus");
  status.textContent = message;
  status.className = isError ? "status-message error" : "status-message";
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
