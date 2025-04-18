import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";

const Calendar = () => {
  const { language, t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get month name
  const getMonthName = (date: Date) => {
    return date.toLocaleString(language, { month: 'long' });
  };
  
  // Get year
  const getYear = (date: Date) => {
    return date.getFullYear();
  };
  
  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  // Create calendar days
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border h-32"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isCurrentDate = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      days.push(
        <div 
          key={day} 
          className={`p-2 border h-32 hover:bg-gray-50 cursor-pointer transition-colors ${
            isCurrentDate ? 'bg-blue-50' : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="font-medium text-sm mb-1">{day}</div>
          {/* Example appointment */}
          {day === 15 && (
            <div className="bg-blue-100 text-blue-800 p-1 rounded text-xs mb-1">
              Tax Meeting (11:30 AM)
            </div>
          )}
          {day === 18 && (
            <div className="bg-green-100 text-green-800 p-1 rounded text-xs mb-1">
              Client Onboarding (3:00 PM)
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{t.appointmentCalendar}</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t.addAppointment}
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
              <CardTitle>
                {getMonthName(currentMonth)} {getYear(currentMonth)}
              </CardTitle>
            </div>
            <div className="flex space-x-1">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-0 text-center mb-2">
            <div className="p-2 font-medium text-sm">{t.sunday}</div>
            <div className="p-2 font-medium text-sm">{t.monday}</div>
            <div className="p-2 font-medium text-sm">{t.tuesday}</div>
            <div className="p-2 font-medium text-sm">{t.wednesday}</div>
            <div className="p-2 font-medium text-sm">{t.thursday}</div>
            <div className="p-2 font-medium text-sm">{t.friday}</div>
            <div className="p-2 font-medium text-sm">{t.saturday}</div>
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0">
            {renderCalendarDays()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
