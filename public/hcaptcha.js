// hCaptcha callback will set this variable
window.__hcaptchaToken = undefined;

// Define the hCaptcha callbacks
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

// Make callbacks globally available
window.onHCaptchaSuccess = onHCaptchaSuccess;
window.onHCaptchaExpired = onHCaptchaExpired;
window.onHCaptchaError = onHCaptchaError;

console.log("hCaptcha callback script loaded");
