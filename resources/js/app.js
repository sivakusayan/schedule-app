/*eslint-env browser*/

/*-----------------------------------------------------------------------------*/
/* SCHEDULE CONTROLLER */
/*-----------------------------------------------------------------------------*/

var scheduleController = (function () {
    'use strict';
    
    var Event, eventDatabase, reservedTimeSlots;
    
    Event = function (name, startTime, endTime, notes) {
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.notes = notes;
    };
    
    eventDatabase = {
        MON: [],
        TUE: [],
        WED: [],
        THU: [],
        FRI: [],
        SAT: [],
        SUN: []
    };
    
    reservedTimeSlots = {
        MON: [],
        TUE: [],
        WED: [],
        THU: [],
        FRI: [],
        SAT: [],
        SUN: []
    };
    
    return {
        validateTimeFormat: function (timeInputs) {
            if (timeInputs[1] !== '') {
                return timeInputs[0].value < timeInputs[1].value;
            } else {
                return true;
            }
        },
        
        validateNoTimeOverlap: function (time, type, activeDay) {
            var timeSlots;
            timeSlots = reservedTimeSlots[activeDay];
            
            //Type 0 if startTime, Type 1 if endTime
            if (type === 0) {
                for (var i = 0; i < timeSlots.length; i++) {
                    if (timeSlots[i][0] <= time && time < timeSlots[i][1]) {
                        return false;
                    }
                }
            } else if (type === 1) {
                for (var i = 0; i < timeSlots.length; i++) {
                    if (timeSlots[i][0] < time && time <= timeSlots[i][1]) {
                        return false;
                    }
                }
            }

            return true;
        },
        
        validateNoSubEvents: function (timeInputs, activeDay) {
            var timeSlots;
            timeSlots = reservedTimeSlots[activeDay];
            
            //Index 0 is startTime, Index 1 is endTime
            for (var i = 0; i < timeSlots.length; i++) {
                    if (timeInputs[0].value <= timeSlots[i][0] && timeSlots[i][1] <= timeInputs[1].value) {
                        return false;
                    }
                }
            
            return true;
        },
        
        addToEventDatabase: function (name, startTime, endTime, notes, activeDay) {
            var eventObj;
            
            eventObj = new Event(name, startTime, endTime, notes);
            if (eventDatabase[activeDay].length === 0) {
                eventDatabase[activeDay].push(eventObj);
            } else { //Linear search to keep database in order
                var indexToInsert;
                indexToInsert = 0;
                
                for (var i = 0; i < eventDatabase[activeDay].length; i++) {
                    if (eventObj.startTime > eventDatabase[activeDay][i].startTime) {
                        indexToInsert += 1;
                    }
                }
                eventDatabase[activeDay].splice(indexToInsert, 0, eventObj);
            }
        },
        
        deleteFromEventDatabase: function (index, activeDay) {
            eventDatabase[activeDay].splice(index, 1);
        },
        
        resetActiveDay: function (activeDay) {
            eventDatabase[activeDay] = [];
            reservedTimeSlots[activeDay] = [];
        },
        
        recordTimeSlot: function (startTime, endTime, activeDay) {
            
            if (reservedTimeSlots[activeDay].length === 0) {
                reservedTimeSlots[activeDay].push([startTime, endTime]);
            } else { //Linear search to keep timeslots in order
                var indexToInsert;
                indexToInsert = 0;
                
                for (var i = 0; i < reservedTimeSlots[activeDay].length; i++) {
                    if (startTime > reservedTimeSlots[activeDay][i][0]) {
                        indexToInsert += 1;
                    }
                }
                reservedTimeSlots[activeDay].splice(indexToInsert, 0, [startTime, endTime]);
            }
        },
        
        deleteTimeSlot: function (index, activeDay) {
            reservedTimeSlots[activeDay].splice(index, 1);
        },
        
        cloneToSelectedDays: function (activeDay, selectedDays) {
            var activeDayRoutine, activeDayTimeSlots;
            activeDayRoutine = eventDatabase[activeDay];
            activeDayTimeSlots = reservedTimeSlots[activeDay];
            
            for (var i = 0; i < selectedDays.length; i++) {
                eventDatabase[selectedDays[i]] = activeDayRoutine;
                reservedTimeSlots[selectedDays[i]] = activeDayTimeSlots;
            }

        },
        
        getEventDatabase: function () {
            return eventDatabase;
        }
    };
    
}());

/*-----------------------------------------------------------------------------*/
/* UI CONTROLLER */
/*-----------------------------------------------------------------------------*/

var UIController = (function () {
    'use strict';
    
    var DOMobjects, dataToHTML, eventHTMLDatabase, resetEventHTMLDatabase, darkenScreen, lightenScreen, toStandardTime;

    DOMobjects = {
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
        
        routineContainer: document.querySelector('.routineContainer')
    };
    
    eventHTMLDatabase = {
        MON: [],
        TUE: [],
        WED: [],
        THU: [],
        FRI: [],
        SAT: [],
        SUN: []
    };
    
    dataToHTML = function (eventObj, index) {
        var HTML, newHTML;

        HTML = '<div id="%event_index%" class="eventContainer %noteDetect%"><div class="event"><div><div class="event__notes"><p>%notes%</p></div></div><div><div class="event__name"><p>%name%</p></div></div><div><div class="event__time"><button class="event__config"><i id="%config_index%" class="fas fa-cog"></i></button><button class="event__delete"><i id="%delete_index%" class="fas fa-times-circle"></i></button><span class="event__start">%startTime%</span><span class="event__end">%endTime%</span></div></div></div></div>';
        
        newHTML = HTML.replace('%name%', eventObj.name);
        newHTML = newHTML.replace('%startTime%', toStandardTime(eventObj.startTime));
        newHTML = newHTML.replace('%endTime%', toStandardTime(eventObj.endTime));
        newHTML = newHTML.replace('%event_index%', 'event_' + index);
        newHTML = newHTML.replace('%config_index%', 'config_' + index);
        newHTML = newHTML.replace('%delete_index%', 'delete_' + index);
        
        if (eventObj.notes.length > 0) {
            newHTML = newHTML.replace('%noteDetect%', 'hasNote');
            newHTML = newHTML.replace('%notes%', eventObj.notes);
        } else {
            newHTML = newHTML.replace('%noteDetect%', 'noNote');
            newHTML = newHTML.replace('%notes%', '');
        }
        
        return newHTML;
    };
    
    resetEventHTMLDatabase = function (activeDay) {
        eventHTMLDatabase[activeDay] = [];
    };
    
    darkenScreen = function () {
        DOMobjects.overlay.classList.remove('overlayOFF');
        DOMobjects.overlay.classList.add('overlayON');
    };
        
    lightenScreen = function () {
        DOMobjects.overlay.classList.remove('overlayON');
        DOMobjects.overlay.classList.add('overlayFADE');

        setTimeout(function () {
            DOMobjects.overlay.classList.remove('overlayFADE');
            DOMobjects.overlay.classList.add('overlayOFF');
        }, 300);
    };
    
    toStandardTime = function (militaryTime) {
        var hours, minutes, standardTime;
        
        hours = Number(militaryTime.split(':')[0]);
        minutes = militaryTime.split(':')[1];
        
        if (hours > 12) {
            standardTime = hours % 12 + ':' + minutes + ' PM';
        } else if (hours === 12) {
            standardTime = hours + ':' + minutes + ' PM';
        } else if (hours === 0) {
            standardTime = hours + 12 + ':' + minutes + ' AM';
        } else if (hours <= 12) {
            standardTime = hours + ':' + minutes + ' AM';
        }
        
        return standardTime;
    };
    
    return {
        getDOMobjects: function () {
            return DOMobjects;
        },
        
        fadeIn: function (domObj) {
            darkenScreen();
            domObj.style.transform = 'translate(50%, 50%)';
            domObj.style.opacity = 1;
        },
        
        fadeOut: function (domObj) {
            lightenScreen();
            domObj.style.opacity = 0;
            setTimeout(function () {
                domObj.style.transform = 'translateX(-300%)';
            }, 300);
        },
        
        getInputData: function () {
            return {
                name: DOMobjects.nameInput.value,
                startTime: DOMobjects.startTimeInput.value,
                endTime: DOMobjects.endTimeInput.value,
                notes: DOMobjects.notesInput.value
            };
        },
        
        setConfigData: function (name, startTime, endTime, notes) {
            DOMobjects.nameConfigInput.value = name;
            DOMobjects.startTimeConfigInput.value = startTime;
            DOMobjects.endTimeConfigInput.value = endTime;
            DOMobjects.notesConfigInput.value = notes;
        },
        
        getConfigData: function () {
            return {
                name: DOMobjects.nameConfigInput.value,
                startTime: DOMobjects.startTimeConfigInput.value,
                endTime: DOMobjects.endTimeConfigInput.value,
                notes: DOMobjects.notesConfigInput.value
            }
        },

        resetNewEventForm: function () {
            DOMobjects.startTimeInput.setCustomValidity('');
            DOMobjects.endTimeInput.setCustomValidity('');
            DOMobjects.newEventForm.reset();
        },
        
        updateHTMLDatabase: function (eventDatabase, activeDay) {
            resetEventHTMLDatabase(activeDay);
            for (var i = 0; i < eventDatabase[activeDay].length; i++) {
                var eventHTML = dataToHTML(eventDatabase[activeDay][i], i);
                eventHTMLDatabase[activeDay].push(eventHTML);
            }
        },
        
        getSelectedDays: function () {
            var selectedDays = [];
            
            Array.prototype.forEach.call(document.querySelectorAll('.selected'), function(current) {
                selectedDays.push(current.textContent);
            });
            
            return selectedDays;
        },
        
        resetCloneForm: function () {
            Array.prototype.forEach.call(document.querySelectorAll('.selected'), function(current) {
                current.classList.remove('selected');  
            });
        },
        
        displayEvents: function (activeDay) {
            while(DOMobjects.routineContainer.firstChild) {
                DOMobjects.routineContainer.removeChild(DOMobjects.routineContainer.firstChild);
            }
            for (var i = 0; i < eventHTMLDatabase[activeDay].length ; i++) {
                DOMobjects.routineContainer.insertAdjacentHTML('beforeend', eventHTMLDatabase[activeDay][i]);
            }
        }
    };
    
}());

/*-----------------------------------------------------------------------------*/
/* EVENT CONTROLLER */
/*-----------------------------------------------------------------------------*/

var eventController = (function (schedCtrl, UICtrl) {
    'use strict';
    
    var activeDay, setupEventListeners, updateUI, addEvent, deleteEvent, cloneRoutine, resetRoutine, selectedEvent, selectedEventIndex, setupConfigureForm, DOMobjects, setValidationMessage;
    
    DOMobjects = UICtrl.getDOMobjects();
    
    setValidationMessage = function (timeInputs) {
        var validityCheck;
        validityCheck = [1,1]

        for (var i = 0; i < 2; i++) {
            if (!schedCtrl.validateTimeFormat(timeInputs)) {
                timeInputs[1].setCustomValidity('End time should be after the Start time.');
                validityCheck[1] = 0;
            } else if (!schedCtrl.validateNoTimeOverlap(timeInputs[i].value, i, activeDay)) {
                timeInputs[i].setCustomValidity('You can\'t have overlapping event times.');
                validityCheck[i] = 0;
            } else if (!schedCtrl.validateNoSubEvents(timeInputs, activeDay)) {
                timeInputs[1].setCustomValidity('You can\'t have overlapping event times.');
                validityCheck[1] = 0;
            }
        }
        
        if (validityCheck[0] === 1) {
            timeInputs[0].setCustomValidity('');
        }
        
        if (validityCheck[1] === 1) {
            timeInputs[1].setCustomValidity('');
        }

    };
    
    setupEventListeners = function () {
        
        /*-------------------------MENU BUTTONS--------------------------------*/
        
        DOMobjects.btnNew.addEventListener('click', function () {
            UICtrl.fadeIn(DOMobjects.newEventUI);
        });
        DOMobjects.btnNewBack.addEventListener('click', function () {
            UICtrl.fadeOut(DOMobjects.newEventUI);
            
            setTimeout(function () {
                UICtrl.resetNewEventForm();
            }, 300);
        });
        
        DOMobjects.btnClone.addEventListener('click', function () {
            UICtrl.fadeIn(DOMobjects.cloneRoutineUI);
        });
        DOMobjects.btnCloneBack.addEventListener('click', function () {
            UICtrl.fadeOut(DOMobjects.cloneRoutineUI);
            UICtrl.resetCloneForm();
        });
        
        DOMobjects.btnReset.addEventListener('click', function () {
            UICtrl.fadeIn(DOMobjects.resetRoutineUI);
        });
        DOMobjects.btnResetBack.addEventListener('click', function () {
            UICtrl.fadeOut(DOMobjects.resetRoutineUI);
        });
        
        /*------------------------FORM BUTTONS------------------------------*/
        
        DOMobjects.startTimeInput.addEventListener('input', function () {
            var timeInputs;
            timeInputs = [DOMobjects.startTimeInput, DOMobjects.endTimeInput];
            setValidationMessage(timeInputs);
        });
        DOMobjects.endTimeInput.addEventListener('input', function () {
            var timeInputs;
            timeInputs = [DOMobjects.startTimeInput, DOMobjects.endTimeInput];
            setValidationMessage(timeInputs);
        });
        DOMobjects.newEventForm.addEventListener('submit', function () {
            var eventObj;
            eventObj = UICtrl.getInputData();
            addEvent(eventObj);
            UICtrl.fadeOut(DOMobjects.newEventUI);
            UICtrl.resetNewEventForm();
        });
        
        DOMobjects.startTimeConfigInput.addEventListener('input', function () {
            var timeInputs;
            timeInputs = [DOMobjects.startTimeConfigInput, DOMobjects.endTimeConfigInput];
            setValidationMessage(timeInputs);
        });
        DOMobjects.endTimeConfigInput.addEventListener('input', function () {
            var timeInputs;
            timeInputs = [DOMobjects.startTimeConfigInput, DOMobjects.endTimeConfigInput];
            setValidationMessage(timeInputs);
        });
        DOMobjects.configEventForm.addEventListener('submit', function () {
            var configuredEventObj;
            configuredEventObj = UICtrl.getConfigData();
            addEvent(configuredEventObj);
            
            UICtrl.fadeOut(DOMobjects.configEventUI);
        });
        
        DOMobjects.cloneRoutineForm.addEventListener('submit', cloneRoutine);
        
        DOMobjects.resetRoutineYes.addEventListener('click', function () {
            resetRoutine();
            UICtrl.fadeOut(DOMobjects.resetRoutineUI);
        });
        
        DOMobjects.resetRoutineNo.addEventListener('click', function () {
            UICtrl.fadeOut(DOMobjects.resetRoutineUI);
        });
        
        /*-------------------------WEEK BUTTONS--------------------------------*/
        
        DOMobjects.week.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {
                //Update UI for current day and change clone routine choices
                document.querySelector('.hidden').classList.remove('hidden');
                
                activeDay = event.target.textContent;
                
                Array.prototype.forEach.call(DOMobjects.cloneRoutineDays, function (current) {
                    if (current.textContent === activeDay) {
                        current.classList.add('hidden');
                    }
                });
                
                document.querySelector('.activeDay').classList.remove('activeDay');
                event.target.classList.add('activeDay');
                DOMobjects.routineContainer.style.opacity = 0;
                setTimeout(function () {
                    updateUI();
                    DOMobjects.routineContainer.style.opacity = 1;
                }, 600)
            }
        });
        
        DOMobjects.cloneRoutineDaysContainer.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {
                event.target.classList.toggle('selected');
            }
        });
        
        /*-------------------------EVENT BUTTONS--------------------------------*/
        
        DOMobjects.routineContainer.addEventListener('click', function (event) {
            
            if (event.target.tagName === 'I') {
                var buttonType;
                buttonType = event.target.getAttribute('id').split('_')[0];
                selectedEventIndex = event.target.getAttribute('id').split('_')[1];
                
                if (buttonType === 'config') {
                    setupConfigureForm(selectedEventIndex);
                    UICtrl.fadeIn(DOMobjects.configEventUI);
                } else if (buttonType === 'delete') {
                    deleteEvent(selectedEventIndex);
                }
            }
        });
        
        DOMobjects.btnConfigBack.addEventListener('click', function () {
            schedCtrl.addToEventDatabase(selectedEvent.name, selectedEvent.startTime, selectedEvent.endTime, selectedEvent.notes, activeDay);
            UICtrl.fadeOut(DOMobjects.configEventUI);
            DOMobjects.endTimeConfigInput.setCustomValidity('');
            DOMobjects.startTimeConfigInput.setCustomValidity('');
        });
    
    };
    
    updateUI = function () {
        var eventDatabase;
        
        eventDatabase = schedCtrl.getEventDatabase();
        UICtrl.updateHTMLDatabase(eventDatabase, activeDay);
        UICtrl.displayEvents(activeDay);
    }
    
    addEvent = function (eventObj) {
        //1. Transfer data to schedule controller
        schedCtrl.addToEventDatabase(eventObj.name, eventObj.startTime, eventObj.endTime, eventObj.notes, activeDay);
        schedCtrl.recordTimeSlot(eventObj.startTime, eventObj.endTime, activeDay);
        //2. Transfer data to UI controller
        updateUI();
    };
    
    deleteEvent = function (index) {
        schedCtrl.deleteFromEventDatabase(index, activeDay);
        schedCtrl.deleteTimeSlot(index, activeDay);
        updateUI();
    };
    
    cloneRoutine = function () {
        var selectedDays;
            
        selectedDays = UICtrl.getSelectedDays();
        schedCtrl.cloneToSelectedDays(activeDay, selectedDays);
        updateUI();
        UICtrl.resetCloneForm();
        UICtrl.fadeOut(DOMobjects.cloneRoutineUI);
    };
    
    resetRoutine = function () {
        schedCtrl.resetActiveDay(activeDay);
        updateUI();
    };
    
    setupConfigureForm = function (index) {
        var eventDatabase;
        eventDatabase = schedCtrl.getEventDatabase();
        selectedEvent = eventDatabase[activeDay][index];
        UICtrl.setConfigData(selectedEvent.name, selectedEvent.startTime, selectedEvent.endTime, selectedEvent.notes);

        schedCtrl.deleteFromEventDatabase(index, activeDay);
        schedCtrl.deleteTimeSlot(index, activeDay);
    };
    
    return {
        init: function () {
            setupEventListeners();
            activeDay = 'MON';
            
            /*
            addEvent({name:'Breakfast', startTime: '07:00', endTime: '07:30', notes: ''});
            addEvent({name:'Workout', startTime: '08:15', endTime: '09:00', notes: '4 sets, 15 reps of each: Glute Bridge, Step Up, Squat, Leg Curl'});
            addEvent({name:'Algorithms Practice', startTime: '09:00', endTime: '11:30', notes: 'Focus on calculating time complexity'});
            addEvent({name:'Lunch', startTime: '11:30', endTime: '12:30', notes: ''});
            addEvent({name:'Calligraphy Club', startTime: '14:00', endTime: '15:30', notes: 'Workshop on flourishing'});
            */

            if (/*@cc_on!@*/false || !!document.documentMode) {
                DOMobjects.startTimeInput.setAttribute('title', 'Military time XX:XX');
                DOMobjects.endTimeInput.setAttribute('title', 'Military time XX:XX');
            }

        }
    };
}(scheduleController, UIController));

eventController.init();
    
