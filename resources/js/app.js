var scheduleController = (function () {
    'use strict';
    
}());

var UIController = (function () {
    'use strict';
    
    
    
}());

var eventController = (function (schedCtrl, UICtrl) {
    'use strict';

    
}(scheduleController, UIController));

document.querySelector('.nav__week').addEventListener('click', function (event) {
    
    if (event.target.tagName === 'BUTTON') {
        document.querySelector('.activeDay').classList.remove('activeDay');
        event.target.classList.add('activeDay');   
    }
});
    
