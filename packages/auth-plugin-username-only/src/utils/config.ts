export type UsernameOnlyOptions = {
  minUsernameLength?: number;
  maxUsernameLength?: number;
  minPasswordLength?: number;
  maxPasswordLength?: number;
};

export type UsernameOnlyConfig = Required<UsernameOnlyOptions>;

const defaultOptions: UsernameOnlyConfig = {
  minUsernameLength: 3,
  maxUsernameLength: 32,
  minPasswordLength: 8,
  maxPasswordLength: 128,
};

export const resolveConfig = (options?: UsernameOnlyOptions): UsernameOnlyConfig => ({
  ...defaultOptions,
  ...options,
});
