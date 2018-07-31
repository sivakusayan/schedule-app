/*-----------------------------------------------------------------------------*/
/* SCHEDULE CONTROLLER */
/*-----------------------------------------------------------------------------*/

const scheduleController = (function () {
  class Event {
    constructor(name, startTime, endTime, notes) {
      this.name = name;
      this.startTime = startTime;
      this.endTime = endTime;
      this.notes = notes;
    }
  }

  const eventDatabase = {
    MON: [],
    TUE: [],
    WED: [],
    THU: [],
    FRI: [],
    SAT: [],
    SUN: [],
  };

  const reservedTimeSlots = {
    MON: [],
    TUE: [],
    WED: [],
    THU: [],
    FRI: [],
    SAT: [],
    SUN: [],
  };

  return {
    validateTimeRange(timeInputs) {
      // Checks if start time is before end time
      if (timeInputs[1] !== '') {
        return timeInputs[0].value < timeInputs[1].value;
      }
      return true;
    },

    validateNoTimeOverlap(time, type, activeDay) {
      // Checks if time is inside an existing event's range
      const timeSlots = reservedTimeSlots[activeDay];

      // Type 0 if startTime, Type 1 if endTime
      if (type === 0) {
        for (const [startTime, endTime] of timeSlots) {
          if (startTime <= time && time < endTime) {
            return false;
          }
        }
      } else if (type === 1) {
        for (let i = 0; i < timeSlots.length; i += 1) {
          if (timeSlots[i][0] < time && time <= timeSlots[i][1]) {
            return false;
          }
        }
      }

      return true;
    },

    validateNoSubEvents(timeInputs, activeDay) {
      // Checks if an existing event's range is inside the requested time range
      const timeSlots = reservedTimeSlots[activeDay];

      // Index 0 is startTime, Index 1 is endTime
      for (let i = 0; i < timeSlots.length; i += 1) {
        if (timeInputs[0].value <= timeSlots[i][0] && timeSlots[i][1] <= timeInputs[1].value) {
          return false;
        }
      }

      return true;
    },

    addToEventDatabase(name, startTime, endTime, notes, activeDay) {
      const eventObj = new Event(name, startTime, endTime, notes);

      if (eventDatabase[activeDay].length === 0) {
        eventDatabase[activeDay].push(eventObj);
      } else { // Linear search to keep database in order
        let indexToInsert = 0;

        for (let i = 0; i < eventDatabase[activeDay].length; i += 1) {
          if (eventObj.startTime > eventDatabase[activeDay][i].startTime) {
            indexToInsert += 1;
          }
        }
        eventDatabase[activeDay].splice(indexToInsert, 0, eventObj);
      }
    },

    deleteFromEventDatabase(index, activeDay) {
      eventDatabase[activeDay].splice(index, 1);
    },

    resetActiveDay(activeDay) {
      eventDatabase[activeDay] = [];
      reservedTimeSlots[activeDay] = [];
    },

    recordTimeSlot(startTime, endTime, activeDay) {
      if (reservedTimeSlots[activeDay].length === 0) {
        reservedTimeSlots[activeDay].push([startTime, endTime]);
      } else { // Linear search to keep timeslots in order
        let indexToInsert = 0;

        for (let i = 0; i < reservedTimeSlots[activeDay].length; i += 1) {
          if (startTime > reservedTimeSlots[activeDay][i][0]) {
            indexToInsert += 1;
          }
        }
        reservedTimeSlots[activeDay].splice(indexToInsert, 0, [startTime, endTime]);
      }
    },

    deleteTimeSlot(index, activeDay) {
      reservedTimeSlots[activeDay].splice(index, 1);
    },

    cloneToSelectedDays(activeDay, selectedDays) {
      const activeDayRoutine = eventDatabase[activeDay];
      const activeDayTimeSlots = reservedTimeSlots[activeDay];

      for (let i = 0; i < selectedDays.length; i += 1) {
        eventDatabase[selectedDays[i]] = activeDayRoutine.slice();
        reservedTimeSlots[selectedDays[i]] = activeDayTimeSlots.slice();
      }
    },

    getEventDatabase() {
      return eventDatabase;
    },
  };
}());

/*-----------------------------------------------------------------------------*/
/* UI CONTROLLER */
/*-----------------------------------------------------------------------------*/

const UIController = (function () {
  const DOMobjects = {
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

  const eventHTMLDatabase = {
    MON: [],
    TUE: [],
    WED: [],
    THU: [],
    FRI: [],
    SAT: [],
    SUN: [],
  };

  function toStandardTime(militaryTime) {
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
  }

  function dataToHTML(eventObj, index) {
    let newHTML;
    const HTML = '<div id="event_%index%" class="eventContainer %noteDetect%"><div class="event"><div><div class="event__time"><span class="event__start">%startTime%</span><span class="event__end">%endTime%</span></div></div><div><div class="event__name"><p>%name%</p></div></div><div><div class="event__buttons"><button id="config_%index%" class="event__config"><i class="fas fa-cog"></i></button><button id="note_%index%" class="event__toggleNote"><i class="fas fa-sticky-note"></i></button><button id="delete_%index%" class="event__delete"><i class="fas fa-times-circle"></i></button></div></div><div><div class="event__note"><p>%notes%</p></div></div></div></div>';

    if (eventObj.notes.length > 0) {
      newHTML = HTML.replace('%noteDetect%', 'hasNote');
    } else if (eventObj.notes.length === 0) {
      newHTML = HTML.replace('%noteDetect%', '');
      newHTML = newHTML.replace('<button id="note_%index%" class="event__toggleNote"><i class="fas fa-sticky-note"></i></button>', '');
    }

    newHTML = newHTML.replace('%name%', eventObj.name);
    newHTML = newHTML.replace('%startTime%', toStandardTime(eventObj.startTime));
    newHTML = newHTML.replace('%endTime%', toStandardTime(eventObj.endTime));
    newHTML = newHTML.replace('%notes%', eventObj.notes);
    newHTML = newHTML.replace(/%index%/g, index);

    return newHTML;
  }

  function resetEventHTMLDatabase(activeDay) {
    eventHTMLDatabase[activeDay] = [];
  }

  function darkenScreen() {
    DOMobjects.overlay.classList.remove('overlayOFF');
    DOMobjects.overlay.classList.add('overlayON');
  }

  function lightenScreen() {
    DOMobjects.overlay.classList.remove('overlayON');
    DOMobjects.overlay.classList.add('overlayFADE');

    setTimeout(() => {
      DOMobjects.overlay.classList.remove('overlayFADE');
      DOMobjects.overlay.classList.add('overlayOFF');
    }, 300);
  }

  return {
    getDOMobjects() {
      return DOMobjects;
    },

    fadeIn(domObj) {
      darkenScreen();
      domObj.style.visibility = 'visible';
      domObj.style.opacity = 1;
    },

    fadeOut(domObj) {
      lightenScreen();
      domObj.style.opacity = 0;
      setTimeout(() => {
        domObj.style.visibility = 'hidden';
      }, 300);
    },

    toggleNote(eventIndex) {
      const event = document.getElementById(`event_${eventIndex}`);
      event.classList.toggle('openNote');
    },

    getInputData() {
      return {
        name: DOMobjects.nameInput.value,
        startTime: DOMobjects.startTimeInput.value,
        endTime: DOMobjects.endTimeInput.value,
        notes: DOMobjects.notesInput.value,
      };
    },

    setConfigData(name, startTime, endTime, notes) {
      DOMobjects.nameConfigInput.value = name;
      DOMobjects.startTimeConfigInput.value = startTime;
      DOMobjects.endTimeConfigInput.value = endTime;
      DOMobjects.notesConfigInput.value = notes;
    },

    getConfigData() {
      return {
        name: DOMobjects.nameConfigInput.value,
        startTime: DOMobjects.startTimeConfigInput.value,
        endTime: DOMobjects.endTimeConfigInput.value,
        notes: DOMobjects.notesConfigInput.value,
      };
    },

    resetNewEventForm() {
      DOMobjects.startTimeInput.setCustomValidity('');
      DOMobjects.endTimeInput.setCustomValidity('');
      DOMobjects.newEventForm.reset();
    },

    updateHTMLDatabase(eventDatabase, activeDay) {
      resetEventHTMLDatabase(activeDay);
      for (let i = 0; i < eventDatabase[activeDay].length; i += 1) {
        const eventHTML = dataToHTML(eventDatabase[activeDay][i], i);
        eventHTMLDatabase[activeDay].push(eventHTML);
      }
    },

    changeActiveDayDisplay(activeDay) {
      let dayName;
      switch (activeDay) {
        case 'MON':
          dayName = 'MONDAY';
          break;
        case 'TUE':
          dayName = 'TUESDAY';
          break;
        case 'WED':
          dayName = 'WEDNESDAY';
          break;
        case 'THU':
          dayName = 'THURSDAY';
          break;
        case 'FRI':
          dayName = 'FRIDAY';
          break;
        case 'SAT':
          dayName = 'SATURDAY';
          break;
        case 'SUN':
          dayName = 'SUNDAY';
          break;
        default:
          dayName = 'UNDEFINED';
          break;
      }
      DOMobjects.activeDayDisplay.textContent = dayName;
    },

    getSelectedDays() {
      const selectedDays = [];

      Array.prototype.forEach.call(document.querySelectorAll('.selected'), (current) => {
        selectedDays.push(current.textContent);
      });

      return selectedDays;
    },

    resetCloneForm() {
      Array.prototype.forEach.call(document.querySelectorAll('.selected'), (current) => {
        current.classList.remove('selected');
      });
    },

    openOptionsMenu() {
      darkenScreen();
      DOMobjects.weekContainer.classList.toggle('menuOpen');
    },

    closeOptionsMenu() {
      lightenScreen();
      DOMobjects.weekContainer.classList.toggle('menuOpen');
    },

    displayEvents(activeDay) {
      while (DOMobjects.routineContainer.firstChild) {
        DOMobjects.routineContainer.removeChild(DOMobjects.routineContainer.firstChild);
      }
      for (let i = 0; i < eventHTMLDatabase[activeDay].length; i += 1) {
        DOMobjects.routineContainer.insertAdjacentHTML('beforeend', eventHTMLDatabase[activeDay][i]);
      }
    },

    deleteFromDisplay(index) {
      const eventDOM = document.getElementById(`event_${index}`);
      eventDOM.firstChild.style.opacity = 0;
      eventDOM.firstChild.style.height = 0;
      eventDOM.style.margin = 0;
      setTimeout(() => {
        eventDOM.parentNode.removeChild(eventDOM);
      }, 300);
    },
  };
}());

/*-----------------------------------------------------------------------------*/
/* EVENT CONTROLLER */
/*-----------------------------------------------------------------------------*/

const eventController = (function (schedCtrl, UICtrl) {
  const state = {
    activeDay: 'MON',
    selectedEvent: null,
    eventDatabase: {
      MON: [],
      TUE: [],
      WED: [],
      THU: [],
      FRI: [],
      SAT: [],
      SUN: [],
    },
    reservedTimeSlots: {
      MON: [],
      TUE: [],
      WED: [],
      THU: [],
      FRI: [],
      SAT: [],
      SUN: [],
    },
  };

  const DOMobjects = UICtrl.getDOMobjects();

  function updateUI() {
    const eventDatabase = schedCtrl.getEventDatabase();
    UICtrl.updateHTMLDatabase(eventDatabase, state.activeDay);
    UICtrl.displayEvents(state.activeDay);
  }

  function addEvent(eventObj) {
    // 1. Transfer data to schedule controller
    schedCtrl.addToEventDatabase(eventObj.name, eventObj.startTime,
      eventObj.endTime, eventObj.notes, state.activeDay);
    schedCtrl.recordTimeSlot(eventObj.startTime, eventObj.endTime, state.activeDay);
    // 2. Transfer data to UI controller
    updateUI();
  }

  function updateIndices() {
    const eventArray = Array.from(document.querySelectorAll('.eventContainer'));

    for (let i = 0; i < eventArray.length; i += 1) {
      eventArray[i].setAttribute('id', `event_${i}`);
      eventArray[i].querySelector('.event__config').setAttribute('id', `config_${i}`);
      eventArray[i].querySelector('.event__delete').setAttribute('id', `delete_${i}`);
      if (eventArray[i].querySelector('.event__toggleNote')) {
        eventArray[i].querySelector('.event__toggleNote').setAttribute('id', `note_${i}`);
      }
    }
  }

  function deleteEvent(index) {
    schedCtrl.deleteFromEventDatabase(index, state.activeDay);
    schedCtrl.deleteTimeSlot(index, state.activeDay);
    UICtrl.deleteFromDisplay(index);
    setTimeout(updateIndices, 300);
  }

  function changeActiveDay(event) {
    document.querySelector('.activeDay').classList.remove('activeDay');
    event.target.classList.add('activeDay');
  }

  function cloneRoutine() {
    const selectedDays = UICtrl.getSelectedDays();
    schedCtrl.cloneToSelectedDays(state.activeDay, selectedDays);
    UICtrl.resetCloneForm();
    UICtrl.fadeOut(DOMobjects.cloneRoutineUI);
  }

  function updateCloneRoutineChoices() {
    document.querySelector('.hidden').classList.remove('hidden');
    Array.prototype.forEach.call(DOMobjects.cloneRoutineDays, (current) => {
      if (current.textContent === state.activeDay) {
        current.classList.add('hidden');
      }
    });
  }

  function resetRoutine() {
    schedCtrl.resetActiveDay(state.activeDay);
    updateUI();
  }

  function setupConfigureForm(index) {
    const eventDatabase = schedCtrl.getEventDatabase();
    state.selectedEvent = eventDatabase[state.activeDay][index];
    UICtrl.setConfigData(state.selectedEvent.name, state.selectedEvent.startTime,
      state.selectedEvent.endTime, state.selectedEvent.notes);

    schedCtrl.deleteFromEventDatabase(index, state.activeDay);
    schedCtrl.deleteTimeSlot(index, state.activeDay);
  }

  function determineButtonEvent(event) {
    if (event.target.tagName === 'BUTTON') {
      const [buttonType, selectedEventIndex] = event.target.getAttribute('id').split('_');

      switch (buttonType) {
        case 'config':
          setupConfigureForm(selectedEventIndex);
          UICtrl.fadeIn(DOMobjects.configEventUI);
          break;
        case 'delete':
          deleteEvent(selectedEventIndex);
          break;
        case 'note':
          UICtrl.toggleNote(selectedEventIndex);
          break;
        default:
          break;
      }
    }
  }

  function setValidationMessage(timeInputs) {
    const validityCheck = [1, 1];

    for (let i = 0; i < 2; i += 1) {
      if (!schedCtrl.validateTimeRange(timeInputs)) {
        timeInputs[1].setCustomValidity('End time should be after the Start time.');
        validityCheck[1] = 0;
      } else if (!schedCtrl.validateNoTimeOverlap(timeInputs[i].value, i, state.activeDay)) {
        timeInputs[i].setCustomValidity("You can't have overlapping event times.");
        validityCheck[i] = 0;
      } else if (!schedCtrl.validateNoSubEvents(timeInputs, state.activeDay)) {
        timeInputs[1].setCustomValidity("You can't have overlapping event times.");
        validityCheck[1] = 0;
      }
    }

    if (validityCheck[0] === 1) {
      timeInputs[0].setCustomValidity('');
    }

    if (validityCheck[1] === 1) {
      timeInputs[1].setCustomValidity('');
    }
  }

  function setupEventListeners() {
    /* -------------------------MENU BUTTONS--------------------------------*/

    DOMobjects.btnNew.addEventListener('click', () => UICtrl.fadeIn(DOMobjects.newEventUI));
    DOMobjects.btnNewBack.addEventListener('click', () => {
      UICtrl.fadeOut(DOMobjects.newEventUI);

      setTimeout(() => {
        UICtrl.resetNewEventForm();
      }, 300);
    });

    DOMobjects.btnClone.addEventListener('click', () => UICtrl.fadeIn(DOMobjects.cloneRoutineUI));
    DOMobjects.btnCloneBack.addEventListener('click', () => {
      UICtrl.fadeOut(DOMobjects.cloneRoutineUI);
      UICtrl.resetCloneForm();
    });

    DOMobjects.btnReset.addEventListener('click', () => UICtrl.fadeIn(DOMobjects.resetRoutineUI));
    DOMobjects.btnResetBack.addEventListener('click', () => UICtrl.fadeOut(DOMobjects.resetRoutineUI));

    DOMobjects.btnOptions.addEventListener('click', UICtrl.openOptionsMenu);
    DOMobjects.btnOptionsBack.addEventListener('click', UICtrl.closeOptionsMenu);

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
      const eventObj = UICtrl.getInputData();
      addEvent(eventObj);
      UICtrl.fadeOut(DOMobjects.newEventUI);
      UICtrl.resetNewEventForm();
    });

    DOMobjects.startTimeConfigInput.addEventListener('input', () => {
      const timeInputs = [DOMobjects.startTimeConfigInput, DOMobjects.endTimeConfigInput];
      setValidationMessage(timeInputs);
    });
    DOMobjects.endTimeConfigInput.addEventListener('input', () => {
      const timeInputs = [DOMobjects.startTimeConfigInput, DOMobjects.endTimeConfigInput];
      setValidationMessage(timeInputs);
    });
    DOMobjects.configEventForm.addEventListener('submit', () => {
      const configuredEventObj = UICtrl.getConfigData();
      addEvent(configuredEventObj);

      UICtrl.fadeOut(DOMobjects.configEventUI);
    });

    DOMobjects.cloneRoutineForm.addEventListener('submit', cloneRoutine);

    DOMobjects.resetRoutineYes.addEventListener('click', () => {
      resetRoutine();
      UICtrl.fadeOut(DOMobjects.resetRoutineUI);
    });

    DOMobjects.resetRoutineNo.addEventListener('click', () => UICtrl.fadeOut(DOMobjects.resetRoutineUI));

    /* -------------------------WEEK BUTTONS--------------------------------*/

    DOMobjects.week.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON' && state.activeDay !== event.target.textContent) {
        state.activeDay = event.target.textContent;
        changeActiveDay(event);
        UICtrl.changeActiveDayDisplay(state.activeDay);
        updateCloneRoutineChoices();
        DOMobjects.routineContainer.style.opacity = 0;
        setTimeout(() => {
          updateUI();
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

    DOMobjects.routineContainer.addEventListener('click', (event) => {
      determineButtonEvent(event);
    });

    DOMobjects.btnConfigBack.addEventListener('click', () => {
      schedCtrl.addToEventDatabase(state.selectedEvent.name, state.selectedEvent.startTime,
        state.selectedEvent.endTime, state.selectedEvent.notes, state.activeDay);
      UICtrl.fadeOut(DOMobjects.configEventUI);
      DOMobjects.endTimeConfigInput.setCustomValidity('');
      DOMobjects.startTimeConfigInput.setCustomValidity('');
    });
  }

  return {
    init() {
      setupEventListeners();
      state.activeDay = 'MON';

      addEvent({
        name: 'Breakfast',
        startTime: '07:00',
        endTime: '07:30',
        notes: '',
      });
      addEvent({
        name: 'Workout',
        startTime: '08:15',
        endTime: '09:00',
        notes: '4 sets, 15 reps of each: Glute Bridge, Step Up, Squat, Leg Curl',
      });
      addEvent({
        name: 'Algorithms Practice',
        startTime: '09:00',
        endTime: '11:30',
        notes: 'Focus on calculating time complexity',
      });
      addEvent({
        name: 'Lunch',
        startTime: '11:30',
        endTime: '12:30',
        notes: '',
      });
      addEvent({
        name: 'Calligraphy Club',
        startTime: '14:00',
        endTime: '15:30',
        notes: 'Workshop on flourishing',
      });

      // Provides fallback for IE not having time input
      if (/* @cc_on!@ */ false || !!document.documentMode) {
        DOMobjects.startTimeInput.setAttribute('title', 'Military time XX:XX');
        DOMobjects.endTimeInput.setAttribute('title', 'Military time XX:XX');
      }
    },
  };
}(scheduleController, UIController));

eventController.init();
