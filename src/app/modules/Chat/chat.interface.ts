export type ICreateOneToOneChat = {
  participantId: string;
};

export type ICreateGroupChat = {
  name: string;
  description?: string;
  avatar?: string;
  participantIds: string[];
};

export type IUpdateGroupChat = {
  name?: string;
  description?: string;
  avatar?: string;
};

export type IAddParticipants = {
  participantIds: string[];
};

export type IRemoveParticipant = {
  participantId: string;
};
