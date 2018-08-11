import TimeSlot from './models/TimeSlot';
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

function setValidationMessage(timeInputs) {
  // Tracks validity of [startTimeInput, endTimeInput]
  const validityCheck = [1, 1];
  // Potential timeslot to add
  const timeSlot = new TimeSlot(timeInputs[0].value, timeInputs[1].value);
  // List of timeslots in database
  const timeSlots = state.eventDatabase.getTimeSlots(state.activeDay);

  if (!timeSlot.validateTimeRange()) {
    timeInputs[1].setCustomValidity('End time should be after the Start time.');
    validityCheck[1] = 0;
  } else if (timeSlot.validateNoTimeOverlap(timeSlots) !== 'OK') {
    const error = timeSlot.validateNoTimeOverlap(timeSlots);
    if (error === 'INVALID_START') {
      timeInputs[0].setCustomValidity('You can\'t have overlapping event times.');
      validityCheck[0] = 0;
    } else if (error === 'INVALID_END') {
      timeInputs[1].setCustomValidity('You can\'t have overlapping event times.');
      validityCheck[1] = 0;
    }
  } else if (!timeSlot.validateNoSubEvents(timeSlots)) {
    timeInputs[1].setCustomValidity('An event is already inside this timeslot.');
    validityCheck[1] = 0;
  }

  if (validityCheck[0] === 1) {
    timeInputs[0].setCustomValidity('');
  }

  if (validityCheck[1] === 1) {
    timeInputs[1].setCustomValidity('');
  }
}

/*-------------------------------------------*/
/* EVENT LISTENERS */
/*-------------------------------------------*/

/* -------------------------MENU BUTTONS--------------------------------*/

DOMobjects.btnNew.addEventListener('click', () => fadeIn(DOMobjects.newEventUI));
DOMobjects.btnNewBack.addEventListener('click', () => {
  // Fade out animation
  fadeOut(DOMobjects.newEventUI);
  // Reset form after animation is done
  setTimeout(() => {
    formView.resetNewEventForm();
  }, 300);
});

DOMobjects.btnClone.addEventListener('click', () => fadeIn(DOMobjects.cloneRoutineUI));
DOMobjects.btnCloneBack.addEventListener('click', () => {
  // Fade out animation
  fadeOut(DOMobjects.cloneRoutineUI);
  // Reset form after animation is done
  setTimeout(() => {
    formView.resetCloneForm();
  }, 300);
});

DOMobjects.btnReset.addEventListener('click', () => fadeIn(DOMobjects.resetRoutineUI));
DOMobjects.btnResetBack.addEventListener('click', () => fadeOut(DOMobjects.resetRoutineUI));

DOMobjects.btnOptions.addEventListener('click', formView.openOptionsMenu);
DOMobjects.btnOptionsBack.addEventListener('click', formView.closeOptionsMenu);

/* ------------------------FORM INPUTS------------------------------*/

DOMobjects.startTimeInput.addEventListener('input', () => {
  const timeInputs = [DOMobjects.startTimeInput, DOMobjects.endTimeInput];
  setValidationMessage(timeInputs);
});
DOMobjects.endTimeInput.addEventListener('input', () => {
  const timeInputs = [DOMobjects.startTimeInput, DOMobjects.endTimeInput];
  setValidationMessage(timeInputs);
});
DOMobjects.newEventForm.addEventListener('submit', () => {
  const event = formView.getInputData();
  eventController.addEvent(event, state);
  fadeOut(DOMobjects.newEventUI);
  formView.resetNewEventForm();
});

/* -------------------------WEEK BUTTONS--------------------------------*/

DOMobjects.week.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON' && state.activeDay !== e.target.textContent) {
    // Copy new active day into state
    state.activeDay = e.target.textContent;
    // Change displayed active day
    menuView.changeActiveDay(e);
    // Disable selecting active day for cloning
    formView.updateCloneRoutineChoices(state.activeDay);
    // Switch active day's schedule
    DOMobjects.routineContainer.style.opacity = 0;
    setTimeout(() => {
      eventController.refreshSchedule(state);
      DOMobjects.routineContainer.style.opacity = 1;
    }, 600);
  }
});

DOMobjects.cloneRoutineDaysContainer.addEventListener('click', (event) => {
  if (event.target.tagName === 'BUTTON') {
    event.target.classList.toggle('selected');
  }
});

/* -------------------------EVENT BUTTONS--------------------------------*/
