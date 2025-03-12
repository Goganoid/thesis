import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Grid
} from "@mui/material";
import { useEffect, useState } from "react";
import { invoiceApi } from "../services/invoiceApi";
import {
  Category,
  CreateInvoiceDto,
  Invoice,
  InvoiceCategory,
  InvoiceStatus,
  UserInvoiceData,
} from "../types/invoice";

function CategoryCard({
  category,
  onCreateInvoice,
}: {
  category: Category;
  onCreateInvoice: (category: InvoiceCategory) => void;
}) {
  const progress = (category.used / category.limit) * 100;
  const remaining = category.limit - category.used;

  return (
    <Card>
      <CardContent>
        <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
          <CircularProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            size={80}
            color={progress > 100 ? "error" : "primary"}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
            >
              {Math.round(progress)}%
            </Typography>
          </Box>
        </Box>
        <Typography variant="h6" gutterBottom>
          {category.category}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Used: ${category.used}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Remaining: ${remaining}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          onClick={() => onCreateInvoice(category.category)}
        >
          Create Invoice
        </Button>
      </CardContent>
    </Card>
  );
}

function InvoiceList({
  invoices,
  onDelete,
}: {
  invoices: Invoice[];
  onDelete: (id: string) => void;
}) {
  return (
    <Grid container spacing={2}>
      {invoices.map((invoice) => (
        <Grid item xs={12} key={invoice.id}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {invoice.category} - ${invoice.amount}
                  </Typography>
                  <Typography color="text.secondary">
                    {invoice.description}
                  </Typography>
                  <Typography color="text.secondary">
                    Status: {invoice.status}
                  </Typography>
                  <Typography color="text.secondary">
                    Date: {new Date(invoice.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <IconButton onClick={() => onDelete(invoice.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<UserInvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Partial<CreateInvoiceDto>>({
    status: InvoiceStatus.WAITING_APPROVAL,
  });

  const fetchData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await invoiceApi.getUserInvoices(currentYear);
      setData(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = (category: InvoiceCategory) => {
    setNewInvoice({ ...newInvoice, category });
    setCreateDialogOpen(true);
  };

  const handleSubmitInvoice = async () => {
    try {
      await invoiceApi.createInvoice(newInvoice as CreateInvoiceDto);
      setCreateDialogOpen(false);
      setNewInvoice({ status: InvoiceStatus.WAITING_APPROVAL });
      fetchData();
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      await invoiceApi.deleteInvoice(id);
      fetchData();
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3} mb={4}>
        {data?.categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.category}>
            <CategoryCard
              category={category}
              onCreateInvoice={handleCreateInvoice}
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom>
        Your Invoices
      </Typography>
      {data?.invoices && (
        <InvoiceList invoices={data.invoices} onDelete={handleDeleteInvoice} />
      )}

      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      >
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={newInvoice.amount || ""}
            onChange={(e) =>
              setNewInvoice({ ...newInvoice, amount: Number(e.target.value) })
            }
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={newInvoice.description || ""}
            onChange={(e) =>
              setNewInvoice({ ...newInvoice, description: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Attachment URL"
            fullWidth
            value={newInvoice.attachmentUrl || ""}
            onChange={(e) =>
              setNewInvoice({ ...newInvoice, attachmentUrl: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitInvoice} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
