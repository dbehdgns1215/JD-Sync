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

const LEGACY_SETTINGS = {
  enableNotifications: false,
  includeStartDateInScheduleRange: false,
  syncStartDateToCalendar: false
};

const GUIDE_PATH = "src/guide.html";
const LAST_SOURCE_TAB_KEY = "lastSourceTab";
const NOTION_RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);
const NOTION_MAX_ATTEMPTS = 3;
let syncedRecruitStorageQueue = Promise.resolve();

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    openGuidePage();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.type) return false;

  if (message.type === "SYNC_RECRUIT") {
    syncRecruit(message.recruit, message.trigger)
      .then((result) => sendResponse(result))
      .catch(async (error) => {
        const result = { ok: false, error: toErrorMessage(error) };
        await appendLog({ level: "error", message: result.error, recruit: message.recruit, at: new Date().toISOString() });
        sendResponse(result);
      });
    return true;
  }

  if (message.type === "UNSYNC_RECRUIT") {
    unsyncRecruit(message.recruit)
      .then((result) => sendResponse(result))
      .catch(async (error) => {
        const result = { ok: false, error: toErrorMessage(error) };
        await appendLog({ level: "error", message: result.error, recruit: message.recruit, at: new Date().toISOString() });
        sendResponse(result);
      });
    return true;
  }

  if (message.type === "GET_GUIDE_STATE") {
    getGuideState()
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ ok: false, error: toErrorMessage(error) }));
    return true;
  }

  if (message.type === "GET_POPUP_STATE") {
    getPopupState()
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ ok: false, error: toErrorMessage(error) }));
    return true;
  }

  if (message.type === "OPEN_GUIDE") {
    openGuidePage()
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: toErrorMessage(error) }));
    return true;
  }

  if (message.type === "REMEMBER_SOURCE_TAB") {
    rememberSourceTab(message.tab)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: toErrorMessage(error) }));
    return true;
  }

  if (message.type === "SAVE_SETTINGS") {
    saveSettings(message.settings || {})
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: toErrorMessage(error) }));
    return true;
  }

  if (message.type === "RESET_SETTINGS") {
    resetSettings(Boolean(message.preserveToken))
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: toErrorMessage(error) }));
    return true;
  }

  if (message.type === "SYNC_LAST_SOURCE_TAB") {
    syncLastSourceTab()
      .then((result) => sendResponse(result))
      .catch(async (error) => {
        const result = { ok: false, error: toErrorMessage(error) };
        await appendLog({ level: "error", message: result.error, at: new Date().toISOString() });
        sendResponse(result);
      });
    return true;
  }

  if (message.type === "CLEAR_SYNC_LOGS") {
    chrome.storage.local
      .set({ syncLogs: [] })
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: toErrorMessage(error) }));
    return true;
  }

  return false;
});

async function openGuidePage() {
  await chrome.tabs.create({ url: chrome.runtime.getURL(GUIDE_PATH) });
}

async function rememberSourceTab(tab) {
  if (!tab || typeof tab.id !== "number") return;

  await chrome.storage.local.set({
    [LAST_SOURCE_TAB_KEY]: {
      id: tab.id,
      url: tab.url || "",
      title: tab.title || "",
      capturedAt: new Date().toISOString()
    }
  });
}

async function getPopupState() {
  const settings = await getSettings();
  const local = await chrome.storage.local.get({ syncLogs: [] });

  return {
    ok: true,
    configured: Boolean(settings.notionToken),
    hasParentId: Boolean(settings.notionParentId),
    autoSync: Boolean(settings.autoSync),
    logs: local.syncLogs || []
  };
}

async function getGuideState() {
  const settings = await getSettings();
  const local = await chrome.storage.local.get({
    syncLogs: [],
    [LAST_SOURCE_TAB_KEY]: null
  });

  return {
    ok: true,
    settings,
    logs: local.syncLogs || [],
    lastSourceTab: local[LAST_SOURCE_TAB_KEY] || null
  };
}

async function saveSettings(incomingSettings) {
  const nextSettings = {};

  for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
    if (typeof defaultValue === "boolean") {
      nextSettings[key] = Boolean(incomingSettings[key]);
    } else {
      nextSettings[key] = String(incomingSettings[key] ?? defaultValue).trim();
    }
  }

  if (!nextSettings.notionVersion) {
    nextSettings.notionVersion = defaultNotionVersion(nextSettings.notionParentType);
  }

  await chrome.storage.sync.set(nextSettings);
  await chrome.storage.sync.remove(Object.keys(LEGACY_SETTINGS));
  if (Object.prototype.hasOwnProperty.call(incomingSettings, "notionToken")) {
    await chrome.storage.local.set({ notionToken: String(incomingSettings.notionToken || "").trim() });
  }
}

async function resetSettings(preserveToken) {
  const currentSettings = await getSettings();
  const nextSettings = { ...DEFAULT_SETTINGS };

  if (preserveToken) {
    nextSettings.notionParentId = currentSettings.notionParentId || "";
    nextSettings.notionParentType = currentSettings.notionParentType || DEFAULT_SETTINGS.notionParentType;
    nextSettings.notionVersion = currentSettings.notionVersion || defaultNotionVersion(nextSettings.notionParentType);
  }

  await chrome.storage.sync.set(nextSettings);
  await chrome.storage.sync.remove(Object.keys(LEGACY_SETTINGS));
  if (!preserveToken) {
    await chrome.storage.local.set({ notionToken: "" });
  }
}

async function syncLastSourceTab() {
  const local = await chrome.storage.local.get({ [LAST_SOURCE_TAB_KEY]: null });
  const sourceTab = local[LAST_SOURCE_TAB_KEY];

  if (!sourceTab || typeof sourceTab.id !== "number") {
    throw new Error("동기화할 자소설 탭 기록이 없어요. 자소설 공고 상세 페이지에서 확장 아이콘을 눌러 주세요.");
  }

  if (!/^https:\/\/(www\.)?jasoseol\.com\/recruit\/\d+/.test(sourceTab.url || "")) {
    throw new Error("직전에 선택한 탭이 자소설 공고 상세 페이지가 아니에요.");
  }

  return await sendTabMessage(sourceTab.id, { type: "SYNC_CURRENT_RECRUIT" });
}

function sendTabMessage(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(response);
    });
  });
}

async function syncRecruit(recruit, trigger) {
  const settings = await getSettings();

  if (trigger === "favorite" && !settings.autoSync) {
    return { ok: true, skipped: true, message: "자동 동기화가 꺼져 있어요." };
  }

  validateSettings(settings);
  validateRecruit(recruit);

  const syncedRecruitIds = await getSyncedRecruitIds();
  const syncKey = buildSyncKey(recruit, settings);
  const shouldSyncSeparateStartDate = shouldCreateSeparateStartDatePage(recruit, settings);
  const existingSync = settings.preventDuplicates
    ? await refreshExistingSyncRecord(syncedRecruitIds[syncKey] || null, syncedRecruitIds, syncKey, settings, shouldSyncSeparateStartDate)
    : syncedRecruitIds[syncKey] || null;
  const alreadySynced = Boolean(existingSync && (existingSync.deadlinePageId || existingSync.pageId || existingSync.startPageId));

  if (settings.preventDuplicates && alreadySynced) {
    const message = "이미 Notion에 동기화된 공고예요.";
    await appendLog({ level: "info", message, recruit, at: new Date().toISOString() });
    return { ok: true, skipped: true, message };
  }

  const deadlinePage = await createNotionPage(buildNotionPayload(recruit, settings, "deadline"), settings);
  const startPage = shouldSyncSeparateStartDate
    ? await createNotionPage(buildNotionPayload(recruit, settings, "start"), settings)
    : null;

  const nextSyncRecord = {
    ...(existingSync || {}),
    syncKey,
    source: recruit.source || "jasoseol",
    recruitId: String(recruit.id),
    notionParentType: settings.notionParentType || DEFAULT_SETTINGS.notionParentType,
    notionParentId: normalizeNotionId(settings.notionParentId),
    pageId: deadlinePage.id,
    deadlinePageId: deadlinePage.id,
    startPageId: startPage ? startPage.id : "",
    syncedAt: new Date().toISOString(),
    title: recruit.displayTitle || recruit.title,
    startTime: recruit.startTime || "",
    endTime: recruit.endTime || "",
    calendarDateProperty: settings.dateProperty,
    includeStartDateInCalendar: Boolean(settings.includeStartDateInCalendar),
    startDateCalendarMode: settings.startDateCalendarMode
  };
  const savedSyncRecord = await upsertSyncedRecruitRecord(syncKey, nextSyncRecord);

  const successMessage = `${recruit.displayTitle || recruit.title} ${startPage ? "시작일 포함 Notion 일정 동기화를 완료했어요." : "Notion 일정 동기화를 완료했어요."}`;
  await appendLog({
    level: "success",
    message: successMessage,
    recruit,
    notionPageId: savedSyncRecord.deadlinePageId,
    startNotionPageId: startPage ? startPage.id : savedSyncRecord.startPageId,
    at: new Date().toISOString()
  });

  return {
    ok: true,
    message: successMessage,
    pageId: savedSyncRecord.deadlinePageId,
    startPageId: savedSyncRecord.startPageId || null
  };
}

async function unsyncRecruit(recruit) {
  const settings = await getSettings();
  const syncedRecruitIds = await getSyncedRecruitIds();
  const { key, record } = findSyncedRecruitRecord(syncedRecruitIds, recruit, settings);

  if (!record) {
    return { ok: true, skipped: true, silent: true };
  }

  if (!settings.notionToken) throw new Error("Notion API 토큰이 설정되지 않았어요.");

  const pageIds = uniqueValues([
    record.deadlinePageId || record.pageId,
    record.startPageId
  ]);

  if (!pageIds.length) {
    await deleteSyncedRecruitRecord(key);
    return { ok: true, skipped: true, silent: true };
  }

  const results = [];
  let trashError = null;
  try {
    for (const pageId of pageIds) {
      results.push(await trashNotionPage(pageId, settings));
    }
  } catch (error) {
    trashError = error;
  }

  // 즐겨찾기 해제 이후에는 Notion 처리 결과와 무관하게 중복 잠금을 풀어야
  // 같은 공고를 다시 즐겨찾기했을 때 재등록할 수 있습니다.
  await deleteSyncedRecruitRecord(key);

  if (trashError) {
    throw new Error(`${toErrorMessage(trashError)} 로컬 동기화 기록은 해제했어요.`);
  }

  const removedCount = results.filter(Boolean).length;
  if (!removedCount) {
    return { ok: true, skipped: true, silent: true };
  }

  const message = `${record.title || "공고"} Notion 일정 동기화를 해제했어요.`;
  await appendLog({
    level: "success",
    message,
    recruit: {
      id: recruit.id,
      source: recruit.source || record.source || "jasoseol",
      displayTitle: record.title || ""
    },
    notionPageId: record.deadlinePageId || record.pageId || "",
    startNotionPageId: record.startPageId || "",
    at: new Date().toISOString()
  });

  return { ok: true, removed: true, message };
}

async function refreshExistingSyncRecord(record, syncedRecruitIds, syncKey, settings, shouldSyncSeparateStartDate) {
  if (!record) return null;

  const nextRecord = { ...record };
  let changed = false;

  const deadlinePageId = nextRecord.deadlinePageId || nextRecord.pageId || "";
  if (deadlinePageId && !(await isNotionPageActive(deadlinePageId, settings))) {
    delete nextRecord.pageId;
    delete nextRecord.deadlinePageId;
    changed = true;
  }

  if (shouldSyncSeparateStartDate && nextRecord.startPageId && !(await isNotionPageActive(nextRecord.startPageId, settings))) {
    delete nextRecord.startPageId;
    changed = true;
  }

  const hasDeadlinePage = Boolean(nextRecord.deadlinePageId || nextRecord.pageId);
  const hasStartPage = Boolean(nextRecord.startPageId);

  if (!hasDeadlinePage && !hasStartPage) {
    await deleteSyncedRecruitRecord(syncKey);
    return null;
  }

  if (changed) {
    await upsertSyncedRecruitRecord(syncKey, nextRecord);
  }

  return nextRecord;
}

async function getSettings() {
  const syncSettings = await chrome.storage.sync.get({ ...DEFAULT_SETTINGS, ...LEGACY_SETTINGS });
  const localSettings = await chrome.storage.local.get({ notionToken: "" });
  const settings = { ...DEFAULT_SETTINGS, ...syncSettings, notionToken: localSettings.notionToken || "" };
  if (settings.dateProperty === "마감일") settings.dateProperty = DEFAULT_SETTINGS.dateProperty;
  if (!settings.deadlineDateProperty) settings.deadlineDateProperty = DEFAULT_SETTINGS.deadlineDateProperty;
  if (!settings.startDateProperty) settings.startDateProperty = DEFAULT_SETTINGS.startDateProperty;
  if (settings.includeStartDateInScheduleRange) {
    settings.includeStartDateInCalendar = true;
    settings.startDateCalendarMode = "range";
  }
  if (settings.syncStartDateToCalendar) {
    settings.includeStartDateInCalendar = true;
    settings.startDateCalendarMode = "separate";
  }
  if (!["range", "separate"].includes(settings.startDateCalendarMode)) {
    settings.startDateCalendarMode = DEFAULT_SETTINGS.startDateCalendarMode;
  }
  return settings;
}

async function getSyncedRecruitIds() {
  const local = await chrome.storage.local.get({ syncedRecruitIds: {} });
  return local.syncedRecruitIds || {};
}

async function upsertSyncedRecruitRecord(syncKey, record) {
  return await updateSyncedRecruitIds((latestSyncedRecruitIds) => {
    latestSyncedRecruitIds[syncKey] = record;
    return latestSyncedRecruitIds[syncKey];
  });
}

async function deleteSyncedRecruitRecord(syncKey) {
  await updateSyncedRecruitIds((latestSyncedRecruitIds) => {
    delete latestSyncedRecruitIds[syncKey];
    return null;
  });
}

async function updateSyncedRecruitIds(mutator) {
  const operation = syncedRecruitStorageQueue.then(async () => {
    const latestSyncedRecruitIds = await getSyncedRecruitIds();
    const result = mutator(latestSyncedRecruitIds);
    await chrome.storage.local.set({ syncedRecruitIds: latestSyncedRecruitIds });
    return result;
  });

  syncedRecruitStorageQueue = operation.catch(() => {});
  return await operation;
}

function buildSyncKey(recruit, settings) {
  return [
    recruit.source || "jasoseol",
    recruit.id,
    settings.notionParentType || DEFAULT_SETTINGS.notionParentType,
    normalizeNotionId(settings.notionParentId)
  ].map(normalizeSyncKeyPart).join(":");
}

function normalizeSyncKeyPart(value) {
  return encodeURIComponent(String(value || "").trim().toLowerCase());
}

function findSyncedRecruitRecord(syncedRecruitIds, recruit, settings) {
  const syncKey = buildSyncKey(recruit, settings);
  if (syncedRecruitIds[syncKey]) {
    return { key: syncKey, record: syncedRecruitIds[syncKey] };
  }

  const legacyKey = String(recruit.id || "").trim();
  if (legacyKey && syncedRecruitIds[legacyKey]) {
    return { key: legacyKey, record: syncedRecruitIds[legacyKey] };
  }

  return { key: syncKey, record: null };
}

function validateSettings(settings) {
  if (!settings.notionToken) throw new Error("Notion API 토큰이 설정되지 않았어요.");
  if (!settings.notionParentId) throw new Error("Notion 데이터베이스 ID가 설정되지 않았어요.");
  if (!settings.titleProperty) throw new Error("Notion DB의 제목 칸 이름이 필요해요.");
  if (!settings.dateProperty) throw new Error("Notion DB의 날짜 칸 이름이 필요해요.");
}

function validateRecruit(recruit) {
  if (!recruit || !recruit.id) throw new Error("공고 ID가 없어요.");
  if (!recruit.endTime) {
    throw new Error("공고 마감일을 찾지 못했어요.");
  }
}

function buildNotionPayload(recruit, settings, calendarEntryType) {
  const properties = {};
  const isStartEntry = calendarEntryType === "start";
  const calendarDate = calendarDateForEntry(recruit, settings, calendarEntryType);
  const title = isStartEntry
    ? `[시작] ${recruit.displayTitle || recruit.title || "자소설 채용 공고"}`
    : recruit.displayTitle || recruit.title || "자소설 채용 공고";

  properties[settings.titleProperty] = titleValue(title);
  properties[settings.dateProperty] = dateRangeValue(calendarDate.start, calendarDate.end);

  addDate(properties, settings.deadlineDateProperty, recruit.endTime);
  addRichText(properties, settings.companyProperty, recruit.companyName);
  addRichText(properties, settings.recruitTitleProperty, recruit.title);
  addUrl(properties, settings.urlProperty, recruit.recruitUrl);
  addUrl(properties, settings.applyUrlProperty, recruit.applyUrl);
  addDate(properties, settings.startDateProperty, recruit.startTime);
  addNumber(properties, settings.sourceIdProperty, Number(recruit.id));
  addRichText(properties, settings.dutiesProperty, Array.isArray(recruit.duties) ? recruit.duties.join(", ") : "");

  return {
    parent: parentValue(settings),
    properties,
    children: buildChildren(recruit)
  };
}

function calendarDateForEntry(recruit, settings, calendarEntryType) {
  if (calendarEntryType === "start") {
    return { start: recruit.startTime, end: "" };
  }

  if (
    settings.includeStartDateInCalendar &&
    settings.startDateCalendarMode === "range" &&
    recruit.startTime &&
    normalizeDate(recruit.startTime) !== normalizeDate(recruit.endTime)
  ) {
    return { start: recruit.startTime, end: recruit.endTime };
  }

  return { start: recruit.endTime, end: "" };
}

function shouldCreateSeparateStartDatePage(recruit, settings) {
  if (!settings.includeStartDateInCalendar || settings.startDateCalendarMode !== "separate") return false;
  if (!recruit.startTime) return false;
  if (!recruit.endTime) return true;
  return normalizeDate(recruit.startTime) !== normalizeDate(recruit.endTime);
}

function parentValue(settings) {
  const parentType = settings.notionParentType || "data_source_id";
  return {
    type: parentType,
    [parentType]: normalizeNotionId(settings.notionParentId)
  };
}

function titleValue(content) {
  return {
    title: [
      {
        type: "text",
        text: { content: trimForNotion(content, 2000) }
      }
    ]
  };
}

function richTextValue(content) {
  return {
    rich_text: [
      {
        type: "text",
        text: { content: trimForNotion(content, 2000) }
      }
    ]
  };
}

function dateValue(value) {
  return { date: { start: normalizeDate(value) } };
}

function dateRangeValue(startValue, endValue) {
  const start = normalizeDate(startValue || endValue);
  const end = normalizeDate(endValue);
  if (!start) return { date: null };
  return { date: { start, end: end && end !== start ? end : null } };
}

function urlValue(value) {
  return { url: trimForNotion(value, 2000) };
}

function numberValue(value) {
  return { number: Number.isFinite(value) ? value : null };
}

function addRichText(properties, propertyName, value) {
  if (!propertyName || !value) return;
  properties[propertyName] = richTextValue(value);
}

function addUrl(properties, propertyName, value) {
  if (!propertyName || !value) return;
  properties[propertyName] = urlValue(value);
}

function addDate(properties, propertyName, value) {
  if (!propertyName || !value) return;
  properties[propertyName] = dateValue(value);
}

function addNumber(properties, propertyName, value) {
  if (!propertyName || !Number.isFinite(value)) return;
  properties[propertyName] = numberValue(value);
}

function buildChildren(recruit) {
  const lines = [
    `회사: ${recruit.companyName || "-"}`,
    `공고명: ${recruit.title || "-"}`,
    `자소설 공고: ${recruit.recruitUrl || "-"}`,
    recruit.applyUrl ? `지원 링크: ${recruit.applyUrl}` : "",
    recruit.endTime ? `마감: ${recruit.endTime}` : "",
    recruit.startTime ? `시작: ${recruit.startTime}` : ""
  ].filter(Boolean);

  return [
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: { content: trimForNotion(lines.join("\n"), 2000) }
          }
        ]
      }
    }
  ];
}

async function createNotionPage(payload, settings) {
  const response = await fetchNotion("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.notionToken}`,
      "Content-Type": "application/json",
      "Notion-Version": settings.notionVersion || defaultNotionVersion(settings.notionParentType)
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  const body = safeJson(text);

  if (!response.ok) {
    const rawMessage = body && body.message ? body.message : text || response.statusText;
    const message = explainNotionApiError(rawMessage, settings);
    throw new Error(`Notion API 오류 (${response.status}): ${message}`);
  }

  return body;
}

async function fetchNotion(url, options) {
  let response = null;

  for (let attempt = 1; attempt <= NOTION_MAX_ATTEMPTS; attempt += 1) {
    response = await fetch(url, options);
    if (!NOTION_RETRY_STATUSES.has(response.status) || attempt === NOTION_MAX_ATTEMPTS) {
      return response;
    }

    await wait(retryDelayMs(response, attempt));
  }

  return response;
}

async function isNotionPageActive(pageId, settings) {
  try {
    const page = await retrieveNotionPage(pageId, settings);
    if (!page) return false;
    return !page.archived && !page.in_trash;
  } catch (_) {
    return true;
  }
}

async function retrieveNotionPage(pageId, settings) {
  const response = await fetchNotion(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${settings.notionToken}`,
      "Notion-Version": settings.notionVersion || defaultNotionVersion(settings.notionParentType)
    }
  });

  const text = await response.text();
  const body = safeJson(text);

  if (response.ok) return body;
  if (response.status === 404) return null;

  const rawMessage = body && body.message ? body.message : text || response.statusText;
  throw new Error(`Notion API 오류 (${response.status}): ${rawMessage}`);
}

async function trashNotionPage(pageId, settings) {
  const trashBodies = trashRequestBodies(settings);
  let lastError = null;

  for (const body of trashBodies) {
    const response = await fetchNotion(`https://api.notion.com/v1/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${settings.notionToken}`,
        "Content-Type": "application/json",
        "Notion-Version": settings.notionVersion || defaultNotionVersion(settings.notionParentType)
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    const responseBody = safeJson(text);

    if (response.ok) return true;
    if (response.status === 404) return false;

    const rawMessage = responseBody && responseBody.message ? responseBody.message : text || response.statusText;
    lastError = new Error(`Notion API 오류 (${response.status}): ${rawMessage}`);

    if (response.status !== 400) break;
  }

  throw lastError || new Error("Notion 페이지를 휴지통으로 이동하지 못했어요.");
}

function trashRequestBodies(settings) {
  const version = settings.notionVersion || defaultNotionVersion(settings.notionParentType);
  const primary = version.startsWith("2022") ? { archived: true } : { in_trash: true };
  const fallback = version.startsWith("2022") ? { in_trash: true } : { archived: true };
  return [primary, fallback];
}

function explainNotionApiError(message, settings) {
  const text = String(message || "");
  const expectedTypeMatch = text.match(/^(.+?) is expected to be ([a-z_]+)/);

  if (!expectedTypeMatch) return text;

  const propertyName = expectedTypeMatch[1].trim();
  const expectedType = expectedTypeMatch[2];
  const readableType = readableNotionType(expectedType);

  if (propertyName === settings.titleProperty && expectedType === "rich_text") {
    return [
      `"${propertyName}" 칸은 Notion에서 텍스트 칸입니다.`,
      "공고 제목을 넣을 칸에는 DB의 첫 번째 제목 칸, 즉 페이지 제목 칸 이름을 입력해야 합니다.",
      `첫 번째 제목 칸 이름을 "${propertyName}"으로 바꾸거나, 설정의 공고 제목 칸을 실제 제목 칸 이름으로 바꿔 주세요.`,
      "참고: Notion API의 rich_text는 노션 화면의 텍스트 속성입니다."
    ].join(" ");
  }

  if (propertyName === settings.titleProperty && expectedType !== "title") {
    return [
      `"${propertyName}" 칸 타입이 ${readableType}입니다.`,
      "공고 제목을 넣을 칸에는 DB의 첫 번째 제목 칸 이름을 입력해야 합니다."
    ].join(" ");
  }

  if ([settings.dateProperty, settings.deadlineDateProperty, settings.startDateProperty].includes(propertyName) && expectedType !== "date") {
    return [
      `"${propertyName}" 칸 타입이 ${readableType}입니다.`,
      "날짜를 넣을 칸에는 Notion의 날짜 속성 칸 이름을 입력해야 합니다."
    ].join(" ");
  }

  return `"${propertyName}" 칸 타입이 ${readableType}입니다. 설정에서 이 칸을 해당 타입에 맞는 입력칸에 연결해 주세요.`;
}

function readableNotionType(type) {
  const labels = {
    title: "제목",
    rich_text: "텍스트",
    date: "날짜",
    url: "URL",
    number: "숫자",
    select: "선택",
    multi_select: "다중 선택",
    checkbox: "체크박스",
    people: "사람",
    files: "파일",
    email: "이메일",
    phone_number: "전화번호"
  };
  return labels[type] || type;
}

function defaultNotionVersion(parentType) {
  return parentType === "data_source_id" ? "2025-09-03" : "2022-06-28";
}

function normalizeNotionId(value) {
  return String(value || "").trim();
}

function normalizeDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return raw;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return raw;
}

function trimForNotion(value, maxLength) {
  const text = String(value || "").trim();
  return text.length > maxLength ? text.slice(0, maxLength - 1) : text;
}

function uniqueValues(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function retryDelayMs(response, attempt) {
  const retryAfter = Number(response.headers && response.headers.get("Retry-After"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return retryAfter * 1000;
  }

  return 350 * attempt;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

function toErrorMessage(error) {
  return error && error.message ? error.message : String(error);
}

async function appendLog(logEntry) {
  const local = await chrome.storage.local.get({ syncLogs: [] });
  const nextLogs = [logEntry, ...(local.syncLogs || [])].slice(0, 30);
  await chrome.storage.local.set({ syncLogs: nextLogs });
}
