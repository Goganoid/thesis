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
import { timeoffsApi } from "../services/timeoffsApi";
import { CategoriesDto, CategoryDto, InvoiceCategory } from "../types/invoice";
import { TimeoffSettingsDto } from "../types/timeoffs";

interface EditableCategoryLimit {
  id: string;
  isEditing: boolean;
  value: number;
}

interface EditableTimeoffSettings {
  isEditing: boolean;
  maxVacationDays: number;
  maxSickDays: number;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [editableLimits, setEditableLimits] = useState<EditableCategoryLimit[]>([]);
  const [editableTimeoffSettings, setEditableTimeoffSettings] = useState<EditableTimeoffSettings>({
    isEditing: false,
    maxVacationDays: 0,
    maxSickDays: 0,
  });

  const { data: categoriesData, isLoading } = useQuery<CategoriesDto>({
    queryKey: ["categories"],
    queryFn: () => invoiceApi.getCategories(),
  });

  const { data: timeoffSettingsData, isLoading: isLoadingTimeoffSettings } = useQuery({
    queryKey: ["timeoffSettings"],
    queryFn: () => timeoffsApi.getSettings(),
  });

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

  useEffect(() => {
    if (timeoffSettingsData) {
      setEditableTimeoffSettings({
        isEditing: false,
        maxVacationDays: timeoffSettingsData.maxVacationDays,
        maxSickDays: timeoffSettingsData.maxSickDays,
      });
    }
  }, [timeoffSettingsData]);

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

  const updateTimeoffSettingsMutation = useMutation({
    mutationFn: (settings: Partial<TimeoffSettingsDto>) => timeoffsApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeoffSettings"] });
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

  const handleTimeoffSettingsEdit = () => {
    setEditableTimeoffSettings(prev => ({ ...prev, isEditing: true }));
  };

  const handleTimeoffSettingsSave = async () => {
    await updateTimeoffSettingsMutation.mutateAsync({
      maxVacationDays: editableTimeoffSettings.maxVacationDays,
      maxSickDays: editableTimeoffSettings.maxSickDays,
    });
    setEditableTimeoffSettings(prev => ({ ...prev, isEditing: false }));
  };

  const handleTimeoffSettingsChange = (field: keyof TimeoffSettingsDto, value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return;

    setEditableTimeoffSettings(prev => ({
      ...prev,
      [field]: numValue,
    }));
  };

  if (isLoading || isLoadingTimeoffSettings) {
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
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage timeoff settings
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography>Max Vacation Days</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {editableTimeoffSettings.isEditing ? (
                      <>
                        <TextField
                          size="small"
                          type="number"
                          value={editableTimeoffSettings.maxVacationDays}
                          onChange={(e) => handleTimeoffSettingsChange("maxVacationDays", e.target.value)}
                          sx={{ width: 100 }}
                        />
                      </>
                    ) : (
                      <Typography>{editableTimeoffSettings.maxVacationDays} days</Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography>Max Sick Days</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {editableTimeoffSettings.isEditing ? (
                      <>
                        <TextField
                          size="small"
                          type="number"
                          value={editableTimeoffSettings.maxSickDays}
                          onChange={(e) => handleTimeoffSettingsChange("maxSickDays", e.target.value)}
                          sx={{ width: 100 }}
                        />
                      </>
                    ) : (
                      <Typography>{editableTimeoffSettings.maxSickDays} days</Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  {editableTimeoffSettings.isEditing ? (
                    <IconButton
                      color="primary"
                      onClick={handleTimeoffSettingsSave}
                      disabled={updateTimeoffSettingsMutation.isPending}
                    >
                      <SaveIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      color="primary"
                      onClick={handleTimeoffSettingsEdit}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
