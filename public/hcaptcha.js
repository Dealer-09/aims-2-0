window.__hcaptchaToken = undefined;

function onHCaptchaSuccess(token) {
  console.log("hCaptcha success callback triggered");
  window.__hcaptchaToken = token;
}

function onHCaptchaExpired() {
  console.log("hCaptcha expired callback triggered");
  window.__hcaptchaToken = undefined;
}

function onHCaptchaError(error) {
  console.error("hCaptcha error callback triggered:", error);
  window.__hcaptchaToken = undefined;
}

window.onHCaptchaSuccess = onHCaptchaSuccess;
window.onHCaptchaExpired = onHCaptchaExpired;
window.onHCaptchaError = onHCaptchaError;

console.log("hCaptcha callback script loaded");
