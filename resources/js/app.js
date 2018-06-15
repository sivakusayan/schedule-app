/*eslint-env browser*/

/*-----------------------------------------------------------------------------*/
/* SCHEDULE CONTROLLER */
/*-----------------------------------------------------------------------------*/

var scheduleController = (function () {
    'use strict';
    
    var id_generator, Event, eventDatabase, daysOfWeek, toTwelveHourTime;
    
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
    
    toTwelveHourTime = function (militaryTime) {
        
    };
    
    return {
        validateTime: function (eventObj) {
            return eventObj.startTime < eventObj.endTime;
        },
        
        addToDatabase: function (name, startTime, endTime, notes) {
            var eventObj, event_id;
            event_id = id_generator;
            id_generator += 1;
            
            eventObj = new Event(name, toTwelveHourTime(startTime), toTwelveHourTime(endTime), notes, event_id);
            eventDatabase[daysOfWeek[0]].push(eventObj);
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
        
        displayEvents: function (database) {
            
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
        var EventObj;
        EventObj = UICtrl.getInputData();

        if (!schedCtrl.validateTime(EventObj)) {
            DOMobjects.endTimeInput.setCustomValidity('End time should be after the Start time.');
        } else {
            DOMobjects.endTimeInput.setCustomValidity('');
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
                DOMobjects.newEventForm.reset();
            }, 300);
        });
        /*------------------------FORM VALIDATION------------------------------*/
        
        DOMobjects.endTimeInput.addEventListener('input', setValidationMessage);
        DOMobjects.startTimeInput.addEventListener('input', setValidationMessage);
        DOMobjects.newEventForm.addEventListener('submit', function () {
            var EventObj;
            EventObj = UICtrl.getInputData();
            
            addEvent(EventObj);
        });
        
        /*-------------------------WEEK BUTTONS--------------------------------*/
        
        DOMobjects.week.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {
                document.querySelector('.activeDay').classList.remove('activeDay');
                event.target.classList.add('activeDay');
            }
        });
    };
    
    addEvent = function (obj) {
        var eventDatabase;
        //1. Transfer data to schedule controller
        schedCtrl.addToDatabase(obj.name, obj.startTime, obj.endTime, obj.notes);
        //2. Transfer data from schedule controller to UI controller
        eventDatabase = schedCtrl.getDatabase();
        //3. Update UI
        UICtrl.displayEvents(eventDatabase);
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
    
