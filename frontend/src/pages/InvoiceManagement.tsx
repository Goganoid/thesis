import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { invoiceApi } from "../services/invoiceApi";
import { Invoice, InvoiceStatus } from "../types/invoice";
import { SortableDataTable, ColumnConfig } from "../components/SortableDataTable";
import { DetailsDialog, Grid } from "../components/DetailsDialog";

const InvoiceManagement: React.FC = () => {
  const theme = useTheme();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["admin-invoices", new Date().getFullYear()],
    queryFn: () =>
      invoiceApi.admin.getAllInvoices(new Date().getFullYear(), [
        InvoiceStatus.WAITING_APPROVAL,
      ]),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      invoiceApi.admin.updateInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      setSelectedInvoice(null);
    },
  });

  const handleApprove = () => {
    if (selectedInvoice) {
      updateStatusMutation.mutate({
        id: selectedInvoice.id,
        status: InvoiceStatus.PAID,
      });
    }
  };

  const handleReject = () => {
    if (selectedInvoice) {
      updateStatusMutation.mutate({
        id: selectedInvoice.id,
        status: InvoiceStatus.REJECTED,
      });
    }
  };

  const getStatusChip = (status: InvoiceStatus) => {
    const statusConfig = {
      [InvoiceStatus.PAID]: { color: "success", label: "Paid" },
      [InvoiceStatus.IN_PROGRESS]: { color: "warning", label: "In Progress" },
      [InvoiceStatus.REJECTED]: { color: "error", label: "Rejected" },
      [InvoiceStatus.WAITING_APPROVAL]: {
        color: "info",
        label: "Waiting Approval",
      },
    };

    const config = statusConfig[status];

    return (
      <Chip label={config.label} color={config.color as any} size="small" />
    );
  };

  // Define columns for the table
  const columns: ColumnConfig<Invoice>[] = [
    {
      id: "createdAt",
      label: "Date",
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      id: "category",
      label: "Category",
    },
    {
      id: "amount",
      label: "Amount",
      render: (item) => `$${item.amount.toFixed(2)}`,
    },
    {
      id: "description",
      label: "Description",
      render: (item) => (
        <Typography
          sx={{
            maxWidth: 250,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.description}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      render: (item) => getStatusChip(item.status),
    },
  ];

  // Filter waiting approval invoices
  const waitingInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter(
      (invoice) => invoice.status === InvoiceStatus.WAITING_APPROVAL
    );
  }, [invoices]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ maxWidth: 1200, margin: "0 auto" }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="medium"
          color="primary.main"
        >
          Invoice Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve pending invoices submitted by employees
        </Typography>
      </Paper>

      <SortableDataTable
        data={waitingInvoices}
        columns={columns}
        defaultSortBy="createdAt"
        defaultSortDirection="desc"
        onRowClick={setSelectedInvoice}
        emptyMessage="No pending invoices found"
        getRowKey={(item) => item.id}
      />

      <DetailsDialog
        open={!!selectedInvoice}
        onClose={() => !updateStatusMutation.isPending && setSelectedInvoice(null)}
        title="Invoice Details"
        actions={
          <>
            <Button
              onClick={() => setSelectedInvoice(null)}
              color="inherit"
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
            <Button
              onClick={handleReject}
              color="error"
              variant="contained"
              disabled={updateStatusMutation.isPending}
              startIcon={<Close />}
              sx={{
                borderRadius: 2,
                px: 2,
                textTransform: "none",
                ml: 1,
                boxShadow: 1,
              }}
            >
              Reject Invoice
            </Button>
            <Button
              onClick={handleApprove}
              color="success"
              variant="contained"
              disabled={updateStatusMutation.isPending}
              startIcon={<Check />}
              sx={{
                borderRadius: 2,
                px: 2,
                textTransform: "none",
                ml: 1,
                boxShadow: 1,
              }}
            >
              Approve Invoice
            </Button>
          </>
        }
      >
        {selectedInvoice && (
          <Box>
            <Grid
              label="Date"
              value={new Date(selectedInvoice.createdAt).toLocaleDateString()}
            />
            <Grid label="Category" value={selectedInvoice.category} />
            <Grid
              label="Amount"
              value={`$${selectedInvoice.amount.toFixed(2)}`}
              highlight
            />
            <Grid
              label="Status"
              value={getStatusChip(selectedInvoice.status)}
              isComponent
            />
            <Box mb={2}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {selectedInvoice.description}
              </Typography>
            </Box>

            {selectedInvoice.attachmentUrl && (
              <Box mt={3}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Attachment
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    textAlign: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <img
                    src={selectedInvoice.attachmentUrl}
                    alt="Invoice attachment"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                      borderRadius: 4,
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DetailsDialog>
    </Box>
  );
};

export default InvoiceManagement;
