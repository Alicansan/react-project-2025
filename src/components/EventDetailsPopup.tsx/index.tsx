import dayjs from 'dayjs';

type EventDetailsPopupProps = {
  event: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    staffName: string;
  } | null;
  onClose: () => void;
}

const EventDetailsPopup = ({ event, onClose }: EventDetailsPopupProps) => {
  if (!event) return null;
  
  return (
    <div className="event-popup-overlay" onClick={onClose}>
      <div className="event-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h3>{event.title}</h3>
        <div className="event-details">
          <p><strong>Staff:</strong> {event.staffName}</p>
          <p><strong>Date:</strong> {dayjs(event.date).format('MMMM D, YYYY')}</p>
          <p><strong>Start Time:</strong> {event.startTime}</p>
          <p><strong>End Time:</strong> {event.endTime}</p>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPopup;