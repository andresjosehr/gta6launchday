document.addEventListener('DOMContentLoaded', () => {
    // Set target date to November 19, 2026
    const targetDate = new Date('2026-11-19T00:00:00').getTime();

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
        const startDate = new Date('2025-11-06T00:00:00').getTime();
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

    // Initial call
    updateCountdown();

    // Update every second
    setInterval(updateCountdown, 1000);
});
