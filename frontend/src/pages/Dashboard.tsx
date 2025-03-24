import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { CategoryCard } from "../components/CategoryCard";
import { DropzoneArea } from "../components/DropzoneArea";
import { useUserData } from "../hooks/queries/useUserData";
import { invoiceApi } from "../services/invoiceApi";
import { UserRole } from "../types/auth";
import { CreateInvoiceDto, InvoiceStatus } from "../types/invoice";
import { hash } from "../utils/hash";

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
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
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
