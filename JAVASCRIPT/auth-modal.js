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

// password toggle function
document.querySelectorAll('.password-toggle').forEach(toggle => {
  toggle.addEventListener('click', function() {
    const inputId = this.getAttribute('data-toggle');
    const input = document.getElementById(inputId);
    
    if (!input) return;
    
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    // update icon
    const svg = this.querySelector('svg');
    if (isPassword) {
      this.setAttribute('aria-label', 'Hide password');
      svg.innerHTML = `
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    } else {
      this.setAttribute('aria-label', 'Show password');
      svg.innerHTML = `
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    }
  });
});

// password strength meter
function checkPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  return strength;
}

function updatePasswordStrength(passwordId, meterId, textId) {
  const password = document.getElementById(passwordId);
  const meter = document.getElementById(meterId);
  const text = document.getElementById(textId);
  
  if (!password || !meter || !text) return;
  
  password.addEventListener('input', function() {
    const value = this.value;
    const strength = checkPasswordStrength(value);
    
    // remove strength classes
    meter.className = 'password-strength-meter';
    
    if (value.length === 0) {
      text.textContent = '';
      return;
    }
    
    if (strength <= 2) {
      meter.classList.add('strength-weak');
      text.textContent = 'Weak password';
      text.style.color = '#ef4444';
    } else if (strength === 3) {
      meter.classList.add('strength-fair');
      text.textContent = 'Fair password';
      text.style.color = '#f59e0b';
    } else if (strength === 4) {
      meter.classList.add('strength-good');
      text.textContent = 'Good password';
      text.style.color = '#3b82f6';
    } else {
      meter.classList.add('strength-strong');
      text.textContent = 'Strong password';
      text.style.color = '#10b981';
    }
  });
}

// initialize password strength meters
updatePasswordStrength('register-password', 'register-strength-meter', 'register-strength-text');
updatePasswordStrength('reset-password', 'reset-strength-meter', 'reset-strength-text');

// make function available globally
window.openAuthModal = openAuthModal;

// prevent closing on outside click
document.querySelectorAll('.auth-modal').forEach(modal => {
  modal.addEventListener('click', e => {
    const card = modal.querySelector('.card');
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const clickedOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;

    if (clickedOutside) {
      e.stopPropagation();
      // modal.close();
    }
  });
});