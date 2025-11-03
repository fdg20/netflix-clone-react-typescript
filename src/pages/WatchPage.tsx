import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Player from "video.js/dist/types/player";
import { Box, Stack, Typography, Menu, MenuItem } from "@mui/material";
import { SliderUnstyledOwnProps } from "@mui/base/SliderUnstyled";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import SettingsIcon from "@mui/icons-material/Settings";
import BrandingWatermarkOutlinedIcon from "@mui/icons-material/BrandingWatermarkOutlined";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import SubtitlesIcon from "@mui/icons-material/Subtitles";
import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";

import useWindowSize from "src/hooks/useWindowSize";
import { formatTime } from "src/utils/common";
import { YOUTUBE_URL } from "src/constant";

import MaxLineTypography from "src/components/MaxLineTypography";
import VolumeControllers from "src/components/watch/VolumeControllers";
import VideoJSPlayer from "src/components/watch/VideoJSPlayer";
import PlayerSeekbar from "src/components/watch/PlayerSeekbar";
import PlayerControlButton from "src/components/watch/PlayerControlButton";
import MainLoadingScreen from "src/components/MainLoadingScreen";
import { useGetAppendedVideosQuery } from "src/store/slices/discover";
import { MEDIA_TYPE } from "src/types/Common";

export function Component() {
  const { mediaType, id } = useParams<{ mediaType: string; id: string }>();
  const navigate = useNavigate();
  const playerRef = useRef<Player | null>(null);
  const settingsMenuRef = useRef<HTMLButtonElement | null>(null);
  
  const [playerState, setPlayerState] = useState({
    paused: false,
    muted: false,
    playedSeconds: 0,
    duration: 0,
    volume: 0.8,
    loaded: 0,
    isFullscreen: false,
  });

  const [playerInitialized, setPlayerInitialized] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [subtitleEnabled, setSubtitleEnabled] = useState(false);

  const mediaTypeEnum = mediaType === "tv" ? MEDIA_TYPE.Tv : MEDIA_TYPE.Movie;
  const movieId = id ? parseInt(id, 10) : 0;

  const { data: movieDetail, isLoading } = useGetAppendedVideosQuery(
    { mediaType: mediaTypeEnum, id: movieId },
    { skip: !movieId }
  );

  const windowSize = useWindowSize();
  
  const videoJsOptions = useMemo(() => {
    // Prioritize Trailers, then Teasers, then Clips, then any other video
    const videos = movieDetail?.videos?.results || [];
    const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube");
    const teaser = videos.find(v => v.type === "Teaser" && v.site === "YouTube");
    const clip = videos.find(v => v.type === "Clip" && v.site === "YouTube");
    const firstVideo = videos.find(v => v.site === "YouTube");
    
    const selectedVideo = trailer || teaser || clip || firstVideo;
    const videoKey = selectedVideo?.key;
    
    // Note: TMDB only provides trailers/teasers via YouTube, not full movies
    // For full movies, you would need a separate streaming service
    const videoUrl = videoKey ? `${YOUTUBE_URL}${videoKey}` : "https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8";
    
    return {
      preload: "metadata",
      autoplay: true,
      controls: false,
      width: windowSize.width,
      height: windowSize.height,
      techOrder: videoKey ? ["youtube"] : undefined,
      sources: [
        {
          src: videoUrl,
          type: videoKey ? "video/youtube" : "application/x-mpegurl",
        },
      ],
    };
  }, [windowSize, movieDetail]);

  useEffect(() => {
    if (!mediaType || !id) {
      navigate("/browse");
    }
  }, [mediaType, id, navigate]);

  const handlePlayerReady = function (player: Player): void {
    player.on("pause", () => {
      setPlayerState((draft) => {
        return { ...draft, paused: true };
      });
    });

    player.on("play", () => {
      setPlayerState((draft) => {
        return { ...draft, paused: false };
      });
    });

    player.on("timeupdate", () => {
      setPlayerState((draft) => {
        return { ...draft, playedSeconds: player.currentTime() };
      });
    });

    player.one("durationchange", () => {
      setPlayerInitialized(true);
      setPlayerState((draft) => ({ ...draft, duration: player.duration() }));
    });

    player.on("fullscreenchange", () => {
      setPlayerState((draft) => ({
        ...draft,
        isFullscreen: player.isFullscreen(),
      }));
    });

    playerRef.current = player;

    setPlayerState((draft) => {
      return { ...draft, paused: player.paused() };
    });
  };

  const handleVolumeChange: SliderUnstyledOwnProps["onChange"] = (_, value) => {
    playerRef.current?.volume((value as number) / 100);
    setPlayerState((draft) => {
      return { ...draft, volume: (value as number) / 100 };
    });
  };

  const handleSeekTo = (v: number) => {
    playerRef.current?.currentTime(v);
  };

  const handleGoBack = () => {
    navigate("/browse");
  };

  const handleFullscreen = () => {
    if (playerRef.current) {
      if (playerRef.current.isFullscreen()) {
        playerRef.current.exitFullscreen();
      } else {
        playerRef.current.requestFullscreen();
      }
    }
  };

  const handleSettingsOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleSubtitleToggle = () => {
    setSubtitleEnabled(!subtitleEnabled);
    handleSettingsClose();
    // Note: Video.js subtitle support would need additional configuration
    // This is a basic toggle for UI
  };

  if (isLoading || !movieDetail) {
    return <MainLoadingScreen />;
  }

  if (!!videoJsOptions.width) {
    return (
      <Box
        sx={{
          position: "relative",
        }}
      >
        <VideoJSPlayer options={videoJsOptions} onReady={handlePlayerReady} />
        {playerRef.current && playerInitialized && (
          <Box
            sx={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              position: "absolute",
            }}
          >
            <Box px={2} sx={{ position: "absolute", top: 75 }}>
              <PlayerControlButton onClick={handleGoBack}>
                <KeyboardBackspaceIcon />
              </PlayerControlButton>
            </Box>

            <Box
              px={{ xs: 1, sm: 2 }}
              sx={{ position: "absolute", bottom: 20, left: 0, right: 0 }}
            >
              {/* Seekbar */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <PlayerSeekbar
                  playedSeconds={playerState.playedSeconds}
                  duration={playerState.duration}
                  seekTo={handleSeekTo}
                />
              </Stack>
              {/* end Seekbar */}

              {/* Controller */}
              <Stack direction="row" alignItems="center">
                {/* left controller */}
                <Stack
                  direction="row"
                  spacing={{ xs: 0.5, sm: 1.5, md: 2 }}
                  alignItems="center"
                >
                  {!playerState.paused ? (
                    <PlayerControlButton
                      onClick={() => {
                        playerRef.current?.pause();
                      }}
                    >
                      <PauseIcon />
                    </PlayerControlButton>
                  ) : (
                    <PlayerControlButton
                      onClick={() => {
                        playerRef.current?.play();
                      }}
                    >
                      <PlayArrowIcon />
                    </PlayerControlButton>
                  )}
                  <PlayerControlButton>
                    <SkipNextIcon />
                  </PlayerControlButton>
                  <VolumeControllers
                    muted={playerState.muted}
                    handleVolumeToggle={() => {
                      playerRef.current?.muted(!playerState.muted);
                      setPlayerState((draft) => {
                        return { ...draft, muted: !draft.muted };
                      });
                    }}
                    value={playerState.volume}
                    handleVolume={handleVolumeChange}
                  />
                  <Typography variant="caption" sx={{ color: "white" }}>
                    {`${formatTime(playerState.playedSeconds)} / ${formatTime(
                      playerState.duration
                    )}`}
                  </Typography>
                </Stack>
                {/* end left controller */}

                {/* middle time */}
                <Box flexGrow={1}>
                  <MaxLineTypography
                    maxLine={1}
                    variant="subtitle1"
                    textAlign="center"
                    sx={{ maxWidth: 300, mx: "auto", color: "white" }}
                  >
                    {movieDetail?.title || "Description"}
                  </MaxLineTypography>
                </Box>
                {/* end middle time */}

                {/* right controller */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={{ xs: 0.5, sm: 1.5, md: 2 }}
                >
                  <PlayerControlButton
                    ref={settingsMenuRef}
                    onClick={handleSettingsOpen}
                  >
                    <SettingsIcon />
                  </PlayerControlButton>
                  <Menu
                    anchorEl={settingsAnchorEl}
                    open={Boolean(settingsAnchorEl)}
                    onClose={handleSettingsClose}
                    PaperProps={{
                      sx: {
                        bgcolor: "rgba(0, 0, 0, 0.9)",
                        color: "white",
                      },
                    }}
                  >
                    <MenuItem onClick={handleSubtitleToggle}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {subtitleEnabled ? (
                          <ClosedCaptionIcon sx={{ color: "white" }} />
                        ) : (
                          <SubtitlesIcon sx={{ color: "white" }} />
                        )}
                        <Typography>
                          {subtitleEnabled ? "Disable Subtitles" : "Enable Subtitles"}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  </Menu>
                  <PlayerControlButton>
                    <BrandingWatermarkOutlinedIcon />
                  </PlayerControlButton>
                  <PlayerControlButton onClick={handleFullscreen}>
                    {playerState.isFullscreen ? (
                      <FullscreenExitIcon />
                    ) : (
                      <FullscreenIcon />
                    )}
                  </PlayerControlButton>
                </Stack>
                {/* end right controller */}
              </Stack>
              {/* end Controller */}
            </Box>
          </Box>
        )}
      </Box>
    );
  }
  return <MainLoadingScreen />;
}

Component.displayName = "WatchPage";
