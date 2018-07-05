/* eslint-env browser */
/* eslint linebreak-style: ["error", "windows"] */

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
    validateTimeFormat(timeInputs) {
      if (timeInputs[1] !== '') {
        return timeInputs[0].value < timeInputs[1].value;
      }
      return true;
    },

    validateNoTimeOverlap(time, type, activeDay) {
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
        eventDatabase[selectedDays[i]] = activeDayRoutine;
        reservedTimeSlots[selectedDays[i]] = activeDayTimeSlots;
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

    btnConfigBack: document.getElementById('btnConfigBack'),
    configEventUI: document.querySelector('.configEventUI'),
    configEventForm: document.getElementById('configEventForm'),
    nameConfigInput: document.getElementById('nameConfigInput'),
    startTimeConfigInput: document.getElementById('startTimeConfigInput'),
    endTimeConfigInput: document.getElementById('endTimeConfigInput'),
    notesConfigInput: document.getElementById('notesConfigInput'),
    configEventSubmit: document.querySelector('.configEventUI__submit'),

    routineContainer: document.querySelector('.routineContainer'),
    openNoteEvents: document.querySelectorAll('.openNote'),
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
    const HTML = '<div id="event_%index%" class="eventContainer %noteDetect%"><div class="event"><div><div class="event__time"><span class="event__start">%startTime%</span><span class="event__end">%endTime%</span></div></div><div><div class="event__name"><p>%name%</p></div></div><div><div class="event__buttons"><button class="event__config"><i id="config_%index%" class="fas fa-cog"></i></button><button class="event__delete"><i id="delete_%index%" class="fas fa-times-circle"></i></button><button class="event__toggleNote"><i id="notes_%index%" class="fas fa-sticky-note"></i></button></div></div><div><div class="event__note"><p>%notes%</p></div></div></div></div>';

    if (eventObj.notes.length > 0) {
      newHTML = HTML.replace('%noteDetect%', 'hasNote');
    } else if (eventObj.notes.length === 0) {
      newHTML = HTML.replace('%noteDetect%', '');
      newHTML = newHTML.replace('<button class="event__toggleNote"><i id="notes_%index%" class="fas fa-sticky-note"></i></button>', '');
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
  let activeDay;
  let selectedEvent;

  const DOMobjects = UICtrl.getDOMobjects();

  function updateUI() {
    const eventDatabase = schedCtrl.getEventDatabase();
    UICtrl.updateHTMLDatabase(eventDatabase, activeDay);
    UICtrl.displayEvents(activeDay);
  }

  function addEvent(eventObj) {
    // 1. Transfer data to schedule controller
    schedCtrl.addToEventDatabase(eventObj.name, eventObj.startTime,
      eventObj.endTime, eventObj.notes, activeDay);
    schedCtrl.recordTimeSlot(eventObj.startTime, eventObj.endTime, activeDay);
    // 2. Transfer data to UI controller
    updateUI();
  }

  function deleteEvent(index) {
    schedCtrl.deleteFromEventDatabase(index, activeDay);
    schedCtrl.deleteTimeSlot(index, activeDay);
    UICtrl.deleteFromDisplay(index);
  }

  function changeActiveDay(event) {
    document.querySelector('.activeDay').classList.remove('activeDay');
    event.target.classList.add('activeDay');
  }

  function cloneRoutine() {
    const selectedDays = UICtrl.getSelectedDays();
    schedCtrl.cloneToSelectedDays(activeDay, selectedDays);
    UICtrl.resetCloneForm();
    UICtrl.fadeOut(DOMobjects.cloneRoutineUI);
  }

  function updateCloneRoutineChoices() {
    document.querySelector('.hidden').classList.remove('hidden');
    Array.prototype.forEach.call(DOMobjects.cloneRoutineDays, (current) => {
      if (current.textContent === activeDay) {
        current.classList.add('hidden');
      }
    });
  }

  function resetRoutine() {
    schedCtrl.resetActiveDay(activeDay);
    updateUI();
  }

  function setupConfigureForm(index) {
    const eventDatabase = schedCtrl.getEventDatabase();
    selectedEvent = eventDatabase[activeDay][index];
    UICtrl.setConfigData(selectedEvent.name, selectedEvent.startTime,
      selectedEvent.endTime, selectedEvent.notes);

    schedCtrl.deleteFromEventDatabase(index, activeDay);
    schedCtrl.deleteTimeSlot(index, activeDay);
  }

  function setValidationMessage(timeInputs) {
    const validityCheck = [1, 1];

    for (let i = 0; i < 2; i += 1) {
      if (!schedCtrl.validateTimeFormat(timeInputs)) {
        timeInputs[1].setCustomValidity('End time should be after the Start time.');
        validityCheck[1] = 0;
      } else if (!schedCtrl.validateNoTimeOverlap(timeInputs[i].value, i, activeDay)) {
        timeInputs[i].setCustomValidity("You can't have overlapping event times.");
        validityCheck[i] = 0;
      } else if (!schedCtrl.validateNoSubEvents(timeInputs, activeDay)) {
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

    /* ------------------------FORM BUTTONS------------------------------*/

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
      if (event.target.tagName === 'BUTTON') {
        activeDay = event.target.textContent;
        changeActiveDay(event);
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
      if (event.target.tagName === 'I') {
        const [buttonType, selectedEventIndex] = event.target.getAttribute('id').split('_');

        switch (buttonType) {
          case 'config':
            setupConfigureForm(selectedEventIndex);
            UICtrl.fadeIn(DOMobjects.configEventUI);
            break;
          case 'delete':
            deleteEvent(selectedEventIndex);
            break;
          case 'notes':
            UICtrl.toggleNote(selectedEventIndex);
            break;
          default:
            console.log('This button type is not programmed yet.');
            break;
        }
      }
    });

    DOMobjects.btnConfigBack.addEventListener('click', () => {
      schedCtrl.addToEventDatabase(selectedEvent.name, selectedEvent.startTime,
        selectedEvent.endTime, selectedEvent.notes, activeDay);
      UICtrl.fadeOut(DOMobjects.configEventUI);
      DOMobjects.endTimeConfigInput.setCustomValidity('');
      DOMobjects.startTimeConfigInput.setCustomValidity('');
    });
  }

  return {
    init() {
      setupEventListeners();
      activeDay = 'MON';

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

      if (/* @cc_on!@ */ false || !!document.documentMode) {
        DOMobjects.startTimeInput.setAttribute('title', 'Military time XX:XX');
        DOMobjects.endTimeInput.setAttribute('title', 'Military time XX:XX');
      }
    },
  };
}(scheduleController, UIController));

eventController.init();
