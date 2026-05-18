const serviceDefaults = {
  user: "http://localhost:3001",
  product: "http://localhost:3002",
  order: "http://localhost:3003",
  custom: ""
};

const presets = {
  "list-users": {
    service: "user",
    method: "GET",
    path: "/users",
    body: ""
  },
  "list-products": {
    service: "product",
    method: "GET",
    path: "/products",
    body: ""
  },
  "list-orders": {
    service: "order",
    method: "GET",
    path: "/orders",
    body: ""
  },
  "order-detail": {
    service: "order",
    method: "GET",
    path: "/orders/1",
    body: ""
  },
  "create-user": {
    service: "user",
    method: "POST",
    path: "/users",
    body: "{\n  \"name\": \"Alice\",\n  \"email\": \"alice@example.com\"\n}"
  },
  "create-product": {
    service: "product",
    method: "POST",
    path: "/products",
    body: "{\n  \"category_id\": 1,\n  \"name\": \"Notebook\",\n  \"price\": 19.5,\n  \"stock\": 100\n}"
  }
};

const elements = {
  form: document.getElementById("request-form"),
  service: document.getElementById("service"),
  method: document.getElementById("method"),
  baseUrl: document.getElementById("base-url"),
  path: document.getElementById("path"),
  body: document.getElementById("body"),
  bodyNote: document.getElementById("body-note"),
  urlPreview: document.getElementById("url-preview"),
  sendBtn: document.getElementById("send-btn"),
  formatBody: document.getElementById("format-body"),
  clearForm: document.getElementById("clear-form"),
  formError: document.getElementById("form-error"),
  statusBadge: document.getElementById("status-badge"),
  timeMs: document.getElementById("time-ms"),
  sizeBytes: document.getElementById("size-bytes"),
  responseNote: document.getElementById("response-note"),
  prettyOutput: document.getElementById("pretty-output"),
  rawOutput: document.getElementById("raw-output"),
  copyResponse: document.getElementById("copy-response"),
  toggleButtons: Array.from(document.querySelectorAll(".toggle__btn")),
  presetButtons: Array.from(document.querySelectorAll("[data-preset]"))
};

const state = {
  view: "pretty",
  lastPretty: "",
  lastRaw: ""
};

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function syntaxHighlight(json) {
  const escaped = escapeHtml(json);
  return escaped.replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\"\s*:)|\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\"|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
    (match) => {
      if (/^\".*\"\s*:/.test(match)) {
        return `<span class=\"token-key\">${match}</span>`;
      }
      if (/^\"/.test(match)) {
        return `<span class=\"token-string\">${match}</span>`;
      }
      if (/true|false/.test(match)) {
        return `<span class=\"token-boolean\">${match}</span>`;
      }
      if (/null/.test(match)) {
        return `<span class=\"token-null\">${match}</span>`;
      }
      return `<span class=\"token-number\">${match}</span>`;
    }
  );
}

function buildUrl() {
  const base = elements.baseUrl.value.trim().replace(/\/+$/, "");
  if (!base) {
    return "";
  }
  let path = elements.path.value.trim() || "/";
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return `${base}${path}`;
}

function updatePreview() {
  const url = buildUrl();
  elements.urlPreview.textContent = url || "URL preview";
}

function setStatusBadge(status) {
  elements.statusBadge.classList.remove("is-ok", "is-warn", "is-err");
  if (status >= 200 && status < 300) {
    elements.statusBadge.classList.add("is-ok");
  } else if (status >= 300 && status < 400) {
    elements.statusBadge.classList.add("is-warn");
  } else if (status >= 400) {
    elements.statusBadge.classList.add("is-err");
  }
  elements.statusBadge.textContent = `Status: ${status}`;
}

function setMeta({ status = "--", time = "--", size = "--" }) {
  if (status === "--") {
    elements.statusBadge.textContent = "Status: --";
    elements.statusBadge.classList.remove("is-ok", "is-warn", "is-err");
  } else {
    setStatusBadge(status);
  }
  elements.timeMs.textContent = `Time: ${time}`;
  elements.sizeBytes.textContent = `Size: ${size}`;
}

function setNote(message) {
  elements.responseNote.textContent = message || "";
}

function showError(message) {
  elements.formError.textContent = message;
}

function clearError() {
  elements.formError.textContent = "";
}

function setOutputs({ prettyText, rawText, isJson }) {
  state.lastPretty = prettyText || "";
  state.lastRaw = rawText || "";

  if (isJson && prettyText) {
    elements.prettyOutput.innerHTML = syntaxHighlight(prettyText);
  } else {
    elements.prettyOutput.textContent = prettyText || "No content";
  }

  elements.rawOutput.textContent = rawText || "";
}

function updateBodyState() {
  const method = elements.method.value;
  const isBodyAllowed = method !== "GET";
  elements.body.disabled = !isBodyAllowed;
  elements.bodyNote.textContent = isBodyAllowed
    ? "Body is optional for POST and PUT."
    : "GET requests do not include a body.";
}

function applyPreset(name) {
  const preset = presets[name];
  if (!preset) {
    return;
  }
  elements.service.value = preset.service;
  elements.method.value = preset.method;
  elements.baseUrl.value = serviceDefaults[preset.service];
  elements.path.value = preset.path;
  elements.body.value = preset.body || "";
  updateBodyState();
  updatePreview();
  clearError();
}

function formatBody() {
  const raw = elements.body.value.trim();
  if (!raw) {
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    elements.body.value = JSON.stringify(parsed, null, 2);
    clearError();
  } catch (err) {
    showError("Body is not valid JSON.");
  }
}

function resetForm() {
  elements.service.value = "user";
  elements.method.value = "GET";
  elements.baseUrl.value = serviceDefaults.user;
  elements.path.value = "/users";
  elements.body.value = "";
  updateBodyState();
  updatePreview();
  clearError();
}

async function copyResponse() {
  const text = state.view === "pretty" ? state.lastPretty : state.lastRaw;
  if (!text) {
    setNote("Nothing to copy yet.");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    setNote("Copied to clipboard.");
  } catch (err) {
    setNote("Copy failed. Select and copy manually.");
  }
}

async function sendRequest(event) {
  event.preventDefault();
  clearError();
  setNote("");

  const url = buildUrl();
  if (!url) {
    showError("Base URL is required.");
    return;
  }

  const method = elements.method.value;
  const bodyText = elements.body.value.trim();

  const options = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
  };

  if (bodyText && method !== "GET") {
    try {
      JSON.parse(bodyText);
      options.body = bodyText;
    } catch (err) {
      showError("Body is not valid JSON.");
      return;
    }
  }

  elements.sendBtn.disabled = true;
  elements.sendBtn.textContent = "Sending...";

  const start = performance.now();

  try {
    const response = await fetch(url, options);
    const timeMs = Math.round(performance.now() - start);
    const text = await response.text();
    const size = new Blob([text]).size;

    let jsonData = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        jsonData = JSON.parse(text);
      } catch (err) {
        setNote("Response claims JSON, but parsing failed.");
      }
    }

    if (jsonData !== null) {
      const prettyText = JSON.stringify(jsonData, null, 2);
      setOutputs({
        prettyText,
        rawText: text,
        isJson: true
      });
    } else {
      setOutputs({
        prettyText: text || "No content",
        rawText: text,
        isJson: false
      });
    }

    setMeta({
      status: response.status,
      time: `${timeMs} ms`,
      size: `${size} bytes`
    });
  } catch (err) {
    showError("Request failed. Check the service URL and CORS.");
    setMeta({});
  } finally {
    elements.sendBtn.disabled = false;
    elements.sendBtn.textContent = "Send request";
  }
}

function setView(view) {
  state.view = view;
  elements.toggleButtons.forEach((button) => {
    const isActive = button.dataset.view === view;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  const showPretty = view === "pretty";
  elements.prettyOutput.classList.toggle("hidden", !showPretty);
  elements.rawOutput.classList.toggle("hidden", showPretty);
}

function handleServiceChange() {
  const value = elements.service.value;
  if (value !== "custom") {
    elements.baseUrl.value = serviceDefaults[value] || "";
  }
  updatePreview();
}

function init() {
  resetForm();

  elements.form.addEventListener("submit", sendRequest);
  elements.service.addEventListener("change", handleServiceChange);
  elements.method.addEventListener("change", () => {
    updateBodyState();
  });

  [elements.baseUrl, elements.path].forEach((input) => {
    input.addEventListener("input", updatePreview);
  });

  elements.formatBody.addEventListener("click", formatBody);
  elements.clearForm.addEventListener("click", resetForm);
  elements.copyResponse.addEventListener("click", copyResponse);

  elements.toggleButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  elements.presetButtons.forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });
}

init();
