"use client";
import { useState, useRef } from 'react';
import { PiMicrophoneLight } from "react-icons/pi";

interface VoiceRecorderProps {
    setTranscript: React.Dispatch<React.SetStateAction<string | null>>;
    setActiveBtn: React.Dispatch<React.SetStateAction<number | null>>;
}


const blobToBase64 = (blob: Blob, callback: (base64: string) => void): void => {
    const reader = new FileReader();
    reader.onload = function () {
        const result = reader.result as string;
        const base64data = result.split(",")[1];
        callback(base64data);
    };
    reader.readAsDataURL(blob);
};

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ setTranscript, setActiveBtn }) => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);


    const matchingKeywords = (num: number | null) => {
        if (num === 1) {
            // console.log(num);
            setActiveBtn(6)
        } else if (num === 2) {
            // console.log(num);
            setActiveBtn(2)
        } else if (num === 3) {
            // console.log(num);
            setActiveBtn(3)
        } else if (num === 4) {
            // console.log(num);
            setActiveBtn(4)
        } else if (num === 5) {
            // console.log(num);
            setActiveBtn(5)
        } else if (num === 6) {
            // console.log(num);
            setActiveBtn(6)
        }

        else {
            console.log(num);
            setActiveBtn(8)
        }
    }

    const matchSentences = async (transcription: string): Promise<number | null> => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer sk-svcacct-fhRmHT1b4JtwNSCsNgxhcX6WiIyryol4VFGsQn6M7U-67RPBOaqa3pmncVFxzT3BlbkFJXmLbfoo1gmrsFQm4xeOtRrEV0sQWrCc-4P2Qg9_lHRoNp1gBtEu6Yal3aq4AA`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are a tool to match sentence meanings.' },
                    {
                        role: 'user', content: `
                            1).ของขวัญปีใหม่จากกระทรวงแรงงาน ปี 2568 โดยกรมพัฒนาฝีมือแรงงาน มีอะไรบ้าง
                            2).กิจกรรมภายในงาน Kick off Drive Safe D เช็คชัวร์ก่อนเดินทาง วันนี้มีกิจกรรมอะไรบ้าง 
                            3).สามารถนำรถเข้าตรวจเช็คสภาพได้ที่ไหนบ้าง
                            4).รบกวนท่านแนะนำตัว
                            5).หน่วยงานเอกชนที่เข้าร่วมโครงการ Kick off Drive Safe D เช็คชัวร์ก่อนเดินทาง มีใครบ้าง

                            ข้อความต่อไปนี้  ${transcription} ตรงกับความหมายในข้อใด

                            ให้ตอบเป็นตัวเลขของข้อนั้น เช่น 1 
                            หากไม่ตรงกับข้อใด ตอบ 8
                    ` }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        // console.log(data)
        const score = parseFloat(data.choices[0].message.content.trim());
        return score;
    };

    const generateRandomString = (length: number): string => {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
        }
        return result;
    };

    const uploadAudioToTranscription = async (audioBlob: Blob): Promise<string | null> => {
        const randomString = generateRandomString(10);
        const formData = new FormData();

        formData.append("audio", audioBlob, `${randomString}.mp3`);
        formData.append("hash", randomString);

        try {
            const response = await fetch("https://nippon.creaivelab.com/speech_to_text/upload-audio", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                console.error('Error uploading audio:', response.statusText);
                return null;
            }

            const transcription = await response.json();

            return transcription.text_output || null;
        } catch (error) {
            console.error('Failed to upload and transcribe audio:', error);
            return null;
        }
    };

    const startRecording = async (): Promise<void> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                blobToBase64(audioBlob, (base64) => console.log('Base64 Audio:', base64[0]));
                audioChunksRef.current = [];

                const audioURL = URL.createObjectURL(audioBlob);
                setAudioUrl(audioURL);
                const transcription = await uploadAudioToTranscription(audioBlob);

                if (transcription) {
                    // console.log('Transcription:', transcription);
                    setTranscript(transcription);
                    const score = await matchSentences(transcription);
                    // console.log('Matched Sentence Index:', score);

                    matchingKeywords(Number(score))
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            alert('Error accessing microphone. Please check your permissions.');
            console.error('Error accessing microphone:', error);
        }
    };
    const stopRecording = (): void => {
        if (!mediaRecorderRef.current) {
            console.warn('No active media recorder to stop.');
            return;
        }
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    };

    return (
        <div className="voice-recorder w-[120px] h-[120px]">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full h-full relative ${isRecording ? 'bg-red-600' : 'bg-white text-black'} transition-colors rounded-full`}
            >
                <img
                    src="./png/btn.png"
                    alt="Microphone button"
                    className="w-full h-full rounded-full object-cover"
                />
                <PiMicrophoneLight className={`absolute inset-0 w-full h-[50%] ${isRecording ? "text-black m-auto animate-ping duration-700" : "hidden"}`} />
            </button>
        </div>

    );
}


export default VoiceRecorder;