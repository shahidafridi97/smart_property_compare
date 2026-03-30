export const STATIC_USER = {
  username: "admin",
  password: "123456",
};

export function validateUser(username, password) {
  return (
    username === STATIC_USER.username &&
    password === STATIC_USER.password
  );
}