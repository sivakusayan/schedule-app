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
    
    var DOMobjects;
    
    DOMobjects = {
        week: document.querySelector('.week'),
        overlay: document.getElementById('overlay'),
        btnNew: document.getElementById('btnNew'),
        btnNewBack: document.querySelector('.newEventUI__back'),
        newEventUI: document.querySelector('.newEventUI')
    };
    
    return {
        getDOMobjects: function () {
            return DOMobjects;
        },
        
        darkenScreen: function () {
            DOMobjects.overlay.classList.remove('overlayOFF');
            DOMobjects.overlay.classList.add('overlayON');
        },
        
        lightenScreen: function () {
            DOMobjects.overlay.classList.remove('overlayON');
            DOMobjects.overlay.classList.add('overlayFADE');
            
            setTimeout(function () {
                DOMobjects.overlay.classList.remove('overlayFADE');
                DOMobjects.overlay.classList.add('overlayOFF');
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
        var DOMobjects = UICtrl.getDOMobjects();
        
        DOMobjects.btnNew.addEventListener('click', function () {
            UICtrl.darkenScreen();
            DOMobjects.newEventUI.style.visibility = 'visible';
            DOMobjects.newEventUI.style.opacity = 1;
        });
        
        DOMobjects.btnNewBack.addEventListener('click', function () {
            UICtrl.lightenScreen();
            DOMobjects.newEventUI.style.visibility = 'hidden';
            DOMobjects.newEventUI.style.opacity = 0;
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
    
