/*eslint-env browser*/

/*-----------------------------------------------------------------------------*/
/* SCHEDULE CONTROLLER */
/*-----------------------------------------------------------------------------*/

var scheduleController = (function () {
    'use strict';
    
    var Event, eventDatabase, reservedTimeSlots, daysOfWeek;
    
    Event = function (name, startTime, endTime, notes) {
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.notes = notes;
    };
    
    daysOfWeek = ['Monday', 'Tuesday', 'Wedensday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    eventDatabase = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
    };
    
    reservedTimeSlots = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
    };
    
    return {
        validateTimeFormat: function (timeInputs) {
            if (timeInputs[1] !== '') {
                return timeInputs[0].value < timeInputs[1].value;
            } else {
                return true;
            }
        },
        
        validateNoTimeOverlap: function (time, type) {
            var timeSlots;
            timeSlots = reservedTimeSlots[daysOfWeek[0]];
            
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
        
        validateNoSubEvents: function (timeInputs) {
            var timeSlots;
            timeSlots = reservedTimeSlots[daysOfWeek[0]];
            
            //Index 0 is startTime, Index 1 is endTime
            for (var i = 0; i < timeSlots.length; i++) {
                    if (timeInputs[0].value <= timeSlots[i][0] && timeSlots[i][1] <= timeInputs[1].value) {
                        return false;    
                    } 
                }  
            
            return true;
        },
        
        addToEventDatabase: function (name, startTime, endTime, notes) {
            var eventObj;
            
            eventObj = new Event(name, startTime, endTime, notes);
            if (eventDatabase[daysOfWeek[0]].length === 0) {
                eventDatabase[daysOfWeek[0]].push(eventObj);
            } else { //Linear search to keep database in order
                var indexToInsert;
                indexToInsert = 0;
                
                for (var i = 0; i < eventDatabase[daysOfWeek[0]].length; i++) {
                    if (eventObj.startTime > eventDatabase[daysOfWeek[0]][i].startTime) {
                        indexToInsert += 1;
                    }
                }
                eventDatabase[daysOfWeek[0]].splice(indexToInsert, 0, eventObj);   
            }
        },
        
        recordTimeSlot: function (startTime, endTime) {
            reservedTimeSlots[daysOfWeek[0]].push([startTime, endTime]);
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
    
    var DOMobjects, dataToHTML, eventHTMLDatabase, resetEventHTMLDatabase, daysOfWeek, darkenScreen, lightenScreen, toStandardTime;
    
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
    
    daysOfWeek = ['Monday', 'Tuesday', 'Wedensday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    eventHTMLDatabase = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
    };
    
    resetEventHTMLDatabase = function () {
        eventHTMLDatabase = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
        };
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

        resetNewEventForm: function () { 
            DOMobjects.startTimeInput.setCustomValidity('');
            DOMobjects.endTimeInput.setCustomValidity('');
            DOMobjects.newEventForm.reset();
        },
        
        updateHTMLDatabase: function (eventDatabase) {
            resetEventHTMLDatabase();
            for (var i = 0; i < eventDatabase[daysOfWeek[0]].length; i++) {
                var eventHTML = dataToHTML(eventDatabase[daysOfWeek[0]][i], i);
                eventHTMLDatabase[daysOfWeek[0]].push(eventHTML);
            }
        },
        
        displayEvents: function () {
            while(DOMobjects.routineContainer.firstChild) {
                DOMobjects.routineContainer.removeChild(DOMobjects.routineContainer.firstChild);
            }
            for (var i = 0; i < eventHTMLDatabase[daysOfWeek[0]].length ; i++) {
                DOMobjects.routineContainer.insertAdjacentHTML('beforeend', eventHTMLDatabase[daysOfWeek[0]][i]);
            }
        }
    };
    
}());

/*-----------------------------------------------------------------------------*/
/* EVENT CONTROLLER */
/*-----------------------------------------------------------------------------*/

var eventController = (function (schedCtrl, UICtrl) {
    'use strict';
    
    var daysOfWeek, setupEventListeners, addEvent, deleteEvent, setupConfigureForm, DOMobjects, setValidationMessage;
    
    DOMobjects = UICtrl.getDOMobjects();
    daysOfWeek = ['Monday', 'Tuesday', 'Wedensday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    setValidationMessage = function () {
        var timeInputs, validityCheck;
        timeInputs = [DOMobjects.startTimeInput, DOMobjects.endTimeInput];
        validityCheck = [1,1]

        for (var i = 0; i < 2; i++) {
            if (!schedCtrl.validateNoTimeOverlap(timeInputs[i].value, i)) {
                timeInputs[i].setCustomValidity('You can\'t have overlapping event times.');
                validityCheck[i] = 0;
            } else if (!schedCtrl.validateTimeFormat(timeInputs)) {
                timeInputs[1].setCustomValidity('End time should be after the Start time.'); 
                validityCheck[1] = 0;
            } else if (!schedCtrl.validateNoSubEvents(timeInputs)) {
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
                UICtrl.resetEventForm();
            }, 300);
        });
        /*------------------------FORM VALIDATION------------------------------*/
        
        DOMobjects.endTimeInput.addEventListener('input', setValidationMessage);
        DOMobjects.startTimeInput.addEventListener('input', setValidationMessage);
        DOMobjects.newEventForm.addEventListener('submit', addEvent);
        
        /*-------------------------WEEK BUTTONS--------------------------------*/
        
        DOMobjects.week.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {
                document.querySelector('.activeDay').classList.remove('activeDay');
                event.target.classList.add('activeDay');
            }
        });
        
        /*-------------------------EVENT BUTTONS--------------------------------*/
        
        DOMobjects.routineContainer.addEventListener('click', function (event) {
            
            if (event.target.tagName === 'I') {
                var buttonType, index;
                buttonType = event.target.getAttribute('id').split('_')[0]; 
                index = event.target.getAttribute('id').split('_')[1]; 
                
                if (buttonType === 'config') {
                    setupConfigureForm(index);
                    UICtrl.fadeIn(DOMobjects.configEventUI);
                } else if (buttonType === 'delete') {
                    deleteEvent(index);
                }
            }
        });
        
        DOMobjects.btnConfigBack.addEventListener('click', function (event) {
            UICtrl.fadeOut(DOMobjects.newEventUI);                                        
        });
    };
    
    addEvent = function () {
        var eventObj, eventDatabase;
        
        eventObj = UICtrl.getInputData();
        //1. Transfer data to schedule controller
        schedCtrl.addToEventDatabase(eventObj.name, eventObj.startTime, eventObj.endTime, eventObj.notes);
        schedCtrl.recordTimeSlot(eventObj.startTime, eventObj.endTime);
        //2. Transfer data to UI controller
        eventDatabase = schedCtrl.getEventDatabase();
        UICtrl.updateHTMLDatabase(eventDatabase);
        //3. Update UI
        UICtrl.displayEvents();
        //4. Reset Form
        UICtrl.fadeOut(DOMobjects.newEventUI);
        UICtrl.resetEventForm();
    };
    
    setupConfigureForm = function (index) {
        var event, eventDatabase;
        eventDatabase = schedCtrl.getEventDatabase();
        event = eventDatabase[daysOfWeek[0]][index];
        UICtrl.setConfigData(event.name, event.startTime, event.endTime, event.notes);
    };
    
    deleteEvent = function () {
        
    };
    
    return {
        init: function () {
            setupEventListeners();

            if (/*@cc_on!@*/false || !!document.documentMode) {
                DOMobjects.startTimeInput.setAttribute("title", "Military time XX:XX");
                DOMobjects.endTimeInput.setAttribute("title", "Military time XX:XX");
            }

        }
    };
}(scheduleController, UIController));

eventController.init();
    
