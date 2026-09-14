import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { uploadChatImage } from "../../chatImages";

export function useChatImage(userId: string | null, conversationId: string | undefined) {
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const generation = useRef(0);

  useEffect(() => {
    setAttachedImage(null);
    setIsUploadingImage(false);
    setImageError("");
    return () => { generation.current++; };
  }, [userId, conversationId]);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // Allow selecting the same file again after removing it.
    if (!file) return;
    const current = ++generation.current;
    setAttachedImage(null);
    setImageError("");
    setIsUploadingImage(true);
    try {
      const url = await uploadChatImage(file, userId || "");
      if (current === generation.current) setAttachedImage(url);
    } catch (error) {
      if (current === generation.current) setImageError(error instanceof Error ? error.message : "Image upload failed. Please try again.");
    } finally {
      if (current === generation.current) setIsUploadingImage(false);
    }
  };

  return { attachedImage, setAttachedImage, isUploadingImage, imageError, handleImageUpload };
}
