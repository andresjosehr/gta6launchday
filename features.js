// Extra features: launch notification, trailers modal.

const NOTIFY_KEY = 'gta6-notify';
const NOTIFIED_KEY = 'gta6-notified';

export const TRAILERS = [
    { id: 'QdBZY2fkU-0', key: 'trailer1' },
    { id: 'VQRLujxTm3c', key: 'trailer2' }
];

function storageGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
}

function storageSet(key, value) {
    try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
    } catch {}
}

/**
 * Browser notification fired once when the countdown reaches zero.
 * Works while the page is open (in any tab); there is no push server.
 * @param {() => object} getTexts returns the active translation object
 */
export function createLaunchNotifier(getTexts) {
    const button = document.getElementById('notify-btn');
    const label = document.getElementById('notify-label');
    const supported = 'Notification' in window;

    const isSubscribed = () => storageGet(NOTIFY_KEY) === 'on';
    const permission = () => (supported ? Notification.permission : 'unsupported');

    function render() {
        if (!button || !label) return;
        const t = getTexts();
        let state = 'off';
        if (!supported) state = 'unsupported';
        else if (permission() === 'denied') state = 'blocked';
        else if (isSubscribed() && permission() === 'granted') state = 'on';

        const text = {
            off: t.notifyMe,
            on: t.notifyOn,
            blocked: t.notifyBlocked,
            unsupported: t.notifyUnsupported
        }[state];
        label.textContent = text;
        button.dataset.state = state;
        button.setAttribute('aria-pressed', String(state === 'on'));
        button.disabled = state === 'blocked' || state === 'unsupported';
        button.title = text;
    }

    async function toggle() {
        if (!supported) return render();
        if (isSubscribed() && permission() === 'granted') {
            storageSet(NOTIFY_KEY, null);
            return render();
        }
        let result = permission();
        if (result === 'default') {
            try { result = await Notification.requestPermission(); } catch { result = 'denied'; }
        }
        if (result === 'granted') storageSet(NOTIFY_KEY, 'on');
        render();
    }

    /** Call on every tick; fires the notification once when the wait is over. */
    function check(targetDate, now = Date.now()) {
        if (now < targetDate) return false;
        if (!supported || permission() !== 'granted' || !isSubscribed()) return false;
        if (storageGet(NOTIFIED_KEY) === String(targetDate)) return false;

        storageSet(NOTIFIED_KEY, String(targetDate));
        const t = getTexts();
        try {
            const notification = new Notification(t.notificationTitle, {
                body: t.notificationBody,
                icon: '/assets/images/vi.webp',
                tag: 'gta6-launch'
            });
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } catch {
            // Some mobile browsers only allow notifications from a service worker.
            return false;
        }
        return true;
    }

    button?.addEventListener('click', toggle);
    render();

    return { render, check };
}

/**
 * Trailers modal with YouTube (privacy-enhanced) embeds.
 * The iframe is only loaded while the modal is open, so playback stops on close.
 * @param {() => object} getTexts returns the active translation object
 */
export function createTrailerModal(getTexts) {
    const openButton = document.getElementById('trailers-btn');
    const modal = document.getElementById('trailer-modal');
    const closeButton = document.getElementById('trailer-close');
    const tabs = document.getElementById('trailer-tabs');
    const iframe = document.getElementById('trailer-iframe');
    if (!openButton || !modal || !tabs || !iframe) return { render() {} };

    let current = TRAILERS[TRAILERS.length - 1].id;

    function select(id) {
        current = id;
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
        tabs.querySelectorAll('.trailer-tab').forEach(tab => {
            const active = tab.dataset.id === id;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', String(active));
        });
    }

    function render() {
        const t = getTexts();
        tabs.innerHTML = TRAILERS.map(({ id, key }) => `
            <button type="button" class="trailer-tab${id === current ? ' active' : ''}" role="tab"
                aria-selected="${id === current}" data-id="${id}">${t[key]}</button>
        `).join('');
        closeButton?.setAttribute('aria-label', t.close);
    }

    function open() {
        render();
        if (typeof modal.showModal === 'function') modal.showModal();
        else modal.setAttribute('open', '');
        select(current);
    }

    function close() {
        if (typeof modal.close === 'function') modal.close();
        else modal.removeAttribute('open');
    }

    openButton.addEventListener('click', open);
    closeButton?.addEventListener('click', close);
    tabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.trailer-tab');
        if (tab) select(tab.dataset.id);
    });
    // Click on the backdrop closes the modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });
    // Stop the video whenever the dialog closes (button, backdrop or Esc)
    modal.addEventListener('close', () => { iframe.removeAttribute('src'); });

    render();
    return { render };
}
