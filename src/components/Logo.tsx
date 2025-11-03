import Box, { BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { MAIN_PATH } from "src/constant";

export default function Logo({ sx }: BoxProps) {
  return (
    <RouterLink to={`/${MAIN_PATH.browse}`} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          ...sx,
        }}
      >
        <Typography
          variant="h5"
          component="span"
          sx={{
            fontWeight: 900,
            color: "#E50914",
            letterSpacing: "-0.5px",
            fontSize: { xs: "18px", sm: "24px" },
            fontFamily: "'Arial Black', Arial, sans-serif",
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
          }}
        >
          UDONGFLIX
        </Typography>
      </Box>
    </RouterLink>
  );
}
