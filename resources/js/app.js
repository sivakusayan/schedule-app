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
        week: document.querySelector('.nav__week'),
        overlay: document.getElementById('overlay')
    };
    
    return {
        getDOMobjects: function () {
            return DOMobjects;
        },
        
        darkenScreen: function () {
            DOMobjects.overlay.classList.remove('overlayOFF');
            DOMobjects.overlayoverlay.classList.add('overlayON');
        },
        
        lightenScreen: function () {
            DOMobjects.overlay.classList.remove('overlayON');
            DOMobjects.overlayoverlay.classList.add('overlayOFF');
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
    
