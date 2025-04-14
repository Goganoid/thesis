import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LeaveType, AddLeaveRequestDto, TeamDto } from "../types/timeoffs";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { timeoffsApi } from "../services/timeoffsApi";

interface LeaveRequestModalProps {
  open: boolean;
  onClose: () => void;
  team: TeamDto;
}

export function LeaveRequestModal({ open, onClose, team }: LeaveRequestModalProps) {
  const queryClient = useQueryClient();
  const [leaveRequestForm, setLeaveRequestForm] = useState<AddLeaveRequestDto>({
    type: LeaveType.TimeOff,
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    comment: "",
  });
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    const startDate = new Date(leaveRequestForm.start);
    const endDate = new Date(leaveRequestForm.end);
    
    if (startDate > endDate) {
      setDateError("Start date cannot be after end date");
    } else {
      setDateError(null);
    }
  }, [leaveRequestForm.start, leaveRequestForm.end]);

  const addLeaveRequestMutation = useMutation({
    mutationFn: ({ teamId, dto }: { teamId: string; dto: AddLeaveRequestDto }) =>
      timeoffsApi.addLeaveRequest(teamId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamLeaveRequests"] });
      onClose();
      setLeaveRequestForm({
        type: LeaveType.TimeOff,
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        comment: "",
      });
    },
  });

  const handleSubmit = () => {
    addLeaveRequestMutation.mutate({
      teamId: team.id,
      dto: leaveRequestForm,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Leave Request</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel>Leave Type</InputLabel>
          <Select
            value={leaveRequestForm.type}
            onChange={(e) =>
              setLeaveRequestForm({
                ...leaveRequestForm,
                type: e.target.value as LeaveType,
              })
            }
            label="Leave Type"
          >
            {Object.values(LeaveType).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={new Date(leaveRequestForm.start)}
            onChange={(date: Date | null) =>
              setLeaveRequestForm({
                ...leaveRequestForm,
                start: date?.toISOString() || new Date().toISOString(),
              })
            }
            sx={{ mt: 2, width: "100%" }}
          />
          <DatePicker
            label="End Date"
            value={new Date(leaveRequestForm.end)}
            onChange={(date: Date | null) =>
              setLeaveRequestForm({
                ...leaveRequestForm,
                end: date?.toISOString() || new Date().toISOString(),
              })
            }
            sx={{ mt: 2, width: "100%" }}
          />
          {dateError && (
            <FormHelperText error sx={{ mt: 1 }}>
              {dateError}
            </FormHelperText>
          )}
        </LocalizationProvider>
        <TextField
          margin="dense"
          label="Comment"
          fullWidth
          multiline
          rows={3}
          value={leaveRequestForm.comment}
          onChange={(e) =>
            setLeaveRequestForm({
              ...leaveRequestForm,
              comment: e.target.value,
            })
          }
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={addLeaveRequestMutation.isPending || !!dateError}
        >
          {addLeaveRequestMutation.isPending ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 