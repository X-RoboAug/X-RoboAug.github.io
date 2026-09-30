const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
let framePending = false;

function updateActiveLink() {
  let activeIndex = -1;
  sections.forEach((section, index) => {
    if (section && section.getBoundingClientRect().top <= 160) activeIndex = index;
  });
  navLinks.forEach((link, index) => {
    if (index === activeIndex) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  framePending = false;
}

function scheduleUpdate() {
  if (!framePending) {
    framePending = true;
    window.requestAnimationFrame(updateActiveLink);
  }
}

window.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('resize', scheduleUpdate);
updateActiveLink();

const citationButton = document.querySelector('.copy-citation');
const citationCode = document.querySelector('#bibtex-citation');
const citationStatus = document.querySelector('#citation-status');

function copyWithSelection(text) {
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  } finally {
    field.remove();
    citationButton.focus({ preventScroll: true });
  }
  return copied;
}

if (citationButton && citationCode && citationStatus) {
  citationButton.addEventListener('click', async () => {
    const text = citationCode.textContent.trim() + '\n';
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }
    if (!copied) copied = copyWithSelection(text);
    if (copied) {
      citationStatus.textContent = 'BibTeX copied to clipboard.';
    } else {
      const range = document.createRange();
      range.selectNodeContents(citationCode);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        citationStatus.textContent = 'Citation selected. Press Ctrl+C or Cmd+C to copy, or download the .bib file.';
      } else {
        citationStatus.textContent = 'Please download the .bib file to use this citation.';
      }
    }
  });
}
