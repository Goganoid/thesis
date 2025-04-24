import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../services/authApi";
import { UserRole, CreateInviteDto } from "../types/auth";
import { invoiceApi } from "../services/invoiceApi";
import { Invoice } from "../types/invoice";
import { useUserData } from "../hooks/queries/useUserData";
import { translateInvoiceStatus } from '../utils/translate';

export function UsersPage() {
  const queryClient = useQueryClient();
  const { data: user } = useUserData();
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [openInvoiceHistoryDialog, setOpenInvoiceHistoryDialog] =
    useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState<CreateInviteDto>({
    email: "",
    role: UserRole.User,
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: authApi.getUsers,
  });

  const { data: invites, isLoading: isLoadingInvites } = useQuery({
    queryKey: ["invites"],
    queryFn: authApi.getInvites,
  });

  const { data: userInvoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["userInvoices", selectedUserId],
    queryFn: () => invoiceApi.admin.getAllInvoices(new Date().getFullYear()),
    enabled: !!selectedUserId,
  });

  const createInviteMutation = useMutation({
    mutationFn: authApi.createInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      setOpenInviteDialog(false);
      setInviteForm({ email: "", role: UserRole.User });
    },
  });

  const deleteInviteMutation = useMutation({
    mutationFn: authApi.deleteInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });

  const handleCreateInvite = async () => {
    await createInviteMutation.mutateAsync(inviteForm);
    navigator.clipboard.writeText(
      `${import.meta.env.VITE_APP_URL}/register`
    );
    alert("The link has been copied to your clipboard");
  };

  const handleDeleteInvite = (id: string) => {
    deleteInviteMutation.mutate(id);
  };

  const handleOpenInvoiceHistory = (userId: string) => {
    setSelectedUserId(userId);
    setOpenInvoiceHistoryDialog(true);
  };

  const handleCloseInvoiceHistory = () => {
    setOpenInvoiceHistoryDialog(false);
    setSelectedUserId(null);
  };

  const filteredInvoices =
    userInvoices?.filter((invoice) => invoice.userId === selectedUserId) || [];
  const invoicesByYear = filteredInvoices.reduce((acc, invoice) => {
    const year = new Date(invoice.createdAt).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(invoice);
    return acc;
  }, {} as Record<number, Invoice[]>);

  if (isLoadingUsers || isLoadingInvites) {
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
        <Typography variant="h4">Users</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenInviteDialog(true)}
        >
          Invite user
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Users
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenInvoiceHistory(user.id)}
                    >
                      <HistoryIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {user && user.role === UserRole.Admin && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Invites
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invites?.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>{invite.role}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleDeleteInvite(invite.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog
        open={openInviteDialog}
        onClose={() => setOpenInviteDialog(false)}
      >
        <DialogTitle>Invite User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={inviteForm.email}
            onChange={(e) =>
              setInviteForm({ ...inviteForm, email: e.target.value })
            }
          />
          <TextField
            select
            margin="dense"
            label="Role"
            fullWidth
            value={inviteForm.role}
            onChange={(e) =>
              setInviteForm({ ...inviteForm, role: e.target.value as UserRole })
            }
          >
            {Object.values(UserRole).map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInviteDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateInvite} variant="contained">
            Invite
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openInvoiceHistoryDialog}
        onClose={handleCloseInvoiceHistory}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Invoice History</DialogTitle>
        <DialogContent>
          {isLoadingInvoices ? (
            <Typography>Loading invoices...</Typography>
          ) : (
            <List>
              {Object.entries(invoicesByYear).map(([year, invoices]) => (
                <Box key={year}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    {year}
                  </Typography>
                  {invoices.map((invoice) => (
                    <ListItem key={invoice.id}>
                      <ListItemText
                        primary={`${invoice.category} - ${invoice.amount}$`}
                        secondary={`Status: ${translateInvoiceStatus(
                          invoice.status
                        )} - ${new Date(
                          invoice.createdAt
                        ).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                  <Divider />
                </Box>
              ))}
              {Object.keys(invoicesByYear).length === 0 && (
                <Typography>No invoices found</Typography>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInvoiceHistory}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
