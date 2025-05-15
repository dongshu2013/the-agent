export const showLoginModal = () => {
  window.dispatchEvent(new CustomEvent("SHOW_LOGIN_MODAL"));
};
