# OpenViking Console for DeepSeek Harness (preview)

[简体中文](README.md) | **English**

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)

An OpenViking Studio panel embedded in DSH: the left sidebar gets an **OpenViking** entry; clicking it opens the server's Web console in DSH's center column, with refresh / open-in-browser controls floating over it. This is a **standalone preview** of the console component proposed in [volcengine/OpenViking#6435](https://github.com/volcengine/OpenViking/pull/6435). Once that PR merges, use the memory plugin's built-in console and remove this preview.

> **Do not install both at the same time.** They register the same `/openviking/console` and `/studio/*` routes and the same `openviking-console` sidebar entry.

![Architecture of the proposed integration](docs/architecture.png)

## Features

- **OpenViking** entry in DSH's left sidebar panel list, beside Plugins / Automation tasks / Context insights.
- The server's own Studio embedded in the center column; the iframe is same-origin through a `/studio/*` proxy, so the plugin applies the DSH `--dsw-alias-*` theme tokens to the Studio's CSS variables (light and dark).
- Floating **refresh** and **open in browser** controls; selecting another sidebar panel switches back.
- Fenced `/openviking/console` status route for the panel; the API key never enters the browser and the proxy never forwards the OpenViking API.
- Configurable `endpoint` (Host/API base) and `consoleUrl` (browser-facing Studio base, defaulting to `endpoint`).

## Requirements

- DSH Web or Desktop with browser-half support.
- An OpenViking server that serves the Studio at `/studio` (the 0.5.x desktop builds do).
- The browser can reach the OpenViking API (`endpoint`); the server must allow the DSH origin in CORS for the Studio's own API calls.
- The console proxy serves static HTML/assets only. If your deployment requires authentication, sign in through the Studio's own connection page.

## Install

### Option 1: npm package name (after publish, recommended)

In DSH's "Add plugin" dialog, enter the package name:

```
dsh-openviking-console
```

Keep the install source at its default (or "Chinese mainland mirror"); click **Install**, enable **OpenViking Console** in the plugin list, then restart or refresh DSH. The OpenViking entry appears in the left sidebar.

### Option 2: GitHub URL / local directory

Paste the repository URL `https://github.com/zrwangems/dsh-openviking-console` into the dialog. If the dialog rejects a plain GitHub URL (some DSH versions only accept a local directory), clone it first and paste the directory path:

```bash
git clone https://github.com/zrwangems/dsh-openviking-console.git
```

### Option 3: CLI

```bash
git clone https://github.com/zrwangems/dsh-openviking-console.git
cd dsh-openviking-console
dsh plugin install .
```

## Configure

The bundle adds one Host row, `openviking-console`. Its defaults work for a local OpenViking on port 1933:

```yaml
- id: openviking-console
  config:
    endpoint: http://127.0.0.1:1933
    # Optional: a browser-facing Studio base when it differs from the API base.
    consoleUrl: https://console.example/openviking
```

`endpoint` is the Host-side OpenViking API base; the status route probes `${endpoint}/health`, the proxy falls back to it when `consoleUrl` is unset, and the injected Studio connection profile uses it as the API base. `consoleUrl` is the browser-facing console base (a base or a full `/studio/home` URL); it defaults to `endpoint` and can be set with `OPENVIKING_CONSOLE_URL`. The environment also accepts `OPENVIKING_URL` / `OPENVIKING_BASE_URL` for `endpoint`.

If you also install `@openviking/dsh-memory-plugin`, its `openviking-memory-runtime` row has its own config; a custom `endpoint` should be mirrored on `openviking-console` if the two components should talk to the same server.

## How it works

- `index.mjs` — Host plugin: resolves `endpoint` / `consoleUrl` and supplies a minimal `/health` client.
- `console.mjs` — fenced `/openviking/console` status route, same-origin `/studio/*` proxy, and the connection-bootstrap injection into the proxied Studio HTML.
- `client-ui.mjs` — browser half (`dsh.client`): the sidebar entry, the main panel, the embedded `/studio/home` iframe, host-theme injection, and the floating controls.

The Studio is same-origin with DSH through the proxy, so the browser half can read its document and apply the host's theme tokens directly. The Studio's API calls go straight to the configured `endpoint`; the proxy only serves HTML and assets.

## Security notes

- The proxy never carries the OpenViking API key and does not forward API requests.
- The status route is fenced with DSH's browser-trust check; it returns connection/status metadata only.
- The Studio authenticates with its own connection page when the deployment requires it.
- The plugin claims the `/studio` path on the DSH origin (the Studio is built with that base).

## Preview notes

- This repository is a preview of [volcengine/OpenViking#6435](https://github.com/volcengine/OpenViking/pull/6435); the upstream integration has the console as a second Host component of `@openviking/dsh-memory-plugin`, so it ships with the memory plugin version.
- Managed or split deployments can point `consoleUrl` at a separate console host; the Studio's API still uses `endpoint`.
- Once the upstream PR is released, uninstall this preview before upgrading the memory plugin.

## License

The plugin code is derived from the [OpenViking](https://github.com/volcengine/OpenViking) repository and is distributed under the GNU Affero General Public License v3.0 (AGPL-3.0); see [LICENSE](LICENSE). OpenViking and the OpenViking marks belong to their respective owners.

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
