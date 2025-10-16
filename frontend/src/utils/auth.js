export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

export const getUserData = () => {
  return {
    name: localStorage.getItem('user_name'),
    email: localStorage.getItem('user_email'),
    profileImage: localStorage.getItem('profile_image'),
    profileCompleted: localStorage.getItem('profile_completed') === 'true',
  };
};

export const logout = () => {
  localStorage.clear();
  window.location.href = '/';
};

export const setUserData = (data) => {
  if (data.access_token) localStorage.setItem('access_token', data.access_token);
  if (data.user) {
    localStorage.setItem('user_name', data.user.name);
    localStorage.setItem('user_email', data.user.email);
    localStorage.setItem('profile_image', data.user.profile_image);
    localStorage.setItem('profile_completed', String(data.user.profile_completed));
  }
};
