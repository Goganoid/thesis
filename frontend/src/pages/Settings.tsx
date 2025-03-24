import { Edit as EditIcon, Save as SaveIcon } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { invoiceApi } from "../services/invoiceApi";
import { CategoriesDto, CategoryDto, InvoiceCategory } from "../types/invoice";

interface EditableCategoryLimit {
  id: string;
  isEditing: boolean;
  value: number;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [editableLimits, setEditableLimits] = useState<EditableCategoryLimit[]>(
    []
  );

  const { data: categoriesData, isLoading } = useQuery<CategoriesDto>({
    queryKey: ["categories"],
    queryFn: () => invoiceApi.getCategories(),
  });

  // Initialize editable limits when data changes
  useEffect(() => {
    if (categoriesData) {
      setEditableLimits(
        categoriesData.categories.map((cat) => ({
          id: cat.id,
          isEditing: false,
          value: cat.limit,
        }))
      );
    }
  }, [categoriesData]);

  const updateLimitMutation = useMutation({
    mutationFn: ({
      categoryId,
      limit,
    }: {
      categoryId: InvoiceCategory;
      limit: number;
    }) => invoiceApi.updateCategoryLimit(categoryId, limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handleEditClick = (category: CategoryDto) => {
    setEditableLimits((prev) =>
      prev.map((item) =>
        item.id === category.id ? { ...item, isEditing: true } : item
      )
    );
  };

  const handleSaveClick = async (category: CategoryDto) => {
    const editableLimit = editableLimits.find((el) => el.id === category.id);
    if (!editableLimit) return;

    await updateLimitMutation.mutateAsync({
      categoryId: category.id,
      limit: editableLimit.value,
    });

    setEditableLimits((prev) =>
      prev.map((item) =>
        item.id === category.id ? { ...item, isEditing: false } : item
      )
    );
  };

  const handleLimitChange = (categoryId: string, value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return;

    setEditableLimits((prev) =>
      prev.map((item) =>
        item.id === categoryId ? { ...item, value: numValue } : item
      )
    );
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Categories
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage spending limits for each invoice category
              </Typography>
              <Divider sx={{ my: 2 }} />

              {categoriesData?.categories.map((category) => {
                const editableLimit = editableLimits.find(
                  (el) => el.id === category.id
                );

                return (
                  <Box
                    key={category.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography>{category.id}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {editableLimit?.isEditing ? (
                        <>
                          <TextField
                            size="small"
                            type="number"
                            value={editableLimit.value}
                            onChange={(e) =>
                              handleLimitChange(category.id, e.target.value)
                            }
                            sx={{ width: 100 }}
                          />
                          <IconButton
                            color="primary"
                            onClick={() => handleSaveClick(category)}
                            disabled={updateLimitMutation.isPending}
                          >
                            <SaveIcon />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <Typography>${category.limit}</Typography>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditClick(category)}
                          >
                            <EditIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Timeoffs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This feature is coming soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
