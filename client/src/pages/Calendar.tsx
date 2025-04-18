import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppointmentDialog from '@/components/calendar/AppointmentDialog';

// Define appointment type to match our database schema
interface Appointment {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number;
  description: string;
  colorCode?: string;
  createdAt?: string;
}

const Calendar = () => {
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Format year and month for the API query
  const yearMonth = format(currentMonth, 'yyyy-MM');
  
  // Query appointments for the selected month
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments', yearMonth],
    queryFn: async () => {
      const response = await fetch(`/api/appointments?month=${yearMonth}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      return await response.json();
    }
  });

  // Generate days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Handle navigation to previous/next month
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    return appointments.filter(appointment => {
      return appointment.date === formattedDay;
    });
  };
  
  // Format appointment time
  const formatAppointmentTime = (timeString: string) => {
    // Time is already in HH:MM format, so we need to parse it
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, 'h:mm a');
  };
  
  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{t.appointments}</h2>
        <AppointmentDialog />
      </div>
      
      <Card>
        <CardHeader className="bg-white border-b">
          <div className="flex justify-between items-center">
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr">
            {/* Fill in leading empty cells for proper day alignment */}
            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div
                key={`empty-start-${index}`}
                className="p-2 min-h-[100px] bg-gray-50 border-b border-r"
              />
            ))}
            
            {/* Render the days of the month */}
            {days.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 min-h-[100px] border-b border-r relative ${
                    isToday(day) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-sm font-medium ${
                        isToday(day) ? 'text-blue-600' : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <TooltipProvider key={appointment.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded truncate cursor-pointer">
                              {formatAppointmentTime(appointment.time)}: {appointment.title}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-medium">{appointment.title}</p>
                              <p className="text-xs">
                                {formatAppointmentTime(appointment.time)} ({appointment.duration} min)
                              </p>
                              {appointment.description && (
                                <p className="text-xs">{appointment.description}</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500 flex items-center">
                        <MoreHorizontal className="h-3 w-3 mr-1" />
                        {dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Fill in trailing empty cells */}
            {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
              <div
                key={`empty-end-${index}`}
                className="p-2 min-h-[100px] bg-gray-50 border-b border-r"
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Toaster component for notifications */}
      <Toaster />
    </div>
  );
};

export default Calendar;