export type ISendMessage = {
  content?: string;
  fileUrl?: string;
  type?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "FILE";
};

export type IGetMessages = {
  page?: number;
  limit?: number;
};
