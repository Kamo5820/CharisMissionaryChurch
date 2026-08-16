// ============================================
// CHURCH DATA - single source of truth for
// services, special events & church settings.
// Shared by the Admin Panel (pages/admin.html)
// and all public pages so edits made by admin
// reflect across the whole site (same browser).
// ============================================
(function (global) {
    var STORAGE_KEY = 'churchData';
    var DATA_VERSION = 2;
    var SUNDAY_ADDRESS = '1 Transoranje Rd, Philip Nel Park, Hall (near Danville Clinic)';
    var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var defaultData = {
        services: [
            {
                id: 1,
                name: "Sunday Service",
                day: 0,
                startTime: "12:00",
                endTime: "17:00",
                    type: "Main Worship Service",
                    location: "1 Transoranje Rd, Philip Nel Park, Hall (near Danville Clinic)",
                    description: "Our main weekly worship service with praise, worship, and teaching. Everyone is welcome.",
                    category: "regular",
                    active: true,
                    days: "Sunday"
            },
            {
                id: 2,
                name: "Midnight Prayer",
                day: 2,
                startTime: "00:00",
                endTime: "01:00",
                type: "Night Watch",
                location: "Livestream",
                description: "We gather four nights a week for intense midnight intercession — warring in the spirit, pulling down strongholds, and standing in the gap for families, the church, and nations. Join us live from wherever you are.",
                category: "regular",
                active: true,
                days: "Tue \u2013 Fri"
            },
            {
                id: 3,
                name: "All Night Prayer",
                day: 2,
                startTime: "00:00",
                endTime: "01:00",
                type: "All Night Prayer",
                location: "Livestream",
                description: "All-night prayer and intercession as we seek God together. Join us live from wherever you are.",
                category: "regular",
                active: true,
                days: "Tue \u2013 Fri"
            }
        ],
        specialEvents: [
            {
                id: 101,
                name: "Easter Sunday Service",
                date: "2024-03-31",
                startTime: "09:00",
                endTime: "12:00",
                type: "Special Service",
                location: "Community Hall",
                description: "Celebrate the resurrection of Jesus Christ with special music and message.",
                category: "special",
                active: true
            },
            {
                id: 102,
                name: "Christmas Eve Service",
                date: "2024-12-24",
                startTime: "18:00",
                endTime: "20:00",
                type: "Candlelight Service",
                location: "Community Hall",
                description: "Special candlelight service celebrating the birth of Christ.",
                category: "special",
                active: true
            },
            {
                id: 103,
                name: "November Prayer & Fasting",
                date: "2026-11-01",
                startTime: "06:00",
                endTime: "12:00",
                type: "Consecration",
                location: "1 Transoranje Rd, Philip Nel Park, Hall (near Danville Clinic)",
                description: "21 days of consecration, prayer, and fasting as we seek God for a fresh encounter.",
                category: "special",
                active: true
            }
        ],
        settings: {
            churchName: "Charis Missionary Church",
            location: "Danville Clinic, Philip Nel Park, Pretoria West",
            phone: "+27 (0)63 619 4901",
            email: "pretoriawest@charismissionary.org",
            regularServiceDescription: "Our weekly services and Bible studies. All services are held at the Community Hall next to Danville Clinic.",
            specialEventsDescription: "Join us for these special services and events throughout the year."
        }
    };

    // Clean up stale data saved by older versions of the site
    function migrate(data) {
        if (!data || !Array.isArray(data.services)) return data;
        var v = Number(data._version || 1);
        if (v >= DATA_VERSION) return data;

        if (v < 2) {
            // Keep only ONE Sunday service, preferring the one with the street address.
            var sunday = [];
            var others = [];
            data.services.forEach(function (s) {
                if (/sunday/i.test(String(s.name || ''))) sunday.push(s);
                else others.push(s);
            });
            if (sunday.length > 1) {
                sunday.sort(function (a, b) {
                    var aLoc = /transoranje/i.test(String(a.location || ''));
                    var bLoc = /transoranje/i.test(String(b.location || ''));
                    if (aLoc !== bLoc) return aLoc ? -1 : 1;
                    return 0;
                });
                sunday = sunday.slice(0, 1);
                data.services = others.concat(sunday);
            }
            sunday.forEach(function (s) {
                if (!/transoranje/i.test(String(s.location || ''))) {
                    s.location = SUNDAY_ADDRESS;
                }
                if (!s.days) s.days = 'Sunday';
            });
        }

        data._version = DATA_VERSION;
        save(data);
        return data;
    }

    function save(data) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { }
    }

    function load() {
        var data = null;
        try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { data = null; }
        if (!data || !Array.isArray(data.services) || !Array.isArray(data.specialEvents)) {
            data = JSON.parse(JSON.stringify(defaultData));
            save(data);
        } else {
            data = migrate(data);
        }
        return data;
    }

    function reset() {
        var data = JSON.parse(JSON.stringify(defaultData));
        save(data);
        return data;
    }

    function formatTime24(t) {
        if (!t) return '';
        var p = String(t).split(':');
        if (p.length < 2) return String(t);
        return p[0] + ':' + p[1];
    }

    function formatTime12(t) {
        if (!t) return '';
        var p = String(t).split(':');
        if (p.length < 2) return String(t);
        var h = parseInt(p[0], 10) || 0;
        var m = parseInt(p[1], 10) || 0;
        var ampm = h >= 12 ? 'PM' : 'AM';
        var h12 = h % 12 || 12;
        return h12 + ':' + String(m).padStart(2, '0') + ' ' + ampm;
    }

    function activeServices(data) {
        return (data.services || []).filter(function (s) { return s && s.active; });
    }

    function activeEvents(data) {
        return (data.specialEvents || []).filter(function (e) { return e && e.active; });
    }

    function sundayServices(data) {
        return activeServices(data).filter(function (s) { return Number(s.day) === 0; });
    }

    function sundayTimes(data) {
        return sundayServices(data).map(function (s) { return formatTime24(s.startTime); }).filter(Boolean);
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Fill elements that carry data-church-* placeholders
    // (works for both inline HTML and components loaded via data-include)
    function fillPlaceholders(data) {
        var sunTimes = sundayTimes(data);
        var sunText = sunTimes.length ? sunTimes.join(' & ') : '\u2014';
        document.querySelectorAll('[data-church-times]').forEach(function (el) {
            el.textContent = sunText;
        });

        var sunServices = sundayServices(data);
        document.querySelectorAll('[data-church-sunday-start]').forEach(function (el) {
            el.textContent = sunServices.length ? formatTime12(sunServices[0].startTime) : '\u2014';
        });
        document.querySelectorAll('[data-church-sunday-end]').forEach(function (el) {
            el.textContent = sunServices.length ? formatTime12(sunServices[0].endTime) : '\u2014';
        });

        var settings = data.settings || {};
        document.querySelectorAll('[data-church-phone]').forEach(function (el) {
            el.textContent = settings.phone || '';
        });
        document.querySelectorAll('[data-church-email]').forEach(function (el) {
            el.textContent = settings.email || '';
        });
        document.querySelectorAll('[data-church-location]').forEach(function (el) {
            el.textContent = settings.location || '';
        });
    }

    // Render active regular services as service cards (index / home style)
    function renderServiceCards(container, data, opts) {
        if (!container) return;
        opts = opts || {};
        var services = activeServices(data);

        if (!services.length) {
            container.innerHTML = '<p style="text-align:center;color:var(--gray);">No services scheduled yet.</p>';
            return;
        }

        var palette = ['svc-card--blue', 'svc-card--rose'];
        container.innerHTML = services.map(function (s, i) {
            var isMidnight = /midnight/i.test(s.name || '');
            var note = escapeHtml(s.description || s.type || '');
            var cta = isMidnight
                ? '<a href="' + (opts.liveHref || 'Live.html') + '" class="svc-btn svc-btn--ghost"><i class="fas fa-video"></i> Watch Live</a>'
                : '<a href="' + (opts.ctaHref || 'events.html') + '" class="svc-btn svc-btn--primary"><i class="fas fa-hand-holding-heart"></i> Join Us</a>';
            return '' +
                '<div class="svc-card ' + palette[i % palette.length] + '">' +
                    '<div class="svc-day">' + DAY_NAMES[Number(s.day) % 7] + '</div>' +
                    '<h3>' + escapeHtml(s.name) + '</h3>' +
                    '<div class="svc-time">' + formatTime24(s.startTime) + ' &ndash; ' + formatTime24(s.endTime) + '</div>' +
                    (note ? '<div class="svc-note">' + note + '</div>' : '') +
                    cta +
                '</div>';
        }).join('');
    }

    // Render the recurring gatherings for events.html.
    // Cards are driven by admin data (services whose name matches).
    function renderEventsList(container, data) {
        if (!container) return;
        var cards = [];

        function score(s) {
            var n = String(s.name || '').toLowerCase();
            if (/sunday/.test(n)) return 0;
            if (/midnight/.test(n)) return 1;
            return -1;
        }

        var services = activeServices(data)
            .map(function (s) { return { s: s, sc: score(s) }; })
            .filter(function (x) { return x.sc >= 0; })
            .sort(function (a, b) {
                if (a.sc !== b.sc) return a.sc - b.sc;
                // Prefer the card with the street address (Transoranje Rd)
                var aLoc = /transoranje/i.test(String(a.s.location || ''));
                var bLoc = /transoranje/i.test(String(b.s.location || ''));
                if (aLoc !== bLoc) return aLoc ? -1 : 1;
                return 0;
            });

        // Show only one card per gathering type (avoids duplicates)
        var seen = {};
        services = services.filter(function (x) {
            if (seen[x.sc]) return false;
            seen[x.sc] = true;
            return true;
        }).map(function (x) { return x.s; });

        services.forEach(function (s) {
            var sc = score(s);
            var daysLabel = s.days || DAY_SHORT[Number(s.day) % 7];
            var isLive = sc > 0;

            var tag = sc === 0 ? 'tag-sunday' : 'tag-special';
            var tagLabel = sc === 0 ? 'Sunday Service' : 'Night Watch';

            var meta = '<span><i class="fas fa-calendar-days"></i> ' + escapeHtml(daysLabel) + '</span>' +
                       '<span><i class="fas fa-clock"></i> ' + formatTime24(s.startTime) + ' \u2013 ' + formatTime24(s.endTime) + '</span>' +
                       (s.location ? '<span><i class="fas fa-location-dot"></i> ' + escapeHtml(s.location) + '</span>' : '');

            var cta = isLive
                ? '<a href="Live.html" class="event-btn event-btn--ghost"><i class="fas fa-video"></i> Watch Live</a>'
                : '<a href="Service Time.html" class="event-btn event-btn--primary"><i class="fas fa-hand-holding-heart"></i> Join Us</a>';

            cards.push(
                '<div class="event-card">' +
                    '<div class="event-date"><span class="day">' + DAY_SHORT[Number(s.day) % 7] + '</span><span class="month">Weekly</span></div>' +
                    '<div class="event-info">' +
                        '<span class="event-tag ' + tag + '">' + tagLabel + '</span>' +
                        '<h3>' + escapeHtml(s.name) + '</h3>' +
                        '<div class="meta">' + meta + '</div>' +
                        (s.description ? '<p>' + escapeHtml(s.description) + '</p>' : '') +
                        '<div class="event-actions">' + cta + '</div>' +
                    '</div>' +
                '</div>'
            );
        });

        // Add the November Prayer & Fasting season (admin-editable special event)
        activeEvents(data).filter(function (e) {
            return /fasting/i.test(String(e.name || ''));
        }).forEach(function (e) {
            var d = new Date(e.date);
            var day = isNaN(d.getTime()) ? 'TBD' : String(d.getDate());
            var month = isNaN(d.getTime()) ? '' : MONTHS[d.getMonth()];
            cards.push(
                '<div class="event-card">' +
                    '<div class="event-date"><span class="day">' + day + '</span><span class="month">' + month + '</span></div>' +
                    '<div class="event-info">' +
                        '<span class="event-tag tag-special">' + escapeHtml(e.type || 'Consecration') + '</span>' +
                        '<h3>' + escapeHtml(e.name) + '</h3>' +
                        '<div class="meta">' +
                            '<span><i class="fas fa-clock"></i> ' + formatTime24(e.startTime) + ' \u2013 ' + formatTime24(e.endTime) + '</span>' +
                            (e.location ? '<span><i class="fas fa-location-dot"></i> ' + escapeHtml(e.location) + '</span>' : '') +
                        '</div>' +
                        (e.description ? '<p>' + escapeHtml(e.description) + '</p>' : '') +
                    '</div>' +
                '</div>'
            );
        });

        container.innerHTML = cards.length
            ? cards.join('')
            : '<p style="text-align:center;color:var(--gray);padding:40px 0;">No gatherings scheduled yet.</p>';
    }

    // Render mini events for pages/home.html
    function renderHomeEvents(container, data) {
        if (!container) return;
        var items = [];
        var max = 3;

        activeServices(data).slice(0, max).forEach(function (s) {
            var day = DAY_SHORT[Number(s.day) % 7];
            items.push(
                '<div class="event-card"><div class="event-date"><span class="day">' + day + '</span><span>Weekly</span></div>' +
                '<div class="event-info"><h4>' + escapeHtml(s.name) + '</h4>' +
                '<div class="event-loc"><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(s.location || '') + ' | ' + formatTime12(s.startTime) + '</div></div></div>'
            );
        });

        activeEvents(data).slice().sort(function (a, b) {
            return String(a.date || '').localeCompare(String(b.date || ''));
        }).slice(0, max).forEach(function (e) {
            var d = new Date(e.date);
            var day = isNaN(d.getTime()) ? 'TBD' : String(d.getDate());
            var month = isNaN(d.getTime()) ? '' : MONTHS[d.getMonth()];
            items.push(
                '<div class="event-card"><div class="event-date"><span class="day">' + day + '</span><span>' + month + '</span></div>' +
                '<div class="event-info"><h4>' + escapeHtml(e.name) + '</h4>' +
                '<div class="event-loc"><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(e.location || '') + (e.startTime ? ' | ' + formatTime12(e.startTime) : '') + '</div></div></div>'
            );
        });

        container.innerHTML = items.length
            ? items.join('')
            : '<p style="text-align:center;color:var(--gray);">No upcoming gatherings.</p>';
    }

    function run() {
        fillPlaceholders(load());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
    document.addEventListener('includesLoaded', run);

    global.ChurchData = {
        load: load,
        save: save,
        reset: reset,
        formatTime24: formatTime24,
        formatTime12: formatTime12,
        sundayTimes: sundayTimes,
        activeServices: activeServices,
        activeEvents: activeEvents,
        renderServiceCards: renderServiceCards,
        renderEventsList: renderEventsList,
        renderHomeEvents: renderHomeEvents,
        defaultData: defaultData,
        DAY_NAMES: DAY_NAMES,
        DAY_SHORT: DAY_SHORT
    };
})(window);
