import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, FileText, Search, CreditCard, X, Eye, Plus } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { format } from "date-fns";
import { 
  Invoice, 
  InsertInvoice, 
  InsertInvoiceItem, 
  Customer, 
  insertInvoiceSchema, 
  insertInvoiceItemSchema 
} from "@shared/schema";
import { Badge } from "@/components/ui/badge";

// Create extended validation schemas with additional validation rules
const invoiceFormSchema = insertInvoiceSchema.extend({
  customerId: z.number().min(1, { message: "Please select a customer" }),
  invoiceNumber: z.string().min(1, { message: "Invoice number is required" }),
  issueDate: z.string().min(1, { message: "Issue date is required" }),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  subtotal: z.string().min(1, { message: "Subtotal is required" }),
  taxRate: z.string().min(1, { message: "Tax rate is required" }),
  taxAmount: z.string().min(1, { message: "Tax amount is required" }),
  totalAmount: z.string().min(1, { message: "Total amount is required" }),
  status: z.enum(["draft", "pending", "paid", "overdue", "cancelled"]),
});

const invoiceItemFormSchema = insertInvoiceItemSchema.extend({
  description: z.string().min(1, { message: "Description is required" }),
  quantity: z.number().min(0.01, { message: "Quantity must be greater than 0" }),
  unitPrice: z.number().min(0.01, { message: "Unit price must be greater than 0" }),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
type InvoiceItemFormValues = z.infer<typeof invoiceItemFormSchema>;

export default function Invoices() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isChangeStatusDialogOpen, setIsChangeStatusDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("draft");
  const [invoiceWithItems, setInvoiceWithItems] = useState<any | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  
  // Create invoice form with validation
  const createInvoiceForm = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerId: 0,
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      status: "draft",
      subtotal: "0",
      taxRate: "10",
      taxAmount: "0",
      totalAmount: "0",
      notes: "",
    },
  });
  
  // Edit invoice form with validation
  const editInvoiceForm = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerId: 0,
      invoiceNumber: "",
      issueDate: "",
      dueDate: "",
      status: "draft",
      subtotal: "0",
      taxRate: "0",
      taxAmount: "0",
      totalAmount: "0",
      notes: "",
    },
  });

  // New item form state
  const [newItem, setNewItem] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
    amount: 0,
  });

  // Fetch invoices
  const { data: invoices = [], isLoading: isInvoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices");
      if (!res.ok) {
        throw new Error("Failed to fetch invoices");
      }
      return res.json();
    },
  });

  // Fetch customers
  const { data: customers = [], isLoading: isCustomersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const res = await fetch("/api/customers");
      if (!res.ok) {
        throw new Error("Failed to fetch customers");
      }
      return res.json();
    },
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async ({
      invoiceData,
      items,
    }: {
      invoiceData: Partial<InsertInvoice>;
      items: Partial<InsertInvoiceItem>[];
    }) => {
      const res = await apiRequest("POST", "/api/invoices", {
        invoice: invoiceData,
        items,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create invoice");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setIsCreateDialogOpen(false);
      resetNewInvoiceForm();
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertInvoice> }) => {
      const res = await apiRequest("PUT", `/api/invoices/${id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update invoice");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setIsEditDialogOpen(false);
      setSelectedInvoice(null);
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update invoice status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/invoices/${id}/status`, { status });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update invoice status");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setIsChangeStatusDialogOpen(false);
      setSelectedInvoice(null);
      toast({
        title: "Success",
        description: "Invoice status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/invoices/${id}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete invoice");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get invoice with items query
  const getInvoiceWithItems = async (id: number) => {
    const res = await fetch(`/api/invoices/${id}?items=true`);
    if (!res.ok) {
      throw new Error("Failed to fetch invoice details");
    }
    return res.json();
  };

  // Handlers
  const onCreateSubmit = (data: InvoiceFormValues) => {
    createInvoiceMutation.mutate({
      invoiceData: data,
      items: invoiceItems,
    });
  };

  const onEditSubmit = (data: InvoiceFormValues) => {
    if (!selectedInvoice) return;
    updateInvoiceMutation.mutate({ id: selectedInvoice.id, data });
  };

  const handleUpdateStatus = () => {
    if (!selectedInvoice || !selectedStatus) return;
    updateStatusMutation.mutate({ id: selectedInvoice.id, status: selectedStatus });
  };

  const handleAddItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all item fields with valid values",
        variant: "destructive",
      });
      return;
    }

    const amount = newItem.quantity * newItem.unitPrice;
    const item = {
      ...newItem,
      amount,
    };

    setInvoiceItems([...invoiceItems, item]);
    setNewItem({
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    });

    // Update invoice totals
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0) + amount;
    const taxRate = parseFloat(createInvoiceForm.getValues("taxRate") || "10");
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    // Update form values for the create form
    createInvoiceForm.setValue("subtotal", subtotal.toString());
    createInvoiceForm.setValue("taxAmount", taxAmount.toString());
    createInvoiceForm.setValue("totalAmount", totalAmount.toString());
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    
    setInvoiceItems(updatedItems);

    // Update invoice totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = parseFloat(createInvoiceForm.getValues("taxRate") || "10");
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    // Update form values for the create form
    createInvoiceForm.setValue("subtotal", subtotal.toString());
    createInvoiceForm.setValue("taxAmount", taxAmount.toString());
    createInvoiceForm.setValue("totalAmount", totalAmount.toString());
  };

  const handleEditClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    editInvoiceForm.reset({
      customerId: invoice.customerId,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      notes: invoice.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleChangeStatusClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setSelectedStatus(invoice.status);
    setIsChangeStatusDialogOpen(true);
  };

  const handleViewClick = async (invoice: Invoice) => {
    try {
      const data = await getInvoiceWithItems(invoice.id);
      setInvoiceWithItems(data);
      setIsViewDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch invoice details",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setIsDeleteAlertOpen(true);
  };
  
  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoiceMutation.mutate(invoiceToDelete.id);
      setIsDeleteAlertOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const resetNewInvoiceForm = () => {
    createInvoiceForm.reset({
      customerId: 0,
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      status: "draft",
      subtotal: "0",
      taxRate: "10",
      taxAmount: "0", 
      totalAmount: "0",
      notes: "",
    });
    setInvoiceItems([]);
  };

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toString().includes(searchQuery) ||
      getCustomerName(invoice.customerId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get customer name by ID
  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown";
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Format currency
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice Management</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="mr-2 h-4 w-4" /> Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new invoice.
                </DialogDescription>
              </DialogHeader>
              <Form {...createInvoiceForm}>
                <form onSubmit={createInvoiceForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createInvoiceForm.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <Select
                            value={field.value ? field.value.toString() : "0"}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createInvoiceForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => field.onChange(value as "draft" | "pending" | "paid" | "overdue" | "cancelled")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createInvoiceForm.control}
                      name="issueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createInvoiceForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createInvoiceForm.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createInvoiceForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="border p-3 rounded-md">
                    <h3 className="font-medium mb-3">Invoice Items</h3>
                    <div className="grid grid-cols-10 gap-3 mb-3">
                      <div className="col-span-4">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="unitPrice">Unit Price</Label>
                        <Input
                          id="unitPrice"
                          type="number"
                          value={newItem.unitPrice}
                          onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="col-span-2 flex items-end">
                        <Button type="button" className="w-full" onClick={handleAddItem}>
                          <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                      </div>
                    </div>
                    {invoiceItems.length > 0 && (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Quantity</TableHead>
                              <TableHead className="text-right">Unit Price</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="text-right w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoiceItems.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                                <TableCell className="text-right">
                                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    {invoiceItems.length === 0 && (
                      <div className="border rounded-md p-4 text-center text-gray-500">
                        No items added yet. Add an item using the form above.
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(createInvoiceForm.watch("subtotal") || "0")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax Rate ({createInvoiceForm.watch("taxRate") || 10}%):</span>
                          <span>{formatCurrency(createInvoiceForm.watch("taxAmount") || "0")}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatCurrency(createInvoiceForm.watch("totalAmount") || "0")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createInvoiceMutation.isPending || invoiceItems.length === 0}>
                      {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-background rounded-md shadow">
        {isInvoicesLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center">
            {searchQuery ? "No invoices match your search." : "No invoices yet. Create your first invoice!"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{getCustomerName(invoice.customerId)}</TableCell>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{format(new Date(invoice.issueDate), 'PP')}</TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), 'PP')}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewClick(invoice)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleChangeStatusClick(invoice)}>
                        <CreditCard className="h-4 w-4" />
                        <span className="sr-only">Change Status</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(invoice)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(invoice)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update invoice information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editInvoiceForm}>
            <form onSubmit={editInvoiceForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editInvoiceForm.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select
                      value={field.value ? field.value.toString() : "0"}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editInvoiceForm.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editInvoiceForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editInvoiceForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateInvoiceMutation.isPending}>
                  {updateInvoiceMutation.isPending ? "Updating..." : "Update Invoice"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={isChangeStatusDialogOpen} onOpenChange={setIsChangeStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Invoice Status</DialogTitle>
            <DialogDescription>
              Update the status of this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteInvoiceMutation.isPending}
            >
              {deleteInvoiceMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}