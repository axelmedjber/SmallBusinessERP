import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { translations, formatDate, generateAppointmentColor } from "@/lib/utils";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import AppointmentDialog from "./AppointmentDialog";
import { queryClient } from "@/lib/queryClient";

const AppointmentCalendar = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments", format(currentDate, "yyyy-MM")],
  });
  
  const addAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to add appointment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments", format(currentDate, "yyyy-MM")] });
    },
  });
  
  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleAddAppointment = (appointmentData: any) => {
    addAppointmentMutation.mutate(appointmentData);
    setIsAppointmentDialogOpen(false);
  };
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get days from previous month to fill the first week
  const firstDayOfMonth = monthStart.getDay();
  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(-i);
    return date;
  }).reverse();
  
  // Get days from next month to fill the last week
  const lastDayOfMonth = monthEnd.getDay();
  const nextMonthDays = Array.from({ length: 6 - lastDayOfMonth }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(monthEnd.getDate() + i + 1);
    return date;
  });
  
  const days = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];
  
  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    if (!appointments) return [];
    
    const dateString = format(date, "yyyy-MM-dd");
    return appointments.filter((appointment: any) => 
      appointment.date.startsWith(dateString)
    );
  };
  
  if (isLoading) {
    return (
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">{t.appointmentCalendar}</h2>
        </div>
        <div className="h-96 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }
  
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{t.appointmentCalendar}</h2>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousMonth}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <span className="mx-4 text-sm font-medium">
              {formatDate(currentDate, language)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
          
          <Button
            variant="default"
            size="sm"
            className="bg-primary"
            onClick={() => setIsAppointmentDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.addAppointment}
          </Button>
        </div>
      </div>
      
      <Card className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7">
          {/* Calendar Day Headers */}
          <div className="border-b border-r border-gray-200 py-2 text-center text-sm font-medium text-gray-700">{t.sunday}</div>
          <div className="border-b border-r border-gray-200 py-2 text-center text-sm font-medium text-gray-700">{t.monday}</div>
          <div className="border-b border-r border-gray-200 py-2 text-center text-sm font-medium text-gray-700">{t.tuesday}</div>
          <div className="border-b border-r border-gray-200 py-2 text-center text-sm font-medium text-gray-700">{t.wednesday}</div>
          <div className="border-b border-r border-gray-200 py-2 text-center text-sm font-medium text-gray-700">{t.thursday}</div>
          <div className="border-b border-r border-gray-200 py-2 text-center text-sm font-medium text-gray-700">{t.friday}</div>
          <div className="border-b border-gray-200 py-2 text-center text-sm font-medium text-gray-700">{t.saturday}</div>
          
          {/* Calendar Days */}
          {weeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              const dayAppointments = getAppointmentsForDay(day);
              
              return (
                <div 
                  key={`${weekIndex}-${dayIndex}`}
                  className={`
                    ${dayIndex < 6 ? 'border-r' : ''} 
                    ${weekIndex < weeks.length - 1 ? 'border-b' : ''} 
                    border-gray-200 h-24 p-1 
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} 
                    text-right
                  `}
                >
                  <div className={`text-sm p-1 ${isDayToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto' : ''}`}>
                    {getDate(day)}
                  </div>
                  
                  {dayAppointments.map((appointment: any) => (
                    <div 
                      key={appointment.id}
                      className={`mt-1 text-xs mb-1 truncate px-1 py-0.5 rounded-sm ${generateAppointmentColor(appointment.id)}`}
                    >
                      {appointment.time} - {appointment.title}
                    </div>
                  ))}
                </div>
              );
            })
          ))}
        </div>
      </Card>
      
      <AppointmentDialog 
        isOpen={isAppointmentDialogOpen}
        onClose={() => setIsAppointmentDialogOpen(false)}
        onSave={handleAddAppointment}
        currentDate={currentDate}
      />
    </section>
  );
};

export default AppointmentCalendar;
