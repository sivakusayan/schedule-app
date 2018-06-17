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
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: []
    };
    
    reservedTimeSlots = {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: []
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
                    if (time >= timeSlots[i][0] && time < timeSlots[i][1]) {
                        return false;    
                    } 
                }   
            } else if (type === 1) {
                for (var i = 0; i < timeSlots.length; i++) {
                    if (time > timeSlots[i][0] && time <= timeSlots[i][1]) {
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
            newHTML = newHTML.replace('<div><div class="event__notes"><p>%notes%</p></div></div>', '');
        }
        
        return newHTML;
    };

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
        
        btnReset: document.getElementById('btnReset'),
        
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
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: []
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
    
    var activeDay, setupEventListeners, addEvent, deleteEvent, selectedEvent, selectedEventIndex, setupConfigureForm, DOMobjects, setValidationMessage;
    
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
        
        DOMobjects
        /*------------------------FORM VALIDATION------------------------------*/
        
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
        
        /*-------------------------WEEK BUTTONS--------------------------------*/
        
        DOMobjects.week.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {
                activeDay = event.target.textContent;
                
                document.querySelector('.activeDay').classList.remove('activeDay');
                event.target.classList.add('activeDay');
                
                DOMobjects.routineContainer.style.opacity = 0;
                setTimeout(function () {
                    UICtrl.displayEvents(activeDay);
                    DOMobjects.routineContainer.style.opacity = 1;
                }, 400)
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
    
    };
    addEvent = function (eventObj) {
        var eventDatabase;
        //1. Transfer data to schedule controller
        schedCtrl.addToEventDatabase(eventObj.name, eventObj.startTime, eventObj.endTime, eventObj.notes, activeDay);
        schedCtrl.recordTimeSlot(eventObj.startTime, eventObj.endTime, activeDay);
        //2. Transfer data to UI controller
        eventDatabase = schedCtrl.getEventDatabase();
        UICtrl.updateHTMLDatabase(eventDatabase, activeDay);
        //3. Update UI
        UICtrl.displayEvents(activeDay);
    };
    
    setupConfigureForm = function (index) {
        var eventDatabase;
        eventDatabase = schedCtrl.getEventDatabase();
        selectedEvent = eventDatabase[activeDay][index];
        UICtrl.setConfigData(selectedEvent.name, selectedEvent.startTime, selectedEvent.endTime, selectedEvent.notes);

        schedCtrl.deleteFromEventDatabase(index, activeDay);
        schedCtrl.deleteTimeSlot(index, activeDay);
    };
    
    deleteEvent = function (index) {
        var newEventDatabase;
        
        schedCtrl.deleteFromEventDatabase(index, activeDay);
        
        newEventDatabase = schedCtrl.getEventDatabase();
        UICtrl.updateHTMLDatabase(newEventDatabase, activeDay);
        UICtrl.displayEvents(activeDay);   
    };
    
    return {
        init: function () {
            setupEventListeners();
            activeDay = 'Mon';

            if (/*@cc_on!@*/false || !!document.documentMode) {
                DOMobjects.startTimeInput.setAttribute("title", "Military time XX:XX");
                DOMobjects.endTimeInput.setAttribute("title", "Military time XX:XX");
            }

        }
    };
}(scheduleController, UIController));

eventController.init();
    
