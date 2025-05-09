import dayjs from "dayjs";
import type { ScheduleInstance } from "../../models/schedule";

const classes = [
  "bg-one",
  "bg-two",
  "bg-three",
  "bg-four",
  "bg-five",
  "bg-six",
  "bg-seven",
  "bg-eight",
  "bg-nine",
  "bg-ten",
  "bg-eleven",
  "bg-twelve",
  "bg-thirteen",
  "bg-fourteen",
  "bg-fifteen",
  "bg-sixteen",
  "bg-seventeen",
  "bg-eighteen",
  "bg-nineteen",
  "bg-twenty",
  "bg-twenty-one",
  "bg-twenty-two",
  "bg-twenty-three",
  "bg-twenty-four",
  "bg-twenty-five",
  "bg-twenty-six",
  "bg-twenty-seven",
  "bg-twenty-eight",
  "bg-twenty-nine",
  "bg-thirty",
  "bg-thirty-one",
  "bg-thirty-two",
  "bg-thirty-three",
  "bg-thirty-four",
  "bg-thirty-five",
  "bg-thirty-six",
  "bg-thirty-seven",
  "bg-thirty-eight",
  "bg-thirty-nine",
  "bg-forty",
];

// Personel ID'sine dayalı bir renk oluşturmak için fonksiyon
export const getStaffColor = (staffId: string): string => {
  // Tutarlı bir renk ataması için staffId'yi bir sayıya dönüştür
  // Eşit dağılım sağlamak için hash fonksiyonu kullan
  let hash = 0;
  for (let i = 0; i < staffId.length; i++) {
    hash = staffId.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Mevcut sınıfların aralığında bir indeks almak için modulo kullan
  const index = Math.abs(hash % classes.length);
  return classes[index];
};

export const getColorClass = (index: number): string => {
  return classes[index] || classes[0];
};

export const getShiftById = (id: string, schedule: ScheduleInstance) => {
  return schedule?.shifts?.find((shift: { id: string }) => id === shift.id);
};

export const getAssigmentById = (id: string, schedule: ScheduleInstance) => {
  return schedule?.assignments?.find((assign) => id === assign.id);
};

export const getStaffById = (id: string, schedule: ScheduleInstance) => {
  return schedule?.staffs?.find((staff) => id === staff.id);
};

export const getDatesBetween = (
  startDate: string,
  endDate: string
): string[] => {
  const dates: string[] = [];
  const start = dayjs(startDate, "DD.MM.YYYY").toDate();
  const end = dayjs(endDate, "DD.MM.YYYY").toDate();
  const current = new Date(start);

  while (current <= end) {
    dates.push(dayjs(current).format("DD-MM-YYYY"));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};
