document.addEventListener('DOMContentLoaded', () => {
  loadHtmlIncludes();
});

function loadHtmlIncludes() {
  const includeElements = document.querySelectorAll('[data-include]');
  if (!includeElements.length) {
    document.dispatchEvent(new CustomEvent('includesLoaded'));
    return;
  }

  const promises = Array.from(includeElements).map(el => {
    return new Promise(resolve => {
      const includePath = el.getAttribute('data-include');
      if (!includePath) { resolve(); return; }

      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      if (includePath.includes('components/footer.html') && currentPage !== 'index.html') {
        resolve();
        return;
      }

      const processHtml = html => {
        const processedHtml = renderTemplate(html, el.dataset);
        const scripts = [];
        const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        const htmlWithoutScripts = processedHtml.replace(scriptRegex, match => {
          scripts.push(match);
          return '';
        });
        el.innerHTML = htmlWithoutScripts;
        scripts.forEach(scriptHtml => {
          const match = scriptHtml.match(/<script\b([^>]*?)>([\s\S]*?)<\/script>/i);
          if (match) {
            const attrs = match[1];
            const code = match[2];
            const newScript = document.createElement('script');
            if (attrs) {
              const srcMatch = attrs.match(/src=["']([^"']*)["']/);
              if (srcMatch) {
                newScript.src = srcMatch[1];
              }
              attrs.replace(/(\w+)(?:=["']([^"']*)["'])?/g, (_, name, val) => {
                if (name !== 'src') {
                  newScript.setAttribute(name, val || '');
                }
              });
            }
            if (code) newScript.textContent = code;
            el.appendChild(newScript);
          }
        });
        if (includePath.includes('components/header.html')) {
          initHeader();
        }
        resolve();
      };

      fetch(includePath, { cache: 'no-store' })
        .then(resp => {
          if (!resp.ok) throw new Error('Failed to load ' + includePath);
          return resp.text();
        })
        .then(processHtml)
        .catch(() => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', includePath, true);
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              processHtml(xhr.responseText);
            } else {
              console.warn('Include failed:', includePath, xhr.status);
              resolve();
            }
          };
          xhr.onerror = function() {
            console.warn('Include failed:', includePath);
            resolve();
          };
          xhr.send();
        });
    });
  });

  Promise.all(promises).then(() => {
    document.dispatchEvent(new CustomEvent('includesLoaded'));
  });
}

function renderTemplate(html, dataset) {
  let rendered = html;
  const renderValues = { ...dataset };

  if ('verse' in renderValues) {
    renderValues.verseBlock = renderValues.verse
      ? `<div class="verse-card">${renderValues.verse}</div>`
      : '';
  }

  // Auto-generate WebP image paths for responsive backgrounds
  if ('bgImage' in renderValues && renderValues.bgImage) {
    const stem = renderValues.bgImage.replace(/\.JPG$/i, '');
    renderValues.bgImageWebp = stem + '.lg.webp';
  }

  Object.keys(renderValues).forEach(key => {
    if (key === 'include') return;
    const value = renderValues[key] || '';
    rendered = rendered.split(`{{${key}}}`).join(value);
  });

  rendered = rendered.replace(/\{\{[^}]+\}\}/g, '');
  return rendered;
}

function initHeader() {
  const header = document.getElementById('mainHeader');
  if (!header || header.dataset.headerInit === 'true') return;
  header.dataset.headerInit = 'true';

  const hamburger = header.querySelector('.hamburger');
  const navUl = header.querySelector('nav ul');
  const dropdownToggles = header.querySelectorAll('.ministries-toggle');
  const dropdownItems = Array.from(dropdownToggles).map(toggle => {
    const parent = toggle.closest('.menu-item-has-children');
    const menu = parent ? parent.querySelector('.dropdown-menu') : null;
    return menu && parent ? { parent, toggle, menu } : null;
  }).filter(Boolean);
  let openDropdown = null;
  const closeTimeouts = new Map();
  let lastScroll = 0;
  let ticking = false;

  const setHeaderScrollState = () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScroll > lastScroll && currentScroll > 100) {
      header.classList.add('header-hidden');
    } else {
      header.classList.remove('header-hidden');
    }
    if (currentScroll > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
    lastScroll = currentScroll;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(setHeaderScrollState);
      ticking = true;
    }
  });

  if (hamburger && navUl) {
    hamburger.addEventListener('click', () => {
      const isActive = navUl.classList.toggle('active');
      hamburger.classList.toggle('active', isActive);
      hamburger.setAttribute('aria-expanded', String(isActive));
    });

    header.querySelectorAll('nav ul li a').forEach(link => {
      link.addEventListener('click', () => {
        if (link.classList && link.classList.contains('ministries-toggle')) return;
        if (navUl.classList.contains('active')) {
          navUl.classList.remove('active');
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navUl.classList.contains('active')) {
        navUl.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const closeDropdown = item => {
    if (!item || !item.menu || !item.toggle) return;
    if (closeTimeouts.has(item)) {
      clearTimeout(closeTimeouts.get(item));
      closeTimeouts.delete(item);
    }

    closeTimeouts.set(item, window.setTimeout(() => {
      item.menu.classList.remove('show');
      item.toggle.setAttribute('aria-expanded', 'false');
      if (openDropdown === item) {
        openDropdown = null;
      }
      closeTimeouts.delete(item);
    }, 80));
  };

  const openDropdownMenu = item => {
    if (!item || !item.menu || !item.toggle) return;
    if (openDropdown && openDropdown !== item) {
      closeDropdown(openDropdown);
    }
    if (closeTimeouts.has(item)) {
      clearTimeout(closeTimeouts.get(item));
      closeTimeouts.delete(item);
    }
    item.menu.classList.add('show');
    item.toggle.setAttribute('aria-expanded', 'true');
    openDropdown = item;
  };

  dropdownItems.forEach(item => {
    item.toggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (openDropdown === item) {
        closeDropdown(item);
      } else {
        openDropdownMenu(item);
      }
    });

    item.parent.addEventListener('mouseenter', () => {
      if (closeTimeouts.has(item)) {
        clearTimeout(closeTimeouts.get(item));
        closeTimeouts.delete(item);
      }
      openDropdownMenu(item);
    });

    item.parent.addEventListener('mouseleave', () => {
      closeDropdown(item);
    });

    item.menu.addEventListener('click', event => {
      event.stopPropagation();
    });
  });

  document.addEventListener('click', event => {
    if (openDropdown && !openDropdown.parent.contains(event.target)) {
      closeDropdown(openDropdown);
    }
  });
}

// ============================================
// PRAYER FORM (for header dropdown include)
// ============================================
document.addEventListener('includesLoaded', () => {
  const form = document.getElementById('submitPrayerBtn');
  if (!form) return;

  const categorySelect = document.getElementById('prayerCategory');
  const customContainer = document.getElementById('customRequestContainer');
  const customText = document.getElementById('customPrayerText');
  const wordCount = document.getElementById('wordCountDisplay');

  if (categorySelect && customContainer) {
    categorySelect.addEventListener('change', () => {
      customContainer.style.display = categorySelect.value === 'Custom' ? 'block' : 'none';
    });
  }

  if (customText && wordCount) {
    customText.addEventListener('input', () => {
      const words = customText.value.trim() ? customText.value.trim().split(/\s+/).length : 0;
      wordCount.textContent = words + ' / 50 words';
    });
  }

  form.addEventListener('click', async () => {
    const name = document.getElementById('prayerName')?.value.trim();
    const email = document.getElementById('prayerEmail')?.value.trim();
    const phone = document.getElementById('prayerPhone')?.value.trim();
    const category = document.getElementById('prayerCategory')?.value;
    const customText = document.getElementById('customPrayerText')?.value.trim();
    const feedback = document.getElementById('prayerFeedback');

    if (!name || !email) {
      if (feedback) {
        feedback.style.display = 'block';
        feedback.textContent = 'Please fill in your name and email.';
        feedback.style.color = '#f87171';
      }
      return;
    }

    const EMAILJS_PUBLIC_KEY = "MSiG_n3G0WXuOFNAp";
    const EMAILJS_SERVICE_ID = "service_d8wpw29";
    const EMAILJS_TEMPLATE_ID = "template_sk17a3p";

    if (typeof emailjs !== 'undefined') {
      try {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
        const currentTime = new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'medium' });
        const templateParams = {
          from_name: name,
          prayer_category: category || 'General',
          name: name,
          time: currentTime,
          message: `Prayer Request from Header\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || '—'}\nCategory: ${category}\n\nRequest: ${customText || category}`
        };
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        if (feedback) {
          feedback.style.display = 'block';
          feedback.textContent = '✓ Your prayer request has been submitted. Our team will pray with you.';
          feedback.style.color = '#10b981';
        }
      } catch (err) {
        if (feedback) {
          feedback.style.display = 'block';
          feedback.textContent = '✓ Your prayer request has been received.';
          feedback.style.color = '#10b981';
        }
      }
    } else {
      if (feedback) {
        feedback.style.display = 'block';
        feedback.textContent = '✓ Your prayer request has been received.';
        feedback.style.color = '#10b981';
      }
    }
  });
});

// ============================================
// SCROLL REVEAL for .reveal elements
// ============================================
document.addEventListener('includesLoaded', () => {
  // Scroll to hash if present (components loaded async, so hash scroll may be missed)
  if (window.location.hash) {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }

  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));
});

// ============================================
// PARTNERSHIP PAYMENT FLOW
// ============================================
document.addEventListener('includesLoaded', function() {
  var paymentModal = document.getElementById('pship-payment-modal');
  if (!paymentModal) return;

  var amountBtns = document.querySelectorAll('.pship-amount-btn');
  var customAmount = document.getElementById('pship-custom-amount');
  var proceedBtn = document.getElementById('pship-proceed-btn');
  var selectedAmount = 0;

  amountBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      amountBtns.forEach(function(b) {
        b.style.borderColor = 'rgba(255,255,255,0.08)';
        b.style.background = 'rgba(255,255,255,0.04)';
      });
      this.style.borderColor = '#d4a017';
      this.style.background = 'rgba(212,160,23,0.12)';
      selectedAmount = parseFloat(this.dataset.amount);
      customAmount.value = '';
    });
  });

  customAmount.addEventListener('input', function() {
    amountBtns.forEach(function(b) {
      b.style.borderColor = 'rgba(255,255,255,0.08)';
      b.style.background = 'rgba(255,255,255,0.04)';
    });
    selectedAmount = parseFloat(this.value) || 0;
  });

  proceedBtn.addEventListener('click', function() {
    if (selectedAmount <= 0 || isNaN(selectedAmount)) {
      alert('Please select or enter a partnership amount.');
      return;
    }

    closePaymentModal();
    setTimeout(function() {
      var m = document.getElementById('pship-bank-modal');
      if (m) m.classList.add('open');
      document.body.style.overflow = 'hidden';
      var proofFile = document.getElementById('pship-proof-file');
      if (proofFile) proofFile.click();
    }, 300);
  });
});

function closePaymentModal() {
  var m = document.getElementById('pship-payment-modal');
  if (m) m.classList.remove('open');
  document.body.style.overflow = '';
}

// ============================================
// CALENDAR BOOKING SYSTEM (Counselling)
// ============================================
document.addEventListener('includesLoaded', function() {
  initCalendarBooking();
});

var calendarState = {
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  selectedDate: null,
  selectedTime: null
};

function initCalendarBooking() {
  var cal = document.getElementById('calendarBooking');
  if (!cal) return;

  renderCalendar();

  document.getElementById('prevMonthBtn').addEventListener('click', function() {
    calendarState.currentMonth--;
    if (calendarState.currentMonth < 0) {
      calendarState.currentMonth = 11;
      calendarState.currentYear--;
    }
    renderCalendar();
  });

  document.getElementById('nextMonthBtn').addEventListener('click', function() {
    calendarState.currentMonth++;
    if (calendarState.currentMonth > 11) {
      calendarState.currentMonth = 0;
      calendarState.currentYear++;
    }
    renderCalendar();
  });

  document.querySelectorAll('.time-slot').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.time-slot').forEach(function(b) {
        b.classList.remove('slot-selected');
      });
      this.classList.add('slot-selected');
      calendarState.selectedTime = this.dataset.time;
      document.getElementById('selectedTimeText').textContent = this.dataset.time;
    });
  });
}

function renderCalendar() {
  var tbody = document.getElementById('calendarBody');
  var title = document.getElementById('calendarTitle');
  if (!tbody || !title) return;

  var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  title.textContent = monthNames[calendarState.currentMonth] + ' ' + calendarState.currentYear;

  var firstDay = new Date(calendarState.currentYear, calendarState.currentMonth, 1).getDay();
  var daysInMonth = new Date(calendarState.currentYear, calendarState.currentMonth + 1, 0).getDate();
  var today = new Date();
  today.setHours(0,0,0,0);

  tbody.innerHTML = '';
  var date = 1;

  for (var i = 0; i < 6; i++) {
    var row = document.createElement('tr');
    for (var j = 0; j < 7; j++) {
      var cell = document.createElement('td');
      if (i === 0 && j < firstDay) {
        cell.textContent = '';
      } else if (date > daysInMonth) {
        cell.textContent = '';
      } else {
        cell.textContent = date;

        var cellDate = new Date(calendarState.currentYear, calendarState.currentMonth, date);
        cellDate.setHours(0,0,0,0);

        if (cellDate < today) {
          cell.classList.add('cal-past');
        } else {
          (function(d) {
            cell.addEventListener('click', function() {
              var prev = tbody.querySelector('.cal-selected');
              if (prev) prev.classList.remove('cal-selected');
              this.classList.add('cal-selected');
              calendarState.selectedDate = calendarState.currentYear + '-' + String(calendarState.currentMonth + 1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
              document.getElementById('selectedDateDisplay').textContent = calendarState.selectedDate;
            });
          })(date);
        }

        date++;
      }
      row.appendChild(cell);
    }
    tbody.appendChild(row);
    if (date > daysInMonth) break;
  }
}

function sendCalendarBooking() {
  var name = document.getElementById('calName').value.trim();
  var phone = document.getElementById('calPhone').value.trim();
  var email = document.getElementById('calEmail').value.trim();
  var reason = document.getElementById('calReason').value.trim();
  var urgency = document.getElementById('calUrgency').value;
  var selectedDate = calendarState.selectedDate;
  var selectedTime = calendarState.selectedTime;

  if (!name || !phone || !reason || !urgency || !selectedDate || !selectedTime) {
    alert('Please fill in all required fields and select a date and time slot.');
    return;
  }

  var formattedMessage = 'Counselling Booking Request\n\n'
    + 'Name: ' + name + '\n'
    + 'Phone: ' + phone + '\n'
    + 'Email: ' + (email || 'Not provided') + '\n'
    + 'Date: ' + selectedDate + '\n'
    + 'Time: ' + selectedTime + '\n'
    + 'Urgency: ' + urgency + '\n\n'
    + 'Reason:\n' + reason;

  var currentTime = new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'medium' });

  var templateParams = {
    from_name: name,
    from_email: email || 'Not provided',
    to_email: 'khorombi2@yahoo.com',
    phone: phone,
    date: selectedDate,
    time: selectedTime,
    urgency: urgency,
    reason: reason,
    message: formattedMessage,
    submitted_at: currentTime
  };

  var btn = document.querySelector('.cal-book-btn');
  var originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Sending...';

  emailjs.send(COUNSEL_EMAILJS_SERVICE_ID, COUNSEL_EMAILJS_TEMPLATE_ID, templateParams)
    .then(function() {
      btn.innerHTML = '<i class="fas fa-check-circle"></i> Booking Sent ✓';
      btn.style.background = '#10b981';
      setTimeout(function() {
        btn.disabled = false;
        btn.innerHTML = originalText;
        btn.style.background = '#25D366';
      }, 3000);
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.innerHTML = originalText;
      alert('Failed to send booking. Please try again. Error: ' + (err.message || 'Unknown'));
    });
}
