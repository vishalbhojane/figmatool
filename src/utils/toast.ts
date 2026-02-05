export const toast = (message: string, duration: number = 3000) => {
  // 1. Create the toast element
  const toastId = `toast-${Date.now()}`;
  const toastElement = document.createElement("div");
  toastElement.id = toastId;
  toastElement.className = "toast";

  // 2. Set the HTML structure
  toastElement.innerHTML = `
    <div class="toast-content">
      <span>${message}</span>
    </div>
  `;

  // 3. Append to body
  document.body.appendChild(toastElement);

  // 4. Remove after duration
  setTimeout(() => {
    const el = document.getElementById(toastId);
    if (el) {
      el.classList.add("toast-fade-out"); // Add a fade-out class
      setTimeout(() => el.remove(), 300); // Remove after animation
    }
  }, duration);
};
