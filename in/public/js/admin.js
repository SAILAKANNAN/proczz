document.addEventListener('DOMContentLoaded', function() {
  // Load admin content dynamically
  const navLinks = document.querySelectorAll('.nav-link');
  const adminContent = document.getElementById('admin-content');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const url = this.getAttribute('href');
      
      fetch(url)
        .then(response => response.text())
        .then(html => {
          adminContent.innerHTML = html;
          history.pushState(null, '', url);
        })
        .catch(err => console.error('Error loading content:', err));
    });
  });
  
  // Handle back/forward navigation
  window.addEventListener('popstate', function() {
    fetch(location.pathname)
      .then(response => response.text())
      .then(html => {
        adminContent.innerHTML = html;
      })
      .catch(err => console.error('Error loading content:', err));
  });
});