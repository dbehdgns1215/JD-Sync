const DEFAULT_SETTINGS = {
  autoSync: true,
  preventDuplicates: true,
  notionParentType: "data_source_id",
  notionParentId: "",
  notionVersion: "2025-09-03",
  titleProperty: "공고명",
  dateProperty: "일정",
  deadlineDateProperty: "마감일",
  companyProperty: "회사명",
  recruitTitleProperty: "",
  urlProperty: "공고 URL",
  applyUrlProperty: "지원 URL",
  startDateProperty: "시작일",
  sourceIdProperty: "공고 ID",
  dutiesProperty: "직무",
  includeStartDateInCalendar: false,
  startDateCalendarMode: "range"
};

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);
let toastTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  await loadGuideState();
});

function bindEvents() {
  document.getElementById("settingsForm").addEventListener("submit", saveSettings);
  document.getElementById("resetButton").addEventListener("click", resetDefaults);
  document.getElementById("includeStartDateInCalendar").addEventListener("change", updateStartDateModeVisibility);
  document.getElementById("clearLogsButton").addEventListener("click", clearLogs);
  document.getElementById("termsConsentCheck").addEventListener("change", updateConsentButton);
  document.getElementById("termsAcceptButton").addEventListener("click", acceptTerms);
}

async function loadGuideState() {
  const state = await sendRuntimeMessage({ type: "GET_GUIDE_STATE" });
  if (!state || !state.ok) {
    setStatus((state && state.error) || "설정 상태를 불러오지 못했어요.", true);
    return;
  }

  renderSettings(state.settings || DEFAULT_SETTINGS);
  renderLogs(state.logs || []);
  renderConsent(state.consent);
}

function renderSettings(settings) {
  for (const key of SETTING_KEYS) {
    const element = document.getElementById(key);
    if (!element) continue;

    if (key === "startDateCalendarMode") {
      const selected = document.querySelector(`input[name="startDateCalendarMode"][value="${settings[key] || DEFAULT_SETTINGS.startDateCalendarMode}"]`);
      if (selected) selected.checked = true;
    } else if (element.type === "checkbox") {
      element.checked = Boolean(settings[key]);
    } else {
      element.value = settings[key] || DEFAULT_SETTINGS[key] || "";
    }
  }

  document.getElementById("notionToken").value = settings.notionToken || "";
  updateStartDateModeVisibility();
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

async function clearLogs() {
  const result = await sendRuntimeMessage({ type: "CLEAR_SYNC_LOGS" });
  if (!result || !result.ok) {
    setStatus((result && result.error) || "기록 삭제에 실패했어요.", true);
    return;
  }

  setStatus("동기화 기록을 지웠어요.");
  await loadGuideState();
}

function renderConsent(consent) {
  const overlay = document.getElementById("termsConsentOverlay");
  const checkbox = document.getElementById("termsConsentCheck");
  const button = document.getElementById("termsAcceptButton");
  if (!overlay || !checkbox || !button) return;

  if (consent && consent.accepted) {
    overlay.hidden = true;
    return;
  }

  checkbox.checked = false;
  button.disabled = true;
  overlay.hidden = false;
  window.setTimeout(() => {
    const content = document.getElementById("termsConsentContent");
    if (content) content.focus();
  }, 0);
}

function updateConsentButton() {
  const checkbox = document.getElementById("termsConsentCheck");
  const button = document.getElementById("termsAcceptButton");
  if (!checkbox || !button) return;
  button.disabled = !checkbox.checked;
}

async function acceptTerms() {
  const checkbox = document.getElementById("termsConsentCheck");
  if (!checkbox || !checkbox.checked) return;

  const result = await sendRuntimeMessage({ type: "ACCEPT_TERMS" });
  if (!result || !result.ok || !result.consent || !result.consent.accepted) {
    setStatus((result && result.error) || "동의 기록을 저장하지 못했어요.", true);
    return;
  }

  document.getElementById("termsConsentOverlay").hidden = true;
  setStatus("이용 조건 동의를 저장했어요.");
}

function collectSettings() {
  const settings = { ...DEFAULT_SETTINGS };

  for (const key of SETTING_KEYS) {
    const element = document.getElementById(key);
    if (!element) continue;
    if (key === "startDateCalendarMode") {
      const checked = document.querySelector('input[name="startDateCalendarMode"]:checked');
      settings[key] = checked ? checked.value : DEFAULT_SETTINGS.startDateCalendarMode;
    } else {
      settings[key] = element.type === "checkbox" ? element.checked : element.value.trim();
    }
  }

  settings.notionToken = document.getElementById("notionToken").value.trim();

  settings.notionParentType = DEFAULT_SETTINGS.notionParentType;
  settings.notionVersion = DEFAULT_SETTINGS.notionVersion;
  settings.preventDuplicates = DEFAULT_SETTINGS.preventDuplicates;

  return settings;
}

function updateStartDateModeVisibility() {
  const checkbox = document.getElementById("includeStartDateInCalendar");
  const modeGroup = document.getElementById("startDateCalendarMode");
  if (!checkbox || !modeGroup) return;
  modeGroup.hidden = !checkbox.checked;
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
  const toast = document.getElementById("settingsToast");
  if (!toast) return;

  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast show${isError ? " error" : ""}`;

  toastTimer = window.setTimeout(() => {
    toast.className = "toast";
  }, isError ? 4200 : 2600);
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
