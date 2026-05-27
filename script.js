// 1. Анхны өгөгдлийг өнөөдрийн огноогоор тааруулж тохируулах
let today = new Date();

// Анхны утга: Сарын тэмдэг 7 хоногийн өмнө эхэлсэн гэж жишээ авав
let defaultStart = new Date();
defaultStart.setDate(today.getDate() - 7);

const state = {
    lastPeriodStart: defaultStart,
    cycleLength: 28,
    periodLength: 5,
    currentCalendarMonth: today.getMonth(),
    currentCalendarYear: today.getFullYear()
};

// Монгол сарын нэрс
const monthNames = ["1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р са r", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"];

// DOM Элементүүд
const startDateInput = document.getElementById('startDateInput');
const cycleLengthInput = document.getElementById('cycleLengthInput');
const periodLengthInput = document.getElementById('periodLengthInput');
const currentDayTxt = document.getElementById('currentDayTxt');
const phaseBadgeTxt = document.getElementById('phaseBadgeTxt');
const daysLeftTxt = document.getElementById('daysLeftTxt');
const calendarMonthYear = document.getElementById('calendarMonthYear');
const daysGrid = document.getElementById('daysGrid');

// Огноог 'YYYY-MM-DD' хэлбэрт оруулах (Input-д зориулж)
function formatDateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Хоёр огнооны зөрүүг хоногоор бодох
function getDaysDiff(date1, date2) {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
}

// ХУАНЛИД ЗОРИУЛСАН ЗӨВ ЛОГИК (Эсрэгээрээ харагдаж байсныг засав)
function getDayPhase(targetDate) {
    let diff = getDaysDiff(targetDate, state.lastPeriodStart);
    
    // Хэрэв өмнөх эсвэл дараагийн циклд байвал одоогийн циклд шилжүүлэх
    if (diff < 0) {
        while (diff < 0) diff += state.cycleLength;
    }
    
    const cycleDay = (diff % state.cycleLength) + 1;

    const ovulationDay = state.cycleLength - 14; 
    const fertileStart = ovulationDay - 5;       
    const fertileEnd = ovulationDay + 1;         

    if (cycleDay <= state.periodLength) return 'period';
    if (cycleDay === ovulationDay) return 'ovulation';
    if (cycleDay >= fertileStart && cycleDay <= fertileEnd) return 'fertile';
    return 'safe';
}

// Үндсэн UI шинэчлэх функц
function updateTracker() {
    let diffDays = getDaysDiff(today, state.lastPeriodStart);
    
    if (diffDays < 0) {
        while (diffDays < 0) diffDays += state.cycleLength;
    }
    
    let currentCycleDay = (diffDays % state.cycleLength) + 1;
    const daysLeft = state.cycleLength - currentCycleDay;

    const ovulationDay = state.cycleLength - 14;
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay + 1;

    let phaseName = 'Аюулгүй үе';
    let badgeBg = 'var(--color-safe-bg)';
    let badgeColor = 'var(--color-safe)';

    if (currentCycleDay <= state.periodLength) {
        phaseName = 'Сарын тэмдэг';
        badgeBg = 'var(--color-period-bg)';
        badgeColor = 'var(--color-period)';
    } else if (currentCycleDay >= fertileStart && currentCycleDay <= fertileEnd) {
        phaseName = (currentCycleDay === ovulationDay) ? 'Оввуляци' : 'Үр тогтох үе';
        badgeBg = 'var(--color-fertile-bg)';
        badgeColor = 'var(--color-fertile)';
    }

    // Бичвэрүүд солих
    currentDayTxt.innerText = currentCycleDay;
    phaseBadgeTxt.innerText = phaseName;
    phaseBadgeTxt.style.backgroundColor = badgeBg;
    phaseBadgeTxt.style.color = badgeColor;
    
    if(daysLeft === 0) {
        daysLeftTxt.innerHTML = "Маргааш дараагийн мөчлөг эхэлнэ.";
    } else {
        daysLeftTxt.innerHTML = `Дараагийн мөчлөг ирэхэд <b>${daysLeft} хоног</b> үлдлээ.`;
    }

    // Тойрог зурах
    drawCircle(currentCycleDay, state.cycleLength, badgeColor);
    // Хуанли зурах
    renderCalendar();
}

// Canvas дээр тойрог зурагч
function drawCircle(current, total, color) {
    const canvas = document.getElementById('circleCanvas');
    const ctx = canvas.getContext('2d');
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    const radius = 95;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Суурь тойрог
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#f2f2f7';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Прогресс дугуй
    const startAngle = -0.5 * Math.PI;
    const endAngle = ((current / total) * 2 * Math.PI) + startAngle;

    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();
}

// Хуанли үүсгэгч функц
function renderCalendar() {
    calendarMonthYear.innerText = `${state.currentCalendarYear} оны ${monthNames[state.currentCalendarMonth]}`;
    daysGrid.innerHTML = '';

    let firstDayIndex = new Date(state.currentCalendarYear, state.currentCalendarMonth, 1).getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const totalDaysInMonth = new Date(state.currentCalendarYear, state.currentCalendarMonth + 1, 0).getDate();

    // Хоосон нүд шахна
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'empty');
        daysGrid.appendChild(emptyCell);
    }

    // Өдрүүдийг гогцоодон хэвлэнэ
    for (let day = 1; day <= totalDaysInMonth; day++) {
        const cell = document.createElement('div');
        cell.classList.add('day-cell');
        cell.innerText = day;

        const cellDate = new Date(state.currentCalendarYear, state.currentCalendarMonth, day);
        
        if (getDaysDiff(cellDate, today) === 0) {
            cell.classList.add('today');
        }

        const phase = getDayPhase(cellDate);
        if (phase === 'period') cell.classList.add('period');
        if (phase === 'fertile') cell.classList.add('fertile');
        if (phase === 'ovulation') cell.classList.add('ovulation');

        // Өдөр дээр дарахад шинэчлэх
        cell.addEventListener('click', () => {
            state.lastPeriodStart = cellDate;
            startDateInput.value = formatDateToISO(cellDate);
            updateTracker();
        });

        daysGrid.appendChild(cell);
    }
}

// Сонсогчид (Event Listeners)
startDateInput.addEventListener('change', (e) => {
    if(e.target.value) {
        state.lastPeriodStart = new Date(e.target.value);
        updateTracker();
    }
});

cycleLengthInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value);
    if(val >= 20 && val <= 45) {
        state.cycleLength = val;
        updateTracker();
    }
});

periodLengthInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value);
    if(val >= 2 && val <= 10) {
        state.periodLength = val;
        updateTracker();
    }
});

document.getElementById('prevMonthBtn').addEventListener('click', () => {
    state.currentCalendarMonth--;
    if (state.currentCalendarMonth < 0) {
        state.currentCalendarMonth = 11;
        state.currentCalendarYear--;
    }
    renderCalendar();
});

document.getElementById('nextMonthBtn').addEventListener('click', () => {
    state.currentCalendarMonth++;
    if (state.currentCalendarMonth > 11) {
        state.currentCalendarMonth = 0;
        state.currentCalendarYear++;
    }
    renderCalendar();
});

// Аппыг ажиллуулж эхлэх
startDateInput.value = formatDateToISO(state.lastPeriodStart);
updateTracker();