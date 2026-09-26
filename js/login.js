// ── Theme toggle ───────────────────────────────────────────────────────────
(function () {
  const html        = document.documentElement;
  const toggleBtn   = document.getElementById('theme-toggle');
  const saved       = localStorage.getItem('otc-theme');

  if (saved === 'light') html.setAttribute('data-theme', 'light');

  toggleBtn.addEventListener('click', function () {
    const isLight = html.getAttribute('data-theme') === 'light';
    if (isLight) {
      html.removeAttribute('data-theme');
      localStorage.setItem('otc-theme', 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
      localStorage.setItem('otc-theme', 'light');
    }
  });
})();

// ── A. DOM references ──────────────────────────────────────────────────────
const usernameInput   = document.getElementById('login-username');
const serverInput     = document.getElementById('login-server');
const passwordInput   = document.getElementById('login-password');
const passwordToggle  = document.getElementById('password-toggle');

passwordToggle.addEventListener('click', function () {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  passwordToggle.classList.toggle('active', isHidden);
  passwordToggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  passwordToggle.setAttribute('title',      isHidden ? 'Hide password' : 'Show password');
});
const jidPreview    = document.getElementById('jid-preview');
const statusMsg     = document.getElementById('status-message');
const loginButton   = document.getElementById('login-button');
const loginForm     = document.getElementById('login-form');

// ── B. JID preview (real-time assembly) ────────────────────────────────────
function updateJidPreview() {
  const user   = usernameInput.value.trim();
  const server = serverInput.value.trim();

  if (!user && !server) {
    jidPreview.textContent = '';
    jidPreview.classList.remove('has-content');
    return;
  }

  const displayUser   = user   || usernameInput.placeholder;
  const displayServer = server || serverInput.placeholder;

  jidPreview.textContent = displayUser + '@' + displayServer;
  jidPreview.classList.toggle('has-content', !!(user && server));
}

usernameInput.addEventListener('input', updateJidPreview);
serverInput.addEventListener('input', updateJidPreview);
updateJidPreview();

// ── C. Status helpers ──────────────────────────────────────────────────────
function showStatus(message, isError) {
  statusMsg.textContent = message;
  statusMsg.style.color = (isError === false)
    ? 'var(--color-accent)'
    : 'var(--color-error)';
  statusMsg.classList.add('visible');
}

function clearStatus() {
  statusMsg.textContent = '';
  statusMsg.classList.remove('visible');
}

// ── D. Form submission ─────────────────────────────────────────────────────
loginForm.addEventListener('submit', function (event) {
  event.preventDefault();
  clearStatus();

  const username = usernameInput.value.trim();
  const server   = serverInput.value.trim();
  const password = passwordInput.value;

  if (!username) {
    showStatus('Please enter your login name.');
    usernameInput.focus();
    return;
  }
  if (!server) {
    showStatus('Please enter the server address.');
    serverInput.focus();
    return;
  }
  if (!password) {
    showStatus('Please enter your password.');
    passwordInput.focus();
    return;
  }

  const jid = username + '@' + server;
  connectXMPP(jid, password, server);
});

// ── E. Strophe.js connection ───────────────────────────────────────────────
let connection = null;

function connectXMPP(jid, password, server) {
  loginButton.disabled = true;
  loginButton.textContent = 'Connecting…';
  showStatus('Connecting to ' + server + '…', false);

  // Most servers expose BOSH at /http-bind (Prosody, ejabberd default).
  // Change to /bosh or /xmpp-httpbind if your server requires it.
  const boshUrl = 'https://' + server + '/http-bind';

  connection = new Strophe.Connection(boshUrl);

  // Uncomment to inspect raw XML in the browser console during development:
  // connection.rawInput  = (data) => console.log('RECV:', data);
  // connection.rawOutput = (data) => console.log('SENT:', data);

  connection.connect(jid, password, function (status) {
    switch (status) {

      case Strophe.Status.CONNECTING:
        showStatus('Connecting…', false);
        break;

      case Strophe.Status.AUTHENTICATING:
        showStatus('Authenticating…', false);
        break;

      case Strophe.Status.CONNECTED:
        showStatus('Connected!', false);
        loginButton.textContent = 'Connected';
        onLoginSuccess(jid);
        break;

      case Strophe.Status.AUTHFAIL:
        showStatus('Wrong username or password.');
        resetLoginButton();
        break;

      case Strophe.Status.CONNFAIL:
        showStatus('Could not connect to server. Check the server address.');
        resetLoginButton();
        break;

      case Strophe.Status.DISCONNECTED:
        // Ignore disconnection events that follow a successful login
        if (loginButton.textContent === 'Connected') break;
        showStatus('Disconnected from server.');
        resetLoginButton();
        break;

      case Strophe.Status.ERROR:
        showStatus('An unexpected error occurred.');
        resetLoginButton();
        break;
    }
  });
}

function resetLoginButton() {
  loginButton.disabled = false;
  loginButton.textContent = 'Log in';
}

function onLoginSuccess(jid) {
  // TODO: hide the login card and show the chat interface.
  console.log('XMPP connected as', jid);
}
