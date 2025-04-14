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
import {
  SortableDataTable,
  ColumnConfig,
} from "../components/SortableDataTable";
import { DetailsDialog, Grid } from "../components/DetailsDialog";
import { timeoffsApi } from "../services/timeoffsApi";
import { LeaveRequestDto, LeaveStatus, LeaveType } from "../types/timeoffs";

const TimeoffsManagementPage: React.FC = () => {
  const theme = useTheme();
  const [selectedTimeoff, setSelectedTimeoff] =
    useState<LeaveRequestDto | null>(null);
  const queryClient = useQueryClient();

  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["myTeams"],
    queryFn: () => timeoffsApi.getMyTeams(),
  });

  const teamIds = teamsData?.teams.map((team) => team.id);

  const { data: leaveRequestsData, isLoading: isLoadingLeaveRequests } =
    useQuery({
      queryKey: ["teamLeaveRequests", teamIds],
      queryFn: async () => {
        if (!teamIds) return [];
        const responses = await Promise.all(
          teamIds.map(async (id) => {
            const response = await timeoffsApi.getTeamLeaveRequests(id);
            return response.leaveRequests.map((request) => ({
              ...request,
              teamId: id,
              teamName: response.name,
            }));
          })
        );
        return responses.flatMap((response) => response);
      },
      enabled: !!teamIds,
    });

  const waitingLeaveRequests = useMemo(() => {
    if (!leaveRequestsData) return [];
    return leaveRequestsData.filter(
      (request) => request.status === LeaveStatus.Waiting
    );
  }, [leaveRequestsData]);

  console.log(leaveRequestsData, waitingLeaveRequests);

  const isLoading = isLoadingTeams || isLoadingLeaveRequests;

  // Update leave request status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeaveStatus }) =>
      timeoffsApi.updateLeaveRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamLeaveRequests"] });
      setSelectedTimeoff(null);
    },
  });

  const handleApprove = () => {
    if (selectedTimeoff) {
      updateStatusMutation.mutate({
        id: selectedTimeoff.id,
        status: LeaveStatus.Approved,
      });
    }
  };

  const handleDecline = () => {
    if (selectedTimeoff) {
      updateStatusMutation.mutate({
        id: selectedTimeoff.id,
        status: LeaveStatus.Declined,
      });
    }
  };

  const getStatusChip = (status: LeaveStatus) => {
    const statusConfig = {
      [LeaveStatus.Approved]: { color: "success", label: "Approved" },
      [LeaveStatus.Declined]: { color: "error", label: "Declined" },
      [LeaveStatus.Waiting]: { color: "warning", label: "Waiting" },
    };

    const config = statusConfig[status];

    return (
      <Chip label={config.label} color={config.color as any} size="small" />
    );
  };

  const getLeaveTypeLabel = (type: LeaveType) => {
    const typeConfig = {
      [LeaveType.TimeOff]: "Time Off",
      [LeaveType.SickLeave]: "Sick Leave",
    };

    return typeConfig[type];
  };

  // Define columns for the table
  const columns: ColumnConfig<LeaveRequestDto>[] = [
    {
      id: "startDate",
      label: "Start Date",
      render: (item) => new Date(item.startDate).toLocaleDateString(),
    },
    {
      id: "endDate",
      label: "End Date",
      render: (item) => new Date(item.endDate).toLocaleDateString(),
    },
    {
      id: "type",
      label: "Type",
      render: (item) => getLeaveTypeLabel(item.type),
    },
    {
      id: "status",
      label: "Status",
      render: (item) => getStatusChip(item.status),
    },
    {
      id: "teamName",
      label: "Team",
    },
    {
      id: "name",
      label: "Email",
    },
  ];

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
          Timeoffs Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve pending timeoff requests submitted by employees
        </Typography>
      </Paper>

      <SortableDataTable
        data={waitingLeaveRequests}
        columns={columns}
        defaultSortBy="startDate"
        defaultSortDirection="desc"
        onRowClick={setSelectedTimeoff}
        emptyMessage="No pending timeoff requests found"
        getRowKey={(item) => item.id}
      />

      <DetailsDialog
        open={!!selectedTimeoff}
        onClose={() =>
          !updateStatusMutation.isPending && setSelectedTimeoff(null)
        }
        title="Timeoff Request Details"
        actions={
          <>
            <Button
              onClick={() => setSelectedTimeoff(null)}
              color="inherit"
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
            <Button
              onClick={handleDecline}
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
              Decline Request
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
              Approve Request
            </Button>
          </>
        }
      >
        {selectedTimeoff && (
          <Box>
            <Grid
              label="Start Date"
              value={new Date(selectedTimeoff.startDate).toLocaleDateString()}
            />
            <Grid
              label="End Date"
              value={new Date(selectedTimeoff.endDate).toLocaleDateString()}
            />
            <Grid
              label="Type"
              value={getLeaveTypeLabel(selectedTimeoff.type)}
            />
            <Grid
              label="Status"
              value={getStatusChip(selectedTimeoff.status)}
              isComponent
            />
            <Grid label="User" value={selectedTimeoff.name} />
            <Grid
              label="Team"
              value={
                teamsData?.teams.find(
                  (team) => team.id === selectedTimeoff.teamId
                )?.name
              }
            />
          </Box>
        )}
      </DetailsDialog>
    </Box>
  );
};

export default TimeoffsManagementPage;
