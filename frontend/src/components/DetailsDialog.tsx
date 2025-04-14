import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  alpha,
  useTheme,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

interface DetailsDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

export function DetailsDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "md",
  fullWidth = true,
}: DetailsDialogProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
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
          onClick={onClose}
          size="small"
          sx={{ color: "white" }}
        >
          <ArrowBack />
        </IconButton>
        {title}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>{children}</Box>
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            p: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}

// Helper component for detail grid rows
export const Grid = ({
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