document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("settingsButton").addEventListener("click", openSettings);

  try {
    await renderPopup();
  } catch (error) {
    setMessage(`설정 상태를 확인하지 못했어요. ${error.message || error}`, true);
  }
});

async function renderPopup() {
  const state = await sendRuntimeMessage({ type: "GET_POPUP_STATE" });

  if (!state || !state.ok) {
    setMessage((state && state.error) || "설정 상태를 확인하지 못했어요.", true);
    return;
  }

  const status = document.getElementById("configStatus");
  const ready = Boolean(state.configured && state.hasParentId);

  status.className = `status-dot ${ready ? "status-dot-ready" : "status-dot-missing"}`;
  status.setAttribute("aria-label", ready ? "정상 동작 중" : "설정 필요");
  status.title = ready ? "정상 동작 중" : "설정 필요";

  renderLogs(state.logs || []);
}

async function openSettings() {
  try {
    await sendRuntimeMessage({ type: "OPEN_GUIDE" });
  } catch (error) {
    setMessage(`설정 페이지를 열지 못했어요. ${error.message || error}`, true);
  }
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
