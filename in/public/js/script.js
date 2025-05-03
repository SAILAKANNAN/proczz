// Client-side validation for login and register forms
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.querySelector('form[action="/login"]');
  const registerForm = document.querySelector('form[action="/register"]');
  
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      const phone = this.querySelector('#phone').value.trim();
      const password = this.querySelector('#password').value.trim();
      
      if (!phone || !password) {
        e.preventDefault();
        alert('Please fill in all fields');
      }
    });
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      const phone = this.querySelector('#phone').value.trim();
      const name = this.querySelector('#name').value.trim();
      const password = this.querySelector('#password').value.trim();
      
      if (!phone || !name || !password) {
        e.preventDefault();
        alert('Please fill in all fields');
      }
    });
  }
});
function downloadQR(withdrawalId, phone) {
  window.location.href = `/admin/withdrawals/download/${withdrawalId}?filename=withdrawal_qr_${phone}.png`;
}