/*eslint-env browser*/

/*-----------------------------------------------------------------------------*/
/* SCHEDULE CONTROLLER */
/*-----------------------------------------------------------------------------*/

var scheduleController = (function () {
    'use strict';
    
    var id_generator, Event, eventDatabase, reservedTimeSlots, daysOfWeek, toStandardTime;
    
    id_generator = 0;
    
    Event = function (name, startTime, endTime, notes, id) {
        this.name = name;
        this.startTime = startTime;
        this.endTIme = endTime;
        this.notes = notes;
        this.id = id;
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
    
    toStandardTime = function (militaryTime) {
        var hours, minutes, standardTime;
        
        hours = Number(militaryTime.split(':')[0]);
        minutes = militaryTime.split(':')[1];
        
        if (hours > 12) {
            standardTime = hours % 12 + ':' + minutes + 'PM';
        } else if (hours === 12) {
            standardTime = hours + ':' + minutes + 'PM';
        } else if (hours === 0) {
            standardTime = hours + 12 + ':' + minutes + 'AM';
        } else if (hours <= 12) {
            standardTime = hours + ':' + minutes + 'AM';
        }
        
        return standardTime;
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
        
        addToDatabase: function (name, startTime, endTime, notes) {
            var eventObj, event_id;
            event_id = id_generator;
            id_generator += 1;
            
            eventObj = new Event(name, toStandardTime(startTime), toStandardTime(endTime), notes, event_id);
            eventDatabase[daysOfWeek[0]].push(eventObj);
        },
        
        recordTimeSlot: function (startTime, endTime) {
            reservedTimeSlots[daysOfWeek[0]].push([startTime, endTime]);
        },
        
        getDatabase: function () {
            return eventDatabase;
        }
    };
    
}());

/*-----------------------------------------------------------------------------*/
/* UI CONTROLLER */
/*-----------------------------------------------------------------------------*/

var UIController = (function () {
    'use strict';
    
    var DOMobjects, darkenScreen, lightenScreen;
    
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
        newEventSubmit: document.querySelector('.newEventUI__submit')
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
    
    return {
        getDOMobjects: function () {
            return DOMobjects;
        },
        
        fadeIn: function (domObj) {
            darkenScreen();
            domObj.style.visibility = 'visible';
            domObj.style.opacity = 1;
        },
        
        fadeOut: function (domObj) {
            lightenScreen();
            domObj.style.opacity = 0;
            setTimeout(function () {
                domObj.style.visibility = 'hidden';
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

        resetEventForm: function () { 
            DOMobjects.newEventForm.reset();
            DOMobjects.startTimeInput.setCustomValidity('');
            DOMobjects.endTimeInput.setCustomValidity('');
        },
        
        constructHTML: function (database) {
            var html, newHtml;
            
            html = '<div class="eventContainer"><div class="event"><div><div class="event__notes hasNote"><p>%notes%</p></div></div><div><div class="event__name"><p>%name%</p></div></div><div><div class="event__time"><button class="event__settings"><i class="fas fa-cog"></i></button><span class="event__start">%timeStart%</span><span class="event__end">%timeEnd%</span></div></div></div></div>';
        }
    };
    
}());

/*-----------------------------------------------------------------------------*/
/* EVENT CONTROLLER */
/*-----------------------------------------------------------------------------*/

var eventController = (function (schedCtrl, UICtrl) {
    'use strict';
    
    var setupEventListeners, addEvent, DOMobjects, setValidationMessage;
    
    DOMobjects = UICtrl.getDOMobjects();
    
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
    };
    
    addEvent = function () {
        var eventObj, eventDatabase;
        
        eventObj = UICtrl.getInputData();
        //1. Transfer data to schedule controller
        schedCtrl.addToDatabase(eventObj.name, eventObj.startTime, eventObj.endTime, eventObj.notes);
        schedCtrl.recordTimeSlot(eventObj.startTime, eventObj.endTime);
        //2. Transfer data from schedule controller to UI controller
        eventDatabase = schedCtrl.getDatabase();
        //3. Update UI
        UICtrl.constructHTML(eventDatabase);
        
        UICtrl.fadeOut(DOMobjects.newEventUI);
        UICtrl.resetEventForm();
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
    
