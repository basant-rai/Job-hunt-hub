import { supabaseClient } from './initialize.js';

const jobForm = document.getElementById('jobForm');
const jobTableBody = document.querySelector('#jobTable tbody');
let editingId = null;
const fileInput = document.querySelector('input[name="resume"]');

supabaseClient.auth.getSession().then(({ data: { session } }) => {
  if (!session) {
    window.location.replace('/auth.html');
  } else {
    window.userSession = session;
  }
});


// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

function getStatusColor(status) {
  switch (status) {
    case 'Offer': return 'bg-green-100 text-green-800';
    case 'Interview':
    case 'Phone Screen': return 'bg-yellow-100 text-yellow-800';
    case 'Rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

async function fetchJobs() {
  const { data, error } = await supabaseClient.from('jobs').select('*').order('id', { ascending: true });
  if (error) return console.error(error);
  renderTable(data);
}

function renderTable(jobs) {
  jobTableBody.innerHTML = '';
  jobs.forEach(job => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-gray-50";
    tr.innerHTML = `
          <td class="px-4 py-4 text-sm">
          ${job.companyName}
          </td>
         <td class="px-4 py-4">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.responseStatus)}">${job.responseStatus}</span>
        </td>      
       <td class="px-4 py-4 text-xs">${job.priority}</td>
        <td class="px-4 py-4 text-sm">${job.followUpDate || 'N/A'}</td>
        <td class="px-4 py-4 text-sm">${job.interviewDate || 'N/A'}</td>
        <td class="px-4 py-4 text-sm">${job.nextAction || 'N/A'}</td>
        <td class="px-4 py-4 text-right text-xs">
          <button onclick="editJob(${job.id})" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
          <button onclick="deleteJob(${job.id})" class="text-red-600 hover:text-red-900">Delete</button>
        </td>
      `;
    jobTableBody.appendChild(tr);
  });
}

window.editJob = async function editJob(id) {
  const { data } = await supabaseClient
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();
  if (!data) return;

  editingId = id;

  for (const key in data) {
    const field = jobForm.elements[key];
    if (field) {
      // Skip file inputs
      if (field.type === "file") continue;

      field.value = data[key] ?? '';
    }
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.deleteJob = async function deleteJob(id) {
  if (!confirm('Delete this application?')) return;
  const { error, data } = await supabaseClient.from('jobs').delete().eq('id', id);
  if (error) return console.error(error);
  alert("✔️ Record deleted successfully.");
  fetchJobs();
}

jobForm.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const formData = {};
    const file = fileInput.files[0];
    let fileUrl = null

    if (file) {
      const filePath = `cv/${window.userSession.user.id}/${Date.now()}-${file.name}`;
      const { data, error } = await supabaseClient.storage
        .from('resumes')
        .upload(filePath, file)
      if (error) {
        console.log("👀 ~ error:", error)
        alert("Upload error:", error)
      };
      // Get public URL
      const { data: urlData } = await supabaseClient
        .storage
        .from('resumes')
        .getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;

    }

    for (const el of jobForm.elements) {
      if (el.name) formData[el.name] = el.value;
    }
    const payload = {
      ...formData,
      user_id: window.userSession.user.id,
      ...(fileUrl && { resume: fileUrl })
    }

    if (editingId) {
      const { error } = await supabaseClient.from('jobs').update(payload).eq('id', editingId);
      if (error) return console.error(error);
      editingId = null;
    } else {
      const { error, data } = await supabaseClient.from('jobs').insert([payload]);
      if (error) return console.error(error);
    }
    jobForm.reset();
    fetchJobs();
    alert("✅ Your information has been saved successfully.");
  } catch (error) {
    alert(error)
  }

});

// Initial fetch
fetchJobs();