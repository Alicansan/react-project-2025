import React, { forwardRef } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventInput } from "@fullcalendar/core/index.js";
import dayjs from "dayjs";
import { getStaffColor, getStaffById } from "./utils";
import type { ScheduleInstance } from "../../models/schedule";

type FullCalendarComponentProps = {
  language: string;
  initialDate: Date;
  events: EventInput[];
  schedule: ScheduleInstance;
  selectedStaffId: string | null;
  highlightedDates: string[];
  staffOverlaps: Record<string, string[]>;
  validDates: () => string[];
  onEventClick: (info: any) => void;
  onDatesSet: (info: any) => void;
};

const FullCalendarComponent = forwardRef<
  FullCalendar,
  FullCalendarComponentProps
>(
  (
    {
      language,
      initialDate,
      events,
      schedule,
      selectedStaffId,
      highlightedDates,
      staffOverlaps,
      validDates,
      onEventClick,
      onDatesSet,
    },
    ref
  ) => {
    const getPlugins = () => {
      const plugins = [dayGridPlugin];
      plugins.push(interactionPlugin);
      return plugins;
    };

    const RenderEventContent = ({ eventInfo }: any) => {
      return (
        <div className="event-content">
          <p>{eventInfo.event.title}</p>
        </div>
      );
    };

    return (
      <FullCalendar
        ref={ref}
        locale={language}
        plugins={getPlugins()}
        contentHeight={400}
        handleWindowResize={true}
        selectable={true}
        editable={false}
        eventOverlap={true}
        eventDurationEditable={false}
        eventClick={onEventClick}
        initialView="dayGridMonth"
        initialDate={initialDate}
        events={events}
        firstDay={1}
        dayMaxEventRows={4}
        fixedWeekCount={true}
        showNonCurrentDates={true}
        eventContent={(eventInfo: any) => (
          <RenderEventContent eventInfo={eventInfo} />
        )}
        datesSet={onDatesSet}
        dayCellContent={({ date }) => {
          const found = validDates().includes(dayjs(date).format("YYYY-MM-DD"));
          const isHighlighted = highlightedDates.includes(
            dayjs(date).format("DD-MM-YYYY")
          );
          const dateStr = dayjs(date).format("YYYY-MM-DD");
          const overlappingStaff = staffOverlaps[dateStr] || [];

          return (
            <div
              className={`${found ? "" : "date-range-disabled"} ${
                isHighlighted ? "highlighted-date-orange" : ""
              }`}
            >
              <span className="date-number">{dayjs(date).date()}</span>
              {overlappingStaff.length > 0 && (
                <div className="overlap-indicators">
                  {overlappingStaff.map((staffId, index) => {
                    const staff = getStaffById(staffId, schedule);
                    return (
                      <div
                        key={`${dateStr}-${staffId}-${index}`}
                        className={`overlap-indicator ${getStaffColor(
                          staffId
                        )}`}
                        title={`Overlaps with: ${
                          staff?.name || "Unknown staff"
                        }`}
                        data-staff-id={staffId}
                      />
                    );
                  })}
                  {overlappingStaff.length > 1 && (
                    <div
                      className="overlap-count"
                      title={`Overlaps with ${
                        overlappingStaff.length
                      } staff: ${overlappingStaff
                        .map(
                          (id) => getStaffById(id, schedule)?.name || "Unknown"
                        )
                        .join(", ")}`}
                    >
                      +{overlappingStaff.length}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }}
      />
    );
  }
);

export default FullCalendarComponent;
