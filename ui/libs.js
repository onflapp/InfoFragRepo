let nextId = 1;
const pending = new Map();

function send(msg) {
  window.parent.postMessage({ jsonrpc: "2.0", ...msg }, "*");
}

function request(method, params) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    send({ id, method, params });
  });
}

function notify(method, params) {
  send({ method, params });
}

function init() {
  window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    const msg = event.data;
    if (!msg || msg.jsonrpc !== "2.0") return;

    if (msg.id !== undefined && !msg.method) {
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
      return;
    }

    if (msg.method === "ui/notifications/tool-result") {
      let val = null;
      if (msg.params && msg.params.structuredContent) val = msg.params.structuredContent;

      show(val);
    }
  });

  request("ui/initialize", {
    protocolVersion: "2025-11-21",
    appInfo: { name: "infofragrepo", version: "1.0.0" },
    appCapabilities: {},
  }).then(() => notify("ui/notifications/initialized", {}));

}
