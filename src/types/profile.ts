import type { UserProfile as BaseProfile } from './models';

export interface UserProfile extends Omit<BaseProfile, 'id'> {
  uid: string;
}
