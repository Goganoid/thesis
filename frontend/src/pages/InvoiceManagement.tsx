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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Check, Close, Download } from "@mui/icons-material";
import { invoiceApi } from "../services/invoiceApi";
import { Invoice, InvoiceStatus } from "../types/invoice";
import { SortableDataTable, ColumnConfig } from "../components/SortableDataTable";
import { DetailsDialog, Grid } from "../components/DetailsDialog";

const InvoiceManagement: React.FC = () => {
  const theme = useTheme();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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

  const generateReportMutation = useMutation({
    mutationFn: ({ start, end }: { start: string; end: string }) =>
      invoiceApi.generateReport(start, end),
    onSuccess: (csvString) => {
      // Create a blob from the CSV string
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-report-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsReportModalOpen(false);
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

  const handleGenerateReport = () => {
    if (startDate && endDate) {
      generateReportMutation.mutate({ start: startDate, end: endDate });
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
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
          </Box>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => setIsReportModalOpen(true)}
            sx={{
              borderRadius: 2,
              px: 2,
              textTransform: "none",
              boxShadow: 1,
            }}
          >
            Generate Report
          </Button>
        </Box>
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

      <Dialog
        open={isReportModalOpen}
        onClose={() => !generateReportMutation.isPending && setIsReportModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Invoice Report</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsReportModalOpen(false)}
            disabled={generateReportMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            disabled={!startDate || !endDate || generateReportMutation.isPending}
            startIcon={generateReportMutation.isPending ? <CircularProgress size={20} /> : <Download />}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceManagement;
