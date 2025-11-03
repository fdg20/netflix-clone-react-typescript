import { useEffect, useRef } from "react";
import Player from "video.js/dist/types/player";
import videojs from "video.js";
import "videojs-youtube";
import "@videojs/http-streaming";
import "video.js/dist/video-js.css";

export default function VideoJSPlayer({
  options,
  onReady,
}: {
  options: any;
  onReady: (player: Player) => void;
}) {
  const videoRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    (async function handleVideojs() {
      // Make sure Video.js player is only initialized once
      if (!playerRef.current) {
        // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
        const videoElement = document.createElement("video-js");
        // videoElement.classList.add("vjs-big-play-centered", "vjs-16-9");

        videoRef.current?.appendChild(videoElement);
        const player = (playerRef.current = videojs(
          videoElement,
          options,
          () => {
            onReady && onReady(player);
          }
        ));

        // import("video.js").then(async ({ default: videojs }) => {
        //   await import("video.js/dist/video-js.css");
        //   if (options["techOrder"] && options["techOrder"].includes("youtube")) {
        //     // eslint-disable-next-line
        //     await import("videojs-youtube");
        //   }
        //   const player = (playerRef.current = videojs(
        //     videoElement,
        //     options,
        //     () => {
        //       onReady && onReady(player);
        //     }
        //   ));
        // });

        // await import("video.js/dist/video-js.css");
        // const videojs = await import("video.js");
        // if (options["techOrder"] && options["techOrder"].includes("youtube")) {
        //   // eslint-disable-next-line
        //   await import("videojs-youtube");
        // }
        // const player = (playerRef.current = videojs.default(
        //   videoElement,
        //   options,
        //   () => {
        //     onReady && onReady(player);
        //   }
        // ));

        // Update existing player when options change
      } else {
        const player = playerRef.current;
        // Update player dimensions
        player.width(options.width);
        player.height(options.height);
        
        // Update video source if it changed
        if (options.sources && options.sources.length > 0) {
          const currentSrc = player.currentSrc();
          const newSrc = options.sources[0].src;
          if (currentSrc !== newSrc) {
            player.src(options.sources);
            player.load();
          }
        }
      }
    })();
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
}
