"use client";
import React, { useRef, useEffect, useState } from 'react';
import VoiceRecorder from './voiceRecorder';

const DSD: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [videoKey, setVideoKey] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
    const [mutedVDO, setMuteVDO] = useState<boolean>(true);
    const [transcript, setTranscript] = useState<string | null>(null);

    const [activeBtn, setActiveBtn] = useState<number | null>(null);

    const videoSources: Record<number, string> = {
        1: "/mp4/a6.mp4",
        2: "/mp4/a2.mp4",
        3: "/mp4/a3.mp4",
        4: "/mp4/a4.mp4",
        5: "/mp4/a5.mp4",
        6: "/mp4/a1.mp4",
        7: "/mp4/a7.mp4",
        8: "/mp4/a8.mp4",
    };

    const videoSrc = activeBtn !== null ? videoSources[activeBtn] : videoSources[1];

    const handleVideoEnd = (): void => {
        console.log('Video has ended. Returning to default video.');
        setActiveBtn(1);
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch((error) => {
                console.warn('Video failed to play automatically', error);
            });
        }
    }, [activeBtn]);

    useEffect(() => {
        const playVideo = async () => {
            if (!videoRef.current) return;

            try {
                await videoRef.current.play();
                console.log('Video started playing successfully');
            } catch (error) {
                console.warn('Autoplay failed. Video interaction required.', error);
                setIsPlaying(false);
            }
        };

        if (videoRef.current) {
            playVideo();
        }
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (activeBtn === 1) {
                setActiveBtn(7);
            }
        }, 60000);
        return () => clearInterval(intervalId);
    }, [activeBtn]);

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-black relative">
            <video
                key={videoKey}
                ref={videoRef}
                autoPlay
                loop={videoSrc == videoSources[1] ? true : false}
                muted={videoSrc == videoSources[1] ? true : false}
                onEnded={handleVideoEnd}
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
                onCanPlay={() => setIsVideoLoaded(true)}
            >
                <source
                    src={videoSrc}
                    type="video/mp4"
                />
            </video>

            <div className='absolute top-[30vh] right-[10vw]'>
                <VoiceRecorder setTranscript={setTranscript} setActiveBtn={setActiveBtn} />
            </div>

            {transcript && (
                <div className="absolute bottom-4 right-4 bg-white p-4 rounded-md shadow-lg max-w-md">
                    <h4 className="text-black font-bold mb-2">Transcription:</h4>
                    <p className="text-black">{transcript}</p>
                </div>
            )}
        </div>
    );
};

export default DSD;
