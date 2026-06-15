(() => {
  const INSTALL_KEY = "__jasoseolNotionCalendarBridgeInstalled";
  if (window[INSTALL_KEY]) return;
  window[INSTALL_KEY] = true;

  const SOURCE = "jasoseol-notion-calendar-page-bridge";
  const FAVORITE_ADD_PATH = "/employment/add_user_employment.json";

  function toUrl(input) {
    try {
      if (typeof input === "string") return input;
      if (input && typeof input.url === "string") return input.url;
    } catch (_) {
      return "";
    }
    return "";
  }

  function isFavoriteAdd(url) {
    return typeof url === "string" && url.includes(FAVORITE_ADD_PATH);
  }

  function parseBody(body) {
    if (!body) return {};

    try {
      if (body instanceof URLSearchParams) {
        return Object.fromEntries(body.entries());
      }

      if (body instanceof FormData) {
        const parsed = {};
        for (const [key, value] of body.entries()) parsed[key] = value;
        return parsed;
      }
    } catch (_) {
      // Fall through to string parsing.
    }

    if (typeof body === "string") {
      try {
        return JSON.parse(body);
      } catch (_) {
        try {
          return Object.fromEntries(new URLSearchParams(body).entries());
        } catch (__) {
          return {};
        }
      }
    }

    return {};
  }

  function parseJson(text) {
    if (!text || typeof text !== "string") return null;
    try {
      return JSON.parse(text);
    } catch (_) {
      return null;
    }
  }

  function extractEmploymentCompanyId(body, responseBody) {
    const candidates = [
      body && body.employment_company_id,
      body && body.employmentCompanyId,
      body && body.employment_company && body.employment_company.id,
      responseBody && responseBody.employment_company_id,
      responseBody && responseBody.employmentCompanyId,
      responseBody && responseBody.id,
      responseBody && responseBody.employment_company && responseBody.employment_company.id
    ];

    for (const value of candidates) {
      if (value !== undefined && value !== null && String(value).trim()) {
        return String(value).trim();
      }
    }

    return "";
  }

  function responseLooksSuccessful(responseBody) {
    if (!responseBody || typeof responseBody !== "object") return true;
    if (responseBody.ret === false) return false;
    if (responseBody.success === false) return false;
    if (responseBody.error || responseBody.errors) return false;
    return true;
  }

  function emit(kind, detail) {
    window.postMessage({ source: SOURCE, kind, detail }, window.location.origin);
  }

  const originalFetch = window.fetch;
  if (typeof originalFetch === "function") {
    window.fetch = async function patchedFetch(input, init) {
      const requestUrl = toUrl(input);
      const requestBody = parseBody(init && init.body);
      const shouldWatch = isFavoriteAdd(requestUrl);
      const response = await originalFetch.apply(this, arguments);

      if (shouldWatch && response && response.ok) {
        response
          .clone()
          .text()
          .then((text) => {
            const responseBody = parseJson(text);
            if (!responseLooksSuccessful(responseBody)) return;

            emit("favorite:add:success", {
              employmentCompanyId: extractEmploymentCompanyId(requestBody, responseBody),
              requestUrl,
              responseBody
            });
          })
          .catch(() => {
            emit("favorite:add:success", {
              employmentCompanyId: extractEmploymentCompanyId(requestBody, null),
              requestUrl
            });
          });
      }

      return response;
    };
  }

  const xhrProto = window.XMLHttpRequest && window.XMLHttpRequest.prototype;
  if (xhrProto) {
    const originalOpen = xhrProto.open;
    const originalSend = xhrProto.send;

    xhrProto.open = function patchedOpen(method, url) {
      this.__jasoseolNotionCalendar = { method, url: toUrl(url) };
      return originalOpen.apply(this, arguments);
    };

    xhrProto.send = function patchedSend(body) {
      const meta = this.__jasoseolNotionCalendar || {};
      const requestBody = parseBody(body);

      if (isFavoriteAdd(meta.url)) {
        this.addEventListener("loadend", () => {
          if (this.status < 200 || this.status >= 300) return;

          let responseBody = null;
          try {
            responseBody = typeof this.response === "object" ? this.response : parseJson(this.responseText);
          } catch (_) {
            responseBody = null;
          }

          if (!responseLooksSuccessful(responseBody)) return;

          emit("favorite:add:success", {
            employmentCompanyId: extractEmploymentCompanyId(requestBody, responseBody),
            requestUrl: meta.url,
            responseBody
          });
        });
      }

      return originalSend.apply(this, arguments);
    };
  }
})();
