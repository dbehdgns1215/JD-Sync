(() => {
  const PAGE_BRIDGE_SOURCE = "jasoseol-notion-calendar-page-bridge";
  const SYNC_DEBOUNCE_MS = 800;
  const EXTENSION_REFRESH_MESSAGE = "확장 프로그램이 업데이트됐습니다. 이 페이지를 새로고침해 주세요.";
  const recentSyncRequests = new Map();

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.source !== PAGE_BRIDGE_SOURCE) return;
    if (!["favorite:add:success", "favorite:remove:success"].includes(event.data.kind)) return;

    const id = normalizeId(event.data.detail && event.data.detail.employmentCompanyId) || extractIdFromUrl(location.href);
    if (!id) {
      if (event.data.kind === "favorite:remove:success") return;
      showToast("자소설 공고 ID를 찾지 못했어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.", "warn");
      return;
    }

    if (event.data.kind === "favorite:remove:success") {
      unsyncRecruitById(id);
      return;
    }

    syncRecruitById(id, "favorite");
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || message.type !== "SYNC_CURRENT_RECRUIT") return false;

    syncCurrentRecruit()
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ ok: false, error: String(error && error.message ? error.message : error) }));

    return true;
  });

  async function syncCurrentRecruit() {
    const recruit = parseRecruitFromDocument(document, location.href);
    if (!recruit || !recruit.id) {
      throw new Error("현재 페이지에서 자소설 공고 정보를 찾지 못했어요.");
    }

    const result = await sendRuntimeMessage({
      type: "SYNC_RECRUIT",
      trigger: "manual",
      recruit
    });

    showResultToast(result);
    return result;
  }

  async function syncRecruitById(id, trigger) {
    if (!shouldHandleRequest(id, "sync")) return;

    try {
      const recruit = await getRecruitById(id);
      const result = await sendRuntimeMessage({
        type: "SYNC_RECRUIT",
        trigger,
        recruit
      });
      showResultToast(result);
    } catch (error) {
      showToast(`Notion 동기화 실패: ${error.message || error}`, "error");
    }
  }

  async function unsyncRecruitById(id) {
    if (!shouldHandleRequest(id, "unsync")) return;

    try {
      const result = await sendRuntimeMessage({
        type: "UNSYNC_RECRUIT",
        recruit: {
          id,
          source: "jasoseol"
        }
      });

      if (!result || !result.ok) {
        showToast(`Notion 동기화 해제 실패: ${(result && result.error) || "알 수 없는 오류"}`, "error");
        return;
      }

      showResultToast(result);
    } catch (error) {
      showToast(`Notion 동기화 해제 실패: ${error.message || error}`, "error");
    }
  }

  function shouldHandleRequest(id, action) {
    const key = `${action}:${id}`;
    const now = Date.now();
    const last = recentSyncRequests.get(key) || 0;
    if (now - last < SYNC_DEBOUNCE_MS) return false;
    recentSyncRequests.set(key, now);
    return true;
  }

  async function getRecruitById(id) {
    const current = parseRecruitFromDocument(document, location.href);
    if (current && String(current.id) === String(id) && hasEnoughRecruitData(current)) {
      return current;
    }

    const detailUrl = new URL(`/recruit/${id}`, location.origin).toString();
    const response = await fetch(detailUrl, { credentials: "include" });
    if (!response.ok) {
      throw new Error(`공고 상세 페이지를 불러오지 못했어요. (${response.status})`);
    }

    const html = await response.text();
    const detailDocument = new DOMParser().parseFromString(html, "text/html");
    const recruit = parseRecruitFromDocument(detailDocument, detailUrl);

    if (!recruit || !recruit.id) {
      throw new Error("공고 상세 데이터 파싱에 실패했어요.");
    }

    return recruit;
  }

  function hasEnoughRecruitData(recruit) {
    return Boolean(recruit.companyName && recruit.title && recruit.endTime);
  }

  function parseRecruitFromDocument(doc, pageUrl) {
    const nextData = parseNextData(doc);
    const pageProps = nextData && nextData.props && nextData.props.pageProps ? nextData.props.pageProps : {};
    const employmentCompany = pageProps.initialEmploymentCompany;

    if (employmentCompany) {
      return normalizeRecruit(employmentCompany, pageUrl, pageProps);
    }

    return parseRecruitFromMeta(doc, pageUrl, pageProps);
  }

  function parseNextData(doc) {
    const node = doc.querySelector("script#__NEXT_DATA__");
    if (!node || !node.textContent) return null;

    try {
      return JSON.parse(node.textContent);
    } catch (_) {
      return null;
    }
  }

  function parseRecruitFromMeta(doc, pageUrl, pageProps) {
    const id = normalizeId(pageProps && pageProps.employmentCompanyId) || extractIdFromUrl(pageUrl);
    if (!id) return null;

    const metaTitle =
      getMetaContent(doc, "meta[property='og:title']") ||
      getMetaContent(doc, "meta[name='title']") ||
      doc.title ||
      "";
    const cleanedTitle = cleanTitle(metaTitle);
    const companyName = cleanedTitle.includes(" 채용공고 - ") ? cleanedTitle.split(" 채용공고 - ")[0] : "";
    const title = cleanedTitle.includes(" 채용공고 - ") ? cleanedTitle.split(" 채용공고 - ")[1] : cleanedTitle;

    return {
      id,
      companyName,
      title,
      displayTitle: buildDisplayTitle(companyName, title),
      recruitUrl: canonicalRecruitUrl(id, pageUrl),
      applyUrl: "",
      startTime: "",
      endTime: "",
      duties: [],
      source: "jasoseol"
    };
  }

  function normalizeRecruit(employmentCompany, pageUrl) {
    const id = normalizeId(employmentCompany.id) || extractIdFromUrl(pageUrl);
    const companyName =
      employmentCompany.name ||
      (employmentCompany.company_group && employmentCompany.company_group.name) ||
      "";
    const title = employmentCompany.title || "";
    const duties = Array.isArray(employmentCompany.employments)
      ? employmentCompany.employments.map((employment) => employment.field).filter(Boolean)
      : [];

    return {
      id,
      companyName,
      title,
      displayTitle: buildDisplayTitle(companyName, title),
      recruitUrl: canonicalRecruitUrl(id, pageUrl),
      applyUrl: employmentCompany.employment_page_url || "",
      startTime: employmentCompany.start_time || "",
      endTime: employmentCompany.end_time || "",
      duties,
      recruitType: employmentCompany.recruit_type,
      favoriteCount: employmentCompany.favorite_count,
      source: "jasoseol"
    };
  }

  function getMetaContent(doc, selector) {
    const node = doc.querySelector(selector);
    return node ? node.getAttribute("content") || "" : "";
  }

  function cleanTitle(value) {
    return String(value || "")
      .replace(/\s*\|\s*자소서 문항.*$/g, "")
      .replace(/\s*-\s*자소설닷컴\s*$/g, "")
      .trim();
  }

  function buildDisplayTitle(companyName, title) {
    const cleanCompany = String(companyName || "").trim();
    const cleanRecruitTitle = String(title || "").trim();
    if (cleanCompany && cleanRecruitTitle) return `[${cleanCompany}] ${cleanRecruitTitle}`;
    return cleanRecruitTitle || cleanCompany || "자소설 채용 공고";
  }

  function canonicalRecruitUrl(id, fallbackUrl) {
    if (id) return new URL(`/recruit/${id}`, location.origin).toString();
    return fallbackUrl;
  }

  function extractIdFromUrl(value) {
    const match = String(value || "").match(/\/recruit\/(\d+)/);
    return match ? match[1] : "";
  }

  function normalizeId(value) {
    if (value === undefined || value === null) return "";
    const match = String(value).match(/\d+/);
    return match ? match[0] : "";
  }

  function sendRuntimeMessage(message) {
    return new Promise((resolve, reject) => {
      if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) {
        reject(new Error(EXTENSION_REFRESH_MESSAGE));
        return;
      }

      try {
        chrome.runtime.sendMessage(message, (response) => {
          const error = chrome.runtime.lastError;
          if (error) {
            reject(new Error(readableRuntimeError(error)));
            return;
          }
          resolve(response);
        });
      } catch (error) {
        reject(new Error(readableRuntimeError(error)));
      }
    });
  }

  function readableRuntimeError(error) {
    const message = String(error && error.message ? error.message : error || "");

    if (
      !message ||
      /extension context invalidated/i.test(message) ||
      /context invalidated/i.test(message) ||
      /receiving end does not exist/i.test(message)
    ) {
      return EXTENSION_REFRESH_MESSAGE;
    }

    return message;
  }

  function showResultToast(result) {
    if (!result || !result.ok) {
      showToast(`Notion 동기화 실패: ${(result && result.error) || "알 수 없는 오류"}`, "error");
      return;
    }

    if (result.removed) {
      showToast(result.message || "Notion 일정 동기화를 해제했어요.", "success");
      return;
    }

    if (result.skipped) {
      if (result.silent) return;
      showToast(result.message || "이미 Notion에 동기화된 공고예요.", "info");
      return;
    }

    showToast(result.message || "Notion 일정 동기화를 완료했어요.", "success");
  }

  function showToast(message, tone) {
    const container = getToastContainer();
    const toast = document.createElement("div");
    toast.className = `jasoseol-notion-calendar-toast jasoseol-notion-calendar-toast-${tone || "info"}`;
    toast.textContent = message;
    Object.assign(toast.style, {
      maxWidth: "360px",
      padding: "12px 14px",
      borderRadius: "8px",
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.22)",
      color: "#ffffff",
      fontSize: "14px",
      lineHeight: "1.45",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background:
        tone === "success"
          ? "#0f766e"
          : tone === "error"
            ? "#b91c1c"
            : tone === "warn"
              ? "#b45309"
              : "#334155"
    });

    container.appendChild(toast);

    window.setTimeout(() => {
      toast.remove();
      if (!container.children.length) container.remove();
    }, 5200);
  }

  function getToastContainer() {
    const existing = document.querySelector(".jasoseol-notion-calendar-toast-container");
    if (existing) return existing;

    const container = document.createElement("div");
    container.className = "jasoseol-notion-calendar-toast-container";
    Object.assign(container.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      zIndex: "2147483647",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "8px",
      pointerEvents: "none"
    });
    document.documentElement.appendChild(container);
    return container;
  }
})();
