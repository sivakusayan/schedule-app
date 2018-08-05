import EventDatabase from './models/EventDatabase';
import * as eventController from './controllers/eventController';
import { DOMobjects, fadeIn, fadeOut } from './views/base';
import * as formView from './views/formView';
import * as menuView from './views/menuView';

const state = {
  activeDay: 'FRI',
  selectedEvent: null,
  eventDatabase: new EventDatabase(),
};

const setupConfigureForm = (index) => {
  state.selectedEvent = state.eventDatabase[state.activeDay][index];
  formView.setConfigData(state.selectedEvent);
  state.eventDatabase.deleteFromDatabase(index, state.activeDay);
};

/*-------------------------------------------*/
/* EVENT LISTENERS */
/*-------------------------------------------*/

/* -------------------------MENU BUTTONS--------------------------------*/

DOMobjects.btnNew.addEventListener('click', () => fadeIn(DOMobjects.newEventUI));
DOMobjects.btnNewBack.addEventListener('click', () => {
  fadeOut(DOMobjects.newEventUI);
  setTimeout(() => {
    formView.resetNewEventForm();
  }, 300);
});

DOMobjects.btnClone.addEventListener('click', () => fadeIn(DOMobjects.cloneRoutineUI));
DOMobjects.btnCloneBack.addEventListener('click', () => {
  fadeOut(DOMobjects.cloneRoutineUI);
  formView.resetCloneForm();
});

DOMobjects.btnReset.addEventListener('click', () => fadeIn(DOMobjects.resetRoutineUI));
DOMobjects.btnResetBack.addEventListener('click', () => fadeOut(DOMobjects.resetRoutineUI));

DOMobjects.btnOptions.addEventListener('click', formView.openOptionsMenu);
DOMobjects.btnOptionsBack.addEventListener('click', formView.closeOptionsMenu);

/* -------------------------WEEK BUTTONS--------------------------------*/

DOMobjects.week.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON' && state.activeDay !== e.target.textContent) {
    state.activeDay = e.target.textContent;
    menuView.changeActiveDay(e);
    formView.updateCloneRoutineChoices(state.activeDay);
    DOMobjects.routineContainer.style.opacity = 0;
    setTimeout(() => {
      eventController.refreshSchedule();
      DOMobjects.routineContainer.style.opacity = 1;
    }, 600);
  }
});
