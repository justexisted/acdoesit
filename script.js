// Smooth scroll for in-page links
document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', evt => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        evt.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Lightweight form handler that opens the mail client
  const form = document.getElementById('plan-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name')?.value?.trim() || '';
      const business = document.getElementById('business')?.value?.trim() || '';
      const email = document.getElementById('email')?.value?.trim() || '';
      const phone = document.getElementById('phone')?.value?.trim() || '';
      const message = document.getElementById('message')?.value?.trim() || '';

      const to = 'hello@acdoesit.com';
      const subject = encodeURIComponent(`Free Plan Request — ${business || 'New Lead'}`);
      const bodyLines = [
        `Name: ${name}`,
        `Business: ${business}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        '',
        'What we sell / notes:',
        message
      ];
      const body = encodeURIComponent(bodyLines.join('\n'));
      const mailto = `mailto:${to}?subject=${subject}&body=${body}`;

      // Try to open mail client
      window.location.href = mailto;

      // Provide quick visual feedback
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Opening your email client…';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 3000);
      }
    });
  }
});



