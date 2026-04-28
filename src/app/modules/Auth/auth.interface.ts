export type IRegisterUser = {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
};

export type ILoginUser = {
  email: string;
  password: string;
};
