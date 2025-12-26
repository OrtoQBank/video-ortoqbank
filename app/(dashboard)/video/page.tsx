import { getSignedEmbedUrl } from "@/lib/bunny";
import { VideoPlayerWithWatermark } from "@/components/bunny/video-player-with-watermark";

export default function VideoPage() {
    const { embedUrl } = getSignedEmbedUrl(
        "87e0e197-ccd4-4a88-a5b5-b461e4ca6383",
        process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || "566190"
    );

    return (
        <VideoPlayerWithWatermark
            embedUrl={embedUrl}
            userName="John Doe"
            userCpf="000.000.000-00"
        />
    );
}
