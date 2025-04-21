import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock, Plus, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Define the appointment interface to match our schema
export interface Appointment {
  id?: number;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number;
  description: string;
  colorCode?: string;
  createdAt?: string;
}

// Initial state for form
const initialAppointmentState: Appointment = {
  title: "",
  date: format(new Date(), "yyyy-MM-dd"),
  time: "09:00",
  duration: 30,
  description: ""
};

interface AppointmentDialogProps {
  editAppointment?: Appointment;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

// Appointment Dialog component
const AppointmentDialog: React.FC<AppointmentDialogProps> = ({ 
  editAppointment, 
  onClose,
  trigger
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [appointment, setAppointment] = useState<Appointment>(initialAppointmentState);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isEdit, setIsEdit] = useState(false);
  const queryClient = useQueryClient();

  // Use effect to initialize form when editing an appointment
  useEffect(() => {
    if (editAppointment) {
      setAppointment(editAppointment);
      setIsEdit(true);
      
      // Parse the date string to a Date object for the calendar
      if (editAppointment.date) {
        const parsedDate = parse(editAppointment.date, "yyyy-MM-dd", new Date());
        setDate(parsedDate);
      }
    } else {
      setAppointment(initialAppointmentState);
      setIsEdit(false);
      setDate(new Date());
    }
  }, [editAppointment, open]);

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

  // Handle form changes
  const handleChange = (field: keyof Appointment, value: string | number) => {
    setAppointment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Mutation for creating appointment
  const { mutate: createAppointment, isPending: isCreating } = useMutation({
    mutationFn: async (data: Appointment) => {
      // Prepare payload directly matching the database schema
      const payload = {
        title: data.title,
        date: data.date,
        time: data.time,
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
      handleDialogClose(false);
      
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

  // Mutation for updating appointment
  const { mutate: updateAppointment, isPending: isUpdating } = useMutation({
    mutationFn: async (data: Appointment) => {
      if (!data.id) throw new Error('Appointment ID is required for update');
      
      // Prepare payload
      const payload = {
        title: data.title,
        date: data.date,
        time: data.time,
        duration: data.duration,
        description: data.description
      };
      
      // Send request to API
      const response = await fetch(`/api/appointments/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update appointment');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Close dialog
      handleDialogClose(false);
      
      // Show success toast
      toast({
        title: "Success",
        description: "Appointment has been updated successfully",
        variant: "default",
      });
      
      // Invalidate queries to refetch appointments
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment",
        variant: "destructive",
      });
    }
  });

  // Mutation for deleting appointment
  const { mutate: deleteAppointment, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      // Send request to API
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete appointment');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Close dialog
      handleDialogClose(false);
      
      // Show success toast
      toast({
        title: "Success",
        description: "Appointment has been deleted successfully",
        variant: "default",
      });
      
      // Invalidate queries to refetch appointments
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error",
        description: error.message || "Failed to delete appointment",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && appointment.id) {
      updateAppointment(appointment);
    } else {
      createAppointment(appointment);
    }
  };

  // Handle delete confirmation
  const handleDelete = () => {
    if (appointment.id) {
      deleteAppointment(appointment.id);
    }
  };

  // Update date field when calendar date changes
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      handleChange('date', format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  // Define isPending based on the current action
  const isPending = isCreating || isUpdating || isDeleting;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.addAppointment}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Appointment" : t.addAppointment}</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Edit the details of your existing appointment." 
              : "Fill in the details to schedule a new appointment."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="title">{t.appointmentTitle}</Label>
            <Input
              id="title"
              value={appointment.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className="bg-background"
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
                      "justify-start text-left font-normal bg-background",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={appointment.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  required
                  className="bg-background"
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
              <SelectTrigger className="bg-background">
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
              className="bg-background"
            />
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div>
              {isEdit && appointment.id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" type="button">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this appointment? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : t.save}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;