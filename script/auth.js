// Initialize Supabase
import { supabaseClient } from './initialize.js';

const authContainer = document.getElementById('auth-container');
const jobTracker = document.getElementById('job-tracker');

supabaseClient.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    showJobTracker()
  }
});

function showJobTracker() {
  window.location.replace('/dashboard.html')
  authContainer.style.display = 'none';
  jobTracker.style.display = 'block';
}

// Email/Password login
document.getElementById('email-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);
  showJobTracker();
});

// Register
document.getElementById('register-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) return alert(error.message);
  alert('Check your email for confirmation!');
});

// Google OAuth
document.getElementById('google-btn').addEventListener('click', async () => {
  await supabaseClient.auth.signInWithOAuth({
    provider: 'google', options: {
      redirectTo: `${window.location.origin}/dashboard.html` 
    }
  });
});
