export interface IUser {
  id?: number;
  name: string;
}
export interface IAddress {
  id?: number;
  name1: string;
  userId: number;
  user?: IUser;
}
