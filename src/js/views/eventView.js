import { DOMobjects, toStandardTime } from './base';

const renderEvent = (event, index) => {
  const markup = `
  <div id="event_${index}" class="eventContainer ${event.notes ? 'hasNote' : ''}">
    <div class="event">
      <div>
        <div class="event__time">
          <span class="event__start">${toStandardTime(event.timeSlot.startTime)}</span>
          <span class="event__end">${toStandardTime(event.timeSlot.endTime)}</span>
        </div>
      </div>
      <div>
        <div class="event__name">
          <p>${event.name}</p>
        </div>
      </div>
      <div>
        <div class="event__buttons">
          <button class="event__config">
            <i class="fas fa-cog"></i>
          </button>
          ${event.notes ? `
          <button class="event__toggleNote">
            <i class="fas fa-sticky-note"></i>
          </button>
          ` : ''}
          <button class="event__delete">
            <i class="fas fa-times-circle"></i>
          </button>
        </div>
      </div>
      <div>
        <div class="event__note">
          <p>${event.notes}</p>
        </div>
      </div>
    </div>
  </div>
  `;

  DOMobjects.routineContainer.insertAdjacentHTML('beforeend', markup);
};

export const renderSchedule = (events) => {
  events.forEach((event, index) => renderEvent(event, index));
};

export const deleteEvent = (index) => {
  const eventDOM = document.getElementById(`event_${index}`);
  // Animation for deleting event
  eventDOM.firstElementChild.style.opacity = 0;
  eventDOM.firstElementChild.style.height = 0;
  eventDOM.style.margin = 0;
  // Delete event after animation over
  setTimeout(() => {
    eventDOM.parentNode.removeChild(eventDOM);
  }, 300);
};

export const clearSchedule = () => {
  DOMobjects.routineContainer.innerHTML = '';
};

export const toggleNote = (eventIndex) => {
  const event = document.getElementById(`event_${eventIndex}`);
  event.classList.toggle('openNote');
};

export const updateIndices = () => {
  const eventArray = Array.from(document.querySelectorAll('.eventContainer'));
  eventArray.forEach((event, index) => event.setAttribute('id', `event_${index}`));
};
