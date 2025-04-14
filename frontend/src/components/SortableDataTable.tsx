import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Card,
  alpha,
  useTheme,
} from "@mui/material";

// Define sort direction
export type SortDirection = "asc" | "desc";

// Define column configuration
export interface ColumnConfig<T> {
  id: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string | number;
}

interface SortableDataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  defaultSortBy?: keyof T | string;
  defaultSortDirection?: SortDirection;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  getRowKey: (item: T) => string | number;
}

export function SortableDataTable<T>({
  data,
  columns,
  defaultSortBy,
  defaultSortDirection = "asc",
  onRowClick,
  emptyMessage = "No data found",
  getRowKey,
}: SortableDataTableProps<T>) {
  const theme = useTheme();
  const [sortBy, setSortBy] = useState<keyof T | string>(defaultSortBy || columns[0].id);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  const handleSort = (columnId: keyof T | string) => {
    if (sortBy === columnId) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortBy(columnId);
      setSortDirection("asc");
    }
  };

  // Apply sorting to the data
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return [...data].sort((a, b) => {
      let comparison = 0;
      const aValue = a[sortBy as keyof T];
      const bValue = b[sortBy as keyof T];

      if (aValue === bValue) {
        comparison = 0;
      } else if (aValue === null || aValue === undefined) {
        comparison = -1;
      } else if (bValue === null || bValue === undefined) {
        comparison = 1;
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        // Fallback for other types
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortBy, sortDirection]);

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer component={Box}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {columns.map((column) => (
                <TableCell 
                  key={String(column.id)} 
                  sx={{ 
                    color: "white",
                    width: column.width,
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : "asc"}
                      onClick={() => handleSort(column.id)}
                      sx={{
                        color: "white !important",
                        "& .MuiTableSortLabel-icon": {
                          color: "white !important",
                        },
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((item) => (
                <TableRow
                  key={getRowKey(item)}
                  hover
                  onClick={() => onRowClick?.(item)}
                  sx={{
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      cursor: onRowClick ? "pointer" : "default",
                    },
                    transition: "background-color 0.2s",
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.id)}>
                      {column.render
                        ? column.render(item)
                        : String(item[column.id as keyof T] || "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
} 