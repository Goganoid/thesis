import { Edit as EditIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../hooks/queries/useUserData";
import { authApi } from "../services/authApi";
import { timeoffsApi } from "../services/timeoffsApi";
import { UserRole } from "../types/auth";
import { CreateTeamDto, TeamDto, UpdateTeamDto } from "../types/timeoffs";

export function TimeoffsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: userData } = useUserData();
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamDto | null>(null);
  const [teamForm, setTeamForm] = useState<
    Omit<CreateTeamDto, "representativeId">
  >({
    name: "",
    members: [],
  });

  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["myTeams"],
    queryFn: () => timeoffsApi.getMyTeams(),
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: authApi.getUsers,
  });

  const createTeamMutation = useMutation({
    mutationFn: timeoffsApi.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTeams"] });
      setOpenTeamDialog(false);
      setTeamForm({ name: "", members: [] });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ teamId, dto }: { teamId: string; dto: UpdateTeamDto }) =>
      timeoffsApi.updateTeam(teamId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTeams"] });
      setOpenTeamDialog(false);
      setEditingTeam(null);
      setTeamForm({ name: "", members: [] });
    },
  });

  const isAdminOrManager =
    userData?.role === UserRole.Admin || userData?.role === UserRole.Manager;

  const handleOpenCreateDialog = () => {
    setEditingTeam(null);
    setTeamForm({ name: "", members: [] });
    setOpenTeamDialog(true);
  };

  const handleOpenEditDialog = (team: TeamDto) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      members: team.members.map((member) => member.id) || [],
    });
    setOpenTeamDialog(true);
  };

  const handleSubmit = () => {
    if (editingTeam) {
      updateTeamMutation.mutate({
        teamId: editingTeam.id,
        dto: teamForm,
      });
    } else {
      createTeamMutation.mutate(teamForm);
    }
  };

  if (isLoadingTeams || isLoadingUsers) {
    return <Typography>Loading...</Typography>;
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
        <Typography variant="h4">Timeoffs</Typography>
        {isAdminOrManager && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenCreateDialog}
            >
              Create a team
            </Button>
            <Button variant="outlined" color="primary" onClick={() => navigate("/timeoffs/manage")}>
              Manage requests
            </Button>
          </Box>
        )}
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          My Teams
        </Typography>
        <List>
          {teamsData?.teams.map((team) => (
            <ListItem
              key={team.id}
              secondaryAction={
                <Box>
                  {isAdminOrManager && (
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditDialog(team);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>
              }
              onClick={() => navigate(`/timeoffs/teams/${team.id}`)}
              sx={{ cursor: "pointer" }}
            >
              <ListItemText primary={team.name} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog
        open={openTeamDialog}
        onClose={() => setOpenTeamDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingTeam ? "Edit Team" : "Create Team"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Team Name"
            fullWidth
            value={teamForm.name}
            onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Team Members</InputLabel>
            <Select
              multiple
              value={teamForm.members}
              onChange={(e) =>
                setTeamForm({
                  ...teamForm,
                  members: e.target.value as string[],
                })
              }
              label="Team Members"
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={users?.find((user) => user.id === value)?.email}
                    />
                  ))}
                </Box>
              )}
            >
              {users
                ?.filter((u) => u.id !== userData?.id)
                .map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.email}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTeamDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTeam ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
