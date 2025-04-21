import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MoreHorizontal, Edit, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import AppointmentDialog, { Appointment } from '@/components/calendar/AppointmentDialog';

const Calendar = () => {
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  
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
  
  // Handle appointment click to open edit dialog
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
  };
  
  // Clear selected appointment when dialog closes
  const handleDialogClose = () => {
    setTimeout(() => {
      setSelectedAppointment(undefined);
    }, 300); // Small delay to avoid issues with the dialog animation
    setDialogOpen(false);
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
        <h2 className="text-2xl font-semibold">{t.appointments}</h2>
        <AppointmentDialog 
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t.addAppointment}
            </Button>
          }
        />
      </div>
      
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth} className="bg-background">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="bg-background">
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
                className="p-2 text-center text-sm font-medium text-muted-foreground"
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
                className="p-2 min-h-[100px] bg-muted/20 border-b border-r"
              />
            ))}
            
            {/* Render the days of the month */}
            {days.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 min-h-[100px] border-b border-r relative ${
                    isToday(day) 
                      ? 'bg-blue-50 dark:bg-blue-900/30' 
                      : 'hover:bg-muted/10 transition-colors'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-sm font-medium ${
                        isToday(day) ? 'text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <Button
                        key={appointment.id}
                        onClick={() => handleAppointmentClick(appointment)}
                        variant="ghost"
                        className="p-1 h-auto w-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 
                                 text-xs rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors 
                                 flex items-center justify-between"
                      >
                        <span className="flex-1 truncate text-left">
                          {formatAppointmentTime(appointment.time)}: {appointment.title}
                        </span>
                        <Edit className="h-3 w-3 ml-1 opacity-70 shrink-0" />
                      </Button>
                    ))}
                    
                    {dayAppointments.length > 3 && (
                      <div 
                        className="text-xs text-muted-foreground flex items-center cursor-pointer
                                hover:text-foreground transition-colors"
                      >
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
                className="p-2 min-h-[100px] bg-muted/20 border-b border-r"
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Appointment Dialog - Always render but control with open state */}
      <AppointmentDialog
        editAppointment={selectedAppointment}
        onClose={handleDialogClose}
      />
      
      {/* Toaster component for notifications */}
      <Toaster />
    </div>
  );
};

export default Calendar;