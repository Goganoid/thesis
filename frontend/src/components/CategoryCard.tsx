import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import { Invoice, InvoiceCategory, InvoiceStatus } from "../types/invoice";

interface CategoryCardProps {
  category: {
    category: InvoiceCategory;
    used: number;
    limit: number;
  };
  onCreateInvoice: (category: InvoiceCategory) => void;
  invoices: Invoice[];
  onDelete: (id: string) => void;
}

export function CategoryCard({
  category,
  onCreateInvoice,
  invoices,
  onDelete,
}: CategoryCardProps) {
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