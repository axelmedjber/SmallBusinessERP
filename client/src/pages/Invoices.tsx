import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText, Search, CreditCard, X, Eye, Plus } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { format } from "date-fns";
import { Invoice, InsertInvoice, InsertInvoiceItem, Customer } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

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
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [invoiceWithItems, setInvoiceWithItems] = useState<any | null>(null);

  // Form state
  const [newInvoice, setNewInvoice] = useState<Partial<InsertInvoice>>({
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

  // Edit form state
  const [editInvoice, setEditInvoice] = useState<Partial<InsertInvoice>>({
    customerId: 0,
    issueDate: "",
    dueDate: "",
    status: "",
    notes: "",
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
  const handleCreateInvoice = () => {
    createInvoiceMutation.mutate({
      invoiceData: newInvoice,
      items: invoiceItems,
    });
  };

  const handleUpdateInvoice = () => {
    if (!selectedInvoice) return;
    updateInvoiceMutation.mutate({ id: selectedInvoice.id, data: editInvoice });
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
    const taxAmount = subtotal * 0.1; // 10% tax rate
    const totalAmount = subtotal + taxAmount;

    setNewInvoice({
      ...newInvoice,
      subtotal: subtotal.toString(),
      taxAmount: taxAmount.toString(),
      totalAmount: totalAmount.toString(),
    });
  };

  const handleRemoveItem = (index: number) => {
    const removedItem = invoiceItems[index];
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    
    setInvoiceItems(updatedItems);

    // Update invoice totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * 0.1; // 10% tax rate
    const totalAmount = subtotal + taxAmount;

    setNewInvoice({
      ...newInvoice,
      subtotal: subtotal.toString(),
      taxAmount: taxAmount.toString(),
      totalAmount: totalAmount.toString(),
    });
  };

  const handleEditClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditInvoice({
      customerId: invoice.customerId,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
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
    if (window.confirm(`Are you sure you want to delete invoice #${invoice.id}?`)) {
      deleteInvoiceMutation.mutate(invoice.id);
    }
  };

  const resetNewInvoiceForm = () => {
    setNewInvoice({
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer">Customer</Label>
                    <Select
                      value={newInvoice.customerId?.toString()}
                      onValueChange={(value) => setNewInvoice({ ...newInvoice, customerId: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newInvoice.status}
                      onValueChange={(value) => setNewInvoice({ ...newInvoice, status: value })}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={newInvoice.issueDate}
                      onChange={(e) => setNewInvoice({ ...newInvoice, issueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  />
                </div>
                <div className="border p-3 rounded-md mt-4">
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
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="unitPrice">Unit Price</Label>
                      <Input
                        id="unitPrice"
                        type="number"
                        value={newItem.unitPrice}
                        onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <Button className="w-full" onClick={handleAddItem}>
                        <Plus className="h-4 w-4 mr-2" /> Add Item
                      </Button>
                    </div>
                  </div>
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
                            <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {invoiceItems.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="h-16 text-center">
                              No items added.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${parseFloat(newInvoice.subtotal || "0").toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({newInvoice.taxRate || 10}%):</span>
                        <span>${parseFloat(newInvoice.taxAmount || "0").toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${parseFloat(newInvoice.totalAmount || "0").toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateInvoice} disabled={createInvoiceMutation.isPending}>
                  {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-customer">Customer</Label>
              <Select
                value={editInvoice.customerId?.toString()}
                onValueChange={(value) => setEditInvoice({ ...editInvoice, customerId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-issueDate">Issue Date</Label>
                <Input
                  id="edit-issueDate"
                  type="date"
                  value={editInvoice.issueDate}
                  onChange={(e) => setEditInvoice({ ...editInvoice, issueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editInvoice.dueDate}
                  onChange={(e) => setEditInvoice({ ...editInvoice, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={editInvoice.notes}
                onChange={(e) => setEditInvoice({ ...editInvoice, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateInvoice} disabled={updateInvoiceMutation.isPending}>
              {updateInvoiceMutation.isPending ? "Updating..." : "Update Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={isChangeStatusDialogOpen} onOpenChange={setIsChangeStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Invoice Status</DialogTitle>
            <DialogDescription>
              Update the status of invoice #{selectedInvoice?.id}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice #{invoiceWithItems?.invoice?.id}</DialogTitle>
            <DialogDescription>
              Invoice details and line items.
            </DialogDescription>
          </DialogHeader>
          {invoiceWithItems && (
            <div className="py-4">
              <div className="border-b pb-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{getCustomerName(invoiceWithItems.invoice.customerId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={getStatusBadgeClass(invoiceWithItems.invoice.status)}>
                      {invoiceWithItems.invoice.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p>{format(new Date(invoiceWithItems.invoice.issueDate), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p>{format(new Date(invoiceWithItems.invoice.dueDate), "MMM d, yyyy")}</p>
                  </div>
                </div>
                {invoiceWithItems.invoice.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p>{invoiceWithItems.invoice.notes}</p>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium mb-3">Invoice Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceWithItems.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${parseFloat(invoiceWithItems.invoice.subtotal || "0").toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({invoiceWithItems.invoice.taxRate || 10}%):</span>
                      <span>${parseFloat(invoiceWithItems.invoice.taxAmount || "0").toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${parseFloat(invoiceWithItems.invoice.totalAmount || "0").toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isInvoicesLoading || isCustomersLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <Table>
            <TableCaption>A list of all invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{getCustomerName(invoice.customerId)}</TableCell>
                  <TableCell>{format(new Date(invoice.issueDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${parseFloat(invoice.totalAmount || "0").toFixed(2)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleViewClick(invoice)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleChangeStatusClick(invoice)}>
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(invoice)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(invoice)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No invoices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}