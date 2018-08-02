export const DOMobjects = {
  week: document.querySelector('.week'),
  activeDayDisplay: document.querySelector('.menu__activeDay'),

  overlay: document.getElementById('overlay'),

  btnNew: document.getElementById('btnNew'),
  btnNewBack: document.getElementById('btnNewBack'),
  newEventUI: document.querySelector('.newEventUI'),
  newEventForm: document.getElementById('newEventForm'),
  nameInput: document.getElementById('nameInput'),
  startTimeInput: document.getElementById('startTimeInput'),
  endTimeInput: document.getElementById('endTimeInput'),
  notesInput: document.getElementById('notesInput'),
  newEventSubmit: document.querySelector('.newEventUI__submit'),

  btnClone: document.getElementById('btnClone'),
  btnCloneBack: document.getElementById('btnCloneBack'),
  cloneRoutineUI: document.querySelector('.cloneRoutineUI'),
  cloneRoutineForm: document.getElementById('cloneRoutineForm'),
  cloneRoutineDaysContainer: document.querySelector('.cloneRoutineUI__daysContainer'),
  cloneRoutineDays: document.querySelectorAll('.cloneRoutineUI__day'),
  cloneRoutineSelectedDays: document.querySelectorAll('.selected'),

  btnReset: document.getElementById('btnReset'),
  btnResetBack: document.getElementById('btnResetBack'),
  resetRoutineUI: document.querySelector('.resetRoutineUI'),
  resetRoutineYes: document.querySelector('.resetRoutineUI__YES'),
  resetRoutineNo: document.querySelector('.resetRoutineUI__NO'),

  btnOptions: document.getElementById('btnOptions'),
  btnOptionsBack: document.getElementById('btnOptionsBack'),

  weekContainer: document.querySelector('.weekContainer'),

  routineContainer: document.querySelector('.routineContainer'),

  btnConfigBack: document.getElementById('btnConfigBack'),
  configEventUI: document.querySelector('.configEventUI'),
  configEventForm: document.getElementById('configEventForm'),
  nameConfigInput: document.getElementById('nameConfigInput'),
  startTimeConfigInput: document.getElementById('startTimeConfigInput'),
  endTimeConfigInput: document.getElementById('endTimeConfigInput'),
  notesConfigInput: document.getElementById('notesConfigInput'),
  configEventSubmit: document.querySelector('.configEventUI__submit'),
};

export const toStandardTime = (militaryTime) => {
  let standardTime;
  const hours = Number(militaryTime.split(':')[0]);
  const minutes = militaryTime.split(':')[1];

  if (hours > 12) {
    standardTime = `${hours % 12}:${minutes} PM`;
  } else if (hours === 12) {
    standardTime = `${hours}:${minutes} PM`;
  } else if (hours === 0) {
    standardTime = `${hours + 12}:${minutes} AM`;
  } else if (hours <= 12) {
    standardTime = `${hours}:${minutes} AM`;
  }

  return standardTime;
};

const darkenScreen = () => {
  DOMobjects.overlay.classList.remove('overlayOFF');
  DOMobjects.overlay.classList.add('overlayON');
};

const lightenScreen = () => {
  DOMobjects.overlay.classList.remove('overlayON');
  DOMobjects.overlay.classList.add('overlayFADE');

  setTimeout(() => {
    DOMobjects.overlay.classList.remove('overlayFADE');
    DOMobjects.overlay.classList.add('overlayOFF');
  }, 300);
};

export const fadeIn = (domObj) => {
  darkenScreen();
  domObj.style.visibility = 'visible';
  domObj.style.opacity = 1;
};

export const fadeOut = (domObj) => {
  lightenScreen();
  domObj.style.opacity = 0;
  setTimeout(() => {
    domObj.style.visibility = 'hidden';
  }, 300);
};
