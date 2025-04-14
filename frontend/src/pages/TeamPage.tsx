import { ChevronLeft, ChevronRight, Add as AddIcon } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Grid,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isWeekend,
  startOfMonth,
} from "date-fns";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { timeoffsApi } from "../services/timeoffsApi";
import { LeaveStatus, LeaveType } from "../types/timeoffs";
import { LeaveRequestModal } from "../components/LeaveRequestModal";
import { useUserData } from "../hooks/queries/useUserData";
import { LeaveStatsCard } from "../components/LeaveStatsCard";

const LEAVE_COLORS = {
  [LeaveType.TimeOff]: "#4CAF50",
  [LeaveType.SickLeave]: "#F44336",
};

export function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: userData } = useUserData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openLeaveRequestDialog, setOpenLeaveRequestDialog] = useState(false);

  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () =>
      timeoffsApi
        .getMyTeams()
        .then((data) => data.teams.find((team) => team.id === teamId)),
  });

  const { data: leaveRequests, isLoading: isLoadingLeaves } = useQuery({
    queryKey: ["teamLeaveRequests", teamId],
    queryFn: () => timeoffsApi.getTeamLeaveRequests(teamId!),
  });

  const { data: userStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["userStats", teamId],
    queryFn: () => timeoffsApi.getUserStats(teamId!),
  });

  const userLeaveRequests = useMemo(() => {
    return leaveRequests?.leaveRequests.filter(
      (request) => request.userId === userData?.id
    );
  }, [leaveRequests, userData?.id]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const getLeaveForDate = (userId: string, date: Date) => {
    return leaveRequests?.leaveRequests.find(
      (request) =>
        request.userId === userId &&
        new Date(request.startDate) <= date &&
        new Date(request.endDate) >= date &&
        request.status === LeaveStatus.Approved
    );
  };

  if (isLoadingTeam || isLoadingLeaves || isLoadingStats) {
    return <Typography>Loading...</Typography>;
  }

  if (!teamData) {
    return <Typography>Team not found</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">{teamData.name}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={handlePreviousMonth}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6">
            {format(currentDate, "MMMM yyyy")}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                {days.map((day: Date) => (
                  <TableCell
                    key={day.toISOString()}
                    sx={{
                      backgroundColor: isWeekend(day)
                        ? "action.hover"
                        : "inherit",
                      color: isWeekend(day) ? "text.secondary" : "inherit",
                      textAlign: "center",
                      width: "40px",
                    }}
                  >
                    {format(day, "d")}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {teamData.members.map((member) => (
                <TableRow
                  key={member.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <TableCell>{member.name}</TableCell>
                  {days.map((day: Date) => {
                    const leave = getLeaveForDate(member.id, day);
                    return (
                      <TableCell
                        key={day.toISOString()}
                        sx={{
                          backgroundColor: isWeekend(day)
                            ? "action.hover"
                            : "inherit",
                          color: isWeekend(day) ? "text.secondary" : "inherit",
                          textAlign: "center",
                          width: "40px",
                          height: "40px",
                          padding: 0,
                          "&:hover": {
                            backgroundColor: "action.selected",
                          },
                        }}
                      >
                        {leave && (
                          <Tooltip
                            title={`${leave.type} - ${format(
                              new Date(leave.startDate),
                              "MMM d"
                            )} - ${format(new Date(leave.endDate), "MMM d")}`}
                          >
                            <Box
                              sx={{
                                width: "100%",
                                height: "100%",
                                backgroundColor: LEAVE_COLORS[leave.type],
                                opacity: 0.7,
                              }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <LeaveRequestModal
        open={openLeaveRequestDialog}
        onClose={() => {
          setOpenLeaveRequestDialog(false);
        }}
        team={teamData}
      />

      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            My Leave Requests
          </Typography>
          <IconButton
            edge="end"
            onClick={(e) => {
              e.stopPropagation();
              setOpenLeaveRequestDialog(true);
            }}
            sx={{ mr: 1 }}
          >
            <AddIcon />
          </IconButton>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <LeaveStatsCard
              title="Sick Leave"
              type={LeaveType.SickLeave}
              total={userStats?.sickDays.total || 0}
              used={userStats?.sickDays.used || 0}
              requests={userLeaveRequests || []}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <LeaveStatsCard
              title="Time Off"
              type={LeaveType.TimeOff}
              total={userStats?.timeoffDays.total || 0}
              used={userStats?.timeoffDays.used || 0}
              requests={userLeaveRequests || []}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
