// hCaptcha callback will set this variable
window.__hcaptchaToken = null;
function onHCaptchaSuccess(token) {
  window.__hcaptchaToken = token;
}
