import { Box, styled } from "@mui/material";

export const DropzoneArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "border 0.3s ease-in-out",
  "&:hover": {
    borderColor: theme.palette.primary.dark,
  },
})); 