import {
  Box,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { LeaveRequestDto, LeaveType } from "../types/timeoffs";

interface LeaveStatsCardProps {
  title: string;
  type: LeaveType;
  total: number;
  used: number;
  requests: LeaveRequestDto[];
}

export function LeaveStatsCard({
  title,
  type,
  total,
  used,
  requests,
}: LeaveStatsCardProps) {
  const filteredRequests = requests.filter((request) => request.type === type);
  const left = total - used;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total
            </Typography>
            <Typography variant="h6">{total}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Used
            </Typography>
            <Typography variant="h6">{used}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Left
            </Typography>
            <Typography variant="h6">{left}</Typography>
          </Box>
        </Box>

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
          Requests
        </Typography>
        {filteredRequests.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {format(new Date(request.startDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.endDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{request.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No {title.toLowerCase()} requests
          </Typography>
        )}
      </CardContent>
    </Card>
  );
} 