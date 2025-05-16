export const showLoginModal = () => {
  const event = new CustomEvent("SHOW_LOGIN_MODAL", {
    detail: { timestamp: Date.now() },
  });
  window.dispatchEvent(event);
};
