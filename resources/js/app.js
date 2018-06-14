/*eslint-env browser*/

/*-----------------------------------------------------------------------------*/
/* SCHEDULE CONTROLLER */
/*-----------------------------------------------------------------------------*/

var scheduleController = (function () {
    'use strict';
    
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
        btnNewBack: document.querySelector('.newEventUI__back'),
        newEventUI: document.querySelector('.newEventUI')
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
        }
    
    };
    
}());

/*-----------------------------------------------------------------------------*/
/* EVENT CONTROLLER */
/*-----------------------------------------------------------------------------*/

var eventController = (function (schedCtrl, UICtrl) {
    'use strict';
    
    var setupEventListeners;
    
    setupEventListeners = function () {
        var DOMobjects;
        
        DOMobjects = UICtrl.getDOMobjects();
        
        DOMobjects.btnNew.addEventListener('click', function () {
            UICtrl.fadeIn(DOMobjects.newEventUI);
        });
        DOMobjects.btnNewBack.addEventListener('click', function () {
            UICtrl.fadeOut(DOMobjects.newEventUI);
        });
        
        DOMobjects.week.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {
                document.querySelector('.activeDay').classList.remove('activeDay');
                event.target.classList.add('activeDay');
            }
        });
        
        
    };
    
    return {
        init: function () {
            setupEventListeners();
        }
    };
}(scheduleController, UIController));

eventController.init();
    
