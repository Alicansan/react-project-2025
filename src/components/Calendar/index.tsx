/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "../profileCalendar.scss";
import FullCalendar from "@fullcalendar/react";
import FullCalendarComponent from "./FullCalendarComponent";
import StaffList from "./StaffList";
import EventDetailsPopup from "./EventDetailsPopup";
import {
  getColorClass,
  getShiftById,
  getAssigmentById,
  getStaffById,
  getDatesBetween,
} from "./utils";
import type { EventInput } from "@fullcalendar/core/index.js";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

type CalendarContainerProps = {
  schedule: ScheduleInstance;
  auth: UserInstance;
};

const CalendarContainer = ({ schedule, auth }: CalendarContainerProps) => {
  const calendarRef = useRef<FullCalendar>(null);

  const [events, setEvents] = useState<EventInput[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [initialDate, setInitialDate] = useState<Date>(
    dayjs(schedule?.scheduleStartDate).toDate()
  );
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [staffOverlaps, setStaffOverlaps] = useState<Record<string, string[]>>(
    {}
  );

  useEffect(() => {
    if (schedule?.scheduleStartDate && calendarRef.current) {
      const startDate = dayjs(schedule.scheduleStartDate).toDate();
      setTimeout(() => {
        calendarRef?.current?.getApi().gotoDate(startDate);
      }, 0);
    }
  }, [schedule?.scheduleStartDate]);

  const validDates = () => {
    const dates: string[] = [];
    let currentDate = dayjs(schedule.scheduleStartDate);
    while (
      currentDate.isBefore(schedule.scheduleEndDate) ||
      currentDate.isSame(schedule.scheduleEndDate)
    ) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  };

  const generateStaffBasedCalendar = () => {
    const works: EventInput[] = [];

    // seçili staff'ın event'lerini filtrele
    const staffAssignments =
      schedule?.assignments?.filter(
        (assignment) => assignment.staffId === selectedStaffId
      ) || [];

    for (let i = 0; i < staffAssignments.length; i++) {
      const className = schedule?.shifts?.findIndex(
        (shift) => shift.id === staffAssignments[i]?.shiftId
      );

      const assignmentDate = dayjs
        .utc(staffAssignments[i]?.shiftStart)
        .format("YYYY-MM-DD");
      const isValidDate = validDates().includes(assignmentDate);

      const work = {
        id: staffAssignments[i]?.id,
        title: getShiftById(staffAssignments[i]?.shiftId, schedule)?.name,
        duration: "01:00",
        date: assignmentDate,
        staffId: staffAssignments[i]?.staffId,
        shiftId: staffAssignments[i]?.shiftId,
        className: `event ${getColorClass(className)} ${
          getAssigmentById(staffAssignments[i]?.id, schedule)?.isUpdated
            ? "highlight"
            : ""
        } ${!isValidDate ? "invalid-date" : ""}`,
      };
      works.push(work);
    }

    const offDays = schedule?.staffs?.find(
      (staff) => staff.id === selectedStaffId
    )?.offDays;
    const dates = getDatesBetween(
      dayjs(schedule.scheduleStartDate).format("DD.MM.YYYY"),
      dayjs(schedule.scheduleEndDate).format("DD.MM.YYYY")
    );
    const newHighlightedDates: string[] = [];

    dates.forEach((date) => {
      const transformedDate = dayjs(date, "DD-MM-YYYY").format("DD.MM.YYYY");
      if (offDays?.includes(transformedDate)) newHighlightedDates.push(date);
    });

    setHighlightedDates(newHighlightedDates);
    setEvents(works);
  };

  // Her tarih için çakışan personeli bul
  const findOverlappingStaff = () => {
    // Çakışmaları sıfırla
    const overlaps: Record<string, string[]> = {};

    if (!schedule?.assignments || !selectedStaffId) return;

    // Mevcut personel atamalarını al
    const currentStaffAssignments = schedule.assignments
      .filter((assignment) => assignment.staffId === selectedStaffId)
      .map((assignment) => {
        const date = dayjs.utc(assignment.shiftStart).format("YYYY-MM-DD");
        return date;
      });

    // Çakışmalar için diğer tüm personel atamalarını kontrol et
    schedule.assignments.forEach((assignment) => {
      // Mevcut personelse atla
      if (assignment.staffId === selectedStaffId) return;

      const date = dayjs.utc(assignment.shiftStart).format("YYYY-MM-DD");

      // Bu tarih seçilen personel tarafından da çalışılıyorsa
      if (currentStaffAssignments.includes(date)) {
        if (!overlaps[date]) {
          overlaps[date] = [];
        }
        // Bu personeli çakışmalara ekle (eğer zaten yoksa)
        if (!overlaps[date].includes(assignment.staffId)) {
          overlaps[date].push(assignment.staffId);
        }
      }
    });

    setStaffOverlaps(overlaps);
  };

  useEffect(() => {
    setSelectedStaffId(schedule?.staffs?.[0]?.id);
    generateStaffBasedCalendar();
    findOverlappingStaff();
    //Burası schedule startDate varsa takvimin başlangıç tarihi güncellenmesi için
    if (schedule?.scheduleStartDate && calendarRef.current) {
      const startDate = dayjs(schedule.scheduleStartDate).toDate();
      setInitialDate(startDate);
      setTimeout(() => {
        calendarRef?.current?.getApi().gotoDate(startDate);
      }, 0);
    }
  }, [schedule]);

  useEffect(() => {
    generateStaffBasedCalendar();
    findOverlappingStaff();
  }, [selectedStaffId]);

  // Program verileri değiştiğinde çakışmaları güncellemek için ayrı bir etki
  useEffect(() => {
    if (selectedStaffId) {
      findOverlappingStaff();
    }
  }, [schedule?.assignments, selectedStaffId]);

  const handleStaffSelection = (staffId: string) => {
    setSelectedStaffId(staffId);

    // Staff değişitiğinde takvimin başlangıç tarihi güncellenmesi
    if (calendarRef.current && schedule?.scheduleStartDate) {
      calendarRef.current
        .getApi()
        .gotoDate(dayjs(schedule.scheduleStartDate).toDate());
    }
  };

  //popup açma
  const handleEventClick = (info: any) => {
    const eventId = info.event.id;
    const assignment = getAssigmentById(eventId, schedule);

    if (assignment) {
      const shift = getShiftById(assignment.shiftId, schedule);
      const staff = getStaffById(assignment.staffId, schedule);

      setSelectedEvent({
        id: eventId,
        title: shift?.name || "Unknown Shift",
        date: dayjs.utc(assignment.shiftStart).format("YYYY-MM-DD"),
        startTime: dayjs.utc(assignment.shiftStart).format("HH:mm"),
        endTime: dayjs.utc(assignment.shiftEnd).format("HH:mm"),
        staffName: staff?.name || "Unknown Staff",
      });
    }
  };

  //popup kapama
  const closeEventPopup = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="calendar-section">
      <div className="calendar-wrapper">
        <StaffList
          staffs={schedule?.staffs || []}
          selectedStaffId={selectedStaffId}
          onStaffSelect={handleStaffSelection}
        />
        <FullCalendarComponent
          ref={calendarRef}
          language={auth.language}
          initialDate={initialDate}
          events={events}
          schedule={schedule}
          selectedStaffId={selectedStaffId}
          highlightedDates={highlightedDates}
          staffOverlaps={staffOverlaps}
          validDates={validDates}
          onEventClick={handleEventClick}
          onDatesSet={(info) => {
            const prevButton = document.querySelector(
              ".fc-prev-button"
            ) as HTMLButtonElement;
            const nextButton = document.querySelector(
              ".fc-next-button"
            ) as HTMLButtonElement;

            if (
              calendarRef?.current?.getApi().getDate() &&
              !dayjs(schedule?.scheduleStartDate).isSame(
                calendarRef?.current?.getApi().getDate()
              )
            )
              setInitialDate(calendarRef?.current?.getApi().getDate());

            const startDiff = dayjs(info.start)
              .utc()
              .diff(
                dayjs(schedule.scheduleStartDate).subtract(1, "day").utc(),
                "days"
              );
            const endDiff = dayjs(dayjs(schedule.scheduleEndDate)).diff(
              info.end,
              "days"
            );
            if (startDiff < 0 && startDiff > -35) prevButton.disabled = true;
            else prevButton.disabled = false;

            if (endDiff < 0 && endDiff > -32) nextButton.disabled = true;
            else nextButton.disabled = false;
          }}
        />
        {selectedEvent && (
          <EventDetailsPopup event={selectedEvent} onClose={closeEventPopup} />
        )}
      </div>
    </div>
  );
};

export default CalendarContainer;
