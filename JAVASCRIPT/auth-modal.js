// Authentication Modal Handler

// open modal
function openAuthModal(modalId) {
const modal = document.getElementById(modalId);
if (modal) {
modal.showModal();
}
}

// close modal
function closeAuthModal(modalId) {
const modal = document.getElementById(modalId);
if (modal) {
modal.close();
}
}

// switch between modals
function switchAuthModal(fromModalId, toModalId) {
closeAuthModal(fromModalId);
setTimeout(() => openAuthModal(toModalId), 100);
}

// handle close buttons
document.querySelectorAll('[data-close]').forEach(btn => {
btn.addEventListener('click', () => {
const modalId = btn.dataset.close;
closeAuthModal(modalId);
});
});

// handle modal switch buttons
document.querySelectorAll('[data-switch]').forEach(btn => {
btn.addEventListener('click', () => {
const currentModal = btn.closest('.auth-modal');
const targetModalId = btn.dataset.switch;
if (currentModal) {
switchAuthModal(currentModal.id, targetModalId);
}
});
});

// check for reset token on load
window.addEventListener('DOMContentLoaded', () => {
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');



if (token) {
  // wait a bit to ensure auth modals are loaded
  setTimeout(() => {
    const tokenField = document.getElementById('resetToken');
    if (tokenField) {
      tokenField.value = token;
      openAuthModal('resetModal');
    }
  }, 400); // 0.4 second delay ensures HTML is ready
}
});

// make function available globally
window.openAuthModal = openAuthModal;

// prevent closing on outside click
document.querySelectorAll('.auth-modal').forEach(modal => {
  modal.addEventListener('click', e => {
    const rect = modal.querySelector('.auth-modal-content').getBoundingClientRect();
    const clickedOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;

    if (clickedOutside) {
      e.stopPropagation();
      e.preventDefault();
    }
  });
});