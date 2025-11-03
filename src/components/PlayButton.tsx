import Button, { ButtonProps } from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useNavigate } from "react-router-dom";
import { MAIN_PATH } from "src/constant";
import { MEDIA_TYPE } from "src/types/Common";

interface PlayButtonProps extends ButtonProps {
  mediaType?: MEDIA_TYPE;
  movieId?: number;
}

export default function PlayButton({ sx, mediaType, movieId, ...others }: PlayButtonProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (mediaType && movieId) {
      const mediaTypePath = mediaType === MEDIA_TYPE.Tv ? "tv" : "movie";
      navigate(`/${MAIN_PATH.watch}/${mediaTypePath}/${movieId}`);
    } else {
      navigate(`/${MAIN_PATH.browse}`);
    }
  };
  
  return (
    <Button
      color="inherit"
      variant="contained"
      startIcon={
        <PlayArrowIcon
          sx={{
            fontSize: {
              xs: "24px !important",
              sm: "32px !important",
              md: "40px !important",
            },
          }}
        />
      }
      {...others}
      sx={{
        px: { xs: 1, sm: 2 },
        py: { xs: 0.5, sm: 1 },
        fontSize: { xs: 18, sm: 24, md: 28 },
        lineHeight: 1.5,
        fontWeight: "bold",
        whiteSpace: "nowrap",
        textTransform: "capitalize",
        ...sx,
      }}
      onClick={handleClick}
    >
      Play
    </Button>
  );
}
