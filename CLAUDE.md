# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

OpenTeamChat is an experimental, open-source XMPP-based team chat client (AGPLv3). It is currently a proof of concept — a login screen that connects to any XMPP server via BOSH using Strophe.js. No build system, no package manager, no framework.

## Running the app

Open `index.html` directly in a browser, or serve it with any static file server:

```sh
python3 -m http.server 8080
# then open http://localhost:8080
```

There are no build steps, tests, or linting tools configured.

## Architecture

The app is plain HTML/CSS/JS with one external dependency loaded via CDN:

- `index.html` — the only page; contains the login form
- `css/style.css` — all styles; uses CSS custom properties for theming
- `js/login.js` — all JavaScript; handles theme toggle, JID preview, form validation, and XMPP connection

**XMPP connection** is handled by [Strophe.js](https://strophe.im/strophejs/) (loaded from jsDelivr CDN). It connects via BOSH at `https://<server>/http-bind`. The `onLoginSuccess()` function at the bottom of `login.js` is the hook for the next development step: hiding the login card and showing the chat interface.

**Theming** uses a dark default with `[data-theme="light"]` overrides on `:root`. The toggle writes `otc-theme` to `localStorage`. All colours are CSS variables defined in `:root`.

## XMPP compatibility

Targets BOSH endpoint at `/http-bind` (ejabberd, Prosody default). Some servers use `/bosh` or `/xmpp-httpbind` — the URL is hardcoded in `connectXMPP()` in `login.js:114`.
