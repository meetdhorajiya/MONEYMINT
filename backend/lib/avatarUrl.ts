import type { IUser } from '@/models/User';

function toEpoch(input: Date | string | number | null | undefined): number | null {
  if (!input) {
    return null;
  }

  if (input instanceof Date) {
    return input.getTime();
  }

  const value = new Date(input).getTime();
  return Number.isFinite(value) ? value : null;
}

export function computeAvatarUrl(user: IUser | null | undefined): string | null {
  if (!user || !user.avatarId) {
    return null;
  }

  const version =
    toEpoch(user.avatarUpdatedAt) ??
    toEpoch(user.updatedAt) ??
    toEpoch(user.createdAt) ??
    Date.now();

  const versionParam = Number.isFinite(version) ? `&v=${version}` : '';
  return `/user/avatar?stream=1${versionParam}`;
}

type SerializableUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function serializeUser(user: IUser): SerializableUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    avatarUrl: computeAvatarUrl(user),
  };
}
