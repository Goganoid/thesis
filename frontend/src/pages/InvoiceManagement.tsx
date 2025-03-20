import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
  TableSortLabel,
  Card,
  alpha,
  useTheme,
} from "@mui/material";
import { invoiceApi } from "../services/invoiceApi";
import { Invoice, InvoiceStatus } from "../types/invoice";
import { ArrowBack, Check, Close } from "@mui/icons-material";

// Define the type for sortable columns
type SortableColumn = "createdAt" | "category" | "amount" | "status";

// Define sort direction
type SortDirection = "asc" | "desc";

const InvoiceManagement: React.FC = () => {
  const theme = useTheme();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<SortableColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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

  const handleSort = (column: SortableColumn) => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  // Apply sorting to the invoices
  const sortedInvoices = useMemo(() => {
    if (!invoices) return [];

    return [...invoices]
      .filter((invoice) => invoice.status === InvoiceStatus.WAITING_APPROVAL)
      .sort((a, b) => {
        let comparison = 0;

        if (sortBy === "createdAt") {
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === "amount") {
          comparison = a.amount - b.amount;
        } else if (sortBy === "category" || sortBy === "status") {
          comparison = a[sortBy].localeCompare(b[sortBy]);
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [invoices, sortBy, sortDirection]);

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

      <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer component={Box}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell sx={{ color: "white" }}>
                  <TableSortLabel
                    active={sortBy === "createdAt"}
                    direction={sortBy === "createdAt" ? sortDirection : "asc"}
                    onClick={() => handleSort("createdAt")}
                    sx={{
                      color: "white !important",
                      "& .MuiTableSortLabel-icon": {
                        color: "white !important",
                      },
                    }}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  <TableSortLabel
                    active={sortBy === "category"}
                    direction={sortBy === "category" ? sortDirection : "asc"}
                    onClick={() => handleSort("category")}
                    sx={{
                      color: "white !important",
                      "& .MuiTableSortLabel-icon": {
                        color: "white !important",
                      },
                    }}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  <TableSortLabel
                    active={sortBy === "amount"}
                    direction={sortBy === "amount" ? sortDirection : "asc"}
                    onClick={() => handleSort("amount")}
                    sx={{
                      color: "white !important",
                      "& .MuiTableSortLabel-icon": {
                        color: "white !important",
                      },
                    }}
                  >
                    Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "white" }}>Description</TableCell>
                <TableCell sx={{ color: "white" }}>
                  <TableSortLabel
                    active={sortBy === "status"}
                    direction={sortBy === "status" ? sortDirection : "asc"}
                    onClick={() => handleSort("status")}
                    sx={{
                      color: "white !important",
                      "& .MuiTableSortLabel-icon": {
                        color: "white !important",
                      },
                    }}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "white" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedInvoices.length > 0 ? (
                sortedInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.05
                        ),
                        cursor: "pointer",
                      },
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <TableCell>
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{invoice.category}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      ${invoice.amount.toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 250,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {invoice.description}
                    </TableCell>
                    <TableCell>{getStatusChip(invoice.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoice(invoice);
                        }}
                        sx={{
                          borderRadius: 8,
                          px: 2,
                          textTransform: "none",
                          fontWeight: "medium",
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No pending invoices found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={!!selectedInvoice}
        onClose={() =>
          !updateStatusMutation.isPending && setSelectedInvoice(null)
        }
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 2,
            pl: 1,
          }}
        >
          <IconButton
            onClick={() => setSelectedInvoice(null)}
            size="small"
            sx={{ color: "white" }}
          >
            <ArrowBack />
          </IconButton>
          Invoice Details
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {selectedInvoice && (
            <Box>
              <Box sx={{ p: 3 }}>
                <Grid
                  label="Date"
                  value={new Date(
                    selectedInvoice.createdAt
                  ).toLocaleDateString()}
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
                <Divider sx={{ my: 2 }} />
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
                    <Paper
                      elevation={0}
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
                    </Paper>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
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
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper component for detail grid rows
const Grid = ({
  label,
  value,
  highlight = false,
  isComponent = false,
}: {
  label: string;
  value: any;
  highlight?: boolean;
  isComponent?: boolean;
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      mb: 1.5,
    }}
  >
    <Typography variant="subtitle2" color="text.secondary">
      {label}:
    </Typography>
    {isComponent ? (
      <Box>{value}</Box>
    ) : (
      <Typography
        variant="body1"
        sx={{
          fontWeight: highlight ? "bold" : "regular",
        }}
      >
        {value}
      </Typography>
    )}
  </Box>
);

export default InvoiceManagement;
