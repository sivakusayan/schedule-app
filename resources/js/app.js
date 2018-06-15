/*eslint-env browser*/

/*-----------------------------------------------------------------------------*/
/* SCHEDULE CONTROLLER */
/*-----------------------------------------------------------------------------*/

var scheduleController = (function () {
    'use strict';
    
    return {
        validateTime: function (obj) {
            return obj.startTime < obj.endTime;
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
        
        fadeIn: function (obj) {
            darkenScreen();
            obj.style.visibility = 'visible';
            obj.style.opacity = 1;
        },
        
        fadeOut: function (obj) {
            lightenScreen();
            obj.style.opacity = 0;
            setTimeout(function () {
                obj.style.visibility = 'hidden';
            }, 300);
        },
        
        getInputData: function () {
            return {
                name: DOMobjects.nameInput.value,
                startTime: DOMobjects.startTimeInput.value,
                endTime: DOMobjects.endTimeInput.value,
                notes: DOMobjects.notesInput.value
            };
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
        //2. Transfer data to schedule controller
        //3. Update schedule controller
        //4. Transfer data from schedule controller to UI controller
        //5. Update UI

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
    
