import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../hooks/queries/useUserData";
import { invoiceApi } from "../services/invoiceApi";
import { UserRole } from "../types/auth";
import {
  Category,
  CreateInvoiceDto,
  Invoice,
  InvoiceCategory,
  InvoiceStatus,
} from "../types/invoice";
import { hash } from "../utils/hash";

function CategoryCard({
  category,
  onCreateInvoice,
  invoices,
  onDelete,
}: {
  category: Category;
  onCreateInvoice: (category: InvoiceCategory) => void;
  invoices: Invoice[];
  onDelete: (id: string) => void;
}) {
  const progress = (category.used / category.limit) * 100;
  const remaining = category.limit - category.used;

  const getGradient = (categoryName: InvoiceCategory) => {
    const gradients: Record<InvoiceCategory, string> = {
      [InvoiceCategory.EDUCATION]:
        "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
      [InvoiceCategory.MEDICINE]:
        "linear-gradient(135deg, #2C5364 0%, #203A43 100%)",
      [InvoiceCategory.SPORT]:
        "linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 100%)",
    };
    return (
      gradients[categoryName] ||
      "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)"
    );
  };

  const getStatusColor = (status: InvoiceStatus) => {
    const colors = {
      [InvoiceStatus.PAID]: "#43E97B",
      [InvoiceStatus.IN_PROGRESS]: "#FFB74D",
      [InvoiceStatus.REJECTED]: "#FF5252",
      [InvoiceStatus.WAITING_APPROVAL]: "#64B5F6",
    };
    return colors[status];
  };

  return (
    <Card
      sx={{
        background: getGradient(category.category),
        color: "white",
        position: "relative",
        overflow: "visible",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            {category.category}
          </Typography>
          <Box sx={{ position: "relative", mt: 2, mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "white",
                },
              }}
            />
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              ${category.used} used
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              ${remaining} left
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          onClick={() => onCreateInvoice(category.category)}
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            mb: 2,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.3)",
            },
          }}
        >
          Add Expense
        </Button>

        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              maxHeight: "300px",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(255,255,255,0.1)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255,255,255,0.3)",
                borderRadius: "4px",
              },
            }}
          >
            {invoices.map((invoice) => (
              <Paper
                key={invoice.id}
                sx={{
                  p: 2,
                  mb: 1,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.15)",
                  },
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip
                        label={`$${invoice.amount}`}
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.2)",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                      <Chip
                        label={invoice.status}
                        sx={{
                          backgroundColor: getStatusColor(invoice.status),
                          color: "white",
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {invoice.description}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={() => onDelete(invoice.id)}
                    sx={{
                      color: "white",
                      opacity: 0.7,
                      "&:hover": {
                        opacity: 1,
                        backgroundColor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
            {invoices.length === 0 && (
              <Typography textAlign="center" sx={{ opacity: 0.7 }}>
                No expenses yet
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

const DropzoneArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "border 0.3s ease-in-out",
  "&:hover": {
    borderColor: theme.palette.primary.dark,
  },
}));

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: userData } = useUserData();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Partial<CreateInvoiceDto>>({
    status: InvoiceStatus.WAITING_APPROVAL,
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", currentYear],
    queryFn: () => invoiceApi.getUserInvoices(currentYear),
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: CreateInvoiceDto) => {
      return await invoiceApi.createInvoice(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setCreateDialogOpen(false);
      setNewInvoice({ status: InvoiceStatus.WAITING_APPROVAL });
      setUploadFile(null);
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await invoiceApi.deleteInvoice(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const getPresignedUrlMutation = useMutation({
    mutationFn: async ({
      fileType,
      hash,
    }: {
      fileType: string;
      hash: string;
    }) => {
      return await invoiceApi.getPresignedUrl(fileType, hash);
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
  });

  const handleCreateInvoice = async () => {
    if (!newInvoice.amount || !newInvoice.description || !newInvoice.category) {
      return;
    }

    try {
      let s3Key = null;

      if (uploadFile) {
        const sha = await hash(await uploadFile.arrayBuffer());
        // Get presigned URL
        const { presignedUrl, key } = await getPresignedUrlMutation.mutateAsync(
          {
            fileType: uploadFile.type,
            hash: sha,
          }
        );

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", presignedUrl, true);
          xhr.onload = () => resolve(xhr.response);
          xhr.onerror = () => reject(xhr.statusText);
          xhr.send(uploadFile);
        });

        s3Key = key;
      }

      // Create invoice with s3Key
      await createInvoiceMutation.mutateAsync({
        ...(newInvoice as CreateInvoiceDto),
        s3Key,
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    await deleteInvoiceMutation.mutateAsync(id);
  };

  if (isLoading) {
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

  const canManageInvoices =
    userData?.role === UserRole.Admin || userData?.role === UserRole.Bookkeeper;

  return (
    <Box
      height="100vh"
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          {canManageInvoices && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/invoice-management")}
            >
              Manage Invoices
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {data?.categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.category}>
              <CategoryCard
                category={category}
                onCreateInvoice={(category) => {
                  setNewInvoice({ ...newInvoice, category });
                  setCreateDialogOpen(true);
                }}
                invoices={data.invoices.filter(
                  (invoice) => invoice.category === category.category
                )}
                onDelete={handleDeleteInvoice}
              />
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={createDialogOpen}
          onClose={() =>
            !createInvoiceMutation.isPending && setCreateDialogOpen(false)
          }
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                margin="dense"
                label="Amount"
                type="number"
                fullWidth
                value={newInvoice.amount || ""}
                onChange={(e) =>
                  setNewInvoice({
                    ...newInvoice,
                    amount: Number(e.target.value),
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newInvoice.description || ""}
                onChange={(e) =>
                  setNewInvoice({ ...newInvoice, description: e.target.value })
                }
                sx={{ mb: 3 }}
              />

              <DropzoneArea
                {...getRootProps()}
                sx={{
                  backgroundColor: (theme) =>
                    isDragActive
                      ? theme.palette.action.hover
                      : theme.palette.background.paper,
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon
                  sx={{ fontSize: 40, color: "primary.main", mb: 2 }}
                />
                <Typography variant="body1" gutterBottom>
                  {uploadFile
                    ? `Selected: ${uploadFile.name}`
                    : "Drag and drop an image here, or click to select"}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Supported formats: PNG, JPG
                </Typography>
              </DropzoneArea>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setCreateDialogOpen(false)}
              disabled={createInvoiceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvoice}
              variant="contained"
              disabled={
                createInvoiceMutation.isPending ||
                !newInvoice.amount ||
                !newInvoice.description ||
                !newInvoice.category
              }
              startIcon={
                createInvoiceMutation.isPending ? (
                  <CircularProgress size={20} />
                ) : undefined
              }
            >
              {createInvoiceMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
