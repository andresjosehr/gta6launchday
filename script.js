import { translations, detectLanguage } from './translations.js';
import { createLaunchNotifier, createTrailerModal } from './features.js';

document.addEventListener('DOMContentLoaded', () => {
    // Zona horaria: la del navegador por defecto, o la elegida en el selector
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    function isValidTimeZone(tz) {
        try {
            new Intl.DateTimeFormat('en-US', { timeZone: tz });
            return true;
        } catch {
            return false;
        }
    }

    // Diferencia (ms) entre la hora local de `tz` y UTC en el instante `timestamp`
    function getTimeZoneOffset(tz, timestamp) {
        const parts = {};
        new Intl.DateTimeFormat('en-US', {
            timeZone: tz, hourCycle: 'h23',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).formatToParts(new Date(timestamp)).forEach(({ type, value }) => { parts[type] = value; });
        const asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
        return asUTC - Math.floor(timestamp / 1000) * 1000;
    }

    // Instante UTC que corresponde a esa fecha/hora local en `tz`
    function zonedTime(tz, year, month, day) {
        const guess = Date.UTC(year, month, day);
        let result = guess - getTimeZoneOffset(tz, guess);
        result = guess - getTimeZoneOffset(tz, result);
        return result;
    }

    let savedTimeZone = null;
    try { savedTimeZone = localStorage.getItem('gta6-timezone'); } catch {}
    let currentTimeZone = savedTimeZone && isValidTimeZone(savedTimeZone) ? savedTimeZone : browserTimeZone;

    // Fecha objetivo: 19 de noviembre de 2026 a las 00:00 en la zona horaria seleccionada
    let targetDate;
    let startDate;
    function computeDates() {
        targetDate = zonedTime(currentTimeZone, 2026, 10, 19);
        startDate = zonedTime(currentTimeZone, 2025, 10, 6);
    }
    computeDates();

    function formatOffset(tz) {
        const minutes = Math.round(getTimeZoneOffset(tz, Date.now()) / 60000);
        const sign = minutes < 0 ? '-' : '+';
        const abs = Math.abs(minutes);
        const h = Math.floor(abs / 60);
        const m = abs % 60;
        return `GMT${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
    }

    function initTimeZoneSelector() {
        const select = document.getElementById('tz-select');
        if (!select) return;

        let zones = [];
        try { zones = Intl.supportedValuesOf('timeZone'); } catch {}
        zones = Array.from(new Set([...zones, browserTimeZone, currentTimeZone, 'UTC']));

        const groups = {};
        zones.forEach(tz => {
            const slash = tz.indexOf('/');
            const region = slash === -1 ? 'Other' : tz.slice(0, slash);
            const city = (slash === -1 ? tz : tz.slice(slash + 1)).replace(/_/g, ' ').replace(/\//g, ' / ');
            (groups[region] ||= []).push({ tz, label: `${city} (${formatOffset(tz)})` });
        });

        select.innerHTML = Object.keys(groups).sort().map(region => `
            <optgroup label="${region}">
                ${groups[region].sort((a, b) => a.label.localeCompare(b.label))
                    .map(({ tz, label }) => `<option value="${tz}">${label}</option>`).join('')}
            </optgroup>
        `).join('');
        select.value = currentTimeZone;

        select.addEventListener('change', () => {
            currentTimeZone = select.value;
            try { localStorage.setItem('gta6-timezone', currentTimeZone); } catch {}
            computeDates();
            updateCountdown();
        });
    }

    // Language management
    let currentLanguage = detectLanguage();
    // Active texts, falling back to English for any missing key
    const getTexts = () => ({ ...translations.en, ...translations[currentLanguage] });
    let notifier = null;
    let trailerModal = null;

    function updateLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('gta6-language', lang);

        const t = getTexts();

        // Update all translatable elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                el.textContent = t[key];
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Handle RTL languages
        if (t.rtl) {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }

        // Update meta tags
        document.title = t.meta.title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', t.meta.title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', t.meta.ogDescription);
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', t.meta.title);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', t.meta.ogDescription);

        // Update language selector display
        const currentFlag = document.getElementById('current-flag');
        const currentLang = document.getElementById('current-lang');
        if (currentFlag) currentFlag.textContent = t.flag;
        if (currentLang) currentLang.textContent = lang.toUpperCase();

        // Refresh texts rendered by the extra features
        notifier?.render();
        trailerModal?.render();

        // Close dropdown
        const dropdown = document.getElementById('lang-dropdown');
        if (dropdown) dropdown.classList.remove('open');
    }

    function initLanguageSelector() {
        const toggle = document.getElementById('lang-toggle');
        const dropdown = document.getElementById('lang-dropdown');

        if (!toggle || !dropdown) return;

        // Populate dropdown
        dropdown.innerHTML = Object.entries(translations).map(([code, lang]) => `
            <button class="lang-option" data-lang="${code}">
                <span class="lang-flag">${lang.flag}</span>
                <span class="lang-name">${lang.name}</span>
            </button>
        `).join('');

        // Toggle dropdown
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        // Handle language selection
        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.lang-option');
            if (option) {
                const lang = option.getAttribute('data-lang');
                updateLanguage(lang);
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('open');
        });

        // Initialize with detected language
        updateLanguage(currentLanguage);
    }

    initLanguageSelector();
    notifier = createLaunchNotifier(getTexts);
    trailerModal = createTrailerModal(getTexts);

    // Get individual digit elements
    const daysHundreds = document.getElementById('days-hundreds');
    const daysTens = document.getElementById('days-tens');
    const daysUnits = document.getElementById('days-units');
    const hoursTens = document.getElementById('hours-tens');
    const hoursUnits = document.getElementById('hours-units');
    const minutesTens = document.getElementById('minutes-tens');
    const minutesUnits = document.getElementById('minutes-units');
    const secondsTens = document.getElementById('seconds-tens');
    const secondsUnits = document.getElementById('seconds-units');

    function setDigits(tens, units, value) {
        const str = value.toString().padStart(2, '0');
        tens.innerText = str[0];
        units.innerText = str[1];
    }

    function setDaysDigits(hundreds, tens, units, value) {
        const str = value.toString().padStart(3, '0');
        hundreds.innerText = str[0];
        tens.innerText = str[1];
        units.innerText = str[2];
        // Ocultar ceros a la izquierda (siempre se muestra al menos una cifra)
        hundreds.style.display = value >= 100 ? '' : 'none';
        tens.style.display = value >= 10 ? '' : 'none';
        // Con 0 días se oculta la columna de días completa
        const hide = value === 0 ? 'none' : '';
        document.getElementById('days-unit').style.display = hide;
        document.getElementById('days-separator').style.display = hide;
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            // Timer expired
            setDaysDigits(daysHundreds, daysTens, daysUnits, 0);
            setDigits(hoursTens, hoursUnits, 0);
            setDigits(minutesTens, minutesUnits, 0);
            setDigits(secondsTens, secondsUnits, 0);
            notifier?.check(targetDate, now);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setDaysDigits(daysHundreds, daysTens, daysUnits, days);
        setDigits(hoursTens, hoursUnits, hours);
        setDigits(minutesTens, minutesUnits, minutes);
        setDigits(secondsTens, secondsUnits, seconds);

        // Progress Bar Logic
        const totalDuration = targetDate - startDate;
        const elapsed = now - startDate;
        
        let percentage = (elapsed / totalDuration) * 100;
        
        // Clamp percentage between 0 and 100
        percentage = Math.max(0, Math.min(100, percentage));
        
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        if (progressBar && progressText) {
            progressBar.style.width = `${percentage}%`;
            progressText.innerText = `${percentage.toFixed(2)}%`;
        }
    }

    initTimeZoneSelector();

    // Initial call
    updateCountdown();

    // Update every second
    setInterval(updateCountdown, 1000);
});
