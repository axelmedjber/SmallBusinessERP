import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Search,
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  InventoryItem,
  InventoryCategory,
  InsertInventoryItem,
  insertInventoryItemSchema,
} from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Inventory() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdateStockDialogOpen, setIsUpdateStockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);

  // Form state
  const [newItem, setNewItem] = useState<Partial<InsertInventoryItem>>({
    name: "",
    description: "",
    sku: "",
    categoryId: 0,
    unitPrice: "0.00",
    costPrice: "0.00",
    quantityInStock: 0,
    reorderLevel: 0,
  });

  // Edit form state
  const [editItem, setEditItem] = useState<Partial<InsertInventoryItem>>({
    name: "",
    description: "",
    sku: "",
    categoryId: 0,
    unitPrice: "0.00",
    costPrice: "0.00",
    quantityInStock: 0,
    reorderLevel: 0,
  });

  // Fetch inventory items
  const { data: items = [], isLoading: isItemsLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/items", activeTab],
    queryFn: async () => {
      const url = activeTab === "low" 
        ? "/api/inventory/items?lowStock=true" 
        : "/api/inventory/items";
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch inventory items");
      }
      return res.json();
    },
  });

  // Fetch inventory categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<InventoryCategory[]>({
    queryKey: ["/api/inventory/categories"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/categories");
      if (!res.ok) {
        throw new Error("Failed to fetch inventory categories");
      }
      return res.json();
    },
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (itemData: Partial<InsertInventoryItem>) => {
      const res = await apiRequest("POST", "/api/inventory/items", itemData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create inventory item");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      setIsCreateDialogOpen(false);
      setNewItem({
        name: "",
        description: "",
        sku: "",
        categoryId: 0,
        unitPrice: "0.00",
        costPrice: "0.00",
        quantityInStock: 0,
        reorderLevel: 0,
      });
      toast({
        title: "Success",
        description: "Inventory item created successfully",
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

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertInventoryItem> }) => {
      const res = await apiRequest("PUT", `/api/inventory/items/${id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update inventory item");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
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

  // Update stock quantity mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/inventory/items/${id}/stock`, { quantity });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update stock quantity");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      setIsUpdateStockDialogOpen(false);
      setSelectedItem(null);
      setStockQuantity(0);
      toast({
        title: "Success",
        description: "Stock quantity updated successfully",
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

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/inventory/items/${id}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete inventory item");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
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

  // Handlers
  const handleCreateItem = () => {
    createItemMutation.mutate(newItem);
  };

  const handleUpdateItem = () => {
    if (!selectedItem) return;
    updateItemMutation.mutate({ id: selectedItem.id, data: editItem });
  };

  const handleUpdateStock = () => {
    if (!selectedItem) return;
    updateStockMutation.mutate({ id: selectedItem.id, quantity: stockQuantity });
  };

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditItem({
      name: item.name,
      description: item.description || "",
      sku: item.sku || "",
      categoryId: item.categoryId,
      unitPrice: item.unitPrice,
      costPrice: item.costPrice || "0.00",
      quantityInStock: item.quantityInStock,
      reorderLevel: item.reorderLevel || 10,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStockClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setStockQuantity(item.quantityInStock);
    setIsUpdateStockDialogOpen(true);
  };

  const handleDeleteClick = (item: InventoryItem) => {
    if (window.confirm(`Are you sure you want to delete item "${item.name}"?`)) {
      deleteItemMutation.mutate(item.id);
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get category name by ID
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Unknown";
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Package className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new item to inventory.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newItem.description ?? ""}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    value={newItem.sku ?? ""}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={newItem.categoryId?.toString()}
                    onValueChange={(value) => setNewItem({ ...newItem, categoryId: parseInt(value) })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unitPrice" className="text-right">
                    Unit Price
                  </Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="costPrice" className="text-right">
                    Cost Price
                  </Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={newItem.costPrice ?? "0.00"}
                    onChange={(e) => setNewItem({ ...newItem, costPrice: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantityInStock" className="text-right">
                    Quantity
                  </Label>
                  <Input
                    id="quantityInStock"
                    type="number"
                    value={newItem.quantityInStock}
                    onChange={(e) => setNewItem({ ...newItem, quantityInStock: parseInt(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reorderLevel" className="text-right">
                    Reorder Level
                  </Label>
                  <Input
                    id="reorderLevel"
                    type="number"
                    value={newItem.reorderLevel ?? 10}
                    onChange={(e) => setNewItem({ ...newItem, reorderLevel: parseInt(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCreateItem} disabled={createItemMutation.isPending}>
                  {createItemMutation.isPending ? "Creating..." : "Create Item"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="low">Low Stock</TabsTrigger>
        </TabsList>
      </Tabs>

      {isItemsLoading ? (
        <div className="text-center py-8">Loading inventory items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No inventory items found. {searchQuery && "Try a different search term."}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableCaption>Inventory items list</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Cost Price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.name}
                    {item.quantityInStock <= (item.reorderLevel || 10) && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.sku || "-"}</TableCell>
                  <TableCell>{getCategoryName(item.categoryId)}</TableCell>
                  <TableCell className="text-right">${parseFloat(item.unitPrice).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {item.costPrice ? `$${parseFloat(item.costPrice).toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell className="text-right">{item.quantityInStock}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStockClick(item)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details of the selected inventory item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editItem.name}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-description"
                value={editItem.description || ""}
                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-sku" className="text-right">
                SKU
              </Label>
              <Input
                id="edit-sku"
                value={editItem.sku || ""}
                onChange={(e) => setEditItem({ ...editItem, sku: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <Select
                value={editItem.categoryId?.toString()}
                onValueChange={(value) => setEditItem({ ...editItem, categoryId: parseInt(value) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-unitPrice" className="text-right">
                Unit Price
              </Label>
              <Input
                id="edit-unitPrice"
                type="number"
                step="0.01"
                value={editItem.unitPrice}
                onChange={(e) => setEditItem({ ...editItem, unitPrice: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-costPrice" className="text-right">
                Cost Price
              </Label>
              <Input
                id="edit-costPrice"
                type="number"
                step="0.01"
                value={editItem.costPrice ?? "0.00"}
                onChange={(e) => setEditItem({ ...editItem, costPrice: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-quantityInStock" className="text-right">
                Quantity
              </Label>
              <Input
                id="edit-quantityInStock"
                type="number"
                value={editItem.quantityInStock}
                onChange={(e) => setEditItem({ ...editItem, quantityInStock: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-reorderLevel" className="text-right">
                Reorder Level
              </Label>
              <Input
                id="edit-reorderLevel"
                type="number"
                value={editItem.reorderLevel ?? 10}
                onChange={(e) => setEditItem({ ...editItem, reorderLevel: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleUpdateItem} disabled={updateItemMutation.isPending}>
              {updateItemMutation.isPending ? "Updating..." : "Update Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Stock Dialog */}
      <Dialog open={isUpdateStockDialogOpen} onOpenChange={setIsUpdateStockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Stock Quantity</DialogTitle>
            <DialogDescription>
              Update the stock quantity for {selectedItem?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock-quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="stock-quantity"
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleUpdateStock} disabled={updateStockMutation.isPending}>
              {updateStockMutation.isPending ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}