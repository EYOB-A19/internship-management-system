export function validateEmail(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function validatePassword(password) {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  return null;
}

export function validateInternshipForm(values) {
  const errors = {};
  if (!values.title || values.title.trim().length < 5) {
    errors.title = 'Internship title must be at least 5 characters.';
  }
  if (!values.description || values.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters.';
  }
  if (!values.location) {
    errors.location = 'Location is required.';
  }
  if (!values.application_deadline) {
    errors.application_deadline = 'Application deadline is required.';
  }
  return errors;
}
