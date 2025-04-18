import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the appointment interface
interface AppointmentData {
  title: string;
  date: string;
  startTime: string;
  duration: number;
  description: string;
}

// Initial state for form
const initialAppointmentState: AppointmentData = {
  title: "",
  date: format(new Date(), "yyyy-MM-dd"),
  startTime: "09:00",
  duration: 30,
  description: ""
};

// Appointment Dialog component
const AppointmentDialog = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentData>(initialAppointmentState);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const queryClient = useQueryClient();

  // Handle form changes
  const handleChange = (field: keyof AppointmentData, value: string | number) => {
    setAppointment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Mutation for creating appointment
  const { mutate: createAppointment, isPending } = useMutation({
    mutationFn: async (data: AppointmentData) => {
      // Format date and time for API
      const formattedDate = data.date;
      const dateTime = `${formattedDate}T${data.startTime}:00`;
      
      // Prepare payload
      const payload = {
        title: data.title,
        startTime: dateTime,
        duration: data.duration,
        description: data.description
      };
      
      // Send request to API
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create appointment');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Reset form and close dialog
      setAppointment(initialAppointmentState);
      setOpen(false);
      
      // Show success toast
      toast({
        title: "Success",
        description: "Appointment has been created successfully",
        variant: "default",
      });
      
      // Invalidate queries to refetch appointments
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error",
        description: error.message || "Failed to create appointment",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAppointment(appointment);
  };

  // Update date field when calendar date changes
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      handleChange('date', format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <span className="mr-2">+</span>
          {t.addAppointment}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t.addAppointment}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="title">{t.appointmentTitle}</Label>
            <Input
              id="title"
              value={appointment.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="date">{t.date}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="time">{t.time}</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="time"
                  type="time"
                  value={appointment.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="duration">{t.duration}</Label>
            <Select 
              value={appointment.duration.toString()} 
              onValueChange={(value) => handleChange('duration', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 {t.minutes}</SelectItem>
                <SelectItem value="30">30 {t.minutes}</SelectItem>
                <SelectItem value="45">45 {t.minutes}</SelectItem>
                <SelectItem value="60">60 {t.minutes}</SelectItem>
                <SelectItem value="90">90 {t.minutes}</SelectItem>
                <SelectItem value="120">120 {t.minutes}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={appointment.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : t.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;